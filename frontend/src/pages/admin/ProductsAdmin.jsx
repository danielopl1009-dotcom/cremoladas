import { useState } from 'react';
import { IcoPlus, IcoEdit, IcoCheck } from '../../components/ui/Icons.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useProducts, useCreateProduct, useUpdateProduct, useToggleProduct } from '../../hooks/useProducts.js';

const SIZES_DEF = [
  { key: 'Vaso S/4', label: 'Vaso S/4' },
  { key: 'Vaso S/5', label: 'Vaso S/5' },
  { key: 'Vaso S/6', label: 'Vaso S/6' },
  { key: 'Vaso S/7', label: 'Vaso S/7' },
  { key: 'Vaso S/9', label: 'Vaso S/9' },
  { key: 'Taper S/4', label: 'Taper S/4' },
  { key: 'Taper S/5', label: 'Taper S/5' },
  { key: 'Taper S/8 (medio litro)', label: 'Taper S/8 medio litro' },
  { key: 'Litro S/16', label: 'Litro S/16' },
];

function ProductForm({ initial = {}, onSubmit, loading }) {
  const initSizes = initial.sizes
    ? (typeof initial.sizes === 'string' ? JSON.parse(initial.sizes) : initial.sizes)
    : {};

  const [name, setName] = useState(initial.name || '');
  const [desc, setDesc] = useState(initial.description || '');
  const [prices, setPrices] = useState(initSizes);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanSizes = Object.fromEntries(Object.entries(prices).filter(([, v]) => v !== '' && Number(v) > 0).map(([k, v]) => [k, Number(v)]));
    onSubmit({ name, description: desc, sizes: cleanSizes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="section-title mb-1.5 block">Nombre *</label>
        <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Vaso" />
      </div>
      <div>
        <label className="section-title mb-1.5 block">Descripción</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} className="input" placeholder="Opcional" />
      </div>
      <div>
        <label className="section-title mb-2 block">Precios por tamaño</label>
        <div className="grid grid-cols-2 gap-2">
          {SIZES_DEF.map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-surface-500 mb-1 block">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">S/</span>
                <input
                  type="number" min="0" step="0.5"
                  value={prices[key] ?? ''}
                  onChange={e => setPrices(p => ({ ...p, [key]: e.target.value }))}
                  className="input pl-8 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Guardando...' : 'Guardar producto'}
      </button>
    </form>
  );
}

export default function ProductsAdmin() {
  const [modal, setModal] = useState(null);
  const { data: products = [], isLoading } = useProducts(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const toggleProduct = useToggleProduct();

  if (isLoading) return <div className="flex justify-center py-12"><div className="spinner text-brand-500" /></div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Productos</h1>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <IcoPlus size={16} /> Nuevo
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tamaños</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
              return (
                <tr key={product.id}>
                  <td>
                    <p className="font-semibold text-surface-900 dark:text-surface-50">{product.name}</p>
                    {product.description && <p className="text-xs text-surface-400">{product.description}</p>}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(sizes).map(([sz, price]) => (
                        <span key={sz} className="text-xs bg-surface-100 dark:bg-surface-800 text-surface-600
                          dark:text-surface-400 px-2 py-0.5 rounded-lg">
                          {sz}: S/{Number(price).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${product.active ? 'badge-ready' : 'badge-cancelled'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(product)}
                        className="btn-ghost p-1.5 rounded-lg"><IcoEdit size={15} /></button>
                      <button
                        onClick={() => toggleProduct.mutate({ id: product.id, active: !product.active })}
                        className={`btn-sm ${product.active ? 'btn-danger' : 'btn-secondary'}`}
                      >
                        {product.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo producto">
        <ProductForm onSubmit={async d => { await createProduct.mutateAsync(d); setModal(null); }} loading={createProduct.isPending} />
      </Modal>

      <Modal open={!!modal && modal !== 'create'} onClose={() => setModal(null)} title="Editar producto">
        {modal && modal !== 'create' && (
          <ProductForm initial={modal}
            onSubmit={async d => { await updateProduct.mutateAsync({ id: modal.id, ...d }); setModal(null); }}
            loading={updateProduct.isPending} />
        )}
      </Modal>
    </div>
  );
}
