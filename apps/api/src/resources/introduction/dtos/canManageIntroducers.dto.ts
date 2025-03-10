import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for checking if a user can manage introducers for a resource
 */
export class CanManageIntroducersResponseDto {
  @ApiProperty({
    description: 'Whether the user can manage introducers for the resource',
    example: true,
  })
  canManageIntroducers: boolean;
}
