import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFaqItemDto, CreateFaqTopicDto, FaqQueryDto } from './dto/faq.dto';
import { FaqItem } from './faq-item.entity';
import { FaqTopic } from './faq-topic.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FaqItem)
    private readonly items: Repository<FaqItem>,
    @InjectRepository(FaqTopic)
    private readonly topics: Repository<FaqTopic>,
  ) {}

  listTopics() {
    return this.topics.find({ order: { sortOrder: 'ASC' } });
  }

  createTopic(dto: CreateFaqTopicDto) {
    return this.topics.save(this.topics.create(dto));
  }

  async findItems(query: FaqQueryDto) {
    const qb = this.items
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.topic', 'topic')
      .orderBy('item.sortOrder', 'ASC');

    if (query.tab && !query.search) qb.andWhere('item.tab = :tab', { tab: query.tab });
    if (query.topic) {
      qb.andWhere('(topic.slug = :topic OR topic.id = :topic)', { topic: query.topic });
    }
    if (query.search) {
      qb.andWhere('(item.question ILIKE :q OR item.answer ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    return qb.getMany();
  }

  async createItem(dto: CreateFaqItemDto) {
    const item = this.items.create(dto);
    if (dto.topicId) {
      const topic = await this.topics.findOne({ where: { id: dto.topicId } });
      if (!topic) throw new NotFoundException('Mavzu topilmadi');
      item.topic = topic;
    }
    return this.items.save(item);
  }

  async removeItem(id: string) {
    const item = await this.items.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Savol topilmadi');
    await this.items.remove(item);
    return { deleted: true };
  }
}
