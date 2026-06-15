import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type StockChangeReason =
  | 'manual_adjustment'
  | 'sale'
  | 'internal_consumption'
  | 'sale_reversal';

@Entity('ammo_stock_history')
export class AmmoStockHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  caliber: string;

  @Column({ name: 'quantity_before' })
  quantityBefore: number;

  @Column({ name: 'quantity_after' })
  quantityAfter: number;

  @Column({ type: 'varchar', length: 30 })
  reason: StockChangeReason;

  @Column({ name: 'admin_id', type: 'uuid', nullable: true })
  adminId: string | null;

  @Column({ name: 'admin_name' })
  adminName: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
