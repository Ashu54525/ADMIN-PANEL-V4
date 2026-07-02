import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserHome from './user/UserHome';
import SubmitForm from './user/SubmitForm';
import MyForms from './user/MyForms';
import ActivityPage from './admin/ActivityPage';
import UserProfile from './user/UserProfile';
import { useAuth } from '../context/AuthContext';

export default function UserLayout() {
  const [active, setActive] = useState('home');
  const { user } = useAuth();

  const pages = {
    home: <UserHome setActive={setActive} />,
    'submit-form': <SubmitForm />,
    'my-forms': <MyForms />,
    activity: <ActivityPage />,
    profile: <UserProfile />,
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
            <span style={{ background: 'rgba(108,142,255,0.15)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>USER</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.fullName}</span>
          </div>
        </header>
        <div className="page-content">
          {pages[active] || <UserHome setActive={setActive} />}
        </div>
      </div>
    </div>
  );
}
