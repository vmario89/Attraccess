import { User } from '@attraccess/database-entities';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionResponse {
  @ApiProperty()
  user: User;

  @ApiProperty()
  authToken: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  tokenId: string;
}

export interface AuthenticatedUser extends User {
  accessToken: string;
}
