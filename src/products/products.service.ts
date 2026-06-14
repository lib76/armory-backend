import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { Brand } from '../brands/brand.entity';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  findAll(categoryId?: string, brandId?: string, showAll = false): Promise<Product[]> {
    const where: Record<string, unknown> = {};
    if (!showAll) where.isActive = true;
    if (categoryId) where.category = { id: categoryId };
    if (brandId) where.brand = { id: brandId };

    return this.repo.find({
      where,
      relations: ['category', 'brand'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id }, relations: ['category', 'brand'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock ?? 0,
      imageUrl: dto.imageUrl ?? null,
      currency: dto.currency ?? 'ARS',
      isActive: dto.isActive ?? true,
      category: { id: dto.categoryId },
      brand: dto.brandId ? ({ id: dto.brandId } as Brand) : null,
    });
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { categoryId, brandId, ...rest } = dto;
    Object.assign(product, rest);
    if (categoryId) product.category = { id: categoryId } as Product['category'];
    if (brandId !== undefined) {
      product.brand = brandId ? ({ id: brandId } as Brand) : null;
    }
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
