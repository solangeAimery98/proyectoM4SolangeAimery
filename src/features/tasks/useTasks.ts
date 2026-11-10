import { useState, useEffect } from 'react';
import { Task } from '../../types/Task';
import {
  subscribeToTasks,
  addTask,
  updateTask,
  deleteTask,
} from './taskService';
import { completeTaskWithReward } from '../garden/services/gardenService';

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTasks(
      userId,
      (updatedTasks) => {
        setTasks(updatedTasks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'No se pudieron cargar las tareas.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const handleAddTask = async (
    title: string,
    description?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setError(null);

      await addTask({
        title: title.trim(),
        description: description?.trim() ?? '',
        completed: false,
        userId,
      });

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo crear la tarea.'
      );
      return false;
    }
  };

  const handleToggleTask = async (
    id: string,
    completed: boolean
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setError(null);

      if (completed) {
        await completeTaskWithReward(userId, id);
      } else {
        await updateTask(id, {
          completed: false,
          completedAt: null,
        });
      }

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar la tarea.'
      );
      return false;
    }
  };

  const handleEditTask = async (
    id: string,
    title: string,
    description: string
  ): Promise<boolean> => {
    try {
      setError(null);

      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
      });

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo editar la tarea.'
      );
      return false;
    }
  };

  const handleDeleteTask = async (id: string): Promise<void> => {
    try {
      setError(null);
      await deleteTask(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar la tarea.'
      );
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask: handleAddTask,
    toggleTask: handleToggleTask,
    editTask: handleEditTask,
    deleteTask: handleDeleteTask,
  };
};