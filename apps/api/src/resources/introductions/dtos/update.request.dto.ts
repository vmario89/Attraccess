import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdateResourceIntroductionDto {
  @ApiProperty({
    description: 'The comment for the action',
    example: 'This is a comment',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
