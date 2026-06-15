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
  @IsInt()
  featuredOrder?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}
