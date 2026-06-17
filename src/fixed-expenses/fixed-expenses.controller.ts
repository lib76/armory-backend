import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FixedExpensesService } from './fixed-expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { ApplyTemplatesDto } from './dto/apply-templates.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('fixed-expenses')
export class FixedExpensesController {
  constructor(private readonly service: FixedExpensesService) {}

  // Templates — static routes must come before :id

  @Get('templates')
  getTemplates() {
    return this.service.findAllTemplates();
  }

  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.service.createTemplate(dto);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.service.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string) {
    return this.service.removeTemplate(id);
  }

  // Expenses

  @Get()
  findByMonth(@Query('month') month: string) {
    return this.service.findByMonth(month ?? '');
  }

  @Post('apply-templates')
  applyTemplates(@Body() dto: ApplyTemplatesDto) {
    return this.service.applyTemplates(dto.month);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
