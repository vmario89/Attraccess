import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateResourceGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @MaxLength(1000)
  description?: string;
} 