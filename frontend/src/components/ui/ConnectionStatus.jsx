import { useEffect, useState } from 'react';
import { IcoWifi, IcoWifiOff } from './Icons.jsx';
import useOfflineStore from '../../stores/offlineStore.js';

export default function ConnectionStatus() {
  const { isOnline, pendingOrders } = useOfflineStore();
  const [show, setShow] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) { setShow(true); setWasOffline(true); }
    else if (wasOffline) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  if (!show) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2
      py-2 text-xs font-semibold transition-colors
      ${isOnline ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {isOnline
        ? <><IcoWifi size={14} /> Conexión restaurada{pendingOrders.length > 0 ? ' — sincronizando...' : ''}</>
        : <><IcoWifiOff size={14} /> Sin conexión — los pedidos se guardan localmente</>
      }
    </div>
  );
}
