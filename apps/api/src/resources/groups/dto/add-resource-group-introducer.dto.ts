import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddResourceGroupIntroducerDto {
  @ApiProperty({ description: 'The ID of the user to be added as an introducer', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId!: number;
}
