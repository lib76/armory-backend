import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AmmoSalesService } from './ammo-sales.service';
import { CreateAmmoSaleDto } from './dto/create-ammo-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { User } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('ammo-sales')
export class AmmoSalesController {
  constructor(private readonly ammoSalesService: AmmoSalesService) {}

  @Get()
  findAll() {
    return this.ammoSalesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAmmoSaleDto, @Req() req: { user: User }) {
    return this.ammoSalesService.create(dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    return this.ammoSalesService.remove(id, req.user);
  }
}
