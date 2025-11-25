import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schemas/project.schema';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);

    jest.clearAllMocks();
  });

  // -----------------------------------
  // CREATE
  // -----------------------------------
  it('should call service.create with userId and dto', async () => {
    const dto: CreateProjectDto = { name: 'Test Project' };
    const result: Project = { _id: '1', ...dto } as unknown as Project;

    mockProjectsService.create.mockResolvedValue(result);

    const response = await controller.create('user123', dto);

    expect(mockProjectsService.create).toHaveBeenCalledWith('user123', dto);
    expect(response).toEqual(result);
  });

  // -----------------------------------
  // FIND ALL
  // -----------------------------------
  it('should call service.findAll and return projects', async () => {
    const projects: Project[] = [
      { _id: '1', name: 'P1' } as unknown as Project,
    ];
    mockProjectsService.findAll.mockResolvedValue(projects);

    const response = await controller.findAll();

    expect(mockProjectsService.findAll).toHaveBeenCalled();
    expect(response).toEqual(projects);
  });

  // -----------------------------------
  // FIND ONE
  // -----------------------------------
  it('should call service.findOneById with id', async () => {
    const project: Project = { _id: '1', name: 'P1' } as unknown as Project;
    mockProjectsService.findOneById.mockResolvedValue(project);

    const response = await controller.findOne('1');

    expect(mockProjectsService.findOneById).toHaveBeenCalledWith('1');
    expect(response).toEqual(project);
  });

  // -----------------------------------
  // UPDATE
  // -----------------------------------
  it('should call service.update with id and dto', async () => {
    const dto: UpdateProjectDto = { name: 'Updated Project' };
    const updated: Project = { _id: '1', ...dto } as unknown as Project;

    mockProjectsService.update.mockResolvedValue(updated);

    const response = await controller.update('1', dto);

    expect(mockProjectsService.update).toHaveBeenCalledWith('1', dto);
    expect(response).toEqual(updated);
  });

  // -----------------------------------
  // DELETE
  // -----------------------------------
  it('should call service.deleteById with id', async () => {
    const deleted: Project = { _id: '1', name: 'P1' } as unknown as Project;

    mockProjectsService.deleteById.mockResolvedValue(deleted);

    const response = await controller.remove('1');

    expect(mockProjectsService.deleteById).toHaveBeenCalledWith('1');
    expect(response).toEqual(deleted);
  });
});
