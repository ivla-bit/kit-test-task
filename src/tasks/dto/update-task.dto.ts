import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../schemas/task.schema';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
