import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('store_config')
export class StoreConfig {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'text', default: '' })
  value: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
