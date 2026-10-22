import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
