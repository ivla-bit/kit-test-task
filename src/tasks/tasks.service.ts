import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { TaskStatus } from './enums/task-status.enum';
import { Model } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQuery } from './types/task-query.type';
import { toObjectId } from '../common/helpers/toObject';
import { TaskFilterDto } from './dto/task-filter.dto';
import { TaskSortDto } from './dto/task-sort.dto';
import { TaskSortOrder } from './enums/task-sort.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private projectsService: ProjectsService,
  ) {}

  async create(ownerId: string, dto: CreateTaskDto): Promise<Task> {
    const project = await this.projectsService.findOneById(dto.project);
    if (!project) throw new NotFoundException('Project not found');

    const task = await this.taskModel.create({
      ...dto,
      owner: toObjectId(ownerId),
      project: toObjectId(dto.project),
      assignedTo: dto.assignedTo ? toObjectId(dto.assignedTo) : null,
    });
    await this.projectsService.addTaskToProject(dto.project, task._id);
    return task;
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel
      .find()
      .populate('owner', '-password')
      .populate('assignedTo', '-password')
      .populate('project')
      .exec();
  }

  async findOneById(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(toObjectId(id))
      .populate('owner', '-password')
      .populate('assignedTo', '-password')
      .populate('project')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const updated: Partial<Task> = {
      ...dto,
      assignedTo: dto.assignedTo ? toObjectId(dto.assignedTo) : undefined,
      project: dto.project ? toObjectId(dto.project) : undefined,
    } as Partial<Task>;

    const task = await this.taskModel
      .findByIdAndUpdate(toObjectId(id), updated, { new: true })
      .populate('owner assignedTo project')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async deleteById(id: string): Promise<Task> {
    const task = await this.taskModel.findByIdAndDelete(toObjectId(id)).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    if (!Object.values(TaskStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const task = await this.taskModel
      .findByIdAndUpdate(toObjectId(id), { status }, { new: true })
      .populate('owner assignedTo project')
      .exec();

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findAllAndFilter(
    filter?: TaskFilterDto,
    sort?: TaskSortDto,
  ): Promise<Task[]> {
    const query: TaskQuery = {};

    if (filter?.status) query.status = filter.status;
    if (filter?.project) query.project = toObjectId(filter.project);
    if (filter?.assignedTo) query.assignedTo = toObjectId(filter.assignedTo);

    let mongoQuery = this.taskModel
      .find(query)
      .populate('owner assignedTo project');

    if (sort?.field) {
      const sortOrder = sort.order === TaskSortOrder.DESC ? -1 : 1;
      mongoQuery = mongoQuery.sort({ [sort.field]: sortOrder });
    }

    return mongoQuery.exec();
  }
}
