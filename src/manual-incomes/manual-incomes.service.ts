import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ManualIncome } from './manual-income.entity';
import type { CreateManualIncomeDto } from './dto/create-manual-income.dto';
import type { UpdateManualIncomeDto } from './dto/update-manual-income.dto';

@Injectable()
export class ManualIncomesService {
  constructor(
    @InjectRepository(ManualIncome)
    private readonly repo: Repository<ManualIncome>,
  ) {}

  findByMonth(month: string): Promise<ManualIncome[]> {
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    return this.repo.find({
      where: { date: Between(`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`) },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  create(dto: CreateManualIncomeDto): Promise<ManualIncome> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        amountForeign: dto.amountForeign ?? null,
        exchangeRate: dto.exchangeRate ?? null,
        customerId: dto.customerId ?? null,
        customerName: dto.customerName ?? null,
        notes: dto.notes ?? null,
        isInternal: dto.isInternal ?? false,
      }),
    );
  }

  async update(id: string, dto: UpdateManualIncomeDto): Promise<ManualIncome> {
    const income = await this.repo.findOne({ where: { id } });
    if (!income) throw new NotFoundException('Ingreso no encontrado');
    Object.assign(income, dto);
    return this.repo.save(income);
  }

  async remove(id: string): Promise<void> {
    const income = await this.repo.findOne({ where: { id } });
    if (!income) throw new NotFoundException('Ingreso no encontrado');
    await this.repo.remove(income);
  }
}
