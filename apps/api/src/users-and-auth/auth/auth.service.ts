import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { User, RevokedToken, AuthenticationDetail, AuthenticationType } from '@attraccess/database-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../../email/email.service';
import { addDays } from 'date-fns';
import * as bcrypt from 'bcrypt';

export interface LocalPasswordAuthenticationOptions {
  password: string;
}

export interface AuthenticationOptions<T extends AuthenticationType> {
  type: T;
  details: T extends AuthenticationType.LOCAL_PASSWORD ? LocalPasswordAuthenticationOptions : never;
}

class UserEmailNotVerifiedException extends ForbiddenException {
  constructor() {
    super('UserEmailNotVerifiedException');
  }
}

class UserEmailInvalidVerificationTokenException extends UnauthorizedException {
  constructor() {
    super('UserEmailInvalidVerificationTokenException');
  }
}

class UserEmailVerificationTokenExpiredException extends UnauthorizedException {
  constructor() {
    super('UserEmailVerificationTokenExpiredException');
  }
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(AuthenticationDetail)
    private authenticationDetailRepository: Repository<AuthenticationDetail>,
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>
  ) {
    this.logger.debug('AuthService initialized');
    // Clean up expired revoked tokens periodically
    setInterval(() => this.cleanupExpiredTokens(), 24 * 60 * 60 * 1000); // Run daily
  }

  private async cleanupExpiredTokens() {
    this.logger.debug('Running cleanup of expired revoked tokens');
    const result = await this.revokedTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    this.logger.debug(`Cleaned up ${result.affected || 0} expired tokens`);
  }

  async isJWTRevoked(tokenId: string): Promise<boolean> {
    this.logger.debug(`Checking if JWT is revoked, token ID: ${tokenId}`);
    const revokedToken = await this.revokedTokenRepository.findOne({
      where: { tokenId },
    });
    const isRevoked = !!revokedToken;
    this.logger.debug(`Token ${tokenId} revoked status: ${isRevoked}`);
    return isRevoked;
  }

  async revokeJWT(tokenId: string): Promise<void> {
    this.logger.debug(`Revoking JWT token ID: ${tokenId}`);
    const token = new RevokedToken();
    token.tokenId = tokenId;
    token.expiresAt = addDays(new Date(), 7); // Keep revoked tokens for 7 days
    await this.revokedTokenRepository.save(token);
    this.logger.debug(`Successfully revoked token ID: ${tokenId}`);
  }

  private async getAuthenticationDetail(
    authenticationType: AuthenticationType,
    userId: number
  ): Promise<AuthenticationDetail> {
    this.logger.debug(`Getting authentication details for user ID: ${userId}, type: ${authenticationType}`);
    const details = await this.authenticationDetailRepository.findOne({
      where: { userId, type: authenticationType },
    });

    if (!details) {
      this.logger.debug(`Authentication details not found for user ID: ${userId}`);
      throw new NotFoundException(`Authentication details for user ${userId} not found`);
    }

    this.logger.debug(`Found authentication details, ID: ${details.id}`);
    return details;
  }

  async validateAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<boolean> {
    this.logger.debug(`Validating authentication details for user ID: ${userId}, type: ${options.type}`);
    const authenticationDetails = await this.getAuthenticationDetail(options.type, userId);

    let isValid = false;
    switch (options.type) {
      case AuthenticationType.LOCAL_PASSWORD:
        this.logger.debug(`Validating password for user ID: ${userId}`);
        isValid = await bcrypt.compare(options.details.password, authenticationDetails.password || '');
        break;

      default:
        this.logger.debug(`Unsupported authentication type: ${options.type}`);
        isValid = false;
    }

    this.logger.debug(`Authentication validation result for user ID: ${userId}: ${isValid}`);
    return isValid;
  }

  async addAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<AuthenticationDetail> {
    this.logger.debug(`Adding authentication details for user ID: ${userId}, type: ${options.type}`);
    const authenticationDetail = new AuthenticationDetail();
    authenticationDetail.userId = userId;
    authenticationDetail.type = options.type;

    if (options.type === AuthenticationType.LOCAL_PASSWORD) {
      this.logger.debug(`Hashing password for user ID: ${userId}`);
      authenticationDetail.password = await bcrypt.hash(options.details.password, this.SALT_ROUNDS);
    }

    const saved = await this.authenticationDetailRepository.save(authenticationDetail);
    this.logger.debug(`Authentication details added for user ID: ${userId}, auth details ID: ${saved.id}`);
    return saved;
  }

  async removeAuthenticationDetails(authenticationDetailsId: number): Promise<void> {
    this.logger.debug(`Removing authentication details with ID: ${authenticationDetailsId}`);
    await this.authenticationDetailRepository.delete({
      id: authenticationDetailsId,
    });
    this.logger.debug(`Authentication details with ID: ${authenticationDetailsId} removed`);
  }

  async getUserByUsernameAndAuthenticationDetails<T extends AuthenticationType>(
    username: string,
    options: AuthenticationOptions<T>
  ): Promise<User | null> {
    this.logger.debug(`Getting user by username: ${username} and authentication details`);
    const user = await this.usersService.findOne({ username });

    if (!user) {
      this.logger.debug(`No user found with username: ${username}`);
      return null;
    }

    if (!user.isEmailVerified) {
      this.logger.debug(`User ${user.id} email not verified`);
      throw new UserEmailNotVerifiedException();
    }

    this.logger.debug(`Validating authentication details for user ID: ${user.id}`);
    const isValid = await this.validateAuthenticationDetails(user.id, options);
    if (!isValid) {
      this.logger.debug(`Invalid authentication for user ID: ${user.id}`);
      return null;
    }

    this.logger.debug(`Authentication successful for user ID: ${user.id}`);
    return user;
  }

  async createJWT(user: User): Promise<string> {
    this.logger.debug(`Creating JWT for user ID: ${user.id}`);
    const tokenId = nanoid();
    const payload = { username: user.username, sub: user.id, tokenId };
    const token = this.jwtService.sign(payload);
    this.logger.debug(`JWT created for user ID: ${user.id}, token ID: ${tokenId}`);
    return token;
  }

  async generateEmailVerificationToken(user: User): Promise<string> {
    this.logger.debug(`Generating email verification token for user ID: ${user.id}`);
    const token = nanoid();

    this.logger.debug(`Updating user with verification token, user ID: ${user.id}`);
    await this.usersService.updateUser(user.id, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: addDays(new Date(), 3),
    });

    this.logger.debug(`Email verification token generated for user ID: ${user.id}`);
    return token;
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    this.logger.debug(`Verifying email: ${email} with token: ${token.substring(0, 5)}...`);
    const user = await this.usersService.findOne({ email });

    if (!user) {
      this.logger.debug(`No user found with email: ${email}`);
      throw new UserEmailInvalidVerificationTokenException();
    }

    if (user.emailVerificationToken !== token) {
      this.logger.debug(`Invalid verification token for user ID: ${user.id}`);
      throw new UserEmailInvalidVerificationTokenException();
    }

    if (user.emailVerificationTokenExpiresAt < new Date()) {
      this.logger.debug(`Expired verification token for user ID: ${user.id}`);
      throw new UserEmailVerificationTokenExpiredException();
    }

    this.logger.debug(`Marking email as verified for user ID: ${user.id}`);
    await this.usersService.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
    this.logger.debug(`Email successfully verified for user ID: ${user.id}`);
  }
}
