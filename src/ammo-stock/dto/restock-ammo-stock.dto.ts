import { IsString, IsInt, IsOptional, Min, MinLength } from 'class-validator';

export class RestockAmmoStockDto {
  @IsString()
  @MinLength(1)
  caliber: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
