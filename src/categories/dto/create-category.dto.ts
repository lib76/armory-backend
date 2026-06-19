import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isFirearm?: boolean;

  @IsOptional()
  @IsBoolean()
  isFreeSale?: boolean;

  @IsOptional()
  @IsBoolean()
  isMunicion?: boolean;

  @IsOptional()
  @IsInt()
  featuredOrder?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  color?: string | null;
}
