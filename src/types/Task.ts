import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  userId: string;
}

export type NewTask = Omit<Task, 'id' | 'createdAt'>;