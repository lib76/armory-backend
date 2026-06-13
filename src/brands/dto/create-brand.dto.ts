import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;
}
