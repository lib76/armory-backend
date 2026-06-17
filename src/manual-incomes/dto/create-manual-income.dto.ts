import {
  IsString, IsNumber, IsIn, IsOptional, IsBoolean,
  IsUUID, Min, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateManualIncomeDto {
  @IsString()
  name: string;

  @IsIn(['product_sale', 'service', 'other'])
  category: string;

  @IsIn(['ARS', 'USD'])
  currency: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountARS: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountForeign?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  exchangeRate?: number;

  @IsIn(['cash', 'transfer'])
  paymentMethod: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
