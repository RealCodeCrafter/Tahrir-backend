import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUuid } from '../../common/utils/id';
import { paginate } from '../../common/utils/pagination';
import { slugify } from '../../common/utils/slug';
import { BlogCategory } from './blog-category.entity';
import { BlogPost } from './blog-post.entity';
import {
  BlogQueryDto,
  CreateBlogCategoryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly posts: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly categories: Repository<BlogCategory>,
  ) {}

  listCategories() {
    return this.categories.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  createCategory(dto: CreateBlogCategoryDto) {
    return this.categories.save(
      this.categories.create({ ...dto, slug: dto.slug ?? slugify(dto.name) }),
    );
  }

  findPosts(query: BlogQueryDto, publishedOnly = true) {
    const qb = this.posts
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .orderBy('post.publishedAt', 'DESC');

    if (publishedOnly) qb.andWhere('post.isPublished = true');
    if (query.category && query.category !== 'All articles') {
      qb.andWhere('(category.slug = :cat OR category.name = :cat)', { cat: query.category });
    }
    if (query.featured) qb.andWhere('post.isFeatured = true');
    if (query.search) {
      qb.andWhere('(post.title ILIKE :q OR post.excerpt ILIKE :q OR post.content ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    return paginate(qb, query);
  }

  async findPost(idOrSlug: string) {
    const post = await this.posts.findOne({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
    });
    if (!post) throw new NotFoundException('Maqola topilmadi');
    return post;
  }

  async createPost(dto: CreateBlogPostDto) {
    const category = await this.categories.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    return this.posts.save(
      this.posts.create({
        ...dto,
        slug: dto.slug ?? slugify(dto.title),
        category,
        publishedAt: dto.isPublished === false ? null : new Date(),
      }),
    );
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    const post = await this.findPost(id);
    if (dto.categoryId) {
      const category = await this.categories.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Kategoriya topilmadi');
      post.category = category;
    }
    Object.assign(post, dto);
    return this.posts.save(post);
  }

  async removePost(id: string) {
    await this.posts.remove(await this.findPost(id));
    return { deleted: true };
  }
}
