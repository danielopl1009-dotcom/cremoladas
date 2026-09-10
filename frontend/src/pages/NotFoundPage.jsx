import { useNavigate } from 'react-router-dom';
import { IcoAlertCircle } from '../components/ui/Icons.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-950 p-8">
      <IcoAlertCircle size={48} className="text-surface-300 dark:text-surface-600 mb-4" />
      <h1 className="text-3xl font-black text-surface-900 dark:text-surface-50 mb-2">404</h1>
      <p className="text-surface-400 mb-6 text-sm">Página no encontrada</p>
      <button onClick={() => navigate(-1)} className="btn-primary">
        Volver atrás
      </button>
    </div>
  );
}
