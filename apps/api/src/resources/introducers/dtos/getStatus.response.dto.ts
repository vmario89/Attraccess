import { ApiProperty } from '@nestjs/swagger';

export class GetIntroducerStatusResponseDto {
  @ApiProperty({
    description: 'Whether the user is an introducer for the resource',
    example: true,
  })
  isIntroducer!: boolean;
}
