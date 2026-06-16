import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  IsString,
  MinLength,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WebOrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateWebOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebOrderItemDto)
  items: WebOrderItemDto[];

  @IsString()
  @MinLength(2)
  customerFirstName: string;

  @IsString()
  @MinLength(2)
  customerLastName: string;

  @IsString()
  @MinLength(6)
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
