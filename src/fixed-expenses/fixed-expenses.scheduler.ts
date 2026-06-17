import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FixedExpensesService } from './fixed-expenses.service';

@Injectable()
export class FixedExpensesScheduler {
  private readonly logger = new Logger(FixedExpensesScheduler.name);

  constructor(private readonly service: FixedExpensesService) {}

  // Runs at 00:05 on the 1st of every month, AR timezone.
  // The 5-minute offset avoids any edge case at exact midnight.
  @Cron('0 5 0 1 * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async handleMonthlyAutoApply(): Promise<void> {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.logger.log(`Monthly auto-apply starting for ${month}`);
    try {
      const created = await this.service.autoApplyTemplates(month);
      this.logger.log(`Monthly auto-apply done: ${created.length} expense(s) created for ${month}`);
    } catch (err) {
      this.logger.error(`Monthly auto-apply failed for ${month}`, err);
    }
  }
}
