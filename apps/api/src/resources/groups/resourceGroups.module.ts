import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Resource,
  ResourceGroup,
  ResourceIntroducer,
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
} from '@fabaccess/database-entities';
import { ResourceGroupsController } from './resourceGroups.controller';
import { ResourceGroupsService } from './resourceGroups.service';
import { ResourceGroupsIntroductionsController } from './introductions/resourceGroups.introductions.controller';
import { ResourceGroupsIntroducersController } from './introducers/resourceGroups.introducers.controller';
import { ResourceGroupsIntroductionsService } from './introductions/resourceGroups.introductions.service';
import { ResourceGroupsIntroducersService } from './introducers/resourceGroups.introducers.service';
import { IsResourceGroupIntroducerGuard } from './introductions/isIntroducerGuard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ResourceGroup,
      ResourceIntroduction,
      ResourceIntroductionHistoryItem,
      ResourceIntroducer,
    ]),
  ],
  controllers: [ResourceGroupsController, ResourceGroupsIntroductionsController, ResourceGroupsIntroducersController],
  providers: [
    ResourceGroupsService,
    ResourceGroupsIntroductionsService,
    ResourceGroupsIntroducersService,
    IsResourceGroupIntroducerGuard,
  ],
  exports: [
    ResourceGroupsService,
    ResourceGroupsIntroductionsService,
    ResourceGroupsIntroducersService,
    IsResourceGroupIntroducerGuard,
  ],
})
export class ResourceGroupsModule {}
