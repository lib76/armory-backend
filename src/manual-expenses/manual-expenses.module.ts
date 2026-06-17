import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualExpense } from './manual-expense.entity';
import { ManualExpensesService } from './manual-expenses.service';
import { ManualExpensesController } from './manual-expenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ManualExpense])],
  controllers: [ManualExpensesController],
  providers: [ManualExpensesService],
})
export class ManualExpensesModule {}
