import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BillingPeriod, SubscriptionStatus } from '../../common/enums';
import { User } from '../users/user.entity';
import { Plan } from '../plans/plan.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { eager: true })
  plan: Plan;

  @Column({ type: 'enum', enum: BillingPeriod })
  billingPeriod: BillingPeriod;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz' })
  endsAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
