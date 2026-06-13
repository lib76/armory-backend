import { IsString, MinLength, Matches } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CUIT/CUIM debe tener 11 dígitos numéricos' })
  cuitCuim: string;
}
