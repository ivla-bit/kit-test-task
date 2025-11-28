/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { User } from './shemas/user.schema';

// Мок toObjectId, чтобы не ругался на "Invalid ObjectId"
jest.mock('../common/helpers/toObject', () => ({
  toObjectId: jest.fn((id: string) => id),
}));

// === МОК МОДЕЛИ ===
class MockUserModel {
  constructor(private data) {
    Object.assign(this, data);
  }

  save = jest.fn().mockImplementation(() => Promise.resolve(this));

  static find = jest.fn().mockReturnThis();
  static exec = jest.fn();
  static findById = jest.fn();
  static findOne = jest.fn().mockReturnThis();
  static findByIdAndDelete = jest.fn().mockReturnThis();
}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  // -------- findAll ----------
  it('should return all users', async () => {
    const users = [{ username: 'test' }];
    MockUserModel.exec.mockResolvedValueOnce(users);

    const result = await service.findAll();

    expect(MockUserModel.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  // -------- findOneById ----------
  it('should return user by ID', async () => {
    const user = { _id: '123', username: 'John' };
    MockUserModel.exec.mockResolvedValueOnce(user);
    MockUserModel.findById.mockReturnValue(MockUserModel);

    const result = await service.findOneById('123');

    expect(MockUserModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user not found', async () => {
    MockUserModel.exec.mockResolvedValueOnce(null);
    MockUserModel.findById.mockReturnValue(MockUserModel);

    await expect(service.findOneById('xxx')).rejects.toThrow(NotFoundException);
  });

  // -------- findByUsername ----------
  it('should find user by username', async () => {
    const user = { _id: '123', username: 'testUser' };
    MockUserModel.exec.mockResolvedValueOnce(user);

    const result = await service.findByUsername('testUser');

    expect(MockUserModel.findOne).toHaveBeenCalledWith({
      username: 'testUser',
    });
    expect(result).toEqual(user);
  });

  // -------- create ----------
  it('should create a user', async () => {
    const dto = { username: 'NewUser', password: '12345' };

    const result = await service.create(dto);

    expect(result).toMatchObject(dto);
    expect(result.save).toHaveBeenCalledTimes(1);
  });

  // -------- deleteById ----------
  it('should delete user by id', async () => {
    const deleted = { _id: '123' };
    MockUserModel.exec.mockResolvedValueOnce(deleted);

    const result = await service.deleteById('123');

    expect(MockUserModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    expect(result).toEqual(deleted);
  });
});
