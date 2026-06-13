import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmmoCaliberStock } from './ammo-caliber-stock.entity';
import { AmmoStockService } from './ammo-stock.service';
import { AmmoStockController } from './ammo-stock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AmmoCaliberStock])],
  controllers: [AmmoStockController],
  providers: [AmmoStockService],
  exports: [AmmoStockService],
})
export class AmmoStockModule {}
