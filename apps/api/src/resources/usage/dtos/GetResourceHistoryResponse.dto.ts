import { ResourceUsage } from '@attraccess/database-entities';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../types/response';

export class GetResourceHistoryResponseDto extends PaginatedResponseDto<ResourceUsage> {
  @ApiProperty({
    type: [ResourceUsage],
  })
  data: ResourceUsage[];
}
