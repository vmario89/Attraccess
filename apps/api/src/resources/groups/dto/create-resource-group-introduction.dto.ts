import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateResourceGroupIntroductionDto {
  @ApiProperty({ description: 'The ID of the user receiving the introduction', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  receiverUserId!: number;

  @ApiProperty({ description: 'The ID of the user who tutored the receiver (optional)', example: 2, required: false })
  @IsNumber()
  @IsOptional()
  tutorUserId?: number;
}
