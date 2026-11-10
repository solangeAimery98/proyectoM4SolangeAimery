import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../../services/firebase/config';
import { Task, NewTask } from '../../types/Task';

const TASKS_COLLECTION = 'tasks';

export const subscribeToTasks = (
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks: Task[] = querySnapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as Task[];

      onTasks(tasks);
    },
    onError
  );
};

export const addTask = async (task: NewTask) => {
  return await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    createdAt: serverTimestamp(),
  });
};

export const updateTask = async (
  id: string,
  updates: Partial<
    Pick<Task, 'title' | 'description' | 'completed' | 'completedAt'>
  >
) => {
  const taskRef = doc(db, TASKS_COLLECTION, id);

  return await updateDoc(taskRef, updates);
};

export const deleteTask = async (id: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, id);

  return await deleteDoc(taskRef);
};