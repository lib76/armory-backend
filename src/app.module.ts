import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { AmmoStockModule } from './ammo-stock/ammo-stock.module';
import { AmmoSalesModule } from './ammo-sales/ammo-sales.module';
import { CustomersModule } from './customers/customers.module';
import { HealthController } from './health.controller';
import { UploadsModule } from './uploads/uploads.module';
import { BrandsModule } from './brands/brands.module';
import { StoreConfigModule } from './store-config/store-config.module';
import { FixedExpensesModule } from './fixed-expenses/fixed-expenses.module';
import { ManualIncomesModule } from './manual-incomes/manual-incomes.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    SuppliersModule,
    AmmoStockModule,
    AmmoSalesModule,
    CustomersModule,
    UploadsModule,
    BrandsModule,
    StoreConfigModule,
    FixedExpensesModule,
    ManualIncomesModule,
  ],
})
export class AppModule {}
