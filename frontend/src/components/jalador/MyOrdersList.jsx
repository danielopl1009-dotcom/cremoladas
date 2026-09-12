import { useState } from 'react';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { IcoCar, IcoHome, IcoStore, IcoMapPin, IcoUpload } from '../ui/Icons.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { PaymentBadge } from '../ui/PaymentBadge.jsx';
import PaymentUploadModal from './PaymentUploadModal.jsx';
import { useOrders } from '../../hooks/useOrders.js';
import { usePayment, useUploadPayment } from '../../hooks/usePayments.js';
import useAuthStore from '../../stores/authStore.js';
import { formatHoraPE, minutosBetween, tiempoRelativo, colorEspera } from '../../lib/time.js';

const LOC_ICON = {
  vehiculo: IcoCar, frente_local: IcoHome,
  restaurante: IcoStore, botica: IcoMapPin, otro: IcoMapPin
};

const fh = formatHoraPE;
const mins = minutosBetween;

function OrderRow({ order, onUploadPayment }) {
  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;
  const Icon     = LOC_ICON[order.location_type] || IcoMapPin;
  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || ''} · ${details.color || ''}`
    : details.nombre || details.referencia || '';

  const { data: payment } = usePayment(order.id);

  const waitToPrep = minutosBetween(order.created_at, order.prepared_at);
  const prepTime   = minutosBetween(order.prepared_at, order.ready_at);
  const totalTime  = minutosBetween(order.created_at, order.delivered_at || order.cancelled_at);

  // Mostrar botón de adjuntar pago si:
  // - No hay pago registrado, O
  // - El pago fue rechazado
  const showUploadButton = !payment || payment.status === 'rejected';

  return (
    <div className="card p-4 space-y-3 animate-fade-in">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg font-black text-surface-900 dark:text-surface-50">
            #{order.order_number}
          </span>
          <div className="flex items-center gap-1 text-surface-400 min-w-0">
            <Icon size={14} />
            <span className="text-xs truncate">{subtitle || order.location_type}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="space-y-1">
        {(order.items || []).map((item, i) => {
          const flavors = typeof item.flavors === 'string'
            ? JSON.parse(item.flavors || '[]') : (item.flavors || []);
          return (
            <p key={i} className="text-xs text-surface-600 dark:text-surface-400">
              {item.quantity}× {item.size}
              {flavors.length > 0 && (
                <span className="text-surface-400"> — {flavors.join(' + ')}</span>
              )}
            </p>
          );
        })}
      </div>

      {/* Línea de tiempos */}
      <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-surface-400">Enviado</span>
          <span className="font-bold text-surface-700 dark:text-surface-200">{fh(order.created_at)}</span>
        </div>

        {order.prepared_at && (
          <div className="flex justify-between">
            <span className="text-surface-400">Preparando</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{fh(order.prepared_at)}</span>
          </div>
        )}

        {order.ready_at && (
          <div className="flex justify-between">
            <span className="text-surface-400">Listo</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{fh(order.ready_at)}</span>
          </div>
        )}

        {order.delivered_at && (
          <div className="flex justify-between">
            <span className="text-surface-400">Entregado</span>
            <span className="font-bold text-surface-600 dark:text-surface-300">{fh(order.delivered_at)}</span>
          </div>
        )}

        {/* Duraciones */}
        {waitToPrep !== null && (
          <div className="flex justify-between col-span-2 border-t border-surface-200 dark:border-surface-700 pt-1 mt-0.5">
            <span className="text-surface-400">Espera hasta prep.</span>
            <span className={clsx('font-semibold', colorEspera(waitToPrep))}>
              {waitToPrep} min
            </span>
          </div>
        )}
        {prepTime !== null && (
          <div className="flex justify-between col-span-2">
            <span className="text-surface-400">Tiempo de preparación</span>
            <span className={clsx('font-semibold', colorEspera(prepTime))}>
              {prepTime} min
            </span>
          </div>
        )}
        {totalTime !== null && (
          <div className="flex justify-between col-span-2">
            <span className="text-surface-400">Tiempo total</span>
            <span className="font-bold text-surface-700 dark:text-surface-200">{totalTime} min</span>
          </div>
        )}
      </div>

      {/* Footer con pago y botón de adjuntar */}
      <div className="flex justify-between items-center gap-3 text-xs">
        <span className="text-surface-400">{tiempoRelativo(order.created_at)}</span>
        <div className="flex items-center gap-2">
          <PaymentBadge payment={payment} size="sm" />
          <span className="font-bold text-surface-700 dark:text-surface-300">
            S/{Number(order.total).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botón para adjuntar pago */}
      {showUploadButton && (
        <button
          onClick={() => onUploadPayment(order.id)}
          className="w-full btn-secondary text-sm py-2"
        >
          <IcoUpload size={14} />
          <span>Adjuntar comprobante</span>
        </button>
      )}
    </div>
  );
}

function IcoClipboard({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  );
}

export default function MyOrdersList({ search }) {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading } = useOrders({
    jaladorId: user?.id,
    search: search || undefined,
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const uploadPaymentMutation = useUploadPayment();

  const handleOpenUploadModal = (orderId) => {
    setSelectedOrderId(orderId);
    setUploadModalOpen(true);
  };

  const handleUploadPayment = async (data) => {
    await uploadPaymentMutation.mutateAsync(data);
    setUploadModalOpen(false);
    setSelectedOrderId(null);
  };

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="spinner text-brand-500" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-surface-300 dark:text-surface-600">
      <IcoClipboard size={40} className="mb-3 opacity-40" />
      <p className="text-sm">Aún no hay pedidos</p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {orders.map(o => (
          <OrderRow 
            key={o.id} 
            order={o} 
            onUploadPayment={handleOpenUploadModal}
          />
        ))}
      </div>

      {uploadModalOpen && (
        <PaymentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedOrderId(null);
          }}
          onUpload={handleUploadPayment}
          orderId={selectedOrderId}
        />
      )}
    </>
  );
}
