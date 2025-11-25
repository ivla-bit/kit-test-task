import { IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'Username must be a string' })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;
}
