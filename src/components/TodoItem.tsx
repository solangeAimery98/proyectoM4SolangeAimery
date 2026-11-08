import React, { useState } from 'react';
import { Task } from '../types/Task';
interface TodoItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    title: string,
    description: string
  ) => Promise<boolean>;
}
export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description
  );
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = editedTitle.trim();
    const trimmedDescription = editedDescription.trim();
    if (!trimmedTitle) {
      setValidationError('El título es obligatorio.');
      return;
    }
    if (trimmedTitle.length > 100) {
      setValidationError('El título no puede superar los 100 caracteres.');
      return;
    }
    if (trimmedDescription.length > 500) {
      setValidationError('La descripción no puede superar los 500 caracteres.');
      return;
    }
    setIsSaving(true);
    setValidationError('');
    try {
      const wasSaved = await onEdit(
        task.id,
        trimmedTitle,
        trimmedDescription
      );
      if (wasSaved) {
        setIsEditing(false);
      }
    } catch {
      setValidationError('No se pudo guardar la tarea. Intentá nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setValidationError('');
    setIsEditing(false);
  };
  const handleStartEditing = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setValidationError('');
    setIsEditing(true);
  };
  return (
    <li
      className={`bloomy-task-card ${task.completed ? 'is-completed' : ''
        }`}
    >
      {isEditing ? (
        <form
          className="bloomy-task-edit-form"
          onSubmit={handleSave}
        >
          <div className="bloomy-task-edit-fields">
            <div className="bloomy-task-edit-field">
              <label htmlFor={`edit-title-${task.id}`}>
                Nombre de la tarea
              </label>
              <input
                id={`edit-title-${task.id}`}
                type="text"
                value={editedTitle}
                onChange={(e) => {
                  setEditedTitle(e.target.value);
                  setValidationError('');
                }}
                maxLength={100}
                required
                disabled={isSaving}
              />
            </div>
            <div className="bloomy-task-edit-field">
              <label htmlFor={`edit-description-${task.id}`}>
                Descripción <span>(opcional)</span>
              </label>
              <textarea
                id={`edit-description-${task.id}`}
                value={editedDescription}
                onChange={(e) => {
                  setEditedDescription(e.target.value);
                  setValidationError('');
                }}
                maxLength={500}
                rows={3}
                disabled={isSaving}
              />
            </div>
          </div>
          {validationError && (
            <p className="bloomy-task-error" role="alert">
              {validationError}
            </p>
          )}
          <div className="bloomy-task-edit-actions">
            <button
              type="button"
              className="bloomy-task-button bloomy-task-button-secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bloomy-task-button bloomy-task-button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bloomy-task-main">
            <label className="bloomy-task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id, !task.completed)}
                aria-label={
                  task.completed
                    ? `Marcar ${task.title} como pendiente`
                    : `Completar ${task.title}`
                }
              />
              <span className="bloomy-task-checkmark" aria-hidden="true">
                {task.completed ? '✓' : ''}
              </span>
            </label>
            <div className="bloomy-task-content">
              <h3 className="bloomy-task-title">
                {task.title}
              </h3>
              {task.description && (
                <p className="bloomy-task-description">
                  {task.description}
                </p>
              )}
              {task.completed && (
                <span className="bloomy-task-status">
                  ✓ Completada
                </span>
              )}
            </div>
          </div>
          <div className="bloomy-task-actions">
            <button
              type="button"
              className="bloomy-task-action bloomy-task-action-edit"
              onClick={handleStartEditing}
              aria-label={`Editar ${task.title}`}
            >
              <span aria-hidden="true">✎</span>
              <span>Editar</span>
            </button>
            <button
              type="button"
              className="bloomy-task-action bloomy-task-action-delete"
              onClick={() => onDelete(task.id)}
              aria-label={`Eliminar ${task.title}`}
            >
              <span aria-hidden="true">×</span>
              <span>Eliminar</span>
            </button>
          </div>
        </>
      )}
    </li>
  );
};