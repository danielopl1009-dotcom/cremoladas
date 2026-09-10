import clsx from 'clsx';

const CFG = {
  pendiente:  { label: 'Pendiente',  cls: 'badge-pending' },
  preparando: { label: 'Preparando', cls: 'badge-preparing' },
  listo:      { label: 'Listo',      cls: 'badge-ready' },
  entregado:  { label: 'Entregado',  cls: 'badge-delivered' },
  cancelado:  { label: 'Cancelado',  cls: 'badge-cancelled' },
};

const DOT_CLS = {
  pendiente:  'bg-amber-400',
  preparando: 'bg-blue-500',
  listo:      'bg-emerald-500',
  entregado:  'bg-surface-400',
  cancelado:  'bg-red-500',
};

export default function StatusBadge({ status }) {
  const cfg = CFG[status] || CFG.pendiente;
  return (
    <span className={clsx('badge', cfg.cls)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', DOT_CLS[status])} />
      {cfg.label}
    </span>
  );
}
