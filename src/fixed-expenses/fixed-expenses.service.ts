import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FixedExpense } from './fixed-expense.entity';
import { ExpenseTemplate } from './expense-template.entity';
import type { CreateExpenseDto } from './dto/create-expense.dto';
import type { UpdateExpenseDto } from './dto/update-expense.dto';
import type { CreateTemplateDto } from './dto/create-template.dto';
import type { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class FixedExpensesService {
  constructor(
    @InjectRepository(FixedExpense)
    private readonly expenseRepo: Repository<FixedExpense>,
    @InjectRepository(ExpenseTemplate)
    private readonly templateRepo: Repository<ExpenseTemplate>,
  ) {}

  // ── Templates ──────────────────────────────────────────────────────────────

  findAllTemplates(): Promise<ExpenseTemplate[]> {
    return this.templateRepo.find({ order: { name: 'ASC' } });
  }

  createTemplate(dto: CreateTemplateDto): Promise<ExpenseTemplate> {
    return this.templateRepo.save(this.templateRepo.create(dto));
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<ExpenseTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template no encontrado');
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async removeTemplate(id: string): Promise<void> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template no encontrado');
    await this.templateRepo.remove(template);
  }

  // ── Expenses ───────────────────────────────────────────────────────────────

  findByMonth(month: string): Promise<FixedExpense[]> {
    return this.expenseRepo.find({ where: { month }, order: { createdAt: 'ASC' } });
  }

  create(dto: CreateExpenseDto): Promise<FixedExpense> {
    return this.expenseRepo.save(
      this.expenseRepo.create({ ...dto, notes: dto.notes ?? null, templateId: dto.templateId ?? null }),
    );
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<FixedExpense> {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    Object.assign(expense, dto);
    return this.expenseRepo.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    await this.expenseRepo.remove(expense);
  }

  // Creates one expense per active template that has no instance yet in `month`.
  // Idempotent: safe to call multiple times for the same month.
  async applyTemplates(month: string): Promise<FixedExpense[]> {
    return this.applyTemplatesWhere(month, { isActive: true });
  }

  // Same as applyTemplates but restricted to templates with autoApply = true.
  // Called by the monthly cron job.
  async autoApplyTemplates(month: string): Promise<FixedExpense[]> {
    return this.applyTemplatesWhere(month, { isActive: true, autoApply: true });
  }

  private async applyTemplatesWhere(
    month: string,
    where: { isActive: boolean; autoApply?: boolean },
  ): Promise<FixedExpense[]> {
    const templates = await this.templateRepo.find({ where });
    const existing = await this.expenseRepo.find({ where: { month } });
    const usedTemplateIds = new Set(existing.map((e) => e.templateId).filter(Boolean));

    const created: FixedExpense[] = [];
    for (const t of templates) {
      if (usedTemplateIds.has(t.id)) continue;
      const expense = this.expenseRepo.create({
        name: t.name,
        amount: t.defaultAmount,
        currency: t.currency,
        month,
        notes: null,
        templateId: t.id,
      });
      created.push(await this.expenseRepo.save(expense));
    }
    return created;
  }
}
