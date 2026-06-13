import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'cuit_cuim', unique: true })
  cuitCuim: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
