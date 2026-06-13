import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AmmoSalesService } from './ammo-sales.service';
import { CreateAmmoSaleDto } from './dto/create-ammo-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ammo-sales')
export class AmmoSalesController {
  constructor(private readonly ammoSalesService: AmmoSalesService) {}

  @Get()
  findAll() {
    return this.ammoSalesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateAmmoSaleDto) {
    return this.ammoSalesService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ammoSalesService.remove(id);
  }
}
