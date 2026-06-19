import { IsString, IsInt, IsOptional, IsIn, Min, MinLength } from 'class-validator';
import { CALIBERS } from '../calibers.constant';

export class UpsertAmmoStockDto {
  @IsIn(CALIBERS)
  caliber: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @MinLength(1, { message: 'El motivo es requerido' })
  notes: string;

  @IsOptional()
  @IsString()
  brand?: string;
}
