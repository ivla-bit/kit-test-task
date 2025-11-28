import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskFilterDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status',
    enum: TaskStatus,
    example: TaskStatus.NEW,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be a valid TaskStatus' })
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by project ID',
    example: '6748e4341aeb312f7f0c3b12',
  })
  @IsOptional()
  @IsMongoId({ message: 'Project must be a valid Mongo ID' })
  project?: string;

  @ApiPropertyOptional({
    description: 'Filter by assigned user ID',
    example: '6748e4341aeb312f7f0c3b55',
  })
  @IsOptional()
  @IsMongoId({ message: 'AssignedTo must be a valid Mongo ID' })
  assignedTo?: string;
}
