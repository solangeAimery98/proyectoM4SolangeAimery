import { useState, useEffect } from 'react';

import { Task } from '../../types/Task';

import {
  subscribeToTasks,
  addTask,
  updateTask,
  deleteTask,
} from './taskService';

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suscripción a los cambios de Firestore
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

  // Crear tarea
  const handleAddTask = async (title: string, description?: string) => {
    if (!userId) return;

    try {
      setError(null);

      await addTask({
        title: title.trim(),
        description: description?.trim() ?? '',
        completed: false,
        userId,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la tarea.'
      );
    }
  };

  // Cambiar estado de una tarea
  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      setError(null);
      await updateTask(id, { completed });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la tarea.'
      );
    }
  };

  // Editar título y descripción
  const handleEditTask = async (
    id: string,
    title: string,
    description: string
  ) => {
    try {
      setError(null);

      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo editar la tarea.'
      );
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTask(id);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar la tarea.'
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