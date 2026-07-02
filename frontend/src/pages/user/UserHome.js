import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserHome({ setActive }) {
  const { user } = useAuth();
  const perms = user?.permissions || {};

  const cards = [
    { id: 'submit-form', icon: '📝', title: 'Submit a Form', desc: 'Fill out and submit a new form request.', color: 'var(--accent)', enabled: perms.canSubmitForms },
    { id: 'my-forms', icon: '📋', title: 'My Submissions', desc: 'View the status of your submitted forms.', color: 'var(--primary)', enabled: true },
    { id: 'activity', icon: '📡', title: 'My Activity', desc: 'See your login and action history.', color: 'var(--warning)', enabled: true },
    { id: 'profile', icon: '👤', title: 'My Profile', desc: 'View and update your account info.', color: 'var(--success)', enabled: perms.canEditProfile },
  ];

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {user?.department ? `${user.department} · ` : ''}{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {cards.map(c => (
          <div
            key={c.id}
            className="card"
            onClick={() => c.enabled && setActive(c.id)}
            style={{
              cursor: c.enabled ? 'pointer' : 'not-allowed',
              opacity: c.enabled ? 1 : 0.45,
              transition: 'var(--transition)',
              border: '1px solid var(--border)'
            }}
            onMouseEnter={e => { if (c.enabled) e.currentTarget.style.borderColor = c.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>{c.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.desc}</p>
            {!c.enabled && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>🔒 Not permitted</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>Account Details</h3>
        <div className="grid-2">
          {[
            ['Full Name', user?.fullName],
            ['Username', user?.username],
            ['Email', user?.email],
            ['Department', user?.department || '—'],
            ['Phone', user?.phone || '—'],
            ['Member Since', new Date(user?.createdAt).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
