import { Module } from '@nestjs/common';
import { ResourceUsageController } from './resourceUsage.controller';
import { ResourceUsageService } from './resourceUsage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource, ResourceUsage } from '@fabaccess/database-entities';
import { ResourceIntroducersModule } from '../introducers/resourceIntroducers.module';
import { ResourceIntroductionsModule } from '../introductions/resourceIntroductions.module';
import { ResourceGroupsModule } from '../groups/resourceGroups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceUsage, Resource]),
    ResourceIntroducersModule,
    ResourceIntroductionsModule,
    ResourceGroupsModule,
  ],
  controllers: [ResourceUsageController],
  providers: [ResourceUsageService],
  exports: [ResourceUsageService],
})
export class ResourceUsageModule {}
