import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './schemas/task.schema';
import { TaskStatus } from './enums/task-status.enum';
describe('TasksController', () => {
  let controller: TasksController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  // -----------------------------------
  // CREATE
  // -----------------------------------
  it('should call service.create with userId and dto', async () => {
    const dto: CreateTaskDto = {
      title: 'Test Task',
      project: 'proj1',
      assignedTo: 'user2',
    };
    const result: Task = {
      _id: '1',
      ...dto,
      status: TaskStatus.NEW,
    } as unknown as Task;

    mockTasksService.create.mockResolvedValue(result);

    const response = await controller.create('user123', dto);

    expect(mockTasksService.create).toHaveBeenCalledWith('user123', dto);
    expect(response).toEqual(result);
  });

  // -----------------------------------
  // FIND ALL
  // -----------------------------------
  it('should call service.findAll and return tasks', async () => {
    const tasks: Task[] = [{ _id: '1', title: 'Task1' } as unknown as Task];
    mockTasksService.findAll.mockResolvedValue(tasks);

    const response = await controller.findAll();

    expect(mockTasksService.findAll).toHaveBeenCalled();
    expect(response).toEqual(tasks);
  });

  // -----------------------------------
  // FIND ONE
  // -----------------------------------
  it('should call service.findOneById with id', async () => {
    const task: Task = { _id: '1', title: 'Task1' } as unknown as Task;
    mockTasksService.findOneById.mockResolvedValue(task);

    const response = await controller.findOne('1');

    expect(mockTasksService.findOneById).toHaveBeenCalledWith('1');
    expect(response).toEqual(task);
  });

  // -----------------------------------
  // UPDATE
  // -----------------------------------
  it('should call service.update with id and dto', async () => {
    const dto: UpdateTaskDto = { title: 'Updated Task' };
    const updated: Task = { _id: '1', ...dto } as unknown as Task;

    mockTasksService.update.mockResolvedValue(updated);

    const response = await controller.update('1', dto);

    expect(mockTasksService.update).toHaveBeenCalledWith('1', dto);
    expect(response).toEqual(updated);
  });

  // -----------------------------------
  // DELETE
  // -----------------------------------
  it('should call service.deleteById with id', async () => {
    const deleted: Task = { _id: '1', title: 'Task1' } as unknown as Task;

    mockTasksService.deleteById.mockResolvedValue(deleted);

    const response = await controller.remove('1');

    expect(mockTasksService.deleteById).toHaveBeenCalledWith('1');
    expect(response).toEqual(deleted);
  });
});
