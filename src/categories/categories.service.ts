import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import type { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_CATEGORIES = [
  { name: 'Pistolas',     slug: 'pistolas',     isFirearm: true,  isFeatured: true,  featuredOrder: 0    },
  { name: 'Rifles',       slug: 'rifles',       isFirearm: true,  isFeatured: true,  featuredOrder: 1    },
  { name: 'Escopetas',    slug: 'escopetas',    isFirearm: true,  isFeatured: true,  featuredOrder: 2    },
  { name: 'Munición',     slug: 'municion',     isFirearm: false, isFeatured: true,  featuredOrder: 3    },
  { name: 'Accesorios',   slug: 'accesorios',   isFirearm: false, isFeatured: true,  featuredOrder: 4    },
  { name: 'Indumentaria', slug: 'indumentaria', isFirearm: false, isFeatured: false, featuredOrder: null },
  { name: 'Airsoft',      slug: 'airsoft',      isFirearm: false, isFeatured: false, featuredOrder: null },
  { name: 'Cuchillos',    slug: 'cuchillos',    isFirearm: false, isFeatured: false, featuredOrder: null },
  { name: 'Arquería',     slug: 'arqueria',     isFirearm: false, isFeatured: false, featuredOrder: null },
  { name: 'Decoración',   slug: 'decoracion',   isFirearm: false, isFeatured: false, featuredOrder: null },
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
      } else {
        const needsPatch =
          exists.isFirearm !== cat.isFirearm ||
          exists.isFeatured !== cat.isFeatured ||
          (exists.featuredOrder === null && cat.featuredOrder !== null);
        if (needsPatch) {
          await this.repo.save({
            ...exists,
            isFirearm: cat.isFirearm,
            isFeatured: cat.isFeatured,
            // only initialize featuredOrder if it hasn't been set yet
            ...(exists.featuredOrder === null ? { featuredOrder: cat.featuredOrder } : {}),
          });
        }
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.repo
      .createQueryBuilder('c')
      .orderBy('CASE WHEN c.featured_order IS NULL THEN 1 ELSE 0 END', 'ASC')
      .addOrderBy('c.featured_order', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .getMany();
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

  async reorder(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.repo.update(ids[i], { featuredOrder: i });
    }
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
