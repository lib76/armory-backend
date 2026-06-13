import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmmoSale } from './ammo-sale.entity';
import { AmmoSalesService } from './ammo-sales.service';
import { AmmoSalesController } from './ammo-sales.controller';
import { AmmoStockModule } from '../ammo-stock/ammo-stock.module';

@Module({
  imports: [TypeOrmModule.forFeature([AmmoSale]), AmmoStockModule],
  controllers: [AmmoSalesController],
  providers: [AmmoSalesService],
})
export class AmmoSalesModule {}
