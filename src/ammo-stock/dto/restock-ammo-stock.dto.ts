import { IsString, IsInt, IsOptional, IsIn, Min } from 'class-validator';
import { CALIBERS } from '../calibers.constant';

export class RestockAmmoStockDto {
  @IsIn(CALIBERS)
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
