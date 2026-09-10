import { useState } from 'react';
import { IcoCheckCircle } from '../components/ui/Icons.jsx';
import clsx from 'clsx';
import Header from '../components/layout/Header.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders.js';
import toast from 'react-hot-toast';

const LOCATION_ICONS = {
  vehiculo: '🚗', frente_local: '🏪', restaurante: '🍽️', botica: '💊', otro: '🛍️',
};

function ReadyOrderCard({ order, onDeliver }) {
  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details)
    : order.location_details;

  const subtitle =
    order.location_type === 'vehiculo'
      ? `${details.placa} · ${details.color}${details.modelo ? ' · ' + details.modelo : ''}`
      : details.nombre || details.referencia || order.location_type;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-green-300 dark:border-green-700 p-4 space-y-3 shadow-sm">
      {/* Número + ubicación */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-black text-gray-900 dark:text-white">#{order.order_number}</span>
        <span className="text-2xl">{LOCATION_ICONS[order.location_type]}</span>
      </div>

      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{subtitle}</div>

      {details.referencia && order.location_type !== 'otro' && (
        <p className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg px-3 py-2">
          📍 {details.referencia}
        </p>
      )}

      {/* Productos */}
      <ul className="space-y-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
        {(order.items || []).map((item, i) => (
          <li key={i} className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
            <span className="font-semibold">{item.quantity}× {item.product_name}</span>
            <span className="text-gray-500 dark:text-gray-400 capitalize">{item.size}</span>
          </li>
        ))}
        <li className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between font-bold">
          <span className="text-gray-700 dark:text-gray-200">Total</span>
          <span className="text-brand-600 dark:text-brand-400">S/{Number(order.total).toFixed(2)}</span>
        </li>
      </ul>

      {/* Botón entregar */}
      <button
        type="button"
        onClick={() => onDeliver(order)}
        className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <IcoCheckCircle size={20} />
        MARCAR COMO ENTREGADO
      </button>
    </div>
  );
}

export default function EntregadorPage() {
  const [confirmOrder, setConfirmOrder] = useState(null);
  const { data: orders = [], isLoading } = useOrders({ status: 'listo' });
  const updateStatus = useUpdateOrderStatus();

  const handleDeliver = async () => {
    if (!confirmOrder) return;
    try {
      await updateStatus.mutateAsync({ id: confirmOrder.id, status: 'entregado' });
      toast.success(`✅ Pedido #${confirmOrder.order_number} entregado`);
      setConfirmOrder(null);
    } catch {
      // error manejado por el hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header title="🍧 Entregas" />

      <div className="px-4 pt-3 pb-2">
        <h2 className="font-bold text-gray-900 dark:text-white">
          Pedidos listos para entregar
          <span className={clsx(
            'ml-2 text-sm px-2 py-0.5 rounded-full',
            orders.length > 0
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          )}>
            {orders.length}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-3">✅</span>
            <p className="text-sm">No hay pedidos listos por entregar</p>
          </div>
        ) : (
          orders.map((order) => (
            <ReadyOrderCard key={order.id} order={order} onDeliver={setConfirmOrder} />
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        open={!!confirmOrder}
        onClose={() => setConfirmOrder(null)}
        title="¿Confirmar entrega?"
      >
        {confirmOrder && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Verifica que estás entregando al cliente correcto antes de confirmar.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pedido</span>
                <span className="font-bold text-gray-900 dark:text-white">#{confirmOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Ubicación</span>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  {LOCATION_ICONS[confirmOrder.location_type]}{' '}
                  {(() => {
                    const d = typeof confirmOrder.location_details === 'string'
                      ? JSON.parse(confirmOrder.location_details)
                      : confirmOrder.location_details;
                    return confirmOrder.location_type === 'vehiculo'
                      ? `${d.placa} · ${d.color}`
                      : d.nombre || d.referencia || confirmOrder.location_type;
                  })()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOrder(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeliver}
                disabled={updateStatus.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Registrando…' : '✅ Confirmar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
