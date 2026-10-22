import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateNewsDto {
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
  @IsString()
  cover?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
