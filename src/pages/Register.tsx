import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../features/auth/authService';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { BloomyLogoIcon } from '../components/layout/icons';
import '../styles/auth.css';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password);
      navigate('/');
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* PANEL DE PRESENTACIÓN */}
      <section className="auth-brand-panel">

        <Link
          to="/login"
          className="auth-brand"
          aria-label="Bloomy, inicio"
        >
          <span className="auth-brand-icon">
            <BloomyLogoIcon size={28} />
          </span>

          <span className="auth-brand-name">
            Bloomy
          </span>
        </Link>

        <div className="auth-brand-content">

          <span className="auth-eyebrow">
            MAKE YOUR DAYS BLOOM
          </span>

          <h1>
            Cada día es
            <br />
            una nueva oportunidad
            <br />
            <span>para crecer.</span>
          </h1>

          <p className="auth-brand-description">
            Empezá a organizar tus días, construir hábitos
            y celebrar cada pequeño logro.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span className="auth-benefit-icon">✿</span>

              <div>
                <h3>Organizá tus días</h3>
                <p>Planificá tus tareas de manera sencilla.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">♡</span>

              <div>
                <h3>Cultivá tus hábitos</h3>
                <p>Construí una rutina a tu propio ritmo.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">❀</span>

              <div>
                <h3>Hacé crecer tu jardín</h3>
                <p>Transformá tus tareas en pequeños logros.</p>
              </div>
            </div>

          </div>
        </div>

        <p className="auth-brand-footer">
          Pequeños pasos también son grandes avances.
        </p>

      </section>

      {/* PANEL DE REGISTRO */}
      <section className="auth-form-panel">

        <div className="auth-form-wrapper">

          <div className="auth-form-heading">

            <span className="auth-welcome-icon">✿</span>

            <span className="auth-form-eyebrow">
              EMPEZÁ TU CAMINO
            </span>

            <h2>Creá tu cuenta</h2>

            <p>
              Tu espacio personal está a un paso de distancia.
            </p>

          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">

              <label htmlFor="register-email">
                Correo electrónico
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>

            <div className="auth-field">

              <label htmlFor="register-password">
                Contraseña
              </label>

              <input
                id="register-password"
                type="password"
                placeholder="Creá una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
              />

              <span className="auth-field-hint">
                Mínimo 6 caracteres.
              </span>

            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}

              {!loading && (
                <span aria-hidden="true">→</span>
              )}
            </button>

          </form>

          <div className="auth-register">
            <span>¿Ya tenés una cuenta?</span>

            <Link to="/login">
              Iniciar sesión
            </Link>
          </div>

          <div className="auth-form-decoration">
            <span>✿</span>
            <span>Todo gran cambio comienza con un pequeño paso.</span>
            <span>✿</span>
          </div>

        </div>

      </section>

    </main>
  );
};