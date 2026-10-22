import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination';
import { NewsletterSubscriber } from './newsletter.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(email: string) {
    const existing = await this.repo.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      existing.isActive = true;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create({ email: email.toLowerCase() }));
  }

  findAll(query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('n').orderBy('n.createdAt', 'DESC');
    if (query.search) {
      qb.andWhere('n.email ILIKE :q', { q: `%${query.search}%` });
    }
    return paginate(qb, query);
  }
}
