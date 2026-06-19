import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmmoCaliberStock } from './ammo-caliber-stock.entity';
import { AmmoStockHistory, type StockChangeReason } from './ammo-stock-history.entity';
import type { UpsertAmmoStockDto } from './dto/upsert-ammo-stock.dto';
import type { RestockAmmoStockDto } from './dto/restock-ammo-stock.dto';
import type { User } from '../users/user.entity';

export interface HistoryRecordInput {
  caliber: string;
  quantityBefore: number;
  quantityAfter: number;
  reason: StockChangeReason;
  admin: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
  customerId?: string | null;
  customerName?: string | null;
  ammoSaleId?: string | null;
  brand?: string | null;
  notes?: string | null;
}

@Injectable()
export class AmmoStockService {
  constructor(
    @InjectRepository(AmmoCaliberStock)
    private readonly repo: Repository<AmmoCaliberStock>,
    @InjectRepository(AmmoStockHistory)
    private readonly historyRepo: Repository<AmmoStockHistory>,
  ) {}

  findAll(): Promise<AmmoCaliberStock[]> {
    return this.repo.find({ order: { caliber: 'ASC' } });
  }

  async findByCaliber(caliber: string): Promise<AmmoCaliberStock | null> {
    return this.repo.findOne({ where: { caliber } });
  }

  async findHistory(caliber: string): Promise<AmmoStockHistory[]> {
    return this.historyRepo.find({
      where: { caliber },
      order: { createdAt: 'DESC' },
    });
  }

  findAllHistory(): Promise<AmmoStockHistory[]> {
    return this.historyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async upsert(dto: UpsertAmmoStockDto, admin: Pick<User, 'id' | 'firstName' | 'lastName'> | null): Promise<AmmoCaliberStock> {
    const existing = await this.repo.findOne({ where: { caliber: dto.caliber } });
    const quantityBefore = existing?.quantity ?? 0;

    let record: AmmoCaliberStock;
    if (existing) {
      existing.quantity = dto.quantity;
      record = await this.repo.save(existing);
    } else {
      record = await this.repo.save(this.repo.create(dto));
    }

    await this.createHistoryRecord({
      caliber: dto.caliber,
      quantityBefore,
      quantityAfter: dto.quantity,
      reason: 'manual_adjustment',
      admin,
      notes: dto.notes ?? null,
    });

    return record;
  }

  async restock(dto: RestockAmmoStockDto, admin: Pick<User, 'id' | 'firstName' | 'lastName'> | null): Promise<AmmoCaliberStock> {
    const existing = await this.repo.findOne({ where: { caliber: dto.caliber } });
    if (!existing) {
      throw new NotFoundException(
        `No hay stock configurado para el calibre "${dto.caliber}". Crealo primero con un Ajuste de stock.`,
      );
    }
    const quantityBefore = existing.quantity;
    existing.quantity += dto.quantity;
    const record = await this.repo.save(existing);

    await this.createHistoryRecord({
      caliber: dto.caliber,
      quantityBefore,
      quantityAfter: record.quantity,
      reason: 'restock',
      admin,
      brand: dto.brand ?? null,
      notes: dto.notes ?? null,
    });

    return record;
  }

  async createHistoryRecord(input: HistoryRecordInput): Promise<void> {
    const entry = this.historyRepo.create({
      caliber: input.caliber,
      quantityBefore: input.quantityBefore,
      quantityAfter: input.quantityAfter,
      reason: input.reason,
      adminId: input.admin?.id ?? null,
      adminName: input.admin
        ? `${input.admin.firstName} ${input.admin.lastName}`
        : 'Sistema',
      customerId: input.customerId ?? null,
      customerName: input.customerName ?? null,
      ammoSaleId: input.ammoSaleId ?? null,
      brand: input.brand ?? null,
      notes: input.notes ?? null,
    });
    await this.historyRepo.save(entry);
  }
}
