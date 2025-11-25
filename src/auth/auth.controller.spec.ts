import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  // -----------------------------------
  // REGISTER
  // -----------------------------------
  it('should call authService.register with dto and return result', async () => {
    const dto: RegisterDto = {
      username: 'test',
      password: '12345',
    };
    const result = { id: '1', ...dto };
    mockAuthService.register.mockResolvedValue(result);

    const response = await controller.register(dto);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(response).toEqual(result);
  });

  // -----------------------------------
  // LOGIN
  // -----------------------------------
  it('should call authService.login with dto and return result', async () => {
    const dto: LoginUserDto = { username: 'test', password: '12345' };
    const result = { accessToken: 'token123' };
    mockAuthService.login.mockResolvedValue(result);

    const response = await controller.login(dto);

    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(response).toEqual(result);
  });
});
