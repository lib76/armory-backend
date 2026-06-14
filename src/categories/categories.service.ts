import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import type { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES = [
  { name: 'Pistolas',    slug: 'pistolas',    isFirearm: true  },
  { name: 'Rifles',      slug: 'rifles',      isFirearm: true  },
  { name: 'Escopetas',   slug: 'escopetas',   isFirearm: true  },
  { name: 'Munición',    slug: 'municion',    isFirearm: false },
  { name: 'Accesorios',  slug: 'accesorios',  isFirearm: false },
  { name: 'Indumentaria',slug: 'indumentaria',isFirearm: false },
  { name: 'Airsoft',     slug: 'airsoft',     isFirearm: false },
  { name: 'Cuchillos',   slug: 'cuchillos',   isFirearm: false },
  { name: 'Arquería',    slug: 'arqueria',    isFirearm: false },
  { name: 'Decoración',  slug: 'decoracion',  isFirearm: false },
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
      } else if (exists.isFirearm !== cat.isFirearm) {
        await this.repo.save({ ...exists, isFirearm: cat.isFirearm });
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
