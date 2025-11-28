import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskSortField, TaskSortOrder } from '../enums/task-sort.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status',
    enum: TaskStatus,
    example: TaskStatus.NEW,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter tasks by project ID',
    example: '6748e4341aeb312f7f0c3b12',
  })
  @IsOptional()
  @IsMongoId()
  project?: string;

  @ApiPropertyOptional({
    description: 'Filter tasks by assigned user ID',
    example: '6748e4341aeb312f7f0c3b55',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Sort tasks by selected field',
    enum: TaskSortField,
    example: TaskSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(TaskSortField)
  sortField?: TaskSortField;

  @ApiPropertyOptional({
    description: 'Sort order: ascending or descending',
    enum: TaskSortOrder,
    example: TaskSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(TaskSortOrder)
  sortOrder?: TaskSortOrder;
}
