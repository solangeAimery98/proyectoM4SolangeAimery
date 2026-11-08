import React, { useState } from 'react';

interface TodoFormProps {
  onAdd: (title: string, description?: string) => Promise<boolean>;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setValidationError('El título de la tarea es obligatorio.');
      return;
    }

    if (normalizedTitle.length > 100) {
      setValidationError('El título no puede superar los 100 caracteres.');
      return;
    }

    if (normalizedDescription.length > 500) {
      setValidationError('La descripción no puede superar los 500 caracteres.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    try {
      const wasCreated = await onAdd(
        normalizedTitle,
        normalizedDescription
      );

      if (wasCreated) {
        setTitle('');
        setDescription('');
      }
    } catch {
      setValidationError('Ocurrió un error inesperado al crear la tarea.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="dashboard-task-form"
    >
      <div className="dashboard-task-form-heading">
        <div>
          <span className="dashboard-task-form-eyebrow">
            UN NUEVO COMIENZO
          </span>

          <h2>¿Qué vamos a hacer hoy?</h2>

          <p>
            Cada pequeña tarea es un paso para hacer florecer tu día.
          </p>
        </div>

        <span className="dashboard-task-form-icon" aria-hidden="true">
          +
        </span>
      </div>

      <div className="dashboard-task-form-fields">
        <div className="dashboard-task-form-field">
          <label htmlFor="task-title">
            Nombre de la tarea
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="Por ejemplo: Estudiar React..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setValidationError('');
            }}
            maxLength={100}
            required
            disabled={isSubmitting}
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError ? 'task-form-error' : undefined
            }
          />

          <span className="dashboard-task-form-counter">
            {title.length}/100
          </span>
        </div>

        <div className="dashboard-task-form-field">
          <label htmlFor="task-description">
            Descripción <span>(opcional)</span>
          </label>

          <textarea
            id="task-description"
            placeholder="Agregá algún detalle para recordar..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setValidationError('');
            }}
            maxLength={500}
            rows={3}
            disabled={isSubmitting}
          />

          <span className="dashboard-task-form-counter">
            {description.length}/500
          </span>
        </div>
      </div>

      {validationError && (
        <p
          id="task-form-error"
          className="dashboard-task-form-error"
          role="alert"
        >
          {validationError}
        </p>
      )}

      <div className="dashboard-task-form-footer">
        <span>
          <span aria-hidden="true">✿</span> Un paso a la vez.
        </span>

        <button
          type="submit"
          className="dashboard-task-form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Agregando...'
          ) : (
            <>
              <span aria-hidden="true">+</span>
              Agregar tarea
            </>
          )}
        </button>
      </div>
    </form>
  );
};