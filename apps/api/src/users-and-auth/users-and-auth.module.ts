import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Services and Controllers
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// Constants and Entities
import { jwtConstants } from './constants';
import {
  User,
  AuthenticationDetail,
  RevokedToken,
  SSOProviderOIDCConfiguration,
  SSOProvider,
} from '@attraccess/database-entities';
import { EmailModule } from '../email/email.module';
import { SSOService } from './auth/sso/sso.service';
import { SSOOIDCStrategy } from './auth/sso/oidc/oidc.strategy';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SSOController } from './auth/sso/sso.controller';

import { loadEnv } from '@attraccess/env';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthenticationDetail, RevokedToken, SSOProvider, SSOProviderOIDCConfiguration]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    EmailModule,
  ],
  providers: [
    UsersService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    SSOService,
    {
      provide: SSOOIDCStrategy,
      useFactory: (moduleRef: ModuleRef) => {
        // This is a placeholder - you'll need to retrieve an actual configuration
        // from the database or environment variables
        const config = new SSOProviderOIDCConfiguration();
        config.issuer = 'placeholder';
        config.authorizationURL = 'placeholder';
        config.tokenURL = 'placeholder';
        config.userInfoURL = 'placeholder';
        config.clientId = 'placeholder';
        config.clientSecret = 'placeholder';

        const env = loadEnv((z) => ({
          FRONTEND_URL: z.string().url().default(process.env.VITE_ATTRACCESS_URL),
        }));
        const callbackURL = env.FRONTEND_URL + '/api/sso/OIDC/callback';

        return new SSOOIDCStrategy(moduleRef, config, callbackURL);
      },
      inject: [ModuleRef, ConfigService],
    },
  ],
  controllers: [UsersController, AuthController, SSOController],
  exports: [UsersService, AuthService],
})
export class UsersAndAuthModule {}
