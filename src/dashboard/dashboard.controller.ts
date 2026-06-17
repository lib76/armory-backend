import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('pending-orders')
  getPendingOrders() {
    return this.dashboardService.getPendingOrders();
  }

  @Get('top-products')
  getTopProducts(@Query('month') month: string) {
    return this.dashboardService.getTopProducts(month);
  }

  @Get('evolution')
  getEvolution(
    @Query('month') month: string,
    @Query('months') months?: string,
  ) {
    return this.dashboardService.getEvolution(month, months ? Number(months) : 6);
  }
}
