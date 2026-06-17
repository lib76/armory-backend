import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ManualExpensesService } from './manual-expenses.service';
import { CreateManualExpenseDto } from './dto/create-manual-expense.dto';
import { UpdateManualExpenseDto } from './dto/update-manual-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('manual-expenses')
export class ManualExpensesController {
  constructor(private readonly service: ManualExpensesService) {}

  @Get()
  findByMonth(@Query('month') month: string) {
    return this.service.findByMonth(month ?? '');
  }

  @Post()
  create(@Body() dto: CreateManualExpenseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateManualExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
