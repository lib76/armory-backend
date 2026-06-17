import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedExpense } from './fixed-expense.entity';
import { ExpenseTemplate } from './expense-template.entity';
import { FixedExpensesService } from './fixed-expenses.service';
import { FixedExpensesController } from './fixed-expenses.controller';
import { FixedExpensesScheduler } from './fixed-expenses.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([FixedExpense, ExpenseTemplate])],
  controllers: [FixedExpensesController],
  providers: [FixedExpensesService, FixedExpensesScheduler],
})
export class FixedExpensesModule {}
