import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  monthlyPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearlyPrice?: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsString()
  cta?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  documentsPerMonth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxUsers?: number;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  monthlyPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
