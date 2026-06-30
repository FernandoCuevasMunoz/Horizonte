import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, setToken } from '../utils/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setRemaining(null);
    setLoading(true);
    try {
      const res = await api.login(password);
      setToken(res.token);
      navigate('/admin');
    } catch (err) {
      if (err && err.error) {
        setError(err.error);
        if (err.remainingAttempts !== undefined) setRemaining(err.remainingAttempts);
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} noValidate className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <img src="/logo.png" alt="Horizonte Inmobiliario" className="h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-forest-dark text-center mb-6">Admin</h1>
        {error && <p className="text-red-600 text-sm mb-2 text-center">{error}</p>}
        {remaining !== null && remaining > 0 && (
          <p className="text-amber-600 text-xs text-center mb-4">
            Intentos restantes: {remaining}
          </p>
        )}
        <label htmlFor="admin-password" className="sr-only">Contraseña</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full px-4 py-3 border border-border-input rounded-lg mb-4 text-forest-dark focus:outline-none focus:ring-2 focus:ring-forest"
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest-dark transition disabled:opacity-60"
          whileHover={!loading && password ? { scale: 1.03 } : undefined}
          whileTap={!loading && password ? { scale: 0.97 } : undefined}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </motion.button>
        <Link
          to="/admin/forgot-password"
          className="block text-center text-moss text-sm hover:text-forest-dark mt-4 transition"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </div>
  );
}
