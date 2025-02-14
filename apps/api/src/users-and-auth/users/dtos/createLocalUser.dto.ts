import { AuthenticationType } from '../../../database/entities';
import { CreateUserDto } from './createUser.dto';
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocalUserDto extends CreateUserDto {
  @ApiProperty({
    enum: AuthenticationType,
    example: AuthenticationType.LOCAL_PASSWORD,
    description: 'The authentication strategy for the user',
  })
  @IsEnum(AuthenticationType)
  strategy: AuthenticationType.LOCAL_PASSWORD;

  @ApiProperty({
    example: 'mySecurePassword123',
    description: "The user's password",
  })
  @IsString()
  password: string;
}
