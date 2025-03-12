import { Test, TestingModule } from '@nestjs/testing';
import { SSOController } from './sso.controller';
import { SSOService } from './sso.service';
import { AuthService } from '../auth.service';

describe('SsoController', () => {
  let controller: SSOController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SSOService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
      controllers: [SSOController],
    }).compile();

    controller = module.get<SSOController>(SSOController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
