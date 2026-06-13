import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';
import { Customer } from '../customers/customer.entity';

@Entity('ammo_sales')
export class AmmoSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  brand: string;

  @Column()
  caliber: string;

  @Column({ name: 'stock_before' })
  stockBefore: number;

  @Column({ name: 'stock_after' })
  stockAfter: number;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Customer, { eager: true, nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer | null;

  @Column({ name: 'is_internal_consumption', default: false })
  isInternalConsumption: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
