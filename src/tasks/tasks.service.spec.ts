import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectsService } from '../projects/projects.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskStatus, Task } from './schemas/task.schema';

// === МОК МОДЕЛИ MONGOOSE ===
class MockTaskModel {
  constructor(data) {
    Object.assign(this, data);
  }

  // new Model().save() — не используется, т.к. create() статическое
  save = jest.fn();

  // static методы
  static create = jest.fn();
  static find = jest.fn().mockReturnThis();
  static findById = jest.fn();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
  static findByIdAndDelete = jest.fn().mockReturnThis();

  // цепочка .populate().populate().exec()
  static populate = jest.fn().mockReturnThis();
  static sort = jest.fn().mockReturnThis();

  static exec = jest.fn();
}

const mockProjectsService = {
  addTaskToProject: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: MockTaskModel,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // CREATE
  // ---------------------------------------------------
  it('should create task and attach it to project', async () => {
    const dto = { title: 'Test', project: 'proj1', assignedTo: 'userAssigned' };
    const createdTask = { _id: 'task1', ...dto };

    MockTaskModel.create.mockResolvedValueOnce(createdTask);

    const result = await service.create('user123', dto);

    expect(MockTaskModel.create).toHaveBeenCalledWith({
      ...dto,
      owner: 'user123',
    });
    expect(mockProjectsService.addTaskToProject).toHaveBeenCalledWith(
      dto.project,
      createdTask._id,
    );
    expect(result).toEqual(createdTask);
  });

  // ---------------------------------------------------
  // FIND ALL
  // ---------------------------------------------------
  it('should return all tasks', async () => {
    const tasks = [{ title: 'Task1' }];
    MockTaskModel.exec.mockResolvedValueOnce(tasks);

    const result = await service.findAll();

    expect(MockTaskModel.find).toHaveBeenCalled();
    expect(MockTaskModel.populate).toHaveBeenCalledWith(
      'owner assignedTo project',
    );
    expect(result).toEqual(tasks);
  });

  // ---------------------------------------------------
  // FIND ONE
  // ---------------------------------------------------
  it('should return task by id', async () => {
    const task = { _id: '1', title: 'Test' };
    MockTaskModel.exec.mockResolvedValueOnce(task);
    MockTaskModel.findById.mockReturnValue(MockTaskModel);

    const result = await service.findOneById('1');

    expect(MockTaskModel.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(task);
  });

  it('should throw NotFoundException if task not found', async () => {
    MockTaskModel.exec.mockResolvedValueOnce(null);
    MockTaskModel.findById.mockReturnValue(MockTaskModel);

    await expect(service.findOneById('xxx')).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------
  // UPDATE
  // ---------------------------------------------------
  it('should update task', async () => {
    const updated = { _id: '1', title: 'Updated' };

    MockTaskModel.exec.mockResolvedValueOnce(updated);
    MockTaskModel.findByIdAndUpdate.mockReturnValue(MockTaskModel);

    const result = await service.update('1', { title: 'Updated' });

    expect(MockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { title: 'Updated' },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException on update when task not found', async () => {
    MockTaskModel.exec.mockResolvedValueOnce(null);
    MockTaskModel.findByIdAndUpdate.mockReturnValue(MockTaskModel);

    await expect(service.update('1', { title: 'nope' })).rejects.toThrow(
      NotFoundException,
    );
  });

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------
  it('should delete task', async () => {
    const deleted = { _id: '1' };
    MockTaskModel.exec.mockResolvedValueOnce(deleted);
    MockTaskModel.findByIdAndDelete.mockReturnValue(MockTaskModel);

    const result = await service.deleteById('1');

    expect(MockTaskModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(result).toEqual(deleted);
  });

  it('should throw NotFoundException on delete when task not found', async () => {
    MockTaskModel.exec.mockResolvedValueOnce(null);
    MockTaskModel.findByIdAndDelete.mockReturnValue(MockTaskModel);

    await expect(service.deleteById('1')).rejects.toThrow(NotFoundException);
  });

  // ---------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------
  it('should update status', async () => {
    const updated = { _id: '1', status: TaskStatus.COMPLETED };

    MockTaskModel.exec.mockResolvedValueOnce(updated);
    MockTaskModel.findByIdAndUpdate.mockReturnValue(MockTaskModel);

    const result = await service.updateStatus('1', TaskStatus.COMPLETED);

    expect(MockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { status: TaskStatus.COMPLETED },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('should throw BadRequestException for invalid status', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(service.updateStatus('1', 'broken' as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException when task not found for status update', async () => {
    MockTaskModel.exec.mockResolvedValueOnce(null);
    MockTaskModel.findByIdAndUpdate.mockReturnValue(MockTaskModel);

    await expect(service.updateStatus('1', TaskStatus.NEW)).rejects.toThrow(
      NotFoundException,
    );
  });

  // ---------------------------------------------------
  // FIND ALL WITH FILTERS & SORT
  // ---------------------------------------------------
  it('should filter and sort tasks', async () => {
    const tasks = [{ title: 'A' }, { title: 'B' }];
    MockTaskModel.exec.mockResolvedValueOnce(tasks);
    MockTaskModel.find.mockReturnValue(MockTaskModel);
    MockTaskModel.sort.mockReturnValue(MockTaskModel);

    const result = await service.findAllAndFilter(
      { status: TaskStatus.NEW },
      { field: 'createdAt', order: 'asc' },
    );

    expect(MockTaskModel.find).toHaveBeenCalledWith({
      status: TaskStatus.NEW,
    });

    expect(MockTaskModel.sort).toHaveBeenCalledWith({ createdAt: 1 });
    expect(result).toEqual(tasks);
  });
});
