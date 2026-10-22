import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FaqItem } from './faq-item.entity';

@Entity('faq_topics')
export class FaqTopic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  label: string;

  @Column({ default: 'book' })
  icon: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => FaqItem, (item) => item.topic)
  items: FaqItem[];
}
