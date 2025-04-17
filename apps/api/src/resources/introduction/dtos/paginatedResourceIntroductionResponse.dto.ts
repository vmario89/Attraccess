import { ResourceIntroduction } from '@attraccess/database-entities';
import { PaginatedResponse } from '../../../types/response';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResourceIntroductionResponseDto extends PaginatedResponse<ResourceIntroduction> {
  @ApiProperty({ type: [ResourceIntroduction] })
  data: ResourceIntroduction[];
}
