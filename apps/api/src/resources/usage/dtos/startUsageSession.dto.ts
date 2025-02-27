import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class StartUsageSessionDto {
  @ApiProperty({
    description: 'Optional notes about the usage session',
    required: false,
    example: 'Printing a prototype case',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
