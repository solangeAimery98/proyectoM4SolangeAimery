import React, { useMemo, useState } from 'react';

import { useAuth } from '../features/auth/AuthContext';
import { useTasks } from '../features/tasks/useTasks';
import { TaskFilter } from '../features/tasks/types/TaskFilter';

import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';

import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export const Tasks: React.FC = () => {
  const { currentUser } = useAuth();

  const {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
  } = useTasks(currentUser?.uid);

  // Estados locales del Dashboard
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  // Nombre del usuario autenticado
  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Usuario';

  // Estadísticas generales de las tareas
  const summary = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.completed
    ).length;

    const pending = total - completed;

    const percentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      completed,
      pending,
      percentage,
    };
  }, [tasks]);

  // Búsqueda y filtrado de tareas
  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'pending' && !task.completed) ||
        (activeFilter === 'completed' && task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, searchTerm, activeFilter]);

  return (
    <div className="dashboard-container">
      <DashboardHeader
        userName={userName}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Cargando tareas...</p>
      ) : (
        <>
          <DashboardSummary {...summary} />

          <DashboardFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          <TodoForm onAdd={addTask} />

          <TodoList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        </>
      )}
    </div>
  );
};