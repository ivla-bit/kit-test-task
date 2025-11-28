import { Types } from 'mongoose';

export function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (id instanceof Types.ObjectId) {
    return id;
  }

  if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
    return new Types.ObjectId(id);
  }

  throw new Error(` Invalid ObjectId: ${id} `);
}
