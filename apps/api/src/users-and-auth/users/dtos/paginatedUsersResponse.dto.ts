import { User } from '@attraccess/database-entities';
import { PaginatedResponseDto } from '../../../types/response';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedUsersResponseDto extends PaginatedResponseDto<User> {
  @ApiProperty({ type: [User] })
  data: User[];
}
