import { useDailyStats, useJaladorPerformance } from '../../hooks/useOrders.js';
import { IcoTrendUp, IcoDollar, IcoClipboardCheck, IcoCar, IcoStore, IcoMapPin, IcoHome, IcoUsers } from '../../components/ui/Icons.jsx';

function StatCard({ Icon, label, value, accent, sub }) {
  return (
    <div className={`card p-4 flex items-start justify-between gap-3 ${accent ? 'border-l-4 border-l-brand-500' : ''}`}>
      <div>
        <p className="section-title mb-1">{label}</p>
        <p className={`text-2xl font-black ${accent ? 'text-brand-600 dark:text-brand-400' : 'text-surface-900 dark:text-surface-50'}`}>
          {value ?? '—'}
        </p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
      <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-400 shrink-0">
        <Icon size={18} />
      </div>
    </div>
  );
}

function LocationRow({ Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-50 dark:border-surface-800 last:border-0">
      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
        <Icon size={14} className="text-surface-400" />
        {label}
      </div>
      <span className="font-bold text-sm text-surface-900 dark:text-surface-100">{value ?? 0}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDailyStats();
  const { data: jaladores, isLoading: jalLoading } = useJaladorPerformance();

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="spinner text-brand-500" style={{ width: 28, height: 28, borderWidth: 3 }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Dashboard</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard Icon={IcoDollar}         label="Ventas del día"  value={`S/${Number(stats?.total_sales || 0).toFixed(2)}`} accent />
        <StatCard Icon={IcoClipboardCheck} label="Pedidos totales" value={stats?.total_orders} />
        <StatCard Icon={IcoTrendUp}        label="Entregados"      value={stats?.delivered_orders} />
        <StatCard Icon={IcoClipboardCheck} label="Cancelados"      value={stats?.cancelled_orders} />
      </div>

      {/* Estados + Ubicaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Estados en tiempo real */}
        <div className="card p-5">
          <p className="section-title mb-4">Estado actual</p>
          <div className="space-y-3">
            {[
              { label: 'Pendientes',  value: stats?.pending_orders,   dot: 'bg-amber-400' },
              { label: 'Preparando',  value: stats?.preparing_orders, dot: 'bg-blue-500' },
              { label: 'Listos',      value: stats?.ready_orders,     dot: 'bg-emerald-500' },
              { label: 'Entregados',  value: stats?.delivered_orders, dot: 'bg-surface-400' },
              { label: 'Cancelados',  value: stats?.cancelled_orders, dot: 'bg-red-400' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-sm text-surface-600 dark:text-surface-400">{s.label}</span>
                </div>
                <span className="font-bold text-sm text-surface-900 dark:text-surface-100">{s.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Por ubicación */}
        <div className="card p-5">
          <p className="section-title mb-3">Por ubicación</p>
          <LocationRow Icon={IcoCar}     label="Vehículos"       value={stats?.vehiculo_orders} />
          <LocationRow Icon={IcoHome}    label="Frente al local" value={stats?.frente_local_orders} />
          <LocationRow Icon={IcoStore}   label="Restaurantes"    value={stats?.restaurante_orders} />
          <LocationRow Icon={IcoMapPin}  label="Boticas"         value={stats?.botica_orders} />
          <LocationRow Icon={IcoMapPin}  label="Otros"           value={stats?.otro_orders} />
        </div>
      </div>

      {/* Rendimiento jaladores */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 dark:border-surface-800 flex items-center gap-2">
          <IcoUsers size={16} className="text-surface-400" />
          <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">Rendimiento por jalador</p>
        </div>
        {jalLoading ? (
          <div className="flex justify-center py-8"><div className="spinner text-brand-500" /></div>
        ) : !jaladores?.length ? (
          <p className="text-sm text-surface-400 text-center py-8">Sin datos todavía</p>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Jalador</th>
                <th className="text-right">Pedidos</th>
                <th className="text-right">Entregados</th>
                <th className="text-right">Ventas</th>
              </tr>
            </thead>
            <tbody>
              {jaladores.map(j => (
                <tr key={j.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center
                        text-brand-700 dark:text-brand-400 font-bold text-xs shrink-0">
                        {j.name.charAt(0)}
                      </div>
                      <span className="font-medium text-surface-800 dark:text-surface-200">{j.name}</span>
                    </div>
                  </td>
                  <td className="text-right text-surface-600 dark:text-surface-400">{j.total_orders}</td>
                  <td className="text-right text-surface-600 dark:text-surface-400">{j.delivered_orders}</td>
                  <td className="text-right font-bold text-brand-600 dark:text-brand-400">
                    S/{Number(j.total_sales).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
