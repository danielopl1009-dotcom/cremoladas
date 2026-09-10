import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDailyStats, useTopProducts, useJaladorPerformance } from '../../hooks/useOrders.js';
import { IcoBarChart, IcoUsers, IcoPackage } from '../../components/ui/Icons.jsx';

function Bar({ label, value, max, color = 'bg-brand-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-surface-600 dark:text-surface-400 w-36 truncate">{label}</span>
      <div className="flex-1 bg-surface-100 dark:bg-surface-800 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-surface-800 dark:text-surface-200 w-8 text-right">{value}</span>
    </div>
  );
}

export default function StatsAdmin() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: stats, isLoading: sLoad } = useDailyStats(date);
  const { data: topProducts = [], isLoading: tLoad } = useTopProducts(8);
  const { data: jaladores = [], isLoading: jLoad } = useJaladorPerformance();

  const maxProd = topProducts.reduce((m, p) => Math.max(m, Number(p.total_quantity)), 0);
  const maxJal  = jaladores.reduce((m, j) => Math.max(m, Number(j.total_orders)), 0);

  const dayLabel = (() => {
    try { return format(new Date(date + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es }); }
    catch { return date; }
  })();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Estadísticas</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="input w-full sm:w-44 text-sm" />
      </div>

      {/* Resumen del día */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IcoBarChart size={16} className="text-surface-400" />
          <p className="font-semibold text-sm text-surface-900 dark:text-surface-50 capitalize">{dayLabel}</p>
        </div>
        {sLoad ? <div className="flex justify-center py-4"><div className="spinner text-brand-500" /></div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total pedidos',   value: stats?.total_orders,     accent: false },
              { label: 'Entregados',      value: stats?.delivered_orders, accent: false },
              { label: 'Cancelados',      value: stats?.cancelled_orders, accent: false },
              { label: 'Ventas totales',  value: `S/${Number(stats?.total_sales || 0).toFixed(2)}`, accent: true },
              { label: 'Vehículos',       value: stats?.vehiculo_orders },
              { label: 'Frente local',    value: stats?.frente_local_orders },
              { label: 'Restaurantes',    value: stats?.restaurante_orders },
              { label: 'Boticas',         value: stats?.botica_orders },
              { label: 'Otros',           value: stats?.otro_orders },
            ].map((item, i) => (
              <div key={i} className="bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
                <p className="section-title">{item.label}</p>
                <p className={`font-black text-lg mt-1 ${item.accent ? 'text-brand-600 dark:text-brand-400' : 'text-surface-900 dark:text-surface-50'}`}>
                  {item.value ?? '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productos más vendidos */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IcoPackage size={16} className="text-surface-400" />
          <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">Productos más vendidos</p>
        </div>
        {tLoad ? <div className="flex justify-center py-4"><div className="spinner text-brand-500" /></div> : (
          topProducts.length === 0
            ? <p className="text-sm text-surface-400 text-center py-4">Sin datos</p>
            : <div className="space-y-3">
                {topProducts.map(p => (
                  <Bar key={p.product_name} label={p.product_name} value={Number(p.total_quantity)} max={maxProd} />
                ))}
              </div>
        )}
      </div>

      {/* Jaladores */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <IcoUsers size={16} className="text-surface-400" />
          <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">Pedidos por jalador</p>
        </div>
        {jLoad ? <div className="flex justify-center py-4"><div className="spinner text-brand-500" /></div> : (
          jaladores.length === 0
            ? <p className="text-sm text-surface-400 text-center py-4">Sin datos</p>
            : <div className="space-y-4">
                {jaladores.map(j => (
                  <div key={j.id}>
                    <div className="flex justify-between text-xs text-surface-500 mb-1">
                      <span className="font-medium">{j.name}</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        S/{Number(j.total_sales).toFixed(2)}
                      </span>
                    </div>
                    <Bar label="" value={Number(j.total_orders)} max={maxJal} color="bg-orange-400" />
                    <p className="text-xs text-surface-400 mt-1">{j.delivered_orders} entregados</p>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
