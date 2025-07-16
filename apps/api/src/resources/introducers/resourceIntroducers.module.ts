import { Module } from '@nestjs/common';
import { ResourceIntroducersService } from './resourceIntroducers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceIntroducer } from '@fabaccess/database-entities';
import { ResourceIntroducersController } from './resourceIntroducers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceIntroducer])],
  controllers: [ResourceIntroducersController],
  providers: [ResourceIntroducersService],
  exports: [ResourceIntroducersService],
})
export class ResourceIntroducersModule {}
