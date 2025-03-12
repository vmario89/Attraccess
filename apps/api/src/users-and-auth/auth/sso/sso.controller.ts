import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SSOOIDCGuard } from './oidc/oidc.guard';
import { AuthGuard } from '@nestjs/passport';
import { SSOProvider, SSOProviderType } from '@attraccess/database-entities';
import { AuthenticatedRequest } from '../../../types/request';
import { CreateSessionResponse } from '../auth.types';
import { AuthService } from '../auth.service';
import { SSOService } from './sso.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('auth/sso')
export class SSOController {
  constructor(
    private readonly authService: AuthService,
    private readonly ssoService: SSOService
  ) {}

  @Get('providers')
  @ApiOperation({ summary: 'Get all SSO providers' })
  @ApiResponse({
    status: 200,
    description: 'The list of SSO providers',
    type: SSOProvider,
    isArray: true,
  })
  async getProviders(): Promise<SSOProvider[]> {
    return this.ssoService.getAllProviders();
  }

  @Get(`/${SSOProviderType.OIDC}/:providerId/login`)
  @ApiOperation({
    summary: 'Login with OIDC',
    description:
      'Login with OIDC and redirect to the callback URL (optional), if you intend to redirect to your frontned,' +
      ' your frontend should pass the query parameters back to the sso callback endpoint' +
      ' to retreive a JWT token for furhter authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
  })
  @ApiQuery({
    name: 'callbackURL',
    required: false,
    description:
      'The URL to redirect to after login (optional), if you intend to redirect to your frontned,' +
      ' your frontend should pass the query parameters back to the sso callback endpoint' +
      ' to retreive a JWT token for furhter authentication',
  })
  @UseGuards(SSOOIDCGuard, AuthGuard('sso-oidc'))
  async oidcLogin(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('providerId') providerId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('callbackURL') callbackURL?: string
  ): Promise<HttpStatus.OK> {
    return HttpStatus.OK;
  }

  @Get(`/${SSOProviderType.OIDC}/:providerId/callback`)
  @ApiOperation({ summary: 'Callback for OIDC login' })
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    type: CreateSessionResponse,
  })
  @UseGuards(SSOOIDCGuard, AuthGuard('sso-oidc'))
  async oidcLoginCallback(
    @Req() request: AuthenticatedRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('providerId') providerId: string
  ): Promise<CreateSessionResponse> {
    const authToken = await this.authService.createJWT(request.user);

    return {
      user: request.user,
      authToken,
    };
  }
}
