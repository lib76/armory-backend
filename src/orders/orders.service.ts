import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem } from './order.entity';
import { Product } from '../products/product.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { CreateWebOrderDto } from './dto/create-web-order.dto';
import type { UpdateOrderDto } from './dto/update-order.dto';
import type { User } from '../users/user.entity';

export interface FinanceSummary {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  byMonth: Array<{ month: string; revenue: number; count: number }>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto, user: User): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
        }

        product.stock -= itemDto.quantity;
        await manager.save(product);

        const item = manager.create(OrderItem, {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: itemDto.quantity,
        });
        orderItems.push(item);
        total += Number(product.price) * itemDto.quantity;
      }

      const order = manager.create(Order, {
        user,
        total,
        currency: 'ARS',
        status: 'pending',
        items: orderItems,
      });

      return manager.save(order);
    });
  }

  async createWebOrder(dto: CreateWebOrderDto): Promise<Order> {
    const customer = await this.customersService.findOrCreate({
      firstName: dto.customerFirstName,
      lastName: dto.customerLastName,
      phone: dto.customerPhone,
    });

    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(`Stock insuficiente para "${product.name}"`);
        }

        product.stock -= itemDto.quantity;
        await manager.save(product);

        const item = manager.create(OrderItem, {
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: itemDto.quantity,
        });
        orderItems.push(item);
        total += Number(product.price) * itemDto.quantity;
      }

      const order = manager.create(Order, {
        user: null,
        customer,
        customerName: `${dto.customerFirstName.trim()} ${dto.customerLastName.trim()}`,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress ?? null,
        currency: dto.currency ?? 'ARS',
        total,
        status: 'pending',
        items: orderItems,
      });

      return manager.save(order);
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['user'] });
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (dto.status !== undefined) {
      order.status = dto.status;
      if (dto.status === 'paid' && !order.paidAt) {
        order.paidAt = new Date();
      } else if (dto.status !== 'paid') {
        order.paidAt = null;
      }
    }

    if (dto.notes !== undefined) {
      order.notes = dto.notes;
    }

    return this.orderRepo.save(order);
  }

  async getFinanceSummary(from?: string, to?: string): Promise<FinanceSummary> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'paid' });

    if (from) {
      qb.andWhere('order.paid_at >= :from', { from: new Date(from) });
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      qb.andWhere('order.paid_at <= :to', { to: toDate });
    }

    const orders = await qb.getMany();

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const byMonthMap = new Map<string, { revenue: number; count: number }>();
    for (const order of orders) {
      const date = order.paidAt ?? order.createdAt;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = byMonthMap.get(month) ?? { revenue: 0, count: 0 };
      byMonthMap.set(month, {
        revenue: current.revenue + Number(order.total),
        count: current.count + 1,
      });
    }

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { totalRevenue, orderCount, averageOrderValue, byMonth };
  }
}
