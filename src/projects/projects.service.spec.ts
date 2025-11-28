/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Project } from './schemas/project.schema';

import * as helpers from '../common/helpers/toObject';

// === MOCK MODEL ===
class MockProjectModel {
  constructor(data) {
    Object.assign(this, data);
  }

  save = jest.fn().mockResolvedValue(this);

  static create = jest.fn();
  static find = jest.fn().mockReturnThis();
  static findById = jest.fn();
  static findByIdAndUpdate = jest.fn().mockReturnThis();
  static findByIdAndDelete = jest.fn().mockReturnThis();
  static populate = jest.fn().mockReturnThis();
  static exec = jest.fn();
  session = jest.fn().mockReturnThis();
}

describe('ProjectsService', () => {
  let service: ProjectsService;
  let model: typeof MockProjectModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: MockProjectModel,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    model = module.get(getModelToken(Project.name));
    jest.clearAllMocks();

    jest
      .spyOn(helpers, 'toObjectId')
      .mockImplementation((val: string | any) => val);
  });

  // CREATE
  it('should create a project', async () => {
    const dto = { name: 'Project1', description: 'Desc' };
    const createdProject = { _id: 'proj1', ...dto, owner: 'user1' };
    MockProjectModel.create.mockResolvedValueOnce(createdProject);

    const result = await service.create('user1', dto);

    expect(MockProjectModel.create).toHaveBeenCalledWith({
      ...dto,
      owner: 'user1',
    });
    expect(result).toEqual(createdProject);
  });

  // FIND ALL
  it('should return all projects', async () => {
    const projects = [{ name: 'Proj1' }];
    // мокируем цепочку populate().populate().populate().exec()
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(projects);
    MockProjectModel.find.mockReturnValue({
      populate: populateMock,
      exec: execMock,
    } as any);

    const result = await service.findAll();

    expect(MockProjectModel.find).toHaveBeenCalled();
    expect(result).toEqual(projects);
  });

  // FIND ONE
  it('should return project by id', async () => {
    const project = { _id: '1', name: 'Proj1' };
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(project);
    MockProjectModel.findById.mockReturnValue({
      populate: populateMock,
      exec: execMock,
    } as any);

    const result = await service.findOneById('1');

    expect(MockProjectModel.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(project);
  });

  it('should throw NotFoundException if project not found', async () => {
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(null);
    MockProjectModel.findById.mockReturnValue({
      populate: populateMock,
      exec: execMock,
    } as any);

    await expect(service.findOneById('xxx')).rejects.toThrow(NotFoundException);
  });

  // UPDATE
  it('should update a project', async () => {
    const updated = { _id: '1', name: 'Updated' };
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(updated);
    MockProjectModel.findByIdAndUpdate.mockReturnValue({
      populate: populateMock,
      exec: execMock,
    } as any);

    const result = await service.update('1', { name: 'Updated' });

    expect(MockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { name: 'Updated' },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException on update', async () => {
    const populateMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(null);
    MockProjectModel.findByIdAndUpdate.mockReturnValue({
      populate: populateMock,
      exec: execMock,
    } as any);

    await expect(service.update('1', { name: 'Nope' })).rejects.toThrow(
      NotFoundException,
    );
  });

  // DELETE
  it('should delete a project', async () => {
    const deleted = { _id: '1' };
    const execMock = jest.fn().mockResolvedValueOnce(deleted);
    MockProjectModel.findByIdAndDelete.mockReturnValue({
      exec: execMock,
    } as any);

    const result = await service.deleteById('1');

    expect(MockProjectModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    expect(result).toEqual(deleted);
  });

  it('should throw NotFoundException on delete', async () => {
    const execMock = jest.fn().mockResolvedValueOnce(null);
    MockProjectModel.findByIdAndDelete.mockReturnValue({
      exec: execMock,
    } as any);

    await expect(service.deleteById('1')).rejects.toThrow(NotFoundException);
  });

  // ADD TASK
  it('should add a task to project', async () => {
    const project = {
      _id: 'proj1',
      tasks: [],
      save: jest.fn().mockResolvedValue(true),
    };
    const sessionMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(project);
    MockProjectModel.findById.mockReturnValue({
      session: sessionMock,
      exec: execMock,
    } as any);

    const result = await service.addTaskToProject('proj1', 'task1');

    expect(result.tasks).toContain('task1');
    expect(project.save).toHaveBeenCalled();
    expect(result).toEqual(project);
  });

  it('should not add duplicate task', async () => {
    const project = {
      _id: 'proj1',
      tasks: ['task1'],
      save: jest.fn(),
    };
    const sessionMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(project);
    MockProjectModel.findById.mockReturnValue({
      session: sessionMock,
      exec: execMock,
    } as any);

    const result = await service.addTaskToProject('proj1', 'task1');

    expect(project.tasks.length).toBe(1);
    expect(project.save).not.toHaveBeenCalled();
    expect(result).toEqual(project);
  });

  it('should throw NotFoundException if project not found on add task', async () => {
    const sessionMock = jest.fn().mockReturnThis();
    const execMock = jest.fn().mockResolvedValueOnce(null);
    MockProjectModel.findById.mockReturnValue({
      session: sessionMock,
      exec: execMock,
    } as any);

    await expect(service.addTaskToProject('proj1', 'task1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
