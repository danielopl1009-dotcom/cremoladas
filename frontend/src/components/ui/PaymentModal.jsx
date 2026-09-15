import { useState, useRef } from 'react';
import clsx from 'clsx';
import Modal from './Modal.jsx';
import CameraCapture from './CameraCapture.jsx';
import { PaymentBadge } from './PaymentBadge.jsx';
import { IcoCheckCircle, IcoAlertCircle } from './Icons.jsx';
import { useConfirmPayment, usePayment } from '../../hooks/usePayments.js';

const METHODS = [
  { id: 'efectivo', label: 'Efectivo',  color: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' },
  { id: 'yape',     label: 'Yape',      color: 'bg-violet-600  hover:bg-violet-700  text-white border-violet-600' },
  { id: 'plin',     label: 'Plin',      color: 'bg-sky-600     hover:bg-sky-700     text-white border-sky-600' },
  { id: 'tarjeta',  label: 'Tarjeta',   color: 'bg-blue-600    hover:bg-blue-700    text-white border-blue-600' },
];

/**
 * Modal reutilizable para confirmar el pago de un pedido.
 * Usado desde Caja, Admin y Servidor (si tiene doble rol).
 *
 * Props:
 *   order   — objeto order completo
 *   open    — boolean
 *   onClose — fn
 */
export default function PaymentModal({ order, open, onClose }) {
  const [method, setMethod]     = useState('efectivo');
  const [monto_pagado, setMontoPagado] = useState('');
  const [yapeFile, setYapeFile] = useState(null);
  const [yapePreview, setYapePreview] = useState(null);
  const [tarjetaFile, setTarjetaFile] = useState(null);
  const [tarjetaPreview, setTarjetaPreview] = useState(null);
  const [notes, setNotes]       = useState('');

  const { data: existingPayment } = usePayment(order?.id);
  const confirmPayment = useConfirmPayment();

  if (!order) return null;

  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;

  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || '—'} · ${details.color || ''}` : details.nombre || order.location_type;

  // Calcular vuelto para efectivo
  const total = Number(order.total);
  const pagado = parseFloat(monto_pagado) || 0;
  const vuelto = pagado > total ? (pagado - total).toFixed(2) : 0;
  const puedeConfirmar = pagado >= total;

  const handleSubmit = async () => {
    if (method === 'yape' && !yapeFile) return;
    if (method === 'tarjeta' && !tarjetaFile) return;
    if (method === 'efectivo' && !puedeConfirmar) return;

    await confirmPayment.mutateAsync({
      orderId: order.id,
      method,
      monto_pagado: method === 'efectivo' ? pagado : null,
      vuelto: method === 'efectivo' ? parseFloat(vuelto) : null,
      notes: notes || null,
      yapePhoto: yapeFile || null,
      tarjetaPhoto: tarjetaFile || null,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setMethod('efectivo');
    setMontoPagado('');
    setYapeFile(null);
    setYapePreview(null);
    setTarjetaFile(null);
    setTarjetaPreview(null);
    setNotes('');
  };

  const alreadyPaid = !!existingPayment;

  return (
    <Modal open={open} onClose={() => { onClose(); resetForm(); }} title={`Pedido #${order.order_number}`} size="md">
      <div className="space-y-4">

        {/* Resumen del pedido */}
        <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Pedido</span>
            <span className="font-black text-surface-900 dark:text-white">#{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Ubicación</span>
            <span className="font-medium text-surface-700 dark:text-surface-300">{subtitle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Jalador</span>
            <span className="text-surface-600 dark:text-surface-400">{order.jalador_name || '—'}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-surface-200 dark:border-surface-700">
            <span className="font-bold text-surface-900 dark:text-white">Total</span>
            <span className="text-xl font-black text-brand-600 dark:text-brand-400">
              S/{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1">
          {(order.items || []).map((item, i) => {
            const flavors = typeof item.flavors === 'string' ? JSON.parse(item.flavors || '[]') : (item.flavors || []);
            return (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">
                  {item.quantity}× {item.size}
                  {flavors.length > 0 && <span className="text-surface-400"> — {flavors.join(' + ')}</span>}
                </span>
                <span className="font-medium text-surface-800 dark:text-surface-200">
                  S/{Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Si ya está pagado */}
        {alreadyPaid ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800
            rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
              <IcoCheckCircle size={18} />
              Pago registrado
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Método</span>
              <PaymentBadge payment={existingPayment} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Cobrado por</span>
              <span className="text-surface-700 dark:text-surface-300">{existingPayment.confirmed_by_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Hora</span>
              <span className="text-surface-600 dark:text-surface-400">
                {new Date(existingPayment.confirmed_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {/* Fotos */}
            {(existingPayment.yape_photo_url || existingPayment.tarjeta_photo_url) && (
              <div className="mt-3 space-y-2">
                {existingPayment.yape_photo_url && (
                  <div>
                    <p className="text-xs text-surface-400 mb-1">Comprobante Yape</p>
                    <img
                      src={`http://localhost:3000${existingPayment.yape_photo_url}`}
                      alt="Comprobante Yape"
                      className="w-full max-h-40 object-contain rounded-lg border border-surface-200 dark:border-surface-700"
                    />
                  </div>
                )}
                {existingPayment.tarjeta_photo_url && (
                  <div>
                    <p className="text-xs text-surface-400 mb-1">Comprobante Tarjeta</p>
                    <img
                      src={`http://localhost:3000${existingPayment.tarjeta_photo_url}`}
                      alt="Comprobante Tarjeta"
                      className="w-full max-h-40 object-contain rounded-lg border border-surface-200 dark:border-surface-700"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Selección de método */}
            <div>
              <p className="section-title mb-2">Método de pago</p>
              <div className="grid grid-cols-4 gap-2">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setMethod(m.id); setMontoPagado(''); }}
                    className={clsx(
                      'py-2.5 rounded-xl text-sm font-semibold border transition-all',
                      method === m.id ? m.color : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-300'
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* EFECTIVO: monto pagado + vuelto */}
            {method === 'efectivo' && (
              <div className="animate-fade-in space-y-3 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div>
                  <label className="section-title mb-2 block">Monto pagado (S/)</label>
                  <input
                    type="number"
                    value={monto_pagado}
                    onChange={e => setMontoPagado(e.target.value)}
                    placeholder="0.00"
                    step="0.50"
                    className="input text-lg font-semibold w-full"
                  />
                  {monto_pagado && !puedeConfirmar && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <IcoAlertCircle size={12} /> Monto insuficiente
                    </p>
                  )}
                </div>

                {pagado > 0 && (
                  <div className="space-y-2 bg-white dark:bg-surface-800 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Total</span>
                      <span className="font-bold">S/{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Pagado</span>
                      <span className="font-bold">S/{pagado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-surface-200 dark:border-surface-700 pt-2">
                      <span className={clsx('font-bold', puedeConfirmar ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        Vuelto
                      </span>
                      <span className={clsx('text-lg font-black', puedeConfirmar ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        S/{vuelto}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* YAPE: foto comprobante */}
            {method === 'yape' && (
              <div className="animate-fade-in">
                <CameraCapture
                  label="Comprobante Yape"
                  color="violet"
                  required
                  onCapture={(file) => {
                    setYapeFile(file);
                    setYapePreview(URL.createObjectURL(file));
                  }}
                  onRemove={() => {
                    setYapeFile(null);
                    setYapePreview(null);
                  }}
                  preview={yapePreview}
                />
              </div>
            )}

            {/* TARJETA: foto comprobante */}
            {method === 'tarjeta' && (
              <div className="animate-fade-in">
                <CameraCapture
                  label="Comprobante de tarjeta (ticket/foto)"
                  color="blue"
                  required
                  onCapture={(file) => {
                    setTarjetaFile(file);
                    setTarjetaPreview(URL.createObjectURL(file));
                  }}
                  onRemove={() => {
                    setTarjetaFile(null);
                    setTarjetaPreview(null);
                  }}
                  preview={tarjetaPreview}
                />
              </div>
            )}

            {/* PLIN: foto comprobante (opcional) */}
            {method === 'plin' && (
              <div className="animate-fade-in">
                <CameraCapture
                  label="Comprobante Plin (opcional)"
                  color="sky"
                  required={false}
                  onCapture={(file) => {
                    setYapeFile(file); // Reutilizar el mismo campo
                    setYapePreview(URL.createObjectURL(file));
                  }}
                  onRemove={() => {
                    setYapeFile(null);
                    setYapePreview(null);
                  }}
                  preview={yapePreview}
                />
              </div>
            )}

            {/* Notas opcionales */}
            <div>
              <label className="section-title mb-1.5 block">Notas (opcional)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input text-sm"
                placeholder="Observaciones del pago..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { onClose(); resetForm(); }} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  confirmPayment.isPending ||
                  (method === 'yape' && !yapeFile) ||
                  (method === 'tarjeta' && !tarjetaFile) ||
                  (method === 'efectivo' && !puedeConfirmar)
                }
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirmPayment.isPending
                  ? <><div className="spinner w-4 h-4 text-white" /> Procesando...</>
                  : <><IcoCheckCircle size={18} /> Confirmar pago</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
