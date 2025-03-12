import { Test, TestingModule } from '@nestjs/testing';
import { SSOService } from './sso.service';
import { SSOProvider } from '@attraccess/database-entities';
import { getRepositoryToken } from '@nestjs/typeorm';

const SSOProviderRepository = getRepositoryToken(SSOProvider);

describe('SsoService', () => {
  let service: SSOService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SSOService,
        {
          provide: SSOProviderRepository,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SSOService>(SSOService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
