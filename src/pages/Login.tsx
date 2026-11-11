import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../features/auth/authService';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { BloomyLogoIcon } from '../components/layout/icons';
import '../styles/auth.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await loginUser(email, password);
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
            TU ESPACIO PERSONAL
          </span>

          <h1>
            Organizá tus días
            <br />
            y hacé crecer
            <br />
            <span>tus pequeños logros.</span>
          </h1>

          <p className="auth-brand-description">
            Un espacio para organizar tus tareas, cultivar tus hábitos
            y disfrutar de cada paso hacia tus objetivos.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span className="auth-benefit-icon">✿</span>

              <div>
                <h3>Organizá tus días</h3>
                <p>Todo lo importante, en un solo lugar.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">♡</span>

              <div>
                <h3>Cultivá tus hábitos</h3>
                <p>Avanzá a tu ritmo, un día a la vez.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">❀</span>

              <div>
                <h3>Hacé crecer tu jardín</h3>
                <p>Cada tarea completada suma progreso.</p>
              </div>
            </div>

          </div>
        </div>

        <p className="auth-brand-footer">
          Pequeños pasos también son grandes avances.
        </p>

      </section>

      {/* PANEL DE ACCESO */}
      <section className="auth-form-panel">

        <div className="auth-form-wrapper">

          <div className="auth-form-heading">

            <span className="auth-welcome-icon">✿</span>

            <span className="auth-form-eyebrow">
              NOS ALEGRA TENERTE DE VUELTA
            </span>

            <h2>¡Hola de nuevo!</h2>

            <p>
              Ingresá a tu espacio y seguí haciendo crecer tus días.
            </p>

          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="auth-field">

              <label htmlFor="login-email">
                Correo electrónico
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

            </div>

            <div className="auth-field">

              <label htmlFor="login-password">
                Contraseña
              </label>

              <input
                id="login-password"
                type="password"
                placeholder="Ingresá tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}

              {!loading && (
                <span aria-hidden="true">→</span>
              )}
            </button>

          </form>

          <div className="auth-register">
            <span>¿Todavía no tenés una cuenta?</span>

            <Link to="/register">
              Crear mi cuenta
            </Link>
          </div>

          <div className="auth-form-decoration">
            <span>✿</span>
            <span>Crecer también es disfrutar el camino.</span>
            <span>✿</span>
          </div>

        </div>

      </section>

    </main>
  );
};