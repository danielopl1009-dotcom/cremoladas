import { useState, lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { disconnectSocket } from '../lib/socket.js';
import useAuthStore from '../stores/authStore.js';
import useUIStore from '../stores/uiStore.js';
import {
  IcoCup, IcoGrid, IcoPackage, IcoUsers, IcoList,
  IcoBarChart, IcoMenu, IcoX, IcoLogout, IcoMoon, IcoSun
} from '../components/ui/Icons.jsx';

const Dashboard    = lazy(() => import('./admin/Dashboard.jsx'));
const ProductsAdmin = lazy(() => import('./admin/ProductsAdmin.jsx'));
const UsersAdmin   = lazy(() => import('./admin/UsersAdmin.jsx'));
const OrdersAdmin  = lazy(() => import('./admin/OrdersAdmin.jsx'));
const StatsAdmin   = lazy(() => import('./admin/StatsAdmin.jsx'));

const NAV = [
  { to: '/admin',          label: 'Dashboard',    Icon: IcoGrid,     end: true },
  { to: '/admin/orders',   label: 'Pedidos',       Icon: IcoList },
  { to: '/admin/products', label: 'Productos',     Icon: IcoPackage },
  { to: '/admin/users',    label: 'Usuarios',      Icon: IcoUsers },
  { to: '/admin/stats',    label: 'Estadísticas',  Icon: IcoBarChart },
];

const Spinner = () => (
  <div className="flex justify-center py-16">
    <div className="spinner text-brand-500" style={{ width: 28, height: 28, borderWidth: 3 }} />
  </div>
);

export default function AdminPage() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => { disconnectSocket(); logout(); navigate('/login', { replace: true }); };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">

      {/* Overlay móvil */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-surface-950 dark:bg-surface-950 text-white
        flex flex-col transition-transform duration-200 border-r border-surface-800
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-surface-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Cremoladas</p>
              <p className="text-xs text-surface-400 leading-none mt-0.5">Anabel</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 text-surface-400 hover:text-white">
            <IcoX size={18} />
          </button>
        </div>

        {/* Perfil */}
        <div className="px-4 py-3 border-b border-surface-800">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm mb-2">
            {user?.name?.charAt(0)}
          </div>
          <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
          <p className="text-xs text-surface-500 mt-0.5 capitalize">{user?.role}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-surface-800 flex gap-1">
          <button
            onClick={toggleDarkMode}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl
              text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            {darkMode ? <IcoSun size={16} /> : <IcoMoon size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl
              text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
          >
            <IcoLogout size={16} />
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar móvil */}
        <div className="lg:hidden bg-white dark:bg-surface-900 border-b border-surface-100
          dark:border-surface-800 px-4 h-14 flex items-center justify-between shrink-0">
          <button onClick={() => setOpen(true)} className="p-2 -ml-2 text-surface-600 dark:text-surface-400">
            <IcoMenu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-white dark:bg-surface-800 flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-xs text-surface-900 dark:text-surface-50">Cremoladas</span>
              <span className="text-xs text-surface-400 mt-0.5">Anabel</span>
            </div>
          </div>
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="orders"   element={<OrdersAdmin />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="users"    element={<UsersAdmin />} />
              <Route path="stats"    element={<StatsAdmin />} />
              <Route path="*"        element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
