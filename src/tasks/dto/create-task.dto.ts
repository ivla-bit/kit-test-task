import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Fix bug #123',
    description: 'The title of the task',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'This task involves fixing the login bug.',
    description: 'The description of the task',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    example: '609e129e1c4ae12f34567890',
    description: 'The ID of the user assigned to the task',
  })
  @IsMongoId({ message: 'AssignedTo must be a valid Mongo ID' })
  @IsNotEmpty({ message: 'AssignedTo is required' })
  assignedTo: string;

  @ApiProperty({
    example: '609e129e1c4ae12f34567891',
    description: 'The ID of the project this task belongs to',
  })
  @IsMongoId({ message: 'Project must be a valid Mongo ID' })
  @IsNotEmpty({ message: 'Project is required' })
  project: string;

  @ApiProperty({
    example: TaskStatus.IN_PROGRESS,
    description: 'The status of the task',
    required: false,
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  status?: TaskStatus;

  @ApiProperty({
    example: '2024-12-31T23:59:59.999Z',
    description: 'The due date of the task in ISO 8601 format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
}
