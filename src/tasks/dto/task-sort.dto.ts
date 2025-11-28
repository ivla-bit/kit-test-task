import { IsEnum, IsOptional } from 'class-validator';
import { TaskSortField, TaskSortOrder } from '../enums/task-sort.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TaskSortDto {
  @ApiPropertyOptional({
    description: 'Field to sort tasks by',
    enum: TaskSortField,
    example: TaskSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(TaskSortField, {
    message: 'Sort field must be one of: createdAt, dueDate, status',
  })
  field?: TaskSortField;

  @ApiPropertyOptional({
    description: 'Sort direction: ascending (asc) or descending (desc)',
    enum: TaskSortOrder,
    example: TaskSortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(TaskSortOrder, {
    message: 'Sort order must be asc or desc',
  })
  order?: TaskSortOrder;
}
