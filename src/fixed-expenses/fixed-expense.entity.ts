import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('fixed_expenses')
export class FixedExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'ARS' })
  currency: 'ARS' | 'USD';

  @Column({ length: 7 })
  month: string;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({ name: 'template_id', nullable: true, type: 'uuid' })
  templateId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
