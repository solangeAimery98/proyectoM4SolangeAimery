import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp | null;
  userId: string;
}

export type NewTask = Omit<Task, 'id' | 'createdAt'>;