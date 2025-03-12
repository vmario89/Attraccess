import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SSOOIDCStrategy } from './oidc.strategy';
import { ModuleRef } from '@nestjs/core';
import { SSOService } from '../sso.service';
import { SSOProviderType } from '@attraccess/database-entities';
import {
  InvalidSSOProviderIdException,
  InvalidSSOProviderTypeException,
  SSOProviderNotFoundException,
} from '../errors';
import { loadEnv } from '@attraccess/env';

const env = loadEnv((z) => ({
  VITE_API_URL: z.string(),
}));

@Injectable()
export class SSOOIDCGuard implements CanActivate {
  private readonly logger = new Logger(SSOOIDCGuard.name);

  public constructor(
    private ssoService: SSOService,
    private moduleRef: ModuleRef
  ) {}

  async canActivate(context: ExecutionContext) {
    this.logger.log('OIDC Guard activation attempted');
    const req = context.switchToHttp().getRequest();

    this.logger.debug(`Request URL: ${req.url}`);
    const url = new URL(env.VITE_API_URL + req.url);

    // e.g. something/sso/oidc/156/login
    const urlPathParts = url.pathname.split('/');
    this.logger.debug(`URL path parts: ${JSON.stringify(urlPathParts)}`);
    const [, providerIdString, ssoType] = urlPathParts.reverse();
    const providerId = parseInt(providerIdString);
    this.logger.debug(
      `Extracted providerId: ${providerId}, ssoType: ${ssoType}, from URL: ${req.url}`
    );

    if (isNaN(providerId)) {
      this.logger.error(`Invalid SSO provider ID: ${providerIdString}`);
      throw new InvalidSSOProviderIdException();
    }

    this.logger.debug(`URL: ${url}`);
    this.logger.debug(`search params: ${url.searchParams}`);
    let callbackURL: string;
    if (url.searchParams.has('callbackURL')) {
      callbackURL = url.searchParams.get('callbackURL');
      this.logger.debug(`Callback URL from query params: ${callbackURL}`);
    } else {
      const baseUrl = url.origin + url.pathname;
      const callbackPath = baseUrl.replace('/login', '/callback');
      callbackURL = `http://localhost:3000${callbackPath}`;
    }
    this.logger.debug(`Generated callback URL: ${callbackURL}`);

    if (ssoType !== SSOProviderType.OIDC) {
      this.logger.error(
        `Invalid SSO provider type: ${ssoType}, expected: ${SSOProviderType.OIDC}`
      );
      throw new InvalidSSOProviderTypeException();
    }

    this.logger.debug(
      `Fetching provider with type: ${ssoType} and id: ${providerId}`
    );
    const provider = await this.ssoService.getProviderByTypeAndId(
      ssoType,
      providerId
    );

    if (!provider) {
      this.logger.error(
        `SSO provider not found for type: ${ssoType} and id: ${providerId}`
      );
      throw new SSOProviderNotFoundException();
    }

    const oidcConfig = provider.oidcConfiguration;

    if (!oidcConfig) {
      this.logger.error(
        `OIDC configuration not found for provider id: ${providerId}`
      );
      throw new SSOProviderNotFoundException();
    }

    this.logger.debug(
      `Initializing SSOOIDCStrategy with provider id: ${providerId}`
    );
    new SSOOIDCStrategy(this.moduleRef, oidcConfig, callbackURL);
    this.logger.log('OIDC Guard activation successful');
    return true;
  }
}
