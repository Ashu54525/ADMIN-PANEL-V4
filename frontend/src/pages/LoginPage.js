import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(form.username, form.password);
      toast.success(`Welcome back, ${user.fullName}!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 40%, rgba(108,142,255,0.08) 0%, var(--bg) 70%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6c8eff,#00e5c3)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12
          }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin<span style={{ color: 'var(--primary)' }}>Panel</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                className="form-control" name="username" autoFocus
                value={form.username} onChange={handle}
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control" name="password" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  placeholder="Enter your password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15
                  }}
                >{showPw ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8, padding: '12px' }}>
              {loading ? <><span className="spinner"></span> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-dim)', fontSize: 12 }}>
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}
