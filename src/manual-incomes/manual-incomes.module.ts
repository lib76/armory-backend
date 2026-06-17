import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManualIncome } from './manual-income.entity';
import { ManualIncomesService } from './manual-incomes.service';
import { ManualIncomesController } from './manual-incomes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ManualIncome])],
  controllers: [ManualIncomesController],
  providers: [ManualIncomesService],
})
export class ManualIncomesModule {}
