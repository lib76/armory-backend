import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface PendingOrdersSummary {
  countARS: number;
  totalARS: number;
  countUSD: number;
  totalUSD: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

export interface EvolutionEntry {
  month: string;
  income: number;
  expenses: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getPendingOrders(): Promise<PendingOrdersSummary> {
    const rows = await this.dataSource.query<
      Array<{ countARS: string; totalARS: string; countUSD: string; totalUSD: string }>
    >(`
      SELECT
        COUNT(*) FILTER (WHERE currency = 'ARS')::int             AS "countARS",
        COALESCE(SUM(total) FILTER (WHERE currency = 'ARS'), 0)::float AS "totalARS",
        COUNT(*) FILTER (WHERE currency = 'USD')::int             AS "countUSD",
        COALESCE(SUM(total) FILTER (WHERE currency = 'USD'), 0)::float AS "totalUSD"
      FROM orders
      WHERE status NOT IN ('paid', 'cancelled')
    `);
    return {
      countARS: Number(rows[0].countARS),
      totalARS: Number(rows[0].totalARS),
      countUSD: Number(rows[0].countUSD),
      totalUSD: Number(rows[0].totalUSD),
    };
  }

  async getTopProducts(month: string): Promise<TopProduct[]> {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return [];
    const [year, m] = month.split('-').map(Number);
    const from = new Date(year, m - 1, 1);
    const to   = new Date(year, m, 0, 23, 59, 59, 999);
    return this.dataSource.query<TopProduct[]>(`
      SELECT
        oi.product_name AS name,
        SUM(
          CASE WHEN o.currency = 'USD' AND o.exchange_rate IS NOT NULL
               THEN oi.unit_price * oi.quantity * o.exchange_rate
               ELSE oi.unit_price * oi.quantity
          END
        )::float AS revenue,
        SUM(oi.quantity)::int AS quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
        AND COALESCE(o.paid_at, o.created_at) >= $1
        AND COALESCE(o.paid_at, o.created_at) <= $2
      GROUP BY oi.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `, [from, to]);
  }

  async getEvolution(upToMonth: string, months = 6): Promise<EvolutionEntry[]> {
    const [year, m] = (upToMonth || '').split('-').map(Number);
    if (!year || !m) return [];

    const entries: EvolutionEntry[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d  = new Date(year, m - 1 - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      entries.push({ month: ym, income: 0, expenses: 0 });
    }

    const fromMonth = entries[0].month;
    const toMonth   = entries[entries.length - 1].month;

    const [orderRows, incomeRows, fixedRows, manualExpRows] = await Promise.all([
      this.dataSource.query<Array<{ month: string; revenue: string }>>(`
        SELECT
          TO_CHAR(COALESCE(paid_at, created_at) AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM') AS month,
          SUM(CASE WHEN currency = 'USD' AND exchange_rate IS NOT NULL
                   THEN total * exchange_rate ELSE total END)::float AS revenue
        FROM orders
        WHERE status = 'paid'
          AND TO_CHAR(COALESCE(paid_at, created_at) AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM') BETWEEN $1 AND $2
        GROUP BY 1
      `, [fromMonth, toMonth]),

      this.dataSource.query<Array<{ month: string; revenue: string }>>(`
        SELECT LEFT(date::text, 7) AS month, SUM(amount_ars)::float AS revenue
        FROM manual_incomes
        WHERE LEFT(date::text, 7) BETWEEN $1 AND $2
        GROUP BY 1
      `, [fromMonth, toMonth]),

      this.dataSource.query<Array<{ month: string; expenses: string }>>(`
        SELECT month, SUM(CASE WHEN currency = 'ARS' THEN amount ELSE 0 END)::float AS expenses
        FROM fixed_expenses
        WHERE month BETWEEN $1 AND $2
        GROUP BY month
      `, [fromMonth, toMonth]),

      this.dataSource.query<Array<{ month: string; expenses: string }>>(`
        SELECT LEFT(date::text, 7) AS month, SUM(amount_ars)::float AS expenses
        FROM manual_expenses
        WHERE LEFT(date::text, 7) BETWEEN $1 AND $2
        GROUP BY 1
      `, [fromMonth, toMonth]),
    ]);

    for (const entry of entries) {
      entry.income =
        Number(orderRows.find((r) => r.month === entry.month)?.revenue ?? 0) +
        Number(incomeRows.find((r) => r.month === entry.month)?.revenue ?? 0);
      entry.expenses =
        Number(fixedRows.find((r) => r.month === entry.month)?.expenses ?? 0) +
        Number(manualExpRows.find((r) => r.month === entry.month)?.expenses ?? 0);
    }

    return entries;
  }
}
