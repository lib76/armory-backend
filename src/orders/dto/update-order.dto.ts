import { IsOptional, IsString, IsIn } from 'class-validator';
import type { OrderStatus } from '../order.entity';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'])
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
