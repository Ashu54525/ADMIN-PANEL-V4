import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
  username: '', email: '', password: '', fullName: '',
  phone: '', department: '',
  permissions: { canViewDashboard: true, canEditProfile: true, canSubmitForms: true }
};

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePerm = e => setForm(f => ({ ...f, permissions: { ...f.permissions, [e.target.name]: e.target.checked } }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/users', form);
      toast.success(`User "${res.data.user.username}" created!`);
      onCreated(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>Create New User</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" name="fullName" value={form.fullName} onChange={handle} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input className="form-control" name="username" value={form.username} onChange={handle} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-control" name="email" type="email" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-control" name="password" type="password" value={form.password} onChange={handle} required minLength={6} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" name="department" value={form.department} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Permissions</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                {Object.keys(form.permissions).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" name={key} checked={form.permissions[key]} onChange={handlePerm} style={{ accentColor: 'var(--primary)' }} />
                    {key.replace(/([A-Z])/g, ' $1').replace('can', 'Can')}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner"></span> Creating…</> : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    fullName: user.fullName, phone: user.phone || '', department: user.department || '',
    email: user.email, isActive: user.isActive,
    permissions: user.permissions || { canViewDashboard: true, canEditProfile: true, canSubmitForms: true }
  });
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const handlePerm = e => setForm(f => ({ ...f, permissions: { ...f.permissions, [e.target.name]: e.target.checked } }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form };
      if (newPw) payload.password = newPw;
      const res = await api.put(`/users/${user._id}`, payload);
      toast.success('User updated!');
      onUpdated(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>Edit User — {user.username}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="fullName" value={form.fullName} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={handle} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-control" name="department" value={form.department} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password (leave blank to keep)</label>
              <input className="form-control" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••" minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Permissions</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                {Object.keys(form.permissions).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" name={key} checked={form.permissions[key]} onChange={handlePerm} style={{ accentColor: 'var(--primary)' }} />
                    {key.replace(/([A-Z])/g, ' $1').replace('can', 'Can')}
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle} style={{ accentColor: 'var(--success)' }} />
                  Account Active
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <><span className="spinner"></span> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    api.get('/users').then(r => setUsers(r.data.users)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      toast.success(`User "${u.username}" deleted.`);
      setUsers(us => us.filter(x => x._id !== u._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={u => setUsers(us => [u, ...us])} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdated={updated => { setUsers(us => us.map(u => u._id === updated._id ? updated : u)); setEditUser(null); }} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Users</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>＋ Create User</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ flex: 1 }}>
            <input
              className="form-control" placeholder="🔍  Search users…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        {loading
          ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>
          : filtered.length === 0
            ? <div className="empty-state"><div className="empty-icon">👥</div><p>No users found</p><button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowCreate(true)}>Create first user</button></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Department</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0f1117', flexShrink: 0 }}>
                              {u.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="font-mono">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.email}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.department || '—'}</td>
                        <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditUser(u)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>
    </>
  );
}
