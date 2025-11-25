import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { Model, Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilter } from './types/task-filter.type';
import { TaskSort } from './types/task-sort.type';
import { TaskQuery } from './types/task-query.type';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private projectsService: ProjectsService,
  ) {}

  async create(ownerId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.taskModel.create({
      ...dto,
      owner: ownerId,
    });

    await this.projectsService.addTaskToProject(dto.project, task._id);
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().populate('owner assignedTo project').exec();
  }

  async findOneById(id: string): Promise<Task | null> {
    const task = await this.taskModel
      .findById(id)
      .populate('owner assignedTo project')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.taskModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async deleteById(id: string): Promise<Task | null> {
    const task = await this.taskModel.findByIdAndDelete(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    if (!Object.values(TaskStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const task = await this.taskModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('owner assignedTo project')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findAllAndFilter(
    filter?: TaskFilter,
    sort?: TaskSort,
  ): Promise<Task[]> {
    const query: TaskQuery = {};

    if (filter?.status) query.status = filter.status;

    if (filter?.project) {
      query.project = new Types.ObjectId(filter.project);
    }

    if (filter?.assignedTo) {
      query.assignedTo = new Types.ObjectId(filter.assignedTo);
    }

    let mongoQuery = this.taskModel
      .find(query)
      .populate('owner assignedTo project');

    if (sort?.field) {
      const sortOrder = sort.order === 'desc' ? -1 : 1;
      mongoQuery = mongoQuery.sort({ [sort.field]: sortOrder });
    }

    return mongoQuery.exec();
  }
}
