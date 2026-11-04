import React from 'react';
import { Task } from '../types/Task';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => task.id && onToggle(task.id, !task.completed)}
        />
        <span className="task-title">{task.title}</span>
      </label>
      {task.description && <p className="task-description">{task.description}</p>}
      {task.id && (
        <button onClick={() => onDelete(task.id!)} className="btn-delete">
          Eliminar
        </button>
      )}
    </li>
  );
};

