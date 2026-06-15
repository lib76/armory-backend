import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreConfig } from './store-config.entity';
import { StoreConfigService } from './store-config.service';
import { StoreConfigController } from './store-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreConfig])],
  controllers: [StoreConfigController],
  providers: [StoreConfigService],
})
export class StoreConfigModule {}
