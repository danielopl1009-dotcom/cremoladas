import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { IcoCar, IcoHome, IcoStore, IcoMapPin, IcoArrowRight, IcoCreditCard } from '../ui/Icons.jsx';
import { PaymentBadge } from '../ui/PaymentBadge.jsx';
import { usePayment } from '../../hooks/usePayments.js';
import { formatHoraPE, minutosBetween, tiempoRelativo, colorEspera } from '../../lib/time.js';

const LOC_ICON = {
  vehiculo: IcoCar, frente_local: IcoHome,
  restaurante: IcoStore, botica: IcoMapPin, otro: IcoMapPin,
};

const ACTION = {
  pendiente:  { label: 'Iniciar preparación', next: 'preparando', cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
  preparando: { label: 'Marcar como listo',   next: 'listo',      cls: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  listo:      { label: 'Marcar entregado',    next: 'entregado',  cls: 'bg-surface-700 hover:bg-surface-800 text-white' },
};

const STATUS_BAR = {
  pendiente:  'border-l-amber-400',
  preparando: 'border-l-blue-500',
  listo:      'border-l-emerald-500',
  entregado:  'border-l-surface-300',
  cancelado:  'border-l-red-400',
};

// Contador en vivo — se actualiza cada minuto
function LiveCounter({ from }) {
  const [mins, setMins] = useState(minutosBetween(from, new Date().toISOString()));

  useEffect(() => {
    const id = setInterval(() => {
      setMins(minutosBetween(from, new Date().toISOString()));
    }, 60000);
    return () => clearInterval(id);
  }, [from]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-surface-400">Transcurrido:</span>
      <span className={clsx('font-bold', colorEspera(mins))}>{mins} min</span>
    </div>
  );
}

// Bloque de tiempos
function TimeLine({ order }) {
  const waitToPrep = minutosBetween(order.created_at, order.prepared_at);
  const prepTime   = minutosBetween(order.prepared_at, order.ready_at);
  const readyToEnd = minutosBetween(order.ready_at, order.delivered_at || order.cancelled_at);
  const totalTime  = minutosBetween(order.created_at, order.delivered_at || order.cancelled_at);
  const finished   = !!(order.delivered_at || order.cancelled_at);

  const rows = [
    { label: 'Pedido enviado', ts: order.created_at,   color: 'text-surface-700 dark:text-surface-200' },
    { label: 'Inicio prep.',   ts: order.prepared_at,  color: 'text-blue-600   dark:text-blue-400'  },
    { label: 'Listo',          ts: order.ready_at,     color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Entregado',      ts: order.delivered_at, color: 'text-surface-600 dark:text-surface-300' },
    { label: 'Cancelado',      ts: order.cancelled_at, color: 'text-red-500' },
  ].filter(r => !!r.ts);

  return (
    <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-3 space-y-2 text-xs">
      {/* Horas */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {rows.map(r => (
          <div key={r.label} className="flex justify-between items-center gap-2">
            <span className="text-surface-400 truncate">{r.label}</span>
            <span className={clsx('font-bold shrink-0', r.color)}>{formatHoraPE(r.ts)}</span>
          </div>
        ))}
      </div>

      {/* Duraciones */}
      {(waitToPrep !== null || prepTime !== null || finished) && (
        <div className="border-t border-surface-200 dark:border-surface-700 pt-2 flex flex-wrap gap-x-4 gap-y-1">
          {waitToPrep !== null && (
            <div className="flex items-center gap-1">
              <span className="text-surface-400">Espera:</span>
              <span className={clsx('font-semibold', colorEspera(waitToPrep))}>{waitToPrep} min</span>
            </div>
          )}
          {prepTime !== null && (
            <div className="flex items-center gap-1">
              <span className="text-surface-400">Prep.:</span>
              <span className={clsx('font-semibold', colorEspera(prepTime))}>{prepTime} min</span>
            </div>
          )}
          {readyToEnd !== null && (
            <div className="flex items-center gap-1">
              <span className="text-surface-400">Entrega:</span>
              <span className="font-medium text-surface-600 dark:text-surface-300">{readyToEnd} min</span>
            </div>
          )}
          {totalTime !== null && finished && (
            <div className="flex items-center gap-1">
              <span className="text-surface-400">Total:</span>
              <span className={clsx('font-bold', colorEspera(totalTime))}>{totalTime} min</span>
            </div>
          )}
          {/* Contador en vivo si el pedido sigue activo */}
          {!finished && <LiveCounter from={order.created_at} />}
        </div>
      )}
    </div>
  );
}

export default function OrderCard({ order, onStatusChange, isUpdating, onPayClick }) {
  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;

  const Icon = LOC_ICON[order.location_type] || IcoMapPin;
  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || '—'} · ${details.color || ''}`
    : details.nombre || details.referencia || order.location_type.replace('_', ' ');

  const action = ACTION[order.status];
  const { data: payment } = usePayment(order.id);

  return (
    <div className={clsx(
      'bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800',
      'shadow-card p-4 space-y-3 border-l-4 animate-fade-in',
      STATUS_BAR[order.status]
    )}>
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-black text-surface-900 dark:text-surface-50">
            #{order.order_number}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Icon size={13} className="text-surface-400 shrink-0" />
            <p className="text-xs text-surface-500 truncate">{subtitle}</p>
          </div>
        </div>
        {/* Hora de creación — hora Perú */}
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-lg">
            {formatHoraPE(order.created_at)}
          </span>
          <p className="text-xs text-surface-400 mt-0.5">{tiempoRelativo(order.created_at)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {(order.items || []).map((item, i) => {
          const flavors = typeof item.flavors === 'string'
            ? JSON.parse(item.flavors || '[]') : (item.flavors || []);
          return (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 w-5 text-right shrink-0">
                {item.quantity}×
              </span>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">{item.size}</span>
                {flavors.length > 0 && (
                  <p className="text-xs text-surface-400 truncate">{flavors.join(' + ')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Observación */}
      {order.observations && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800
          rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          {order.observations}
        </div>
      )}

      {/* Línea de tiempo */}
      <TimeLine order={order} />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">{order.jalador_name || '—'}</span>
        <div className="flex items-center gap-2">
          <PaymentBadge payment={payment} size="sm" />
          <span className="text-sm font-bold text-surface-700 dark:text-surface-300">
            S/{Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón cobrar */}
      {!payment && onPayClick && (
        <button
          type="button"
          onClick={() => onPayClick(order)}
          className="w-full py-2 rounded-xl text-xs font-bold border border-emerald-500 text-emerald-700
            dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors
            flex items-center justify-center gap-1.5"
        >
          <IcoCreditCard size={13} />
          Registrar pago
        </button>
      )}

      {/* Acción de estado */}
      {action && (
        <button
          type="button"
          onClick={() => onStatusChange(order.id, action.next)}
          disabled={isUpdating}
          className={clsx(
            'w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all',
            'active:scale-[.98] disabled:opacity-50',
            action.cls
          )}
        >
          {isUpdating
            ? <><div className="spinner w-3 h-3" /> Actualizando...</>
            : <>{action.label} <IcoArrowRight size={13} /></>
          }
        </button>
      )}

      {order.status === 'cancelado' && (
        <p className="text-center text-xs text-red-500 font-semibold">
          Cancelado a las {formatHoraPE(order.cancelled_at)}
        </p>
      )}
    </div>
  );
}
