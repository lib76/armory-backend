import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import type { CreateCustomerDto } from './dto/create-customer.dto';
import type { UpdateCustomerDto } from './dto/update-customer.dto';

export interface FindOrCreateInput {
  firstName: string;
  lastName: string;
  phone: string;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findAll(search?: string): Promise<Customer[]> {
    if (search && search.trim().length > 0) {
      return this.repo.find({
        where: [
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
          { dni: ILike(`%${search}%`) },
        ],
        order: { lastName: 'ASC', firstName: 'ASC' },
        take: 10,
      });
    }
    return this.repo.find({ order: { lastName: 'ASC', firstName: 'ASC' } });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  create(dto: CreateCustomerDto): Promise<Customer> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.repo.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }

  async findOrCreate(input: FindOrCreateInput): Promise<Customer> {
    const normalizedPhone = input.phone.replace(/\D/g, '');
    const existing = await this.repo.findOne({
      where: {
        firstName: ILike(input.firstName.trim()),
        lastName: ILike(input.lastName.trim()),
        phone: ILike(`%${normalizedPhone}%`),
      },
    });
    if (existing) return existing;

    return this.repo.save(
      this.repo.create({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        dni: null,
        clu: null,
      }),
    );
  }
}
