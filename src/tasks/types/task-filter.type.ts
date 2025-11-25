import { TaskStatus } from '../schemas/task.schema';

export interface TaskFilter {
  status?: TaskStatus;
  project?: string;
  assignedTo?: string;
}
