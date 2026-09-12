import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { IcoEye, IcoEyeOff, IcoCup } from '../components/ui/Icons.jsx';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import useAuthStore from '../stores/authStore.js';

const ROLE_HOME = {
  jalador: '/jalador', servidor: '/servidor',
  caja: '/caja', administrador: '/admin',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Llena todos los campos'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.user, data.data.token);
      navigate(ROLE_HOME[data.data.user.role] || '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Usuario o clave incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Panel izquierdo — decorativo (solo desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/40" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-brand-700/60" />
        <div className="absolute top-1/3 right-8 w-48 h-48 rounded-full bg-brand-400/20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Cremoladas Anabel" className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight block leading-none">Cremoladas Anabel</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Pedidos más rápidos,<br />clientes más felices
          </h2>
          <p className="text-brand-100 text-base leading-relaxed">
            Del jalador a la cocina en segundos.<br />
            Nada de papelitos ni confusión.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {[['Jalador', 'Toma el pedido'], ['Servidor', 'Lo prepara'], ['Caja', 'Cobra']].map(([r, d]) => (
            <div key={r}>
              <p className="text-white font-semibold text-sm">{r}</p>
              <p className="text-brand-200 text-xs mt-0.5">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo centrado */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Cremoladas Anabel" className="w-full h-full object-contain p-2" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Cremoladas Anabel</h1>
            <p className="text-surface-400 text-sm mt-2">Ingresa tu usuario y clave</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Usuario
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="input bg-surface-900 border-surface-700 text-white placeholder:text-surface-600
                  focus:ring-brand-500 focus:border-brand-500"
                placeholder="usuario"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input bg-surface-900 border-surface-700 text-white placeholder:text-surface-600
                    focus:ring-brand-500 focus:border-brand-500 pr-12"
                  placeholder="•••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors p-1"
                >
                  {showPass ? <IcoEyeOff size={18} /> : <IcoEye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold
                py-3 rounded-xl transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><div className="spinner text-white w-4 h-4" /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-surface-600 text-xs mt-8">
            Cremoladas Anabel &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
