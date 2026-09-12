import { useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { tiempoRelativo } from '../lib/time.js';
import Header from '../components/layout/Header.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { PaymentBadge } from '../components/ui/PaymentBadge.jsx';
import PaymentModal from '../components/ui/PaymentModal.jsx';
import {
  IcoCreditCard, IcoSearch, IcoX, IcoDollar,
  IcoClipboardCheck, IcoBarChart, IcoTrendUp, IcoEye
} from '../components/ui/Icons.jsx';
import { useOrders, useDailyStats } from '../hooks/useOrders.js';
import { useDailyPayments, usePayment } from '../hooks/usePayments.js';

// ── Row con pago en tiempo real ───────────────────────────────────────────────
function OrderRow({ order, onPayClick }) {
  const { data: payment } = usePayment(order.id);
  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;
  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || '—'} · ${details.color || ''}` : details.nombre || order.location_type;

  return (
    <tr className={clsx(payment && 'bg-emerald-50/30 dark:bg-emerald-900/5')}>
      <td>
        <span className="font-black text-surface-900 dark:text-surface-50">#{order.order_number}</span>
      </td>
      <td>
        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[130px] truncate">{subtitle}</p>
        <p className="text-xs text-surface-400">{tiempoRelativo(order.created_at)}</p>
      </td>
      <td className="hidden sm:table-cell">
        <span className="text-xs text-surface-500">{order.jalador_name || '—'}</span>
      </td>
      <td className="text-right font-bold text-surface-900 dark:text-surface-100">
        S/{Number(order.total).toFixed(2)}
      </td>
      <td><StatusBadge status={order.status} /></td>
      <td><PaymentBadge payment={payment} /></td>
      <td>
        <button
          onClick={() => onPayClick(order)}
          className={clsx(
            'btn-sm flex items-center gap-1 rounded-xl transition-all',
            payment
              ? 'btn-ghost text-surface-400'
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          )}
        >
          {payment ? <IcoEye size={13} /> : <IcoCreditCard size={13} />}
          <span className="hidden sm:inline">{payment ? 'Ver' : 'Cobrar'}</span>
        </button>
      </td>
    </tr>
  );
}

// ── Vista de resumen del día ──────────────────────────────────────────────────
function DaySummary() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data, isLoading } = useDailyPayments(today);

  if (isLoading) return <div className="flex justify-center py-6"><div className="spinner text-brand-500" /></div>;

  const totals = data?.totals || [];
  const payments = data?.data || [];

  const METHOD_COLORS = {
    efectivo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    yape:     'bg-violet-100  text-violet-700  dark:bg-violet-900/30  dark:text-violet-400',
    plin:     'bg-sky-100     text-sky-700     dark:bg-sky-900/30     dark:text-sky-400',
    tarjeta:  'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
  };

  const total = totals.reduce((s, t) => s + Number(t.total), 0);

  return (
    <div className="space-y-4">
      {/* Resumen por método */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {totals.length === 0 ? (
          <div className="col-span-4 text-center text-sm text-surface-400 py-6">Sin pagos registrados hoy</div>
        ) : totals.map(t => (
          <div key={t.method} className="card p-3">
            <span className={clsx('badge mb-2', METHOD_COLORS[t.method])}>{t.method}</span>
            <p className="text-xl font-black text-surface-900 dark:text-white">S/{Number(t.total).toFixed(2)}</p>
            <p className="text-xs text-surface-400 mt-0.5">{t.count} cobro{t.count !== '1' ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Total general */}
      {totals.length > 0 && (
        <div className="bg-brand-600 text-white rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-brand-200 text-xs font-medium">Total cobrado hoy</p>
            <p className="text-3xl font-black mt-0.5">S/{total.toFixed(2)}</p>
          </div>
          <IcoDollar size={32} className="text-brand-300" />
        </div>
      )}

      {/* Últimos cobros */}
      {payments.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">Últimos cobros</p>
          </div>
          <table className="table-base">
            <thead>
              <tr><th>Pedido</th><th>Método</th><th className="text-right">Monto</th><th>Cobrado por</th><th>Foto</th></tr>
            </thead>
            <tbody>
              {payments.slice(0, 20).map(p => (
                <tr key={p.id}>
                  <td>
                    <p className="font-bold">#{p.order_number}</p>
                    <p className="text-xs text-surface-400">
                      {new Date(p.confirmed_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td><PaymentBadge payment={p} /></td>
                  <td className="text-right font-bold text-surface-900 dark:text-surface-100">
                    S/{Number(p.amount).toFixed(2)}
                  </td>
                  <td className="text-xs text-surface-500">{p.confirmed_by_name || '—'}</td>
                  <td>
                    {p.yape_photo_url ? (
                      <button
                        onClick={() => window.open(`http://localhost:3000${p.yape_photo_url}`, '_blank')}
                        className="text-xs text-violet-600 dark:text-violet-400 underline hover:no-underline"
                      >
                        Ver foto
                      </button>
                    ) : <span className="text-surface-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CajaPage() {
  const [tab, setTab]           = useState('pending');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('listo');
  const [payOrder, setPayOrder]   = useState(null);

  const { data: stats } = useDailyStats();

  const { data: orders = [], isLoading } = useOrders({
    status: statusFilter || undefined,
    search: search || undefined,
    limit: 100,
  });

  const TABS = [
    { id: 'pending', label: 'Cobrar',    Icon: IcoCreditCard },
    { id: 'summary', label: 'Resumen',   Icon: IcoBarChart },
  ];

  const STATUS_OPTS = [
    { id: 'listo',     label: 'Listos' },
    { id: 'entregado', label: 'Entregados' },
    { id: 'preparando', label: 'Preparando' },
    { id: '',          label: 'Todos' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <Header title="Cremoladas Anabel" subtitle="Caja" />

      {/* Stats rápidas */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 px-4 py-3">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: 'Ventas',      value: `S/${Number(stats?.total_sales || 0).toFixed(2)}`, accent: true },
            { label: 'Entregados',  value: stats?.delivered_orders ?? '—' },
            { label: 'Por cobrar',  value: stats?.ready_orders ?? '—' },
            { label: 'Total hoy',   value: stats?.total_orders ?? '—' },
          ].map(s => (
            <div key={s.label} className="shrink-0 text-center px-3">
              <p className="section-title">{s.label}</p>
              <p className={clsx('font-black text-lg', s.accent ? 'text-brand-600 dark:text-brand-400' : 'text-surface-900 dark:text-surface-50')}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
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

      <div className="flex-1 overflow-y-auto">
        {tab === 'summary' && (
          <div className="max-w-3xl mx-auto px-4 py-4">
            <DaySummary />
          </div>
        )}

        {tab === 'pending' && (
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <IcoSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  className="input pl-9 pr-9 text-sm" placeholder="Buscar número, placa..." />
                {search && <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"><IcoX size={15} /></button>}
              </div>
              <div className="flex gap-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-1 flex-wrap">
                {STATUS_OPTS.map(opt => (
                  <button key={opt.id} onClick={() => setStatus(opt.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                      statusFilter === opt.id ? 'bg-brand-600 text-white' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><div className="spinner text-brand-500" /></div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-surface-300 dark:text-surface-600">
                <IcoClipboardCheck size={40} className="mb-3 opacity-40" />
                <p className="text-sm">Sin pedidos en este filtro</p>
              </div>
            ) : (
              <div className="card p-0 overflow-hidden overflow-x-auto">
                <table className="table-base min-w-[600px]">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ubicación</th>
                      <th className="hidden sm:table-cell">Jalador</th>
                      <th className="text-right">Total</th>
                      <th>Estado</th>
                      <th>Pago</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <OrderRow key={order.id} order={order} onPayClick={setPayOrder} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <PaymentModal order={payOrder} open={!!payOrder} onClose={() => setPayOrder(null)} />
    </div>
  );
}
