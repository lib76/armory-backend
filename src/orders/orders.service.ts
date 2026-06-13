import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem } from './order.entity';
import { ProductsService } from '../products/products.service';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { User } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly itemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto, user: User): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const product = await this.productsService.findOne(itemDto.productId);

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}"`,
          );
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

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    order.status = status;
    return this.orderRepo.save(order);
  }
}
