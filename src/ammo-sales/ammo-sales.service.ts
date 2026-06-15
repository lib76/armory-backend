import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AmmoSale } from './ammo-sale.entity';
import { AmmoCaliberStock } from '../ammo-stock/ammo-caliber-stock.entity';
import { AmmoStockService } from '../ammo-stock/ammo-stock.service';
import type { CreateAmmoSaleDto } from './dto/create-ammo-sale.dto';
import type { User } from '../users/user.entity';

@Injectable()
export class AmmoSalesService {
  constructor(
    @InjectRepository(AmmoSale)
    private readonly repo: Repository<AmmoSale>,
    private readonly dataSource: DataSource,
    private readonly ammoStockService: AmmoStockService,
  ) {}

  findAll(): Promise<AmmoSale[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: CreateAmmoSaleDto, admin: Pick<User, 'id' | 'firstName' | 'lastName'> | null): Promise<AmmoSale> {
    if (!dto.isInternalConsumption && !dto.customerId) {
      throw new BadRequestException(
        'Debe indicar un cliente o marcar como Consumo interno.',
      );
    }

    const sale = await this.dataSource.transaction(async (manager) => {
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

      const stockBefore = stock.quantity;
      stock.quantity -= dto.quantity;
      const stockAfter = stock.quantity;
      await manager.save(stock);

      const saleRecord = manager.create(AmmoSale, {
        quantity: dto.quantity,
        brand: dto.brand,
        caliber: dto.caliber,
        stockBefore,
        stockAfter,
        supplier: { id: dto.supplierId },
        customer: dto.customerId ? { id: dto.customerId } : null,
        isInternalConsumption: dto.isInternalConsumption ?? false,
      });

      return manager.save(saleRecord);
    });

    // Load relations for history record
    const full = await this.repo.findOne({ where: { id: sale.id } });
    const customerName = full?.customer
      ? `${full.customer.firstName} ${full.customer.lastName}`
      : null;

    await this.ammoStockService.createHistoryRecord({
      caliber: dto.caliber,
      quantityBefore: sale.stockBefore,
      quantityAfter: sale.stockAfter,
      reason: dto.isInternalConsumption ? 'internal_consumption' : 'sale',
      admin,
      customerId: full?.customer?.id ?? null,
      customerName,
    });

    return sale;
  }

  async remove(id: string, admin: Pick<User, 'id' | 'firstName' | 'lastName'> | null): Promise<void> {
    let saleCalib = '';
    let stockBefore = 0;
    let stockAfter = 0;

    await this.dataSource.transaction(async (manager) => {
      const sale = await manager.findOne(AmmoSale, { where: { id } });
      if (!sale) throw new NotFoundException('Venta no encontrada');

      saleCalib = sale.caliber;
      const stock = await manager.findOne(AmmoCaliberStock, {
        where: { caliber: sale.caliber },
      });

      if (stock) {
        stockBefore = stock.quantity;
        stock.quantity += sale.quantity;
        stockAfter = stock.quantity;
        await manager.save(stock);
      }

      await manager.remove(sale);
    });

    await this.ammoStockService.createHistoryRecord({
      caliber: saleCalib,
      quantityBefore: stockBefore,
      quantityAfter: stockAfter,
      reason: 'sale_reversal',
      admin,
    });
  }
}
