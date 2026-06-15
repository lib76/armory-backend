import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreConfig } from './store-config.entity';

const DEFAULTS: Record<string, string> = {
  whatsapp_number: '',
  whatsapp_greeting: 'Hola, me comunico desde la web de Armería TFALP. ',
};

const PUBLIC_KEYS = ['whatsapp_number', 'whatsapp_greeting'];

@Injectable()
export class StoreConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreConfig)
    private readonly repo: Repository<StoreConfig>,
  ) {}

  async onModuleInit() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      const exists = await this.repo.findOne({ where: { key } });
      if (!exists) {
        await this.repo.save(this.repo.create({ key, value }));
      }
    }
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async getPublic(): Promise<Record<string, string>> {
    const all = await this.getAll();
    return Object.fromEntries(
      PUBLIC_KEYS.map((k) => [k, all[k] ?? '']),
    );
  }

  async set(updates: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      await this.repo.upsert({ key, value }, ['key']);
    }
  }
}
