import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 0 })
  monthlyPrice: number;

  @Column({ type: 'int', default: 0 })
  yearlyPrice: number;

  @Column('simple-array')
  features: string[];

  @Column({ default: 'Tanlash' })
  cta: string;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 5 })
  documentsPerMonth: number;

  @Column({ default: 1 })
  maxUsers: number;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => User, (user) => user.plan)
  users: User[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
