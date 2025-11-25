import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class CreateTaskDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsMongoId({ message: 'AssignedTo must be a valid Mongo ID' })
  @IsNotEmpty({ message: 'AssignedTo is required' })
  assignedTo: string;

  @IsMongoId({ message: 'Project must be a valid Mongo ID' })
  @IsNotEmpty({ message: 'Project is required' })
  project: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}
