import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly protectedEmail: string;

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {
    this.protectedEmail =
      this.config.get<string>('SUPERADMIN_EMAIL') ?? 'paine76@protonmail.com';
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role ?? 'customer',
    });
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.email === this.protectedEmail) {
      throw new ForbiddenException('Esta cuenta no puede ser modificada');
    }
    if (dto.password) {
      (user as User & { passwordHash: string }).passwordHash = await bcrypt.hash(dto.password, 10);
    }
    const { password: _pw, ...rest } = dto;
    Object.assign(user, rest);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.email === this.protectedEmail) {
      throw new ForbiddenException('Esta cuenta no puede ser eliminada');
    }
    await this.repo.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.repo.findOne({ where: { email: this.protectedEmail } });
    if (!existing) {
      await this.create({
        email: this.protectedEmail,
        password: this.config.get<string>('ADMIN_PASSWORD') ?? 'admin123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
      });
    } else if (existing.role !== 'superadmin') {
      existing.role = 'superadmin';
      await this.repo.save(existing);
    }
  }
}
