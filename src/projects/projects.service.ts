import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model, Types, ClientSession } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { toObjectId } from '../common/helpers/toObject';
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
      owner: toObjectId(ownerId),
    });

    return project;
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .populate('owner', '-password')
      .populate('members', '-password')
      .populate('tasks')
      .exec();
  }

  async findOneById(id: string): Promise<Project> {
    const project = await this.projectModel
      .findById(toObjectId(id))
      .populate('owner', '-password')
      .populate('members', '-password')
      .populate('tasks')
      .exec();

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(toObjectId(id), dto, { new: true })
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async deleteById(id: string): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndDelete(toObjectId(id))
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async addTaskToProject(
    projectId: string,
    taskId: string | Types.ObjectId,
    session?: ClientSession | null,
  ): Promise<Project> {
    const project = await this.projectModel
      .findById(toObjectId(projectId))
      .session(session || null)
      .exec();

    if (!project) throw new NotFoundException('Project not found');

    const taskObjectId = toObjectId(taskId);

    const alreadyHas = project.tasks.some((t) =>
      toObjectId(t).equals(taskObjectId),
    );
    if (!alreadyHas) {
      project.tasks.push(taskObjectId);
      await project.save({ session });
    }

    return project;
  }

  async addMemberToProject(
    projectId: string,
    userId: string | Types.ObjectId,
  ): Promise<Project> {
    const project = await this.projectModel.findById(toObjectId(projectId));

    if (!project) throw new NotFoundException('Project not found');

    const userObjectId = toObjectId(userId);

    const alreadyMember = project.members.some((m) =>
      toObjectId(m).equals(userObjectId),
    );
    if (alreadyMember) {
      throw new BadRequestException('User is already a member of this project');
    }

    project.members.push(userObjectId);
    await project.save();

    return project;
  }
}
