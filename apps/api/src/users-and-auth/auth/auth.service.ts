import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { User, RevokedToken, AuthenticationDetail, AuthenticationType } from '@fabaccess/database-entities';
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
    await this.revokedTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async isJWTRevoked({ tokenId }: { tokenId: string }): Promise<boolean> {
    const revokedToken = await this.revokedTokenRepository.findOne({
      where: { tokenId },
    });
    const isRevoked = !!revokedToken;
    return isRevoked;
  }

  async revokeJWT({ tokenId }: { tokenId: string }): Promise<void> {
    this.logger.debug(`Revoking JWT token: ${tokenId}`);
    const revokedToken = new RevokedToken();
    revokedToken.tokenId = tokenId;
    await this.revokedTokenRepository.save(revokedToken);
    this.logger.debug(`Successfully revoked token: ${tokenId}`);
  }

  private async getAuthenticationDetail(
    authenticationType: AuthenticationType,
    userId: number
  ): Promise<AuthenticationDetail> {
    const details = await this.authenticationDetailRepository.findOne({
      where: { userId, type: authenticationType },
    });

    if (!details) {
      this.logger.debug(`Authentication details not found for user ID: ${userId}`);
      throw new NotFoundException(`Authentication details for user ${userId} not found`);
    }

    return details;
  }

  async validateAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<boolean> {
    const authenticationDetails = await this.getAuthenticationDetail(options.type, userId);

    let isValid = false;
    switch (options.type) {
      case AuthenticationType.LOCAL_PASSWORD:
        isValid = await bcrypt.compare(options.details.password, authenticationDetails.password || '');
        break;

      default:
        this.logger.debug(`Unsupported authentication type: ${options.type}`);
        isValid = false;
    }

    return isValid;
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async addAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<AuthenticationDetail> {
    const authenticationDetail = new AuthenticationDetail();
    authenticationDetail.userId = userId;
    authenticationDetail.type = options.type;

    if (options.type === AuthenticationType.LOCAL_PASSWORD) {
      this.logger.debug(`Hashing password for user ID: ${userId}`);
      authenticationDetail.password = await this.hashPassword(options.details.password);
    }

    const saved = await this.authenticationDetailRepository.save(authenticationDetail);
    return saved;
  }

  async removeAuthenticationDetails(authenticationDetailsId: number): Promise<void> {
    await this.authenticationDetailRepository.delete({
      id: authenticationDetailsId,
    });
  }

  async getUserByAuthenticationDetails<T extends AuthenticationType>(
    usernameOrEmail: string,
    options: AuthenticationOptions<T>
  ): Promise<User | null> {
    // First try to find user by username
    console.log('usernameOrEmail', usernameOrEmail);
    let user = await this.usersService.findOne({ username: usernameOrEmail });

    // If not found by username, try by email
    if (!user) {
      user = await this.usersService.findOne({ email: usernameOrEmail });
    }

    if (!user) {
      this.logger.debug(`No user found with username or email: ${usernameOrEmail}`);
      return null;
    }

    if (!user.isEmailVerified) {
      this.logger.debug(`User ${user.id} email not verified`);
      throw new UserEmailNotVerifiedException();
    }

    const isValid = await this.validateAuthenticationDetails(user.id, options);
    if (!isValid) {
      this.logger.debug(`Invalid authentication for user ID: ${user.id}`);
      return null;
    }

    return user;
  }

  async createJWT(user: User): Promise<string> {
    const tokenId = nanoid();
    const payload = { username: user.username, sub: user.id, tokenId };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async generateEmailVerificationToken(user: User): Promise<string> {
    const token = nanoid();

    await this.usersService.updateOne(user.id, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: addDays(new Date(), 3),
    });

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
    await this.usersService.updateOne(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
    this.logger.debug(`Email successfully verified for user ID: ${user.id}`);
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.usersService.findOne({ email });
    if (!user) {
      this.logger.debug(`No user found with email: ${email}`);
      return null;
    }

    const token = nanoid();
    await this.usersService.updateOne(user.id, {
      passwordResetToken: token,
      passwordResetTokenExpiresAt: addDays(new Date(), 1),
    });

    return token;
  }

  async changePassword(user: User, password: string): Promise<void> {
    const authenticationDetail = await this.getAuthenticationDetail(AuthenticationType.LOCAL_PASSWORD, user.id);

    authenticationDetail.password = await this.hashPassword(password);
    await this.authenticationDetailRepository.save(authenticationDetail);
  }

  async generateEmailChangeToken(user: User, newEmail: string): Promise<string> {
    const token = nanoid();

    await this.usersService.updateOne(user.id, {
      newEmail,
      emailChangeToken: token,
      emailChangeTokenExpiresAt: addDays(new Date(), 3),
    });

    return token;
  }

  async confirmEmailChange(newEmail: string, token: string): Promise<User> {
    this.logger.debug(`Confirming email change to: ${newEmail} with token: ${token.substring(0, 5)}...`);

    const user = await this.usersService.findOne({ emailChangeToken: token });

    if (!user) {
      this.logger.debug(`No user found with email change token: ${token.substring(0, 5)}...`);
      throw new UnauthorizedException('Invalid token');
    }

    if (user.newEmail !== newEmail) {
      this.logger.debug(`Email mismatch for user ID: ${user.id}. Expected: ${user.newEmail}, Provided: ${newEmail}`);
      throw new UnauthorizedException('Invalid email');
    }

    if (user.emailChangeTokenExpiresAt < new Date()) {
      this.logger.debug(`Expired email change token for user ID: ${user.id}`);
      throw new UnauthorizedException('Token expired');
    }

    // Check if the new email is already in use by another user
    const existingUser = await this.usersService.findOne({ email: newEmail });
    if (existingUser && existingUser.id !== user.id) {
      this.logger.debug(`New email ${newEmail} is already in use by user ID: ${existingUser.id}`);
      throw new UnauthorizedException('Email already in use');
    }

    this.logger.debug(`Updating email for user ID: ${user.id} from ${user.email} to ${newEmail}`);
    const updatedUser = await this.usersService.updateOne(user.id, {
      email: newEmail,
      newEmail: null,
      emailChangeToken: null,
      emailChangeTokenExpiresAt: null,
      isEmailVerified: true, // Auto-verify the new email since they confirmed the change
    });

    this.logger.debug(`Email successfully changed for user ID: ${user.id}`);
    return updatedUser;
  }
}
