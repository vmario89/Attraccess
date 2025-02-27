import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export type PaginatedResponse<T> = PaginatedResponseDto<T>;

export function makePaginatedResponse<T>(
  options: { page: number; limit: number },
  data: T[],
  total: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit),
  };
}
