import React, { useState } from 'react';
import { Task } from '../types/Task';

interface TodoItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = editedTitle.trim();
    const trimmedDescription = editedDescription.trim();

    if (!trimmedTitle || trimmedTitle.length > 100) return;
    if (trimmedDescription.length > 500) return;
    if (!task.id) return;

    onEdit(task.id, trimmedTitle, trimmedDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setIsEditing(false);
  };

  return (
    <li className={`todo-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <form onSubmit={handleSave} className="edit-task-form">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            maxLength={100}
            required
            aria-label="Título de la tarea"
          />

          <input
            type="text"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            maxLength={500}
            aria-label="Descripción de la tarea"
          />

          <button type="submit">Guardar</button>
          <button type="button" onClick={handleCancel}>
            Cancelar
          </button>
        </form>
      ) : (
        <>
          <label>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id, !task.completed)}
            />
            <span className="task-title">{task.title}</span>
          </label>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-actions">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-edit"
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="btn-delete"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </li>
  );
};