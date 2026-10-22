import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from '../modules/blog/blog-category.entity';
import { BlogPost } from '../modules/blog/blog-post.entity';
import { Category } from '../modules/categories/category.entity';
import { FaqItem } from '../modules/faq/faq-item.entity';
import { FaqTopic } from '../modules/faq/faq-topic.entity';
import { News } from '../modules/news/news.entity';
import { Plan } from '../modules/plans/plan.entity';
import { Product } from '../modules/products/product.entity';
import { User } from '../modules/users/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Plan,
      BlogCategory,
      BlogPost,
      News,
      FaqTopic,
      FaqItem,
      Category,
      Product,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
