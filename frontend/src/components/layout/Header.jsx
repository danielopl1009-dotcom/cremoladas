import { useNavigate } from 'react-router-dom';
import { IcoCup, IcoLogout, IcoMoon, IcoSun, IcoBell } from '../ui/Icons.jsx';
import { disconnectSocket } from '../../lib/socket.js';
import useAuthStore from '../../stores/authStore.js';
import useUIStore from '../../stores/uiStore.js';

const ROLE_LABEL = {
  jalador: 'Jalador', servidor: 'Servidor',
  caja: 'Caja', administrador: 'Administrador',
};

export default function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, notifications } = useUIStore();
  const unread = notifications.length;

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800
      px-4 h-14 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Izquierda */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <IcoCup size={16} className="text-white" />
        </div>
        <div className="hidden sm:block">
          {title && <p className="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-none">{title}</p>}
          {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Centro — título en mobile */}
      {title && (
        <p className="sm:hidden text-sm font-semibold text-surface-900 dark:text-surface-50 absolute left-1/2 -translate-x-1/2">
          {title}
        </p>
      )}

      {/* Derecha */}
      <div className="flex items-center gap-1">
        {/* Rol */}
        <span className="hidden sm:block text-xs text-surface-400 mr-2 font-medium">
          {ROLE_LABEL[user?.role]}
        </span>

        {/* Notificaciones */}
        <button className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400">
          <IcoBell size={18} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          )}
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400"
        >
          {darkMode ? <IcoSun size={18} /> : <IcoMoon size={18} />}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400"
        >
          <IcoLogout size={18} />
        </button>
      </div>
    </header>
  );
}
