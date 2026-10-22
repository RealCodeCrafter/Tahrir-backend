import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from '../../common/enums';
import { paginate } from '../../common/utils/pagination';
import { User } from './user.entity';
import { AdminUpdateUserDto, CreateUserDto, UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const exists = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) {
      throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
    }
    const user = this.usersRepo.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      password: await bcrypt.hash(dto.password, 10),
      role: dto.role ?? UserRole.USER,
    });
    const saved = await this.usersRepo.save(user);
    return this.findById(saved.id);
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    return user;
  }

  async findByEmail(email: string, withPassword = false) {
    const qb = this.usersRepo.createQueryBuilder('user').where('user.email = :email', {
      email: email.toLowerCase(),
    });
    if (withPassword) {
      qb.addSelect('user.password');
    }
    return qb.getOne();
  }

  async findAll(query: PaginationDto) {
    const qb = this.usersRepo.createQueryBuilder('user').orderBy('user.createdAt', 'DESC');
    if (query.search) {
      qb.andWhere('(user.fullName ILIKE :q OR user.email ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    return paginate(qb, query);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.findById(id);
    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
    await this.usersRepo.save(user);
    return this.findById(id);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    if (dto.email) user.email = dto.email.toLowerCase();
    await this.usersRepo.save(user);
    return this.findById(id);
  }

  async remove(id: string) {
    const user = await this.findById(id);
    await this.usersRepo.remove(user);
    return { deleted: true };
  }

  async save(user: User) {
    return this.usersRepo.save(user);
  }

  async findByResetToken(token: string) {
    return this.usersRepo.findOne({ where: { resetToken: token } });
  }

  sanitize(user: User) {
    const safe = { ...user } as Partial<User>;
    delete safe.password;
    delete safe.resetToken;
    delete safe.resetTokenExpiresAt;
    return safe;
  }
}
