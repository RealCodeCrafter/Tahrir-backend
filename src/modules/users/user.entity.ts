import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { Plan } from '../plans/plan.entity';
import { DocumentFile } from '../documents/document.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetTokenExpiresAt: Date | null;

  @ManyToOne(() => Plan, { nullable: true, eager: true })
  plan: Plan | null;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => DocumentFile, (document) => document.user)
  documents: DocumentFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
