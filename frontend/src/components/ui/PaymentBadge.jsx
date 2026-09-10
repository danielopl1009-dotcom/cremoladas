import clsx from 'clsx';
import { IcoCreditCard, IcoCheckCircle } from './Icons.jsx';

const METHOD_LABEL = {
  efectivo: 'Efectivo',
  yape:     'Yape',
  plin:     'Plin',
  tarjeta:  'Tarjeta',
};

const METHOD_COLOR = {
  efectivo: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  yape:     'bg-violet-50  text-violet-700  border-violet-200  dark:bg-violet-900/20  dark:text-violet-400  dark:border-violet-800',
  plin:     'bg-sky-50     text-sky-700     border-sky-200     dark:bg-sky-900/20     dark:text-sky-400     dark:border-sky-800',
  tarjeta:  'bg-blue-50    text-blue-700    border-blue-200    dark:bg-blue-900/20    dark:text-blue-400    dark:border-blue-800',
};

/**
 * Badge pequeño que muestra si el pedido está pagado o no.
 * payment = objeto payment de la BD, o null si no pagado.
 */
export function PaymentBadge({ payment, size = 'sm' }) {
  if (!payment) {
    return (
      <span className={clsx(
        'inline-flex items-center gap-1 rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      )}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Sin cobrar
      </span>
    );
  }

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full border font-semibold',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      METHOD_COLOR[payment.method] || METHOD_COLOR.efectivo
    )}>
      <IcoCheckCircle size={size === 'sm' ? 11 : 14} />
      {METHOD_LABEL[payment.method] || payment.method}
    </span>
  );
}

export default PaymentBadge;
