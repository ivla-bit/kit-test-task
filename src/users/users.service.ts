import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './shemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { toObjectId } from '../common/helpers/toObject';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOneById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(toObjectId(id)).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const created = new this.userModel(createUserDto);
    return created.save();
  }

  async deleteById(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(toObjectId(id)).exec();
  }
}
