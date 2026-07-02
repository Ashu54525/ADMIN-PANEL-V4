import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <span>{icon}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function actionColor(action) {
  if (['LOGIN'].includes(action)) return 'login';
  if (['FORM_SUBMIT'].includes(action)) return 'form';
  if (['USER_CREATED','USER_UPDATED','USER_DELETED'].includes(action)) return 'admin';
  if (action === 'USER_DELETED') return 'delete';
  return '';
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activity/stats/overview')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><div className="spinner" style={{ width: 32, height: 32 }}></div></div>;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Users" value={stats?.stats?.totalUsers} color="var(--primary)" bg="rgba(108,142,255,0.12)" />
        <StatCard icon="✅" label="Active Users" value={stats?.stats?.activeUsers} color="var(--success)" bg="rgba(0,214,143,0.12)" />
        <StatCard icon="📋" label="Form Submissions" value={stats?.stats?.totalForms} color="var(--accent)" bg="rgba(0,229,195,0.12)" />
        <StatCard icon="🔐" label="Logins Today" value={stats?.stats?.loginCount} color="var(--warning)" bg="rgba(255,179,71,0.12)" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live feed</span>
        </div>
        {stats?.recentActivity?.length === 0
          ? <div className="empty-state"><div className="empty-icon">📡</div><p>No activity yet</p></div>
          : stats?.recentActivity?.map(a => (
            <div key={a._id} className="activity-item">
              <div className={`activity-dot ${actionColor(a.action)}`}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{a.description}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                  <span className="activity-time">{timeAgo(a.createdAt)}</span>
                  {a.user && <span style={{ fontSize: 11, color: 'var(--primary)' }}>{a.user.username}</span>}
                  <span className={`badge ${a.user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: 9, padding: '1px 6px' }}>{a.action}</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}
