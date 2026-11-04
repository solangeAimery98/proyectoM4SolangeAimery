import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useTasks } from '../features/tasks/useTasks';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export const Tasks: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks(currentUser?.uid);

  return (
    <div className="tasks-container">
      <h2>Mis Tareas</h2>
      {error && <p className="error-message">{error}</p>}
      <TodoForm onAdd={addTask} />
      {loading ? (
        <p>Cargando tareas...</p>
      ) : (
        <TodoList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
      )}
    </div>
  );
};

