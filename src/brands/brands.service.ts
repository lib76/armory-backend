import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';
import type { CreateBrandDto } from './dto/create-brand.dto';
import type { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  findAll(): Promise<Brand[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findByCategory(categoryId: string): Promise<Brand[]> {
    return this.repo
      .createQueryBuilder('brand')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('1')
          .from('products', 'p')
          .where('p.brand_id = brand.id')
          .andWhere('p.category_id = :categoryId')
          .andWhere('p.is_active = true')
          .getQuery();
        return `EXISTS ${sub}`;
      })
      .setParameter('categoryId', categoryId)
      .orderBy('brand.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    return brand;
  }

  create(dto: CreateBrandDto): Promise<Brand> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    Object.assign(brand, dto);
    return this.repo.save(brand);
  }

  async delete(id: string): Promise<void> {
    const brand = await this.findOne(id);
    try {
      await this.repo.remove(brand);
    } catch {
      throw new BadRequestException('No se puede eliminar una marca que tiene productos asociados');
    }
  }
}
