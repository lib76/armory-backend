import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import type { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES = [
  { name: 'Pistolas', slug: 'pistolas' },
  { name: 'Rifles', slug: 'rifles' },
  { name: 'Escopetas', slug: 'escopetas' },
  { name: 'Munición', slug: 'municion' },
  { name: 'Accesorios', slug: 'accesorios' },
  { name: 'Indumentaria', slug: 'indumentaria' },
  { name: 'Airsoft', slug: 'airsoft' },
  { name: 'Cuchillos', slug: 'cuchillos' },
  { name: 'Arquería', slug: 'arqueria' },
  { name: 'Decoración', slug: 'decoracion' },
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async onModuleInit() {
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await this.repo.findOne({ where: { slug: cat.slug } });
      if (!exists) {
        await this.repo.save(this.repo.create(cat));
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.repo.create(dto);
    return this.repo.save(category);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findOne(id);
    try {
      await this.repo.remove(category);
    } catch {
      throw new BadRequestException('No se puede eliminar una categoría que tiene productos asociados');
    }
  }
}
