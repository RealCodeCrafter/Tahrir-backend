import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginationDto,
): Promise<PaginatedResult<T>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const [items, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
