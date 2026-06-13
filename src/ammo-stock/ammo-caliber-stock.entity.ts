import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('ammo_caliber_stock')
export class AmmoCaliberStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  caliber: string;

  @Column({ default: 0 })
  quantity: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
