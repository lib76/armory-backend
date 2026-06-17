import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';
import type { CreateSupplierDto } from './dto/create-supplier.dto';
import type { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  findAll(): Promise<Supplier[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  create(dto: CreateSupplierDto): Promise<Supplier> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.repo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    Object.assign(supplier, dto);
    return this.repo.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.repo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    try {
      await this.repo.remove(supplier);
    } catch {
      throw new BadRequestException('No se puede eliminar un proveedor que tiene ventas de munición asociadas');
    }
  }
}
