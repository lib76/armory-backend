import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ManualExpense } from './manual-expense.entity';
import { CreateManualExpenseDto } from './dto/create-manual-expense.dto';
import { UpdateManualExpenseDto } from './dto/update-manual-expense.dto';

@Injectable()
export class ManualExpensesService {
  constructor(
    @InjectRepository(ManualExpense)
    private readonly repo: Repository<ManualExpense>,
  ) {}

  findByMonth(month: string): Promise<ManualExpense[]> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return Promise.resolve([]);
    const [year, m] = month.split('-').map(Number);
    const lastDay = new Date(year, m, 0).getDate();
    return this.repo.find({
      where: { date: Between(`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`) },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(dto: CreateManualExpenseDto): Promise<ManualExpense> {
    const expense = this.repo.create({
      name: dto.name,
      category: dto.category,
      currency: dto.currency,
      amountARS: dto.amountARS,
      amountForeign: dto.amountForeign ?? null,
      exchangeRate: dto.exchangeRate ?? null,
      supplierId: dto.supplierId ?? null,
      supplierName: dto.supplierName ?? null,
      notes: dto.notes ?? null,
      date: dto.date,
    });
    return this.repo.save(expense);
  }

  async update(id: string, dto: UpdateManualExpenseDto): Promise<ManualExpense> {
    const expense = await this.repo.findOneBy({ id });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    Object.assign(expense, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.currency !== undefined && { currency: dto.currency }),
      ...(dto.amountARS !== undefined && { amountARS: dto.amountARS }),
      ...(dto.amountForeign !== undefined && { amountForeign: dto.amountForeign }),
      ...(dto.exchangeRate !== undefined && { exchangeRate: dto.exchangeRate }),
      ...(dto.supplierId !== undefined && { supplierId: dto.supplierId }),
      ...(dto.supplierName !== undefined && { supplierName: dto.supplierName }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.date !== undefined && { date: dto.date }),
    });
    return this.repo.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.repo.findOneBy({ id });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    await this.repo.remove(expense);
  }
}
