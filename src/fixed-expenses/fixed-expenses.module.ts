import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedExpense } from './fixed-expense.entity';
import { ExpenseTemplate } from './expense-template.entity';
import { FixedExpensesService } from './fixed-expenses.service';
import { FixedExpensesController } from './fixed-expenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FixedExpense, ExpenseTemplate])],
  controllers: [FixedExpensesController],
  providers: [FixedExpensesService],
})
export class FixedExpensesModule {}
