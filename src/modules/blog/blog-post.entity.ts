import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogCategory } from './blog-category.entity';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'peach' })
  cover: string;

  @Column({ default: 'search' })
  icon: string;

  @Column({ default: 5 })
  readMinutes: number;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => BlogCategory, (category) => category.posts, { eager: true })
  category: BlogCategory;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
