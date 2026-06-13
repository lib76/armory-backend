import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmmoCaliberStock } from './ammo-caliber-stock.entity';
import type { UpsertAmmoStockDto } from './dto/upsert-ammo-stock.dto';

@Injectable()
export class AmmoStockService {
  constructor(
    @InjectRepository(AmmoCaliberStock)
    private readonly repo: Repository<AmmoCaliberStock>,
  ) {}

  findAll(): Promise<AmmoCaliberStock[]> {
    return this.repo.find({ order: { caliber: 'ASC' } });
  }

  async findByCaliber(caliber: string): Promise<AmmoCaliberStock | null> {
    return this.repo.findOne({ where: { caliber } });
  }

  async upsert(dto: UpsertAmmoStockDto): Promise<AmmoCaliberStock> {
    const existing = await this.repo.findOne({ where: { caliber: dto.caliber } });
    if (existing) {
      existing.quantity = dto.quantity;
      return this.repo.save(existing);
    }
    return this.repo.save(this.repo.create(dto));
  }
}
