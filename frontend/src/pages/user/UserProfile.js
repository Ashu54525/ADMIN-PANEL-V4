import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ newPw: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileRef = useRef();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePw = e => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Profile photo upload — convert to base64
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB.'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }

    setPhotoLoading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api.put(`/users/${user._id}`, { profilePhoto: base64 });
      updateUser(res.data.user);
      toast.success('Profile photo updated!');
    } catch { toast.error('Failed to upload photo.'); }
    finally { setPhotoLoading(false); }
  };

  const removePhoto = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    setPhotoLoading(true);
    try {
      const res = await api.put(`/users/${user._id}`, { profilePhoto: null });
      updateUser(res.data.user);
      toast.success('Photo removed.');
    } catch { toast.error('Failed.'); }
    finally { setPhotoLoading(false); }
  };

  const saveProfile = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/users/${user._id}`, form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const changePw = async e => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match.'); return; }
    if (pwForm.newPw.length < 6) { toast.error('Minimum 6 characters.'); return; }
    setPwLoading(true);
    try {
      await api.put(`/users/${user._id}`, { password: pwForm.newPw });
      setPwForm({ newPw: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwLoading(false); }
  };

  return (
    <>
      <h1 className="page-title">My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile photo card */}
          <div className="card" style={{ textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
              {user?.profilePhoto
                ? <img
                    src={user.profilePhoto} alt="Profile"
                    style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                  />
                : <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6c8eff,#00e5c3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, fontWeight: 700, color: '#0f1117'
                  }}>
                    {user?.fullName?.[0]?.toUpperCase()}
                  </div>
              }
              {photoLoading && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div className="spinner"></div>
                </div>
              )}
            </div>

            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.fullName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>@{user?.username}</div>
            <div style={{ marginBottom: 16 }}>
              <span className="badge badge-primary">{user?.role}</span>
              {user?.department && <span className="badge badge-muted" style={{ marginLeft: 6 }}>{user.department}</span>}
            </div>

            {/* Upload buttons */}
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handlePhotoChange}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={() => fileRef.current.click()} disabled={photoLoading}>
                📷 {user?.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              {user?.profilePhoto && (
                <button className="btn btn-danger btn-sm" onClick={removePhoto} disabled={photoLoading}>
                  🗑️ Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>JPG, PNG, GIF · Max 2MB</p>
          </div>

          {/* Signature display */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>My Signature</h3>
            {user?.signature
              ? <>
                  <div style={{
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden', marginBottom: 10, background: '#1a1d27'
                  }}>
                    <img src={user.signature} alt="Signature" style={{ width: '100%', height: 120, objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Signed on: {user?.signatureDate ? new Date(user.signatureDate).toLocaleString() : '—'}
                  </p>
                </>
              : <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 13 }}>
                  No signature on file.
                </div>
            }
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Edit info */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Personal Information</h3>
            {user?.permissions?.canEditProfile
              ? <form onSubmit={saveProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" name="fullName" value={form.fullName} onChange={handle} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-control" value={user?.email} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-control" value={user?.department || '—'} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner"></span> Saving…</> : '💾 Save Changes'}
                  </button>
                </form>
              : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Profile editing is not permitted.</p>
            }
          </div>

          {/* Account details */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Account Details</h3>
            {[
              ['Username', '@' + user?.username],
              ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'],
              ['Member Since', new Date(user?.createdAt).toLocaleDateString()],
              ['Signature Status', user?.signature ? '✅ Signed' : '❌ Not signed'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>

          {/* Change password */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>Change Password</h3>
            <form onSubmit={changePw}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-control" name="newPw" type="password" value={pwForm.newPw} onChange={handlePw} minLength={6} required placeholder="Min 6 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-control" name="confirm" type="password" value={pwForm.confirm} onChange={handlePw} required />
              </div>
              <button className="btn btn-ghost" type="submit" disabled={pwLoading}>
                {pwLoading ? <><span className="spinner"></span> Updating…</> : '🔐 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
