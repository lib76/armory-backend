import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ManualIncomesService } from './manual-incomes.service';
import { CreateManualIncomeDto } from './dto/create-manual-income.dto';
import { UpdateManualIncomeDto } from './dto/update-manual-income.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('manual-incomes')
export class ManualIncomesController {
  constructor(private readonly service: ManualIncomesService) {}

  @Get()
  findByMonth(@Query('month') month: string) {
    return this.service.findByMonth(month ?? '');
  }

  @Post()
  create(@Body() dto: CreateManualIncomeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManualIncomeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
