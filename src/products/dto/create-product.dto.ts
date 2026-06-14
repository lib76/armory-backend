import { IsString, IsNumber, IsOptional, Min, IsUUID, IsBoolean, ValidateIf, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @ValidateIf((o: { brandId?: string | null }) => o.brandId !== null)
  @IsUUID()
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  brandId?: string | null;

  @IsOptional()
  @IsIn(['ARS', 'USD'])
  currency?: 'ARS' | 'USD';

  @IsOptional()
  @IsIn(['nuevo', 'usado'])
  condition?: 'nuevo' | 'usado' | null;

  @IsOptional()
  @IsString()
  caliber?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
