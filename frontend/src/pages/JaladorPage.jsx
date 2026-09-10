import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header.jsx';
import LocationSelector from '../components/jalador/LocationSelector.jsx';
import ProductPicker from '../components/jalador/ProductPicker.jsx';
import MyOrdersList from '../components/jalador/MyOrdersList.jsx';
import { IcoPlus, IcoList, IcoSearch, IcoX, IcoArrowRight, IcoCar, IcoHome, IcoStore, IcoMapPin } from '../components/ui/Icons.jsx';
import { useCreateOrder } from '../hooks/useOrders.js';
import useOfflineStore from '../stores/offlineStore.js';

const LOC_LABEL = {
  vehiculo: (d) => `${d.placa || '—'} · ${d.color || ''}`,
  frente_local: () => 'Frente al local',
  restaurante: (d) => d.nombre || 'Restaurante',
  botica: (d) => d.nombre || 'Botica',
  otro: (d) => d.referencia || 'Otro',
};
const LOC_ICON = { vehiculo: IcoCar, frente_local: IcoHome, restaurante: IcoStore, botica: IcoMapPin, otro: IcoMapPin };

// ── Formulario nuevo pedido ──────────────────────────────────────────────────
function NewOrderForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [locationType, setLocationType] = useState('');
  const [locationDetails, setLocationDetails] = useState({});
  const [cart, setCart] = useState([]);
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState({});

  const createOrder = useCreateOrder();
  const { isOnline, addPendingOrder } = useOfflineStore();

  const handleDetailChange = (field, value) => {
    setLocationDetails(p => ({ ...p, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const validateStep1 = () => {
    if (!locationType) { toast.error('Selecciona la ubicación'); return false; }
    const errs = {};
    if (locationType === 'vehiculo') {
      if (!locationDetails.placa?.trim()) errs.placa = 'Requerida';
      if (!locationDetails.color?.trim()) errs.color = 'Requerido';
    }
    if (['restaurante', 'botica'].includes(locationType) && !locationDetails.nombre?.trim())
      errs.nombre = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  const handleConfirm = async () => {
    if (cart.length === 0) { toast.error('Agrega al menos un producto'); return; }
    const orderData = { uuid: uuidv4(), locationType, locationDetails, items: cart, observations: observations.trim() || null, total };

    if (!isOnline) {
      addPendingOrder(orderData);
      toast.success('Pedido guardado — se sincronizará al reconectar');
      resetForm(); onSuccess?.(); return;
    }

    try {
      await createOrder.mutateAsync(orderData);
      toast.success('Pedido enviado');
      resetForm(); onSuccess?.();
    } catch (err) {
      if (err.response?.status === 409) { toast.success('Pedido ya registrado'); resetForm(); }
    }
  };

  const resetForm = () => {
    setStep(1); setLocationType(''); setLocationDetails({});
    setCart([]); setObservations(''); setErrors({});
  };

  const LocIcon = LOC_ICON[locationType] || IcoMapPin;

  return (
    <div className="space-y-5 pb-24">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {['Ubicación', 'Productos'].map((label, idx) => {
          const s = idx + 1;
          return (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => s < step && setStep(s)}
                className={clsx(
                  'w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all',
                  step >= s ? 'bg-brand-600 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                )}
              >{s}</button>
              <span className={clsx('text-xs', step >= s ? 'text-surface-700 dark:text-surface-300 font-medium' : 'text-surface-400')}>
                {label}
              </span>
              {idx === 0 && <IcoArrowRight size={14} className="text-surface-300 dark:text-surface-600" />}
            </div>
          );
        })}
      </div>

      {/* Paso 1 */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
            Ubicación del cliente
          </p>
          <LocationSelector
            value={locationType}
            details={locationDetails}
            onChange={v => { setLocationType(v); setLocationDetails({}); setErrors({}); }}
            onDetailsChange={handleDetailChange}
            errors={errors}
          />
          <button
            type="button"
            onClick={() => validateStep1() && setStep(2)}
            disabled={!locationType}
            className="btn-primary w-full"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          {/* Chip de ubicación */}
          <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-900/20
            border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <LocIcon size={15} className="text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="text-sm font-medium text-brand-800 dark:text-brand-300 truncate">
                {LOC_LABEL[locationType]?.(locationDetails)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-brand-500 text-xs font-semibold underline shrink-0 ml-2"
            >
              Cambiar
            </button>
          </div>

          <ProductPicker cart={cart} onCartChange={setCart} />

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 mb-1.5">
              Observación (opcional)
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              className="input resize-none text-sm"
              placeholder="Sin hielo, entregar por ventana..."
            />
          </div>

          {/* Barra fija de confirmación */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-surface-900
            border-t border-surface-100 dark:border-surface-800 px-4 py-3 z-30">
            <div className="flex items-center justify-between mb-3 max-w-xl mx-auto">
              <span className="text-sm text-surface-500">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
              <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                S/{total.toFixed(2)}
              </span>
            </div>
            <div className="max-w-xl mx-auto">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={cart.length === 0 || createOrder.isPending}
                className="w-full btn-primary py-3 text-base disabled:opacity-40"
              >
                {createOrder.isPending ? 'Enviando...' : !isOnline ? 'Guardar (sin conexión)' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function JaladorPage() {
  const [tab, setTab] = useState('new');
  const [search, setSearch] = useState('');
  const pendingCount = useOfflineStore(s => s.pendingOrders.length);

  const TABS = [
    { id: 'new',  label: 'Nuevo pedido', Icon: IcoPlus },
    { id: 'list', label: 'Mis pedidos',  Icon: IcoList  },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <Header title="Cremoladas" subtitle="Jalador" />

      {/* Tab bar */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 px-4 shrink-0">
        <div className="flex max-w-xl mx-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all',
                tab === id
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-surface-500 dark:text-surface-500 hover:text-surface-700'
              )}
            >
              <Icon size={16} />
              {label}
              {id === 'list' && pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pt-4">
          {tab === 'new' && <NewOrderForm onSuccess={() => setTab('list')} />}

          {tab === 'list' && (
            <div className="space-y-3">
              <div className="relative">
                <IcoSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-9 pr-9 text-sm"
                  placeholder="Buscar por placa, número..."
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                    <IcoX size={15} />
                  </button>
                )}
              </div>
              <MyOrdersList search={search} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
