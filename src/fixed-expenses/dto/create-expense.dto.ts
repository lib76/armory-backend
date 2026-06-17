import { IsString, IsNumber, IsIn, IsOptional, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsIn(['ARS', 'USD'])
  currency: 'ARS' | 'USD';

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM' })
  month: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
