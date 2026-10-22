import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingPeriod, SubscriptionStatus } from '../../common/enums';
import { Plan } from '../plans/plan.entity';
import { User } from '../users/user.entity';
import { CreateSubscriptionDto } from './dto/subscribe.dto';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly plansRepo: Repository<Plan>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(user: User, dto: CreateSubscriptionDto) {
    const plan = await this.plansRepo.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Tarif topilmadi');

    await this.repo.update(
      { user: { id: user.id }, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.CANCELED },
    );

    const startedAt = new Date();
    const endsAt = new Date(startedAt);
    if (dto.billingPeriod === BillingPeriod.YEARLY) {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    const subscription = await this.repo.save(
      this.repo.create({
        user,
        plan,
        billingPeriod: dto.billingPeriod,
        status: SubscriptionStatus.ACTIVE,
        startedAt,
        endsAt,
      }),
    );

    user.plan = plan;
    await this.usersRepo.save(user);
    return subscription;
  }

  mine(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(userId: string, id: string) {
    const item = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!item) throw new NotFoundException('Obuna topilmadi');
    item.status = SubscriptionStatus.CANCELED;
    return this.repo.save(item);
  }
}
