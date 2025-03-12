import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { SSOOIDCGuard } from './oidc/oidc.guard';
import { AuthGuard } from '@nestjs/passport';
import { SSOProvider, SSOProviderType } from '@attraccess/database-entities';
import { AuthenticatedRequest } from '../../../types/request';
import { CreateSessionResponse } from '../auth.types';
import { AuthService } from '../auth.service';
import { SSOService } from './sso.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSSOProviderDto } from './dto/create-sso-provider.dto';
import { UpdateSSOProviderDto } from './dto/update-sso-provider.dto';
import { Auth } from '../../../users-and-auth/strategies/systemPermissions.guard';
import { Response } from 'express';

@ApiTags('SSO')
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

  @Get('providers/:id')
  @ApiOperation({ summary: 'Get SSO provider by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the SSO provider',
  })
  @ApiResponse({
    status: 200,
    description: 'The SSO provider',
    type: SSOProvider,
  })
  @ApiResponse({
    status: 404,
    description: 'Provider not found',
  })
  async getProviderById(@Param('id') id: string): Promise<SSOProvider> {
    return this.ssoService.getProviderById(parseInt(id, 10));
  }

  @Post('providers')
  @Auth('canManageSystemConfiguration')
  @ApiOperation({ summary: 'Create a new SSO provider' })
  @ApiBody({ type: CreateSSOProviderDto })
  @ApiResponse({
    status: 201,
    description: 'The SSO provider has been created',
    type: SSOProvider,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createProvider(
    @Body() createDto: CreateSSOProviderDto
  ): Promise<SSOProvider> {
    return this.ssoService.createProvider(createDto);
  }

  @Put('providers/:id')
  @Auth('canManageSystemConfiguration')
  @ApiOperation({ summary: 'Update an existing SSO provider' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the SSO provider',
  })
  @ApiBody({ type: UpdateSSOProviderDto })
  @ApiResponse({
    status: 200,
    description: 'The SSO provider has been updated',
    type: SSOProvider,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Provider not found',
  })
  async updateProvider(
    @Param('id') id: string,
    @Body() updateDto: UpdateSSOProviderDto
  ): Promise<SSOProvider> {
    return this.ssoService.updateProvider(parseInt(id, 10), updateDto);
  }

  @Delete('providers/:id')
  @Auth('canManageSystemConfiguration')
  @ApiOperation({ summary: 'Delete an SSO provider' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the SSO provider',
  })
  @ApiResponse({
    status: 200,
    description: 'The SSO provider has been deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Provider not found',
  })
  async deleteProvider(@Param('id') id: string): Promise<void> {
    return this.ssoService.deleteProvider(parseInt(id, 10));
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
    name: 'redirectTo',
    required: false,
    description:
      'The URL to redirect to after login (optional), if you intend to redirect to your frontned,' +
      ' your frontend should pass the query parameters back to the sso callback endpoint' +
      ' to retreive a JWT token for furhter authentication',
  })
  @ApiParam({
    name: 'providerId',
    type: 'string',
    description: 'The ID of the SSO provider',
  })
  @UseGuards(SSOOIDCGuard, AuthGuard('sso-oidc'))
  async oidcLogin(): Promise<HttpStatus.OK> {
    return HttpStatus.OK;
  }

  @Get(`/${SSOProviderType.OIDC}/:providerId/callback`)
  @ApiOperation({ summary: 'Callback for OIDC login' })
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    type: CreateSessionResponse,
  })
  @ApiParam({
    name: 'providerId',
    type: 'string',
    description: 'The ID of the SSO provider',
  })
  @ApiQuery({
    name: 'state',
    required: true,
  })
  @ApiQuery({
    name: 'session-state',
    required: true,
  })
  @ApiQuery({
    name: 'iss',
    required: true,
  })
  @ApiQuery({
    name: 'code',
    required: true,
  })
  @UseGuards(SSOOIDCGuard, AuthGuard('sso-oidc'))
  async oidcLoginCallback(
    @Req() request: AuthenticatedRequest,
    @Query('redirectTo') redirectTo: string,
    @Res() response: Response
  ): Promise<CreateSessionResponse | void> {
    const authToken = await this.authService.createJWT(request.user);
    const auth: CreateSessionResponse = {
      user: request.user,
      authToken,
    };

    if (redirectTo) {
      const urlWithAuth = new URL(redirectTo);
      urlWithAuth.searchParams.set('auth', JSON.stringify(auth));
      return response.redirect(urlWithAuth.toString());
    }

    return auth;
  }
}
