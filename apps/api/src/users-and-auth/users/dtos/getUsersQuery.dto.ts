import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min, Max } from 'class-validator';

export class GetUsersQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 10;
}
