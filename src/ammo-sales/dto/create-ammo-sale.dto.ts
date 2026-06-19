import { IsString, IsInt, IsUUID, IsBoolean, IsOptional, IsIn, Min, MinLength } from 'class-validator';
import { CALIBERS } from '../../ammo-stock/calibers.constant';

export class CreateAmmoSaleDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  brand: string;

  @IsIn(CALIBERS)
  caliber: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsBoolean()
  isInternalConsumption?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
