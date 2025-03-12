import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SSOProvider, SSOProviderType } from '@attraccess/database-entities';

@Injectable()
export class SSOService {
  public constructor(
    @InjectRepository(SSOProvider)
    private ssoProviderRepository: Repository<SSOProvider>
  ) {}

  public async getAllProviders(): Promise<SSOProvider[]> {
    return this.ssoProviderRepository.find();
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
}
