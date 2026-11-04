import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { Task } from '../../types/Task';

const TASKS_COLLECTION = 'tasks';

export const getTasks = async (userId: string): Promise<Task[]> => {
  const q = query(collection(db, TASKS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Task, 'id'>),
  }));
};

export const addTask = async (task: Omit<Task, 'id'>) => {
  return await addDoc(collection(db, TASKS_COLLECTION), task);
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const taskRef = doc(db, TASKS_COLLECTION, id);
  return await updateDoc(taskRef, updates);
};

export const deleteTask = async (id: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, id);
  return await deleteDoc(taskRef);
};

