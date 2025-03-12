import { Profile, Strategy } from 'passport-openidconnect';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  SSOProviderOIDCConfiguration,
  User,
} from '@attraccess/database-entities';
import { UsersService } from '../../../users/users.service';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SSOOIDCStrategy extends PassportStrategy(Strategy, 'sso-oidc') {
  private readonly logger = new Logger(SSOOIDCStrategy.name);

  constructor(
    private moduleRef: ModuleRef,
    config: SSOProviderOIDCConfiguration,
    callbackURL: string
  ) {
    super({
      issuer: config.issuer,
      authorizationURL: config.authorizationURL,
      userInfoURL: config.userInfoURL,
      tokenURL: config.tokenURL,
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL,
    });

    this.logger.log(
      `Initialized OIDC strategy with issuer: ${config.issuer} and callbackURL: ${callbackURL}`
    );
  }

  async validate(_issuer: string, profile: Profile): Promise<User> {
    this.logger.log(`Validating OIDC profile for issuer: ${_issuer}`);

    const emails = profile.emails || [];

    this.logger.debug(
      `Profile data: ${JSON.stringify({
        id: profile.id,
        displayName: profile.displayName,
        emails: emails.map((e) => e.value),
        username: profile.username,
      })}`
    );

    if (emails.length === 0) {
      this.logger.error('No emails found in SSO profile');
      throw new BadRequestException('No emails found in SSO profile');
    }

    const usersService = await this.moduleRef.get(UsersService);

    let user: User | null = null;
    for (const email of emails) {
      this.logger.debug(`Checking if user exists with email: ${email.value}`);
      user = await usersService
        .findOne({
          email: email.value,
        })
        .catch((error) => {
          this.logger.warn(
            `Error finding user with email ${email.value}: ${error.message}`
          );
          return null;
        });

      if (user) {
        this.logger.log(`Found existing user with email: ${email.value}`);
        break;
      }
    }

    if (user) {
      this.logger.log(`User authenticated successfully: ${user.email}`);
      return user;
    }

    const email = profile.emails[0].value;
    if (!email) {
      this.logger.error('No email found in SSO profile');
      throw new BadRequestException('No email found in SSO profile');
    }

    const username = profile.username || email;
    this.logger.log(
      `Creating new user with username: ${username} and email: ${email}`
    );
    user = await usersService.createOne(username, email);

    if (!user) {
      this.logger.error('Failed to create user after SSO authentication');
      throw new UnauthorizedException();
    }

    this.logger.log(`New user created successfully: ${user.email}`);
    return user;
  }
}
