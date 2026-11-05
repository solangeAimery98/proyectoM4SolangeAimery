import React from 'react';
import { Task } from '../types/Task';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  onToggle,
  onDelete,
  onEdit,
}) => {
  if (tasks.length === 0) {
    return <p className="no-tasks">No hay tareas pendientes.</p>;
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