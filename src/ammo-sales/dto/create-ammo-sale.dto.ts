import { IsString, IsInt, IsUUID, Min, MinLength } from 'class-validator';

export class CreateAmmoSaleDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  brand: string;

  @IsString()
  @MinLength(1)
  caliber: string;

  @IsUUID()
  supplierId: string;
}
