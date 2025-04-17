import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse<T> {
  // data property should be defined and decorated in extending classes
  // Example: @ApiProperty({ type: [SpecificType] }) data: SpecificType[];
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({
    type: 'integer',
    nullable: true,
    description: 'The next page number, or null if it is the last page.',
  })
  nextPage: number | null;

  @ApiProperty()
  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  public constructor(data: T[], total: number, options: { page: number; limit: number }) {
    this.data = data;
    this.total = total;
    this.page = options.page;
    this.limit = options.limit;
    this.nextPage = this.page * this.limit < this.total ? this.page + 1 : null;
  }
}

export function makePaginatedResponse<T>(
  options: { page: number; limit: number },
  data: T[],
  total: number
): PaginatedResponse<T> & { data: T[] } {
  // Adjust return type slightly for clarity
  return new PaginatedResponse<T>(data, total, options);
}
