import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AmmoSale } from './ammo-sale.entity';
import { AmmoCaliberStock } from '../ammo-stock/ammo-caliber-stock.entity';
import type { CreateAmmoSaleDto } from './dto/create-ammo-sale.dto';

@Injectable()
export class AmmoSalesService {
  constructor(
    @InjectRepository(AmmoSale)
    private readonly repo: Repository<AmmoSale>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<AmmoSale[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateAmmoSaleDto): Promise<AmmoSale> {
    return this.dataSource.transaction(async (manager) => {
      const stock = await manager.findOne(AmmoCaliberStock, {
        where: { caliber: dto.caliber },
      });

      if (!stock) {
        throw new NotFoundException(
          `No hay stock configurado para el calibre "${dto.caliber}". Configuralo primero en Stock por calibre.`,
        );
      }

      if (stock.quantity < dto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Stock actual de ${dto.caliber}: ${stock.quantity} unidades.`,
        );
      }

      stock.quantity -= dto.quantity;
      await manager.save(stock);

      const sale = manager.create(AmmoSale, {
        quantity: dto.quantity,
        brand: dto.brand,
        caliber: dto.caliber,
        supplier: { id: dto.supplierId },
      });

      return manager.save(sale);
    });
  }

  async remove(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(AmmoSale, { where: { id } });
      if (!sale) throw new NotFoundException('Venta no encontrada');

      const stock = await manager.findOne(AmmoCaliberStock, {
        where: { caliber: sale.caliber },
      });

      if (stock) {
        stock.quantity += sale.quantity;
        await manager.save(stock);
      }

      await manager.remove(sale);
    });
  }
}
