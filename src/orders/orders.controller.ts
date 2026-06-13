import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { User } from '../users/user.entity';

interface AuthRequest {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: AuthRequest) {
    return this.ordersService.create(dto, req.user);
  }

  @Get('my')
  myOrders(@Request() req: AuthRequest) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}
