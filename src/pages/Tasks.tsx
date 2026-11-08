import React, { useMemo, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useTasks } from '../features/tasks/useTasks';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
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

  const [searchTerm, setSearchTerm] = useState('');

  const userName =
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Usuario';

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return tasks;

    return tasks.filter((task) => {
      const title = task.title.toLowerCase();
      const description = task.description.toLowerCase();

      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [tasks, searchTerm]);

  return (
    <div className="dashboard-container">
      <DashboardHeader
        userName={userName}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Cargando tareas...</p>
      ) : (
        <>
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