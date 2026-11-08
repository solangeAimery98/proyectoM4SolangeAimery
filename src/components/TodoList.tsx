import React from 'react';
import { Task } from '../types/Task';
import { TaskFilter } from '../features/tasks/types/TaskFilter';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  activeFilter: TaskFilter;
  searchTerm: string;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    description: string
  ) => Promise<boolean>;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  activeFilter,
  searchTerm,
  onToggle,
  onDelete,
  onEdit,
}) => {
  if (tasks.length === 0) {
    let emptyMessage = 'Todavía no tenés tareas. ¡Creá la primera!';

    if (searchTerm.trim()) {
      emptyMessage = 'No encontramos tareas que coincidan con tu búsqueda.';
    } else if (activeFilter === 'pending') {
      emptyMessage = '¡No tenés tareas pendientes!';
    } else if (activeFilter === 'completed') {
      emptyMessage = 'Todavía no completaste ninguna tarea.';
    }

    return (
      <div className="dashboard-empty-state" role="status">
        <span aria-hidden="true">✿</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};