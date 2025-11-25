import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateProjectDto,
  ): Promise<ProjectDocument> {
    const project = await this.projectModel.create({
      ...dto,
      owner: ownerId,
    });

    return project;
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find().populate('owner members tasks').exec();
  }

  async findOneById(id: string): Promise<Project | null> {
    const project = await this.projectModel
      .findById(id)
      .populate('owner members tasks')
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project | null> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async deleteById(id: string): Promise<Project | null> {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async addTaskToProject(
    projectId: string,
    taskId: string | Types.ObjectId,
  ): Promise<Project> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) throw new NotFoundException('Project not found');
    if (!project.tasks.includes(taskId as Types.ObjectId)) {
      project.tasks.push(taskId as Types.ObjectId);
      await project.save();
    }
    return project;
  }

  async addMemberToProject(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.members.some((m) => m.toString() === userId)) {
      throw new BadRequestException('User is already a member of this project');
    }

    project.members.push(new Types.ObjectId(userId));
    await project.save();

    return project;
  }
}
