import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findByUsername' | 'create'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('должен успешно регистрировать пользователя', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usersService.create.mockResolvedValue({
        _id: '123',
        username: 'test',
      } as any);
      jwtService.sign.mockReturnValue('token_123');

      const result = await authService.register({
        username: 'test',
        password: '12345',
      });

      expect(usersService.findByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.hash).toHaveBeenCalledWith('12345', 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'token_123' });
    });

    it('должен выбрасывать ошибку если username уже занят', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usersService.findByUsername.mockResolvedValue({
        username: 'test',
      } as any);

      await expect(
        authService.register({ username: 'test', password: '123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('должен логинить пользователя', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usersService.findByUsername.mockResolvedValue({
        _id: '123',
        username: 'test',
        password: 'hashed_pw',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token_abc');

      const result = await authService.login({
        username: 'test',
        password: '12345',
      });

      expect(usersService.findByUsername).toHaveBeenCalledWith('test');
      expect(bcrypt.compare).toHaveBeenCalledWith('12345', 'hashed_pw');
      expect(result).toEqual({ accessToken: 'token_abc' });
    });

    it('должен выбрасывать ошибку если username не существует', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(
        authService.login({ username: 'ghost', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен выбрасывать ошибку если пароль неверный', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      usersService.findByUsername.mockResolvedValue({
        username: 'test',
        password: 'hashed_pw',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ username: 'test', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
