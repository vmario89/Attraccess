import { Controller, Get, Inject } from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';

@Controller('fabreader')
export class FabreaderController {
  public constructor(
    @Inject(DbService)
    private readonly dbService: DbService
  ) {}

  @Get()
  async getAllReaders() {
    return await this.dbService.getAllReaders();
  }
}
