import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../../common/utils/pagination';
import { Category } from '../categories/category.entity';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(query: ProductQueryDto) {
    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC');
    if (query.categoryId) qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    if (query.search) {
      qb.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    return paginate(qb, query);
  }

  search(query: ProductQueryDto) {
    return this.findAll(query);
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Mahsulot topilmadi');
    return item;
  }

  async create(dto: CreateProductDto) {
    const product = this.repo.create(dto);
    if (dto.categoryId) {
      const category = await this.categories.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Kategoriya topilmadi');
      product.category = category;
    }
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId) {
      const category = await this.categories.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Kategoriya topilmadi');
      product.category = category;
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { deleted: true };
  }
}
