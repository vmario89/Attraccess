import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import {
  User,
  RevokedToken,
  AuthenticationDetail,
  AuthenticationType,
} from '@attraccess/database-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../../email/email.service';
import { addDays } from 'date-fns';
import * as bcrypt from 'bcrypt';

export interface LocalPasswordAuthenticationOptions {
  password: string;
}

export interface AuthenticationOptions<T extends AuthenticationType> {
  type: T;
  details: T extends AuthenticationType.LOCAL_PASSWORD
    ? LocalPasswordAuthenticationOptions
    : never;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(AuthenticationDetail)
    private authenticationDetailRepository: Repository<AuthenticationDetail>,
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>
  ) {
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

  async isJWTRevoked(tokenId: string): Promise<boolean> {
    const revokedToken = await this.revokedTokenRepository.findOne({
      where: { tokenId },
    });
    return !!revokedToken;
  }

  async revokeJWT(tokenId: string): Promise<void> {
    const token = new RevokedToken();
    token.tokenId = tokenId;
    token.expiresAt = addDays(new Date(), 7); // Keep revoked tokens for 7 days
    await this.revokedTokenRepository.save(token);
  }

  private async getAuthenticationDetail(
    authenticationType: AuthenticationType,
    userId: number
  ): Promise<AuthenticationDetail> {
    const details = await this.authenticationDetailRepository.findOne({
      where: { userId, type: authenticationType },
    });

    if (!details) {
      throw new NotFoundException(
        `Authentication details for user ${userId} not found`
      );
    }

    return details;
  }

  async validateAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<boolean> {
    const authenticationDetails = await this.getAuthenticationDetail(
      options.type,
      userId
    );

    switch (options.type) {
      case AuthenticationType.LOCAL_PASSWORD:
        return bcrypt.compare(
          options.details.password,
          authenticationDetails.password || ''
        );

      default:
        return false;
    }
  }

  async addAuthenticationDetails<T extends AuthenticationType>(
    userId: number,
    options: AuthenticationOptions<T>
  ): Promise<void> {
    const authenticationDetail = new AuthenticationDetail();
    authenticationDetail.userId = userId;
    authenticationDetail.type = options.type;

    if (options.type === AuthenticationType.LOCAL_PASSWORD) {
      authenticationDetail.password = await bcrypt.hash(
        options.details.password,
        this.SALT_ROUNDS
      );
    }

    await this.authenticationDetailRepository.save(authenticationDetail);
  }

  async getUserByUsernameAndAuthenticationDetails<T extends AuthenticationType>(
    username: string,
    options: AuthenticationOptions<T>
  ): Promise<User | null> {
    const user = await this.usersService.findOne({ username });

    if (!user) {
      return null;
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address first');
    }

    const isValid = await this.validateAuthenticationDetails(user.id, options);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async createJWT(user: User): Promise<string> {
    const tokenId = nanoid();
    const payload = { username: user.username, sub: user.id, tokenId };
    return this.jwtService.sign(payload);
  }

  async generateEmailVerificationToken(user: User): Promise<string> {
    const token = nanoid();
    await this.usersService.updateUser(user.id, {
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: addDays(new Date(), 3),
    });

    return token;
  }

  async verifyEmail(email: string, token: string): Promise<void> {
    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (user.emailVerificationToken !== token) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (user.emailVerificationTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Verification token has expired');
    }

    await this.usersService.updateUser(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });
  }
}
