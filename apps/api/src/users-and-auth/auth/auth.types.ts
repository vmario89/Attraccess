import { User } from '@fabaccess/database-entities';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionResponse {
  @ApiProperty({
    type: User,
    description: 'The user that has been logged in',
    example: {
      id: 1,
      username: 'testuser',
    },
  })
  user: User;

  @ApiProperty({
    type: String,
    description: 'The authentication token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  authToken: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  tokenId: string;
}
