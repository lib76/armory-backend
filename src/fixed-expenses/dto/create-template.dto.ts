import { IsString, IsNumber, IsIn, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultAmount: number;

  @IsIn(['ARS', 'USD'])
  currency: 'ARS' | 'USD';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;
}
