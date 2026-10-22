import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Entity('blog_categories')
export class BlogCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => BlogPost, (post) => post.category)
  posts: BlogPost[];
}
