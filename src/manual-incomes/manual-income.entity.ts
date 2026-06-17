import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('manual_incomes')
export class ManualIncome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 20 })
  category: string; // 'product_sale' | 'service' | 'other'

  @Column({ length: 3, default: 'ARS' })
  currency: string; // 'ARS' | 'USD'

  // ARS equivalent — always set. If currency=ARS: equals amount. If USD: amountForeign * exchangeRate.
  @Column('decimal', { precision: 12, scale: 2, name: 'amount_ars' })
  amountARS: number;

  // Original foreign-currency amount (null when currency=ARS).
  @Column('decimal', { precision: 12, scale: 2, name: 'amount_foreign', nullable: true })
  amountForeign: number | null;

  // Exchange rate used for conversion (null when currency=ARS).
  @Column('decimal', { precision: 12, scale: 4, name: 'exchange_rate', nullable: true })
  exchangeRate: number | null;

  @Column({ length: 10, name: 'payment_method' })
  paymentMethod: string; // 'cash' | 'transfer'

  @Column({ name: 'is_internal', default: false })
  isInternal: boolean;

  @Column({ nullable: true, name: 'customer_id' })
  customerId: string | null;

  @Column({ nullable: true, name: 'customer_name' })
  customerName: string | null;

  @Column({ nullable: true })
  notes: string | null;

  // User-specified date of the income (YYYY-MM-DD).
  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
