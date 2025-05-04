import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

interface JwtPayload {
  username: string;
  sub: number;
  tokenId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private usersService: UsersService, private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const isRevoked = await this.authService.isJWTRevoked(payload.tokenId);
    if (isRevoked) {
      this.logger.warn(`JWT token ${payload.tokenId} is revoked`);
      throw new UnauthorizedException();
    }

    if (!payload.sub) {
      this.logger.warn('JWT payload does not contain user ID (sub)');
      throw new UnauthorizedException('Invalid JWT Token');
    }

    const user = await this.usersService.findOne({ id: payload.sub });

    if (!user) {
      this.logger.warn(`User with ID ${payload.sub} not found`);
      throw new UnauthorizedException();
    }

    return user;
  }
}
