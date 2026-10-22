import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { isUuid } from '../../common/utils/id';
import { paginate } from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slug';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';
import { News } from './news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly repo: Repository<News>,
  ) {}

  findAll(query: PaginationDto, publishedOnly = true) {
    const qb = this.repo.createQueryBuilder('news').orderBy('news.publishedAt', 'DESC');
    if (publishedOnly) qb.andWhere('news.isPublished = true');
    if (query.search) {
      qb.andWhere('(news.title ILIKE :q OR news.excerpt ILIKE :q)', { q: `%${query.search}%` });
    }
    return paginate(qb, query);
  }

  async findOne(idOrSlug: string) {
    const item = await this.repo.findOne({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
    });
    if (!item) throw new NotFoundException('Yangilik topilmadi');
    return item;
  }

  create(dto: CreateNewsDto) {
    return this.repo.save(
      this.repo.create({
        ...dto,
        slug: dto.slug ?? slugify(dto.title),
        publishedAt: dto.isPublished === false ? null : new Date(),
      }),
    );
  }

  async update(id: string, dto: UpdateNewsDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { deleted: true };
  }
}
