import { ApiProperty } from '@nestjs/swagger';
import { ResourceGroup } from '@attraccess/database-entities';
import { PaginatedResponse } from '../../../types/response';

export class PaginatedResourceGroupResponseDto extends PaginatedResponse<ResourceGroup> {
  @ApiProperty({ type: [ResourceGroup] })
  data: ResourceGroup[];
} 