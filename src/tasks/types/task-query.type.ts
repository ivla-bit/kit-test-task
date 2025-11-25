import { Types } from 'mongoose';

export interface TaskQuery {
  status?: string;
  project?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
}
