import { IsString, IsInt, Min, MinLength, IsOptional } from 'class-validator';

export class UpsertAmmoStockDto {
  @IsString()
  @MinLength(1)
  caliber: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
