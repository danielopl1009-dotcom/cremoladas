import { useState } from 'react';
import clsx from 'clsx';
import Header from '../components/layout/Header.jsx';
import OrderCard from '../components/servidor/OrderCard.jsx';
import PaymentModal from '../components/ui/PaymentModal.jsx';
import { IcoGrid, IcoPackage, IcoPlus, IcoMinus, IcoEdit, IcoCheck } from '../components/ui/Icons.jsx';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders.js';
import { useFlavors } from '../hooks/useProducts.js';
import useAuthStore from '../stores/authStore.js';

// ─────────────────────────────────────────────────────────────────────────────
// KANBAN
// ─────────────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { id: 'pendiente',  label: 'Pendiente',  color: 'text-amber-600  dark:text-amber-400',    dot: 'bg-amber-400'   },
  { id: 'preparando', label: 'Preparando', color: 'text-blue-600   dark:text-blue-400',     dot: 'bg-blue-500'    },
  { id: 'listo',      label: 'Listo',      color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  { id: 'entregado',  label: 'Entregado',  color: 'text-surface-500 dark:text-surface-400', dot: 'bg-surface-400' },
];

function KanbanView() {
  const [updatingId, setUpdatingId]   = useState(null);
  const [showDelivered, setShowDelivered] = useState(false);
  const [payOrder, setPayOrder]       = useState(null);

  const { data: orders = [], isLoading } = useOrders({});
  const updateStatus = useUpdateOrderStatus();
  const { user } = useAuthStore();

  // Todos los servidores pueden registrar pagos
  const canPay = ['servidor', 'caja', 'administrador'].includes(user?.role);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try { await updateStatus.mutateAsync({ id, status }); }
    finally { setUpdatingId(null); }
  };

  const grouped = COLUMNS.reduce((a, c) => ({ ...a, [c.id]: orders.filter(o => o.status === c.id) }), {});
  const cols    = showDelivered ? COLUMNS : COLUMNS.filter(c => c.id !== 'entregado');

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner text-brand-500" /></div>;

  return (
    <div className="h-full flex flex-col">
      {/* Barra de contadores */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800
        px-4 py-2 flex items-center gap-4 overflow-x-auto shrink-0">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex items-center gap-1.5 shrink-0">
            <span className={clsx('w-2 h-2 rounded-full', col.dot)} />
            <span className="text-xs text-surface-600 dark:text-surface-400">{col.label}</span>
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100 bg-surface-100
              dark:bg-surface-800 px-1.5 py-0.5 rounded-full">
              {grouped[col.id]?.length ?? 0}
            </span>
          </div>
        ))}
        <button
          onClick={() => setShowDelivered(!showDelivered)}
          className="ml-auto text-xs text-brand-600 dark:text-brand-400 font-semibold shrink-0"
        >
          {showDelivered ? 'Ocultar entregados' : 'Ver entregados'}
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 p-4 overflow-x-auto flex-1 items-start">
        {cols.map(col => (
          <div key={col.id}
            className="flex flex-col min-w-[270px] max-w-[300px] bg-surface-100 dark:bg-surface-800/50 rounded-2xl p-3 gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="flex items-center gap-2">
                <span className={clsx('w-2 h-2 rounded-full', col.dot)} />
                <span className={clsx('text-xs font-bold uppercase tracking-wide', col.color)}>{col.label}</span>
              </div>
              <span className="text-xs font-bold text-surface-500 bg-white dark:bg-surface-700 rounded-full px-2 py-0.5 shadow-sm">
                {grouped[col.id]?.length ?? 0}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-200px)] pr-0.5">
              {grouped[col.id]?.length === 0
                ? <p className="text-center text-xs text-surface-400 py-8">Sin pedidos</p>
                : grouped[col.id].map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    isUpdating={updatingId === order.id}
                    onPayClick={canPay ? (o) => setPayOrder(o) : null}
                  />
                ))
              }
            </div>
          </div>
        ))}
      </div>

      <PaymentModal order={payOrder} open={!!payOrder} onClose={() => setPayOrder(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_STOCK = () => {
  try { return JSON.parse(localStorage.getItem('flavor_stock') || '{}'); } catch { return {}; }
};

function InventoryView() {
  const { data: flavors = [], isLoading } = useFlavors();
  const [stock, setStock]   = useState(INITIAL_STOCK);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');

  const save = (id, val) => {
    const n = Math.max(0, parseInt(val) || 0);
    const next = { ...stock, [id]: n };
    setStock(next);
    localStorage.setItem('flavor_stock', JSON.stringify(next));
    setEditing(null);
  };

  const adjust = (id, delta) => {
    const current = stock[id] ?? 0;
    const next = { ...stock, [id]: Math.max(0, current + delta) };
    setStock(next);
    localStorage.setItem('flavor_stock', JSON.stringify(next));
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="spinner text-brand-500" /></div>;

  const low = flavors.filter(f => (stock[f.id] ?? 0) < 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {low.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Stock bajo ({low.length})</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">{low.map(f => f.name).join(', ')}</p>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
          <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">Inventario de sabores</p>
          <p className="text-xs text-surface-400 mt-0.5">Registra la cantidad disponible de cada sabor</p>
        </div>
        <table className="table-base">
          <thead>
            <tr><th>Sabor</th><th className="text-center">Cantidad</th><th className="text-center">Ajustar</th></tr>
          </thead>
          <tbody>
            {flavors.map(f => {
              const qty   = stock[f.id] ?? 0;
              const isLow = qty < 5;
              return (
                <tr key={f.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {isLow && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
                      <span className={clsx('text-sm', isLow && 'text-amber-600 dark:text-amber-400 font-medium')}>{f.name}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    {editing === f.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                          className="input w-16 text-center text-sm py-1.5" min={0}
                          onKeyDown={e => e.key === 'Enter' && save(f.id, editVal)} autoFocus />
                        <button onClick={() => save(f.id, editVal)}
                          className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                          <IcoCheck size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(f.id); setEditVal(String(qty)); }}
                        className={clsx(
                          'font-bold text-sm px-3 py-1 rounded-lg transition-colors',
                          isLow ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                                : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                        )}>
                        {qty} <IcoEdit size={11} className="inline ml-1 opacity-40" />
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => adjust(f.id, -1)}
                        className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center
                          hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                        <IcoMinus size={12} />
                      </button>
                      <button onClick={() => adjust(f.id, 1)}
                        className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center
                          hover:bg-brand-200 text-brand-700 dark:text-brand-400 transition-colors">
                        <IcoPlus size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA SERVIDOR
// ─────────────────────────────────────────────────────────────────────────────
export default function ServidorPage() {
  const [tab, setTab] = useState('orders');

  const TABS = [
    { id: 'orders',    label: 'Pedidos',    Icon: IcoGrid    },
    { id: 'inventory', label: 'Inventario', Icon: IcoPackage },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <Header title="Cremoladas" subtitle="Servidor" />

      <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 px-4 shrink-0">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all',
                tab === id
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              )}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'orders'    && <KanbanView />}
        {tab === 'inventory' && <InventoryView />}
      </div>
    </div>
  );
}
