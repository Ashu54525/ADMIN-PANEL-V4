import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const adminNav = [
  { section: 'Overview' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { section: 'Management' },
  { id: 'users', icon: '👥', label: 'Users' },
  { id: 'forms', icon: '📋', label: 'Forms & Verification' },
  { id: 'activity', icon: '📡', label: 'Activity Log' },
];

const userNav = [
  { section: 'My Space' },
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'submit-form', icon: '📝', label: 'My Form' },
  { id: 'my-forms', icon: '📋', label: 'Form Status' },
  { id: 'activity', icon: '📡', label: 'My Activity' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
];

export default function Sidebar({ active, setActive }) {
  const { user, logout, isAdmin } = useAuth();
  const nav = isAdmin ? adminNav : userNav;
  const handleLogout = async () => { await logout(); toast.info('Logged out'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <div>
            <h2 style={{ fontSize: 14 }}>Admin<span style={{ color: 'var(--primary)' }}>Panel</span></h2>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isAdmin ? 'Administrator' : 'User Portal'}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map((item, i) =>
          item.section
            ? <div key={i} className="nav-section">{item.section}</div>
            : <div key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => setActive(item.id)}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </div>
        )}
      </nav>
      <div className="sidebar-footer">
        <div style={{ padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setActive(isAdmin ? 'dashboard' : 'profile')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }} />
              : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0f1117', flexShrink: 0 }}>{user?.fullName?.[0]?.toUpperCase()}</div>
            }
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{user?.role}</div>
            </div>
          </div>
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}><span className="nav-icon">🚪</span> Logout</div>
      </div>
    </aside>
  );
}
