import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateWebOrderDto } from './dto/create-web-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { User } from '../users/user.entity';

interface AuthRequest {
  user: User;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('web')
  createWeb(@Body() dto: CreateWebOrderDto) {
    return this.ordersService.createWebOrder(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req: AuthRequest) {
    return this.ordersService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('finance')
  finance(@Query('from') from?: string, @Query('to') to?: string) {
    return this.ordersService.getFinanceSummary(from, to);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myOrders(@Request() req: AuthRequest) {
    return this.ordersService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }
}
