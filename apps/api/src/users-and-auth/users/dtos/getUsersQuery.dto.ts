import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersQueryDto {
  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
  })
  page: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: 'The number of users to retrieve per page',
    example: 10,
  })
  limit: number;
}
