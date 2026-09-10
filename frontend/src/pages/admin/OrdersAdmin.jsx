import { useState } from 'react';
import clsx from 'clsx';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatHoraPE, minutosBetween, tiempoRelativo } from '../../lib/time.js';

const fh = formatHoraPE;
const minsB = minutosBetween;
import Modal from '../../components/ui/Modal.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { PaymentBadge } from '../../components/ui/PaymentBadge.jsx';
import PaymentModal from '../../components/ui/PaymentModal.jsx';
import { IcoSearch, IcoX, IcoCar, IcoHome, IcoStore, IcoMapPin } from '../../components/ui/Icons.jsx';
import { useOrders, useOrder, useUpdateOrderStatus } from '../../hooks/useOrders.js';
import { usePayment } from '../../hooks/usePayments.js';

const LOC_ICON = { vehiculo: IcoCar, frente_local: IcoHome, restaurante: IcoStore, botica: IcoMapPin, otro: IcoMapPin };

const STATUSES = [
  { id: '',           label: 'Todos' },
  { id: 'pendiente',  label: 'Pendiente' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'listo',      label: 'Listo' },
  { id: 'entregado',  label: 'Entregado' },
  { id: 'cancelado',  label: 'Cancelado' },
];

// Row con pago en tiempo real
function AdminOrderRow({ order, onView, onPay }) {
  const { data: payment } = usePayment(order.id);
  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;
  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || '—'} · ${details.color || ''}` : details.nombre || order.location_type;
  const Icon = LOC_ICON[order.location_type] || IcoMapPin;

  return (
    <tr className={clsx('cursor-pointer', payment && 'bg-emerald-50/30 dark:bg-emerald-900/5')}
      onClick={() => onView(order.id)}>
      <td><span className="font-black text-surface-900 dark:text-surface-50">#{order.order_number}</span></td>
      <td>
        <div className="flex items-center gap-1.5">
          <Icon size={13} className="text-surface-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[110px] truncate">{subtitle}</p>
            <p className="text-xs text-surface-400">{tiempoRelativo(new Date(order.created_at).toISOString())}</p>
          </div>
        </div>
      </td>
      <td className="text-sm text-surface-500">{order.jalador_name || '—'}</td>
      <td className="text-right font-bold text-surface-900 dark:text-surface-100">S/{Number(order.total).toFixed(2)}</td>
      <td><StatusBadge status={order.status} /></td>
      <td><PaymentBadge payment={payment} /></td>
      <td>
        <button
          onClick={e => { e.stopPropagation(); onPay(order); }}
          className="btn-sm btn-ghost text-xs"
        >
          {payment ? 'Ver pago' : 'Cobrar'}
        </button>
      </td>
    </tr>
  );
}

  const { data: order, isLoading } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) return <div className="flex justify-center py-8"><div className="spinner text-brand-500" /></div>;
  if (!order) return <p className="text-surface-400 text-center py-8">No encontrado</p>;

  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;

  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
          <p className="section-title mb-1">Pedido</p>
          <p className="font-black text-lg text-surface-900 dark:text-white">#{order.order_number}</p>
        </div>
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
          <p className="section-title mb-1">Estado</p>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 space-y-1">
        <p className="section-title">Ubicación</p>
        <p className="font-semibold text-surface-900 dark:text-white mt-1">
          {order.location_type === 'vehiculo'
            ? `${details.placa} · ${details.color}${details.modelo ? ' · ' + details.modelo : ''}`
            : details.nombre || order.location_type}
        </p>
        {details.referencia && <p className="text-surface-400 text-xs">{details.referencia}</p>}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-base">
          <tbody>
            {order.items?.map((item, i) => {
              const flavors = typeof item.flavors === 'string' ? JSON.parse(item.flavors || '[]') : (item.flavors || []);
              return (
                <tr key={i}>
                  <td>
                    <p className="font-medium">{item.quantity}× {item.size}</p>
                    {flavors.length > 0 && <p className="text-xs text-surface-400">{flavors.join(' + ')}</p>}
                  </td>
                  <td className="text-right font-bold">S/{Number(item.subtotal).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800 flex justify-between font-black">
          <span>Total</span>
          <span className="text-brand-600 dark:text-brand-400">S/{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div>
        <p className="section-title mb-2">Historial de tiempos</p>
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3 space-y-1.5 text-xs">
          {[
            { label: 'Pedido creado',    ts: order.created_at,   color: 'text-surface-700 dark:text-surface-200' },
            { label: 'Inicio prep.',     ts: order.prepared_at,  color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Listo',            ts: order.ready_at,     color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Entregado',        ts: order.delivered_at, color: 'text-surface-600 dark:text-surface-300' },
            { label: 'Cancelado',        ts: order.cancelled_at, color: 'text-red-500' },
          ].filter(r => !!r.ts).map(r => (
            <div key={r.label} className="flex justify-between">
              <span className="text-surface-400">{r.label}</span>
              <span className={clsx('font-bold', r.color)}>{fh(r.ts)}</span>
            </div>
          ))}

          {/* Duraciones */}
          {minsB(order.created_at, order.prepared_at) !== null && (
            <div className="flex justify-between border-t border-surface-200 dark:border-surface-700 pt-1.5 mt-1">
              <span className="text-surface-400">Espera hasta prep.</span>
              <span className="font-semibold">{minsB(order.created_at, order.prepared_at)} min</span>
            </div>
          )}
          {minsB(order.prepared_at, order.ready_at) !== null && (
            <div className="flex justify-between">
              <span className="text-surface-400">Tiempo preparación</span>
              <span className="font-semibold">{minsB(order.prepared_at, order.ready_at)} min</span>
            </div>
          )}
          {minsB(order.created_at, order.delivered_at || order.cancelled_at) !== null && (
            <div className="flex justify-between">
              <span className="text-surface-400">Tiempo total</span>
              <span className="font-bold text-surface-900 dark:text-white">
                {minsB(order.created_at, order.delivered_at || order.cancelled_at)} min
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="section-title mb-2">Historial de estados</p>
        <div className="space-y-1.5">
          {order.history?.map(h => (
            <div key={h.id} className="flex items-center gap-2 text-xs text-surface-500">
              <span className="text-surface-400 w-12 shrink-0">
                {fh(h.changed_at)}
              </span>
              <span className="font-semibold text-surface-700 dark:text-surface-300 capitalize">{h.status}</span>
              {h.changed_by_name && <span className="text-surface-400">— {h.changed_by_name}</span>}
            </div>
          ))}
        </div>
      </div>

      {['pendiente', 'preparando', 'listo'].includes(order.status) && (
        <button
          onClick={async () => { await updateStatus.mutateAsync({ id: order.id, status: 'cancelado' }); onClose(); }}
          disabled={updateStatus.isPending}
          className="btn-danger w-full"
        >
          Cancelar pedido
        </button>
      )}
    </div>
  );
}

export default function OrdersAdmin() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [payOrder, setPayOrder]     = useState(null);

  const { data: orders = [], isLoading } = useOrders({
    status: statusFilter || undefined,
    search: search || undefined,
    limit: 100,
  });

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Pedidos</h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <IcoSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 pr-9 text-sm" placeholder="Buscar número, placa..." />
          {search && <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400"><IcoX size={15} /></button>}
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="input w-full sm:w-44 text-sm">
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="spinner text-brand-500" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-surface-300 dark:text-surface-600">
          <p className="text-sm">Sin pedidos</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="table-base min-w-[600px]">
            <thead>
              <tr>
                <th>#</th><th>Ubicación</th><th>Jalador</th>
                <th className="text-right">Total</th><th>Estado</th><th>Pago</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <AdminOrderRow
                  key={order.id}
                  order={order}
                  onView={setSelectedId}
                  onPay={setPayOrder}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title="Detalle del pedido">
        {selectedId && <OrderDetail orderId={selectedId} onClose={() => setSelectedId(null)} />}
      </Modal>

      <PaymentModal order={payOrder} open={!!payOrder} onClose={() => setPayOrder(null)} />
    </div>
  );
}
