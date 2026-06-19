import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AmmoStockService } from './ammo-stock.service';
import { UpsertAmmoStockDto } from './dto/upsert-ammo-stock.dto';
import { RestockAmmoStockDto } from './dto/restock-ammo-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { User } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('ammo-stock')
export class AmmoStockController {
  constructor(private readonly ammoStockService: AmmoStockService) {}

  @Get()
  findAll() {
    return this.ammoStockService.findAll();
  }

  @Get('movements')
  findAllHistory() {
    return this.ammoStockService.findAllHistory();
  }

  @Get(':caliber/history')
  findHistory(@Param('caliber') caliber: string) {
    return this.ammoStockService.findHistory(decodeURIComponent(caliber));
  }

  @Post()
  upsert(@Body() dto: UpsertAmmoStockDto, @Req() req: { user: User }) {
    return this.ammoStockService.upsert(dto, req.user);
  }

  @Post('restock')
  restock(@Body() dto: RestockAmmoStockDto, @Req() req: { user: User }) {
    return this.ammoStockService.restock(dto, req.user);
  }
}
