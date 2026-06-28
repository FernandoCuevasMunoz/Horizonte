import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword();
      if (res && res.error) { setError(res.error); return; }
      setSent(true);
    } catch (err) {
      if (err && err.error) setError(err.error);
      else setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <img src="/logo.png" alt="Horizonte Inmobiliario" className="h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-forest-dark text-center mb-2">Recuperar contraseña</h1>
        <p className="text-moss text-sm text-center mb-6">
          Recibirás un código para crear una nueva contraseña.
        </p>
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        {sent ? (
          <div>
            <p className="text-forest font-semibold text-center mb-4">
              Revisa tu correo. Luego vuelve e ingresa el código.
            </p>
            <Link
              to="/admin/reset-password"
              className="block w-full text-center bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest-dark transition"
            >
              Ingresar código
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest-dark transition disabled:opacity-60 mb-3"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}
        <Link to="/admin/login" className="block text-center text-moss text-sm hover:text-forest-dark mt-4 transition">
          Volver al login
        </Link>
      </div>
    </div>
  );
}
