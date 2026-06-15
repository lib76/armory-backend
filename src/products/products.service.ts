import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { Brand } from '../brands/brand.entity';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  findAll(categoryId?: string, brandId?: string, showAll = false): Promise<Product[]> {
    const where: Record<string, unknown> = {};
    if (!showAll) where.isActive = true;
    if (categoryId) where.category = { id: categoryId };
    if (brandId) where.brand = { id: brandId };

    return this.repo.find({
      where,
      relations: ['category', 'brand', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id }, relations: ['category', 'brand'] });
    if (!product) throw new NotFoundException('Producto no encontrado');
    product.images = product.images?.sort((a, b) => a.position - b.position) ?? [];
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const imageUrls = dto.imageUrls ?? [];

    const product = this.repo.create({
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock ?? 0,
      imageUrl: imageUrls[0] ?? null,
      currency: dto.currency ?? 'ARS',
      condition: dto.condition ?? null,
      caliber: dto.caliber ?? null,
      isActive: dto.isActive ?? true,
      category: { id: dto.categoryId },
      brand: dto.brandId ? ({ id: dto.brandId } as Brand) : null,
    });

    const saved = await this.repo.save(product);

    for (let i = 0; i < imageUrls.length; i++) {
      await this.imageRepo.save(
        this.imageRepo.create({ product: saved, url: imageUrls[i], position: i }),
      );
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { categoryId, brandId, imageUrls, ...rest } = dto;
    Object.assign(product, rest);
    if (categoryId) product.category = { id: categoryId } as Product['category'];
    if (brandId !== undefined) {
      product.brand = brandId ? ({ id: brandId } as Brand) : null;
    }
    if (imageUrls !== undefined) {
      const existing = await this.imageRepo.find({ where: { product: { id } } });
      if (existing.length > 0) await this.imageRepo.remove(existing);
      for (let i = 0; i < imageUrls.length; i++) {
        await this.imageRepo.save(
          this.imageRepo.create({ product, url: imageUrls[i], position: i }),
        );
      }
      product.imageUrl = imageUrls[0] ?? null;
    }
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
