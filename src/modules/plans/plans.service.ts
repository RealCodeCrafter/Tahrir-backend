import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils/slug';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Plan } from './plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly repo: Repository<Plan>,
  ) {}

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC', monthlyPrice: 'ASC' } });
  }

  async findOne(id: string) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Tarif topilmadi');
    return plan;
  }

  create(dto: CreatePlanDto) {
    const yearlyPrice = dto.yearlyPrice ?? Math.round(dto.monthlyPrice * 12 * 0.8);
    return this.repo.save(
      this.repo.create({
        ...dto,
        slug: dto.slug ?? slugify(dto.name),
        yearlyPrice,
      }),
    );
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);
    Object.assign(plan, dto);
    return this.repo.save(plan);
  }

  async remove(id: string) {
    await this.repo.remove(await this.findOne(id));
    return { deleted: true };
  }
}
