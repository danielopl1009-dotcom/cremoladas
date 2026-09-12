import { useState } from 'react';
import { IcoPlus, IcoEdit } from '../../components/ui/Icons.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useUsers, useCreateUser, useUpdateUser, useToggleUser } from '../../hooks/useUsers.js';

const ROLES = [
  { id: 'jalador', label: 'Jalador' },
  { id: 'servidor', label: 'Servidor' },
  { id: 'caja', label: 'Caja' },
  { id: 'administrador', label: 'Administrador' },
];

const ROLE_BADGE = {
  jalador:       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  servidor:      'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  caja:          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  administrador: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

function UserForm({ initial = {}, onSubmit, loading, isEdit }) {
  const [form, setForm] = useState({
    name: initial.name || '', username: initial.username || '',
    password: '', role: initial.role || 'jalador',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = { ...form };
    if (isEdit && !d.password) delete d.password;
    onSubmit(d);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="section-title mb-1.5 block">Nombre *</label>
        <input required value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="Carlos López" />
      </div>
      <div>
        <label className="section-title mb-1.5 block">Usuario *</label>
        <input required type="text" value={form.username} onChange={e => set('username', e.target.value)} className="input" placeholder="carlos" />
      </div>
      <div>
        <label className="section-title mb-1.5 block">Contraseña {isEdit ? '(dejar vacío para no cambiar)' : '*'}</label>
        <input type="password" required={!isEdit} value={form.password} onChange={e => set('password', e.target.value)}
          className="input" placeholder="mínimo 1 carácter" />
      </div>
      <div>
        <label className="section-title mb-1.5 block">Rol *</label>
        <select value={form.role} onChange={e => set('role', e.target.value)} className="input">
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Guardando...' : 'Guardar usuario'}
      </button>
    </form>
  );
}

export default function UsersAdmin() {
  const [modal, setModal] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const { data: users = [], isLoading } = useUsers({ role: roleFilter || undefined });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const toggleUser = useToggleUser();

  if (isLoading) return <div className="flex justify-center py-12"><div className="spinner text-brand-500" /></div>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50">Usuarios</h1>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <IcoPlus size={16} /> Nuevo
        </button>
      </div>

      {/* Filtro por rol */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setRoleFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${!roleFilter ? 'bg-brand-600 text-white' : 'btn-outline'}`}>
          Todos
        </button>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => setRoleFilter(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${roleFilter === r.id ? 'bg-brand-600 text-white' : 'btn-outline'}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>IP / Último acceso</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center
                      justify-center text-surface-600 dark:text-surface-400 font-bold text-sm shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-surface-900 dark:text-surface-50">{u.name}</p>
                      <p className="text-xs text-surface-400">{u.username}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${ROLE_BADGE[u.role] || ''}`}>
                    {ROLES.find(r => r.id === u.role)?.label}
                  </span>
                </td>
                <td>
                  {u.last_ip ? (
                    <div>
                      <p className="text-xs font-mono text-surface-900 dark:text-surface-50">{u.last_ip}</p>
                      {u.last_login && (
                        <p className="text-xs text-surface-400 mt-0.5">
                          {new Date(u.last_login).toLocaleString('es-PE', { 
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-surface-400">Sin acceso aún</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${u.active ? 'badge-ready' : 'badge-cancelled'}`}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModal(u)} className="btn-ghost p-1.5 rounded-lg">
                      <IcoEdit size={15} />
                    </button>
                    <button
                      onClick={() => toggleUser.mutate({ id: u.id, active: !u.active })}
                      className={`btn-sm ${u.active ? 'btn-danger' : 'btn-secondary'}`}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nuevo usuario">
        <UserForm onSubmit={async d => { await createUser.mutateAsync(d); setModal(null); }} loading={createUser.isPending} />
      </Modal>

      <Modal open={!!modal && modal !== 'create'} onClose={() => setModal(null)} title="Editar usuario">
        {modal && modal !== 'create' && (
          <UserForm initial={modal} isEdit
            onSubmit={async d => { await updateUser.mutateAsync({ id: modal.id, ...d }); setModal(null); }}
            loading={updateUser.isPending} />
        )}
      </Modal>
    </div>
  );
}
