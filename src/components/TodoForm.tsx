import React, { useState } from 'react';

interface TodoFormProps {
  onAdd: (title: string, description?: string) => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;
    if (title.trim().length > 100) return;
    if (description.trim().length > 500) return;

    onAdd(title.trim(), description.trim());

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
        aria-label="Título de la tarea"
      />

      <input
        type="text"
        placeholder="Descripción (opcional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}
        aria-label="Descripción de la tarea"
      />

      <button type="submit">Agregar</button>
    </form>
  );
};

