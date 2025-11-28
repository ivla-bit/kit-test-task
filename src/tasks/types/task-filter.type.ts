import { TaskStatus } from '../enums/task-status.enum';
export interface TaskFilter {
  status?: TaskStatus;
  project?: string;
  assignedTo?: string;
}
