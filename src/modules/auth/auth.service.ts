import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Parollar mos kelmadi');
    }
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
    });
    return this.issue(user.id, user.email, user.role, user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Email yoki parol noto'g'ri");
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Hisob faol emas');
    }
    const safe = await this.usersService.findById(user.id);
    return this.issue(safe.id, safe.email, safe.role, safe);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      user.resetToken = randomBytes(24).toString('hex');
      user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await this.usersService.save(user);
    }
    return {
      message: "Agar email mavjud bo'lsa, parolni tiklash yo'riqnomasi yuborildi",
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException("Token noto'g'ri yoki muddati o'tgan");
    }
    user.password = await bcrypt.hash(dto.password, 10);
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await this.usersService.save(user);
    return { message: 'Parol muvaffaqiyatli yangilandi' };
  }

  private issue(id: string, email: string, role: string, user: unknown) {
    const token = this.jwtService.sign({ sub: id, email, role });
    return {
      token,
      user: this.usersService.sanitize(user as never),
    };
  }
}
