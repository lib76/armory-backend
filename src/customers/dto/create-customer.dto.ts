import { IsString, MinLength, Matches, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @Matches(/^\d{7,8}$/, { message: 'DNI debe tener 7 u 8 dígitos' })
  dni: string;

  @IsString()
  @MinLength(2)
  clu: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value || undefined)
  email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  address?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  notes?: string;
}
