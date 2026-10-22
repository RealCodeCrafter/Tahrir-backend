import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('check_history')
export class CheckHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb' })
  issues: unknown;

  @Column({ default: 0 })
  words: number;

  @Column({ default: 0 })
  chars: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;
}
