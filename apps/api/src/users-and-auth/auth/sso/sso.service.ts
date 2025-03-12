import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SSOProvider,
  SSOProviderOIDCConfiguration,
  SSOProviderType,
} from '@attraccess/database-entities';
import { CreateSSOProviderDto } from './dto/create-sso-provider.dto';
import { UpdateSSOProviderDto } from './dto/update-sso-provider.dto';
import { SSOProviderNotFoundException } from './errors';

@Injectable()
export class SSOService {
  public constructor(
    @InjectRepository(SSOProvider)
    private ssoProviderRepository: Repository<SSOProvider>,
    @InjectRepository(SSOProviderOIDCConfiguration)
    private oidcConfigRepository: Repository<SSOProviderOIDCConfiguration>
  ) {}

  public async getAllProviders(): Promise<SSOProvider[]> {
    return this.ssoProviderRepository.find();
  }

  public async getProviderById(id: number): Promise<SSOProvider> {
    const provider = await this.ssoProviderRepository.findOne({
      where: { id },
    });

    if (!provider) {
      throw new SSOProviderNotFoundException();
    }

    return provider;
  }

  public getProviderByTypeAndId(
    ssoType: SSOProviderType,
    providerId: number
  ): Promise<SSOProvider> {
    const relations = [];

    if (ssoType === SSOProviderType.OIDC) {
      relations.push('oidcConfiguration');
    }

    return this.ssoProviderRepository.findOne({
      where: { type: ssoType, id: providerId },
      relations,
    });
  }

  public async createProvider(
    createDto: CreateSSOProviderDto
  ): Promise<SSOProvider> {
    const newProvider = this.ssoProviderRepository.create({
      name: createDto.name,
      type: createDto.type,
    });

    const savedProvider = await this.ssoProviderRepository.save(newProvider);

    if (
      createDto.type === SSOProviderType.OIDC &&
      createDto.oidcConfiguration
    ) {
      await this.createOIDCConfiguration(
        savedProvider.id,
        createDto.oidcConfiguration
      );
    }

    return this.getProviderByTypeAndId(savedProvider.type, savedProvider.id);
  }

  public async updateProvider(
    id: number,
    updateDto: UpdateSSOProviderDto
  ): Promise<SSOProvider> {
    const provider = await this.getProviderById(id);

    // Basic provider properties
    Object.assign(provider, updateDto);

    // Handle OIDC configuration
    if (
      provider.type === SSOProviderType.OIDC &&
      updateDto.oidcConfiguration &&
      provider.oidcConfiguration
    ) {
      await this.updateOIDCConfiguration(
        provider.oidcConfiguration,
        updateDto.oidcConfiguration
      );
    }

    await this.ssoProviderRepository.save(provider);

    return this.getProviderByTypeAndId(provider.type, provider.id);
  }

  public async deleteProvider(id: number): Promise<void> {
    await this.getProviderById(id);
    await this.ssoProviderRepository.delete(id);
  }

  public async createOIDCConfiguration(
    providerId: number,
    config: {
      issuer: string;
      authorizationURL: string;
      tokenURL: string;
      userInfoURL: string;
      clientId: string;
      clientSecret: string;
    }
  ): Promise<SSOProviderOIDCConfiguration> {
    const newConfig = this.oidcConfigRepository.create({
      ...config,
      ssoProviderId: providerId,
    });

    return this.oidcConfigRepository.save(newConfig);
  }

  public async updateOIDCConfiguration(
    existingConfig: SSOProviderOIDCConfiguration,
    updateConfig: Partial<{
      issuer: string;
      authorizationURL: string;
      tokenURL: string;
      userInfoURL: string;
      clientId: string;
      clientSecret: string;
    }>
  ): Promise<SSOProviderOIDCConfiguration> {
    Object.assign(existingConfig, updateConfig);
    return this.oidcConfigRepository.save(existingConfig);
  }
}
