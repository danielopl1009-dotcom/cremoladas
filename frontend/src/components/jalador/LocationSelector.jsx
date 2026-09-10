import clsx from 'clsx';
import { IcoCar, IcoStore, IcoMapPin, IcoHome } from '../ui/Icons.jsx';

const LOCATIONS = [
  { id: 'vehiculo',     label: 'Vehículo',        Icon: IcoCar },
  { id: 'frente_local', label: 'Frente al local',  Icon: IcoHome },
  { id: 'restaurante',  label: 'Restaurante',      Icon: IcoStore },
  { id: 'botica',       label: 'Botica',           Icon: IcoMapPin },
  { id: 'otro',         label: 'Otro',             Icon: IcoMapPin },
];

export default function LocationSelector({ value, details, onChange, onDetailsChange, errors = {} }) {
  return (
    <div className="space-y-4">
      {/* Grid de tipos */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {LOCATIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={clsx(
              'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
              value === id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:border-brand-300'
            )}
          >
            <Icon size={20} />
            <span className="text-xs text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* Campos por tipo */}
      {value === 'vehiculo' && (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">Placa *</label>
              <input
                value={details.placa || ''}
                onChange={e => onDetailsChange('placa', e.target.value.toUpperCase())}
                className={clsx('input uppercase tracking-widest', errors.placa && 'input-error')}
                placeholder="ABC-123"
                maxLength={8}
              />
              {errors.placa && <p className="text-red-500 text-xs mt-1">{errors.placa}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 mb-1.5">Color *</label>
              <input
                value={details.color || ''}
                onChange={e => onDetailsChange('color', e.target.value)}
                className={clsx('input', errors.color && 'input-error')}
                placeholder="Negro"
              />
              {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-500 mb-1.5">Marca / Modelo (opcional)</label>
            <input
              value={details.modelo || ''}
              onChange={e => onDetailsChange('modelo', e.target.value)}
              className="input"
              placeholder="Toyota Yaris"
            />
          </div>
        </div>
      )}

      {(value === 'restaurante' || value === 'botica') && (
        <div className="animate-fade-in">
          <label className="block text-xs font-semibold text-surface-500 mb-1.5">
            Nombre {value === 'restaurante' ? 'del restaurante' : 'de la botica'} *
          </label>
          <input
            value={details.nombre || ''}
            onChange={e => onDetailsChange('nombre', e.target.value)}
            className={clsx('input', errors.nombre && 'input-error')}
            placeholder={value === 'restaurante' ? 'El Buen Sabor' : 'Botica San Juan'}
          />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
        </div>
      )}

      {/* Referencia adicional */}
      <div>
        <label className="block text-xs font-semibold text-surface-500 mb-1.5">Referencia adicional (opcional)</label>
        <input
          value={details.referencia || ''}
          onChange={e => onDetailsChange('referencia', e.target.value)}
          className="input text-sm"
          placeholder="Segundo carro de la fila, frente a la puerta..."
        />
      </div>
    </div>
  );
}
