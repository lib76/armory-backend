import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('manual_expenses')
export class ManualExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 20 })
  category: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountARS: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amountForeign: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  exchangeRate: number | null;

  @Column({ type: 'varchar', nullable: true })
  supplierId: string | null;

  @Column({ type: 'varchar', nullable: true })
  supplierName: string | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
