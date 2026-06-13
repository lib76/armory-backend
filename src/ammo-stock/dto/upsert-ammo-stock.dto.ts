import { IsString, IsInt, Min, MinLength } from 'class-validator';

export class UpsertAmmoStockDto {
  @IsString()
  @MinLength(1)
  caliber: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
