import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../utils/api';

export default function AdminResetPassword() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword(code, newPassword);
      if (res && res.error) { setError(res.error); return; }
      setDone(true);
      timerRef.current = setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      if (err && err.error) setError(err.error);
      else setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
          <img src="/logo.png" alt="Horizonte Inmobiliario" className="h-16 mx-auto mb-6" />
          <p className="text-forest font-bold text-lg mb-2">Contraseña actualizada</p>
          <p className="text-moss text-sm">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <img src="/logo.png" alt="Horizonte Inmobiliario" className="h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-forest-dark text-center mb-6">Nueva contraseña</h1>
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="reset-code" className="sr-only">Código de recuperación</label>
          <input
            id="reset-code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Código de recuperación"
            className="w-full px-4 py-3 border border-border-input rounded-lg mb-4 text-forest-dark focus:outline-none focus:ring-2 focus:ring-forest"
            autoFocus
          />
          <label htmlFor="reset-password" className="sr-only">Nueva contraseña (mín. 6 caracteres)</label>
          <input
            id="reset-password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            className="w-full px-4 py-3 border border-border-input rounded-lg mb-4 text-forest-dark focus:outline-none focus:ring-2 focus:ring-forest"
          />
          <motion.button
            type="submit"
            disabled={loading || !code || newPassword.length < 6}
            className="w-full bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest-dark transition disabled:opacity-60"
            whileHover={!loading && code && newPassword.length >= 6 ? { scale: 1.03 } : undefined}
            whileTap={!loading && code && newPassword.length >= 6 ? { scale: 0.97 } : undefined}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </form>
        <Link to="/admin/login" className="block text-center text-moss text-sm hover:text-forest-dark mt-4 transition">
          Volver al login
        </Link>
      </div>
    </div>
  );
}
