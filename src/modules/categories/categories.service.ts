import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slug';
import { CreateCategoryDto } from '../products/dto/product.dto';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('category').orderBy('category.name', 'ASC');
    if (query.search) {
      qb.andWhere('category.name ILIKE :q', { q: `%${query.search}%` });
    }
    return paginate(qb, query);
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Kategoriya topilmadi');
    return item;
  }

  create(dto: CreateCategoryDto) {
    return this.repo.save(
      this.repo.create({ ...dto, slug: dto.slug ?? slugify(dto.name) }),
    );
  }

  async update(id: string, dto: CreateCategoryDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    if (dto.name && !dto.slug) item.slug = slugify(dto.name);
    return this.repo.save(item);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { deleted: true };
  }
}
