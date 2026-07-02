import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ACTION_COLORS = {
  LOGIN: 'badge-success', LOGOUT: 'badge-muted',
  FORM_SUBMIT: 'badge-primary', PROFILE_UPDATE: 'badge-primary',
  USER_CREATED: 'badge-warning', USER_UPDATED: 'badge-warning',
  USER_DELETED: 'badge-danger', PASSWORD_CHANGED: 'badge-warning',
  PAGE_VISIT: 'badge-muted'
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(date).toLocaleString();
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');
  const { isAdmin } = useAuth();

  const load = (p = 1) => {
    setLoading(true);
    api.get(`/activity?page=${p}&limit=25`)
      .then(r => { setActivities(r.data.activities); setTotal(r.data.total); setPages(r.data.pages); setPage(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter
    ? activities.filter(a => a.action === filter || a.description?.toLowerCase().includes(filter.toLowerCase()))
    : activities;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>{isAdmin ? 'Activity Log' : 'My Activity'}</h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} total events</span>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: 0, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <input
            className="form-control" placeholder="🔍  Filter by action or description…"
            value={filter} onChange={e => setFilter(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <button className="btn btn-ghost btn-sm" onClick={() => load(1)}>↺ Refresh</button>
        </div>

        {loading
          ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>
          : filtered.length === 0
            ? <div className="empty-state"><div className="empty-icon">📡</div><p>No activity yet</p></div>
            : <>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {isAdmin && <th>User</th>}
                        <th>Action</th>
                        <th>Description</th>
                        <th>IP</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a._id}>
                          {isAdmin && (
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{a.user?.fullName || 'Unknown'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>@{a.user?.username}</div>
                            </td>
                          )}
                          <td><span className={`badge ${ACTION_COLORS[a.action] || 'badge-muted'}`}>{a.action}</span></td>
                          <td style={{ fontSize: 13, maxWidth: 300 }}>{a.description}</td>
                          <td style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>{a.ipAddress || '—'}</td>
                          <td style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{timeAgo(a.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 0 0' }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => load(page - 1)}>← Prev</button>
                    <span style={{ padding: '5px 10px', fontSize: 12, color: 'var(--text-muted)' }}>Page {page} / {pages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => load(page + 1)}>Next →</button>
                  </div>
                )}
              </>
        }
      </div>
    </>
  );
}
