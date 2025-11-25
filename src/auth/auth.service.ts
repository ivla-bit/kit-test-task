import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';

import { LoginUserDto } from './dto/login.dto';
import { AuthResponse } from './types/auth-response.type';
import { UserDocument } from 'src/users/shemas/user.schema';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { username, password } = dto;
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      username,
      password: hashedPassword,
    });
    console.log(user);
    return this.generateToken(user);
  }

  async login(dto: LoginUserDto): Promise<AuthResponse> {
    const { username, password } = dto;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  private generateToken(user: UserDocument): AuthResponse {
    const payload = {
      sub: user._id,
      username: user.username,
    };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
