import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AdminDashboard from './admin/AdminDashboard';
import UsersPage from './admin/UsersPage';
import FormsPage from './admin/FormsPage';
import ActivityPage from './admin/ActivityPage';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [active, setActive] = useState('dashboard');
  const { user } = useAuth();

  const pages = {
    dashboard: <AdminDashboard />,
    users: <UsersPage />,
    forms: <FormsPage />,
    activity: <ActivityPage />,
  };

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} />
      <div className="main-content">
        <header className="topbar">
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {active.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'rgba(255,179,71,0.15)', color: 'var(--warning)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>ADMIN</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.fullName}</span>
          </div>
        </header>
        <div className="page-content">{pages[active] || <AdminDashboard />}</div>
      </div>
    </div>
  );
}
