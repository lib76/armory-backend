import {
  IsString, IsNotEmpty, IsIn, IsNumber, IsPositive, IsOptional,
  IsUUID, Min, Matches,
} from 'class-validator';

export class CreateManualExpenseDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsIn(['inventory', 'supplies', 'services', 'other'])
  category: string;

  @IsIn(['ARS', 'USD'])
  currency: string;

  @IsNumber() @IsPositive()
  amountARS: number;

  @IsOptional() @IsNumber() @Min(0)
  amountForeign?: number;

  @IsOptional() @IsNumber() @Min(0)
  exchangeRate?: number;

  @IsOptional() @IsUUID()
  supplierId?: string;

  @IsOptional() @IsString()
  supplierName?: string;

  @IsOptional() @IsString()
  notes?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;
}
