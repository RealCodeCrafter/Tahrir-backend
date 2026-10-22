import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class BlogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;
}

export class CreateBlogCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
