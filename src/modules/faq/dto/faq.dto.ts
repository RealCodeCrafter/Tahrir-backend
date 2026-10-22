import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { FaqTab } from '../../../common/enums';

export class FaqQueryDto {
  @IsOptional()
  @IsEnum(FaqTab)
  tab?: FaqTab;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateFaqTopicDto {
  @IsString()
  slug: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreateFaqItemDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsEnum(FaqTab)
  tab?: FaqTab;

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
