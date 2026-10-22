import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FaqTab } from '../../common/enums';
import { FaqTopic } from './faq-topic.entity';

@Entity('faq_items')
export class FaqItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'varchar', nullable: true })
  tag: string | null;

  @Column({ type: 'enum', enum: FaqTab, default: FaqTab.POPULAR })
  tab: FaqTab;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => FaqTopic, (topic) => topic.items, { eager: true, nullable: true })
  topic: FaqTopic | null;
}
