import { Resource } from '@attraccess/database-entities';
import { PaginatedResponseDto } from '../../types/response';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResourceResponseDto extends PaginatedResponseDto<Resource> {
  @ApiProperty({ type: [Resource] })
  data: Resource[];
}
