import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('expense_templates')
export class ExpenseTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 12, scale: 2, name: 'default_amount' })
  defaultAmount: number;

  @Column({ length: 3, default: 'ARS' })
  currency: 'ARS' | 'USD';

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
