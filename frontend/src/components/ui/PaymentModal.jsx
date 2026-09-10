import { useState, useRef } from 'react';
import clsx from 'clsx';
import Modal from './Modal.jsx';
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
  const [yapeFile, setYapeFile] = useState(null);
  const [preview, setPreview]   = useState(null);
  const [notes, setNotes]       = useState('');
  const fileRef = useRef();

  const { data: existingPayment } = usePayment(order?.id);
  const confirmPayment = useConfirmPayment();

  if (!order) return null;

  const details = typeof order.location_details === 'string'
    ? JSON.parse(order.location_details) : order.location_details;

  const subtitle = order.location_type === 'vehiculo'
    ? `${details.placa || '—'} · ${details.color || ''}` : details.nombre || order.location_type;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setYapeFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (method === 'yape' && !yapeFile) return;
    await confirmPayment.mutateAsync({
      orderId: order.id,
      method,
      notes: notes || null,
      yapePhoto: yapeFile || null,
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setMethod('efectivo');
    setYapeFile(null);
    setPreview(null);
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
              S/{Number(order.total).toFixed(2)}
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
            {/* Foto Yape */}
            {existingPayment.yape_photo_url && (
              <div className="mt-2">
                <p className="text-xs text-surface-400 mb-1">Comprobante Yape</p>
                <img
                  src={`http://localhost:3000${existingPayment.yape_photo_url}`}
                  alt="Comprobante Yape"
                  className="w-full max-h-48 object-contain rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer"
                  onClick={() => window.open(`http://localhost:3000${existingPayment.yape_photo_url}`, '_blank')}
                />
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
                    onClick={() => { setMethod(m.id); if (m.id !== 'yape') { setYapeFile(null); setPreview(null); } }}
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

            {/* Upload foto Yape */}
            {method === 'yape' && (
              <div className="animate-fade-in">
                <p className="section-title mb-2">
                  Foto del comprobante Yape <span className="text-red-500">*</span>
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Comprobante Yape"
                      className="w-full max-h-48 object-contain rounded-xl border border-surface-200 dark:border-surface-700"
                    />
                    <button
                      type="button"
                      onClick={() => { setYapeFile(null); setPreview(null); fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center
                        justify-center text-xs font-bold hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <IcoCheckCircle size={12} /> Foto cargada
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="w-full border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-xl
                      py-6 flex flex-col items-center gap-2 text-violet-600 dark:text-violet-400
                      hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span className="text-sm font-semibold">Tomar foto o subir imagen</span>
                    <span className="text-xs text-surface-400">JPG, PNG o WEBP — máx. 5MB</span>
                  </button>
                )}

                {!yapeFile && (
                  <div className="flex items-center gap-1.5 mt-2 text-amber-600 dark:text-amber-400 text-xs">
                    <IcoAlertCircle size={13} />
                    Debes adjuntar la foto del Yape para continuar
                  </div>
                )}
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
                  (method === 'yape' && !yapeFile)
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
