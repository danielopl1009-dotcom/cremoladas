import { useState } from 'react';
import clsx from 'clsx';
import { useProducts, useFlavors } from '../../hooks/useProducts.js';
import { IcoPlus, IcoMinus, IcoTrash, IcoChevronD } from '../ui/Icons.jsx';

// ── Selector de sabores (hasta 3) ───────────────────────────────────────────
function FlavorSelector({ selected, onChange }) {
  const { data: flavors = [] } = useFlavors();
  const [open, setOpen] = useState(false);

  const toggle = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter(f => f !== name));
    } else {
      if (selected.length >= 3) return; // máximo 3
      onChange([...selected, name]);
    }
  };

  const label = selected.length === 0
    ? 'Seleccionar sabor(es)'
    : selected.join(' + ');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'input w-full flex items-center justify-between text-left',
          selected.length === 0 && 'text-surface-400'
        )}
      >
        <span className="truncate text-sm">{label}</span>
        <IcoChevronD size={16} className={clsx('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-surface-900 border border-surface-200
          dark:border-surface-700 rounded-xl shadow-card-md max-h-56 overflow-y-auto animate-fade-in">
          {flavors.map(f => {
            const isSelected = selected.includes(f.name);
            const isDisabled = !isSelected && selected.length >= 3;
            return (
              <button
                key={f.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggle(f.name)}
                className={clsx(
                  'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between',
                  'transition-colors hover:bg-surface-50 dark:hover:bg-surface-800',
                  isSelected && 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium',
                  isDisabled && 'opacity-30 cursor-not-allowed'
                )}
              >
                <span>{f.name}</span>
                {isSelected && (
                  <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300
                    px-2 py-0.5 rounded-full">
                    {selected.indexOf(f.name) + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <p className="mt-1 text-xs text-surface-400">
          {selected.length}/3 sabores — {selected.length < 3 ? 'puedes agregar más' : 'máximo alcanzado'}
        </p>
      )}
    </div>
  );
}

// ── Item del carrito ─────────────────────────────────────────────────────────
function CartRow({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-surface-100 dark:border-surface-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
          {item.sizeName}
        </p>
        <p className="text-xs text-surface-500 truncate">{item.flavors.join(' + ')}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onDecrease(item)}
          className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center
            hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
        >
          <IcoMinus size={13} />
        </button>
        <span className="w-6 text-center text-sm font-bold text-surface-900 dark:text-surface-100">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onIncrease(item)}
          className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center
            hover:bg-brand-200 dark:hover:bg-brand-800/60 text-brand-700 dark:text-brand-400 transition-colors"
        >
          <IcoPlus size={13} />
        </button>
      </div>
      <span className="text-sm font-bold text-surface-900 dark:text-surface-100 w-14 text-right">
        S/{item.subtotal.toFixed(2)}
      </span>
      <button
        type="button"
        onClick={() => onRemove(item)}
        className="text-surface-300 hover:text-red-500 dark:text-surface-600 dark:hover:text-red-400
          transition-colors p-1"
      >
        <IcoTrash size={15} />
      </button>
    </div>
  );
}

// ── Selector principal ───────────────────────────────────────────────────────
export default function ProductPicker({ cart, onCartChange }) {
  const { data: products = [], isLoading } = useProducts(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize]   = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="spinner text-brand-500" /></div>;
  }

  // Obtener tamaños del producto seleccionado
  const currentSizes = selectedProduct
    ? Object.entries(
        typeof selectedProduct.sizes === 'string'
          ? JSON.parse(selectedProduct.sizes)
          : selectedProduct.sizes
      )
    : [];

  const currentPrice = currentSizes.find(([k]) => k === selectedSize)?.[1] ?? 0;

  const handleAdd = () => {
    if (!selectedProduct || !selectedSize || selectedFlavors.length === 0) return;

    const key = `${selectedProduct.id}__${selectedSize}__${selectedFlavors.join(',')}`;
    const existing = cart.find(i => i.key === key);

    if (existing) {
      onCartChange(cart.map(i =>
        i.key === key
          ? { ...i, quantity: i.quantity + 1, subtotal: currentPrice * (i.quantity + 1) }
          : i
      ));
    } else {
      onCartChange([...cart, {
        key,
        productId:   selectedProduct.id,
        productName: selectedProduct.name,
        sizeName:    selectedSize,
        size:        selectedSize,
        flavors:     selectedFlavors,
        unitPrice:   currentPrice,
        quantity:    1,
        subtotal:    currentPrice,
      }]);
    }
    setSelectedFlavors([]);
  };

  const increase = (item) => onCartChange(cart.map(i =>
    i.key === item.key ? { ...i, quantity: i.quantity + 1, subtotal: i.unitPrice * (i.quantity + 1) } : i
  ));

  const decrease = (item) => {
    if (item.quantity <= 1) { remove(item); return; }
    onCartChange(cart.map(i =>
      i.key === item.key ? { ...i, quantity: i.quantity - 1, subtotal: i.unitPrice * (i.quantity - 1) } : i
    ));
  };

  const remove = (item) => onCartChange(cart.filter(i => i.key !== item.key));

  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  const canAdd = selectedProduct && selectedSize && selectedFlavors.length > 0;

  return (
    <div className="space-y-4">
      {/* Paso 1: Tipo de envase */}
      <div>
        <p className="section-title mb-2">Tipo de envase</p>
        <div className="flex gap-2 flex-wrap">
          {products.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setSelectedProduct(p); setSelectedSize(''); }}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                selectedProduct?.id === p.id
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-brand-400'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Paso 2: Tamaño/precio */}
      {selectedProduct && (
        <div className="animate-fade-in">
          <p className="section-title mb-2">Tamaño</p>
          <div className="flex gap-2 flex-wrap">
            {currentSizes.map(([sizeName, price]) => (
              <button
                key={sizeName}
                type="button"
                onClick={() => setSelectedSize(sizeName)}
                className={clsx(
                  'flex flex-col items-center px-4 py-2.5 rounded-xl border transition-all text-sm',
                  selectedSize === sizeName
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-brand-400'
                )}
              >
                <span className="font-semibold">{sizeName}</span>
                <span className={clsx('text-xs', selectedSize === sizeName ? 'text-brand-100' : 'text-surface-400')}>
                  S/{price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: Sabores */}
      {selectedSize && (
        <div className="animate-fade-in">
          <p className="section-title mb-2">Sabor(es) — máx. 3</p>
          <FlavorSelector selected={selectedFlavors} onChange={setSelectedFlavors} />
        </div>
      )}

      {/* Botón agregar */}
      {selectedSize && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className={clsx(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
            canAdd
              ? 'bg-brand-600 hover:bg-brand-700 text-white active:scale-[.98]'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
          )}
        >
          <IcoPlus size={16} />
          Agregar al pedido
          {canAdd && <span className="text-brand-200">— S/{currentPrice.toFixed(2)}</span>}
        </button>
      )}

      {/* Carrito */}
      {cart.length > 0 && (
        <div className="card p-0 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              Pedido actual
            </p>
            <span className="text-xs text-surface-400">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          <div className="px-4">
            {cart.map(item => (
              <CartRow
                key={item.key}
                item={item}
                onIncrease={increase}
                onDecrease={decrease}
                onRemove={remove}
              />
            ))}
          </div>
          <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800/50 flex justify-between items-center">
            <span className="text-sm font-semibold text-surface-600 dark:text-surface-400">Total</span>
            <span className="text-xl font-black text-brand-600 dark:text-brand-400">
              S/{total.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
