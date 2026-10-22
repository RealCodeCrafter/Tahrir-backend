import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination';
import { Contact } from './contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly repo: Repository<Contact>,
  ) {}

  create(dto: CreateContactDto) {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(query: PaginationDto) {
    const qb = this.repo.createQueryBuilder('contact').orderBy('contact.createdAt', 'DESC');
    if (query.search) {
      qb.andWhere('(contact.fullName ILIKE :q OR contact.email ILIKE :q OR contact.message ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    return paginate(qb, query);
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Murojaat topilmadi');
    return item;
  }

  async update(id: string, dto: UpdateContactDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { deleted: true };
  }
}
