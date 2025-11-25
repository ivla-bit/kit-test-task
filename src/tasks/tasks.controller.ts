import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './schemas/task.schema';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../common/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { TaskFilter } from './types/task-filter.type';
import type { TaskSort } from './types/task-sort.type';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  create(
    @User('sub') userId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [Task] })
  findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('filter')
  @ApiOperation({ summary: 'Get tasks with filter & sorting' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'project', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'sortField', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findFiltered(
    @Query() filter: TaskFilter,
    @Query() sort: TaskSort,
  ): Promise<Task[]> {
    return this.tasksService.findAllAndFilter(filter, sort);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Task found', type: Task })
  findOne(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateTaskDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task | null> {
    return this.tasksService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { example: { status: 'in_progress' } } })
  @ApiResponse({ status: 200, description: 'Task status updated', type: Task })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
  ): Promise<Task | null> {
    return this.tasksService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.deleteById(id);
  }
}
