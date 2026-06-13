import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AmmoStockService } from './ammo-stock.service';
import { UpsertAmmoStockDto } from './dto/upsert-ammo-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ammo-stock')
export class AmmoStockController {
  constructor(private readonly ammoStockService: AmmoStockService) {}

  @Get()
  findAll() {
    return this.ammoStockService.findAll();
  }

  @Post()
  upsert(@Body() dto: UpsertAmmoStockDto) {
    return this.ammoStockService.upsert(dto);
  }
}
