import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

// ── Upload Excel Modal ────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls)$/i)) { toast.error('Please select an Excel file (.xlsx or .xls)'); return; }
    setFile(f);
  };

  const upload = async () => {
    if (!file) { toast.error('Please select a file first.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/forms/records/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>Upload Client Records</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Upload an Excel file (.xlsx) with columns: <strong>Name, Unique Number, Monthly Income, Address, Contact Details</strong>.
            All rows will be added to the pool and assigned to users one by one as they complete forms.
          </p>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleFile} />
          <div
            onClick={() => fileRef.current.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            {file
              ? <div style={{ fontWeight: 600, color: 'var(--success)' }}>✓ {file.name}</div>
              : <><div style={{ fontWeight: 600, marginBottom: 4 }}>Click to select Excel file</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>.xlsx or .xls</div></>
            }
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={upload} disabled={loading || !file}>
              {loading ? <><span className="spinner"></span> Uploading…</> : '📤 Upload Records'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Signature Verify Modal ────────────────────────────────────────────────────
function VerifyModal({ v, onClose, onUpdated }) {
  const [notes, setNotes] = useState(v.adminNotes || '');
  const [loading, setLoading] = useState(false);

  const act = async (verified) => {
    setLoading(true);
    try {
      const res = await api.patch(`/forms/verification/${v._id}/verify`, { verified, adminNotes: notes });
      toast.success(verified ? '✅ Verified!' : '❌ Rejected.');
      onUpdated(res.data.verification);
      onClose();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const u = v.user;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>Verify Signature — {u?.fullName}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            {u?.profilePhoto
              ? <img src={u.profilePhoto} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0f1117' }}>{u?.fullName?.[0]}</div>
            }
            <div><div style={{ fontWeight: 600 }}>{u?.fullName}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{u?.username}</div></div>
          </div>
          <div className="form-label" style={{ marginBottom: 8 }}>Uploaded Signature</div>
          <div style={{ border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff', marginBottom: 16 }}>
            <img src={v.signatureImage} alt="Signature" style={{ width: '100%', height: 130, objectFit: 'contain' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => act(true)} disabled={loading}>✅ Verify</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => act(false)} disabled={loading}>❌ Reject</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filled Record Detail Modal ────────────────────────────────────────────────
function RecordDetailModal({ rec, onClose }) {
  const u = rec.assignedTo;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 16 }}>Filled Record — {rec.uniqueId}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
            {u?.profilePhoto
              ? <img src={u.profilePhoto} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0f1117' }}>{u?.fullName?.[0]}</div>
            }
            <div><div style={{ fontWeight: 600, fontSize: 13 }}>Filled by {u?.fullName}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(rec.filledAt).toLocaleString()}</div></div>
          </div>

          {[
            ['Name', rec.name, rec.filledName],
            ['Unique ID', rec.uniqueId, rec.filledUniqueId],
            ['Amount', rec.amount, rec.filledAmount],
            ['Phone', rec.phoneNumber, rec.filledPhoneNumber],
            ['Address', rec.address, rec.filledAddress],
          ].map(([label, orig, filled]) => (
            <div key={label} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14 }}>{filled || '—'}</div>
              {filled !== orig && orig && <div style={{ fontSize: 10, color: 'var(--text-dim)', textDecoration: 'line-through', marginTop: 2 }}>Original: {orig}</div>}
            </div>
          ))}

          {u?.signature && (
            <div style={{ marginTop: 14 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>User's Signature</div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff' }}>
                <img src={u.signature} alt="" style={{ width: '100%', height: 80, objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function FormsPage() {
  const [tab, setTab] = useState('verify'); // verify | progress | records
  const [verifications, setVerifications] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [filledRecords, setFilledRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [verifySelected, setVerifySelected] = useState(null);
  const [recordSelected, setRecordSelected] = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/forms/verification/all'),
      api.get('/forms/records/progress'),
      api.get('/forms/records/stats'),
      api.get('/forms/records/filled?limit=100')
    ]).then(([v, p, s, f]) => {
      setVerifications(v.data.verifications);
      setProgress(p.data.progress);
      setStats(s.data.stats);
      setFilledRecords(f.data.records);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const pendingVerifications = verifications.filter(v => v.status === 'pending_verification');

  return (
    <>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={loadAll} />}
      {verifySelected && <VerifyModal v={verifySelected} onClose={() => setVerifySelected(null)} onUpdated={updated => { setVerifications(vs => vs.map(v => v._id === updated._id ? updated : v)); }} />}
      {recordSelected && <RecordDetailModal rec={recordSelected} onClose={() => setRecordSelected(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Forms & Verification</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>📊 Upload Excel</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(108,142,255,0.12)' }}>📋</div><div className="stat-value" style={{ color: 'var(--primary)' }}>{stats?.total ?? 0}</div><div className="stat-label">Total Records</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(255,179,71,0.12)' }}>📥</div><div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.unassigned ?? 0}</div><div className="stat-label">Unassigned</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(0,229,195,0.12)' }}>🔄</div><div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.assigned ?? 0}</div><div className="stat-label">In Progress</div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: 'rgba(0,214,143,0.12)' }}>✅</div><div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.filled ?? 0}</div><div className="stat-label">Completed</div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn btn-sm ${tab === 'verify' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('verify')}>
          ✍️ Signature Verification {pendingVerifications.length > 0 && <span style={{ background: 'var(--warning)', color: '#0f1117', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 4, fontWeight: 700 }}>{pendingVerifications.length}</span>}
        </button>
        <button className={`btn btn-sm ${tab === 'progress' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('progress')}>👥 User Progress</button>
        <button className={`btn btn-sm ${tab === 'records' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('records')}>📝 Filled Records</button>
      </div>

      {loading
        ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>
        : <>
            {/* Verification queue */}
            {tab === 'verify' && (
              <div className="card">
                {verifications.length === 0
                  ? <div className="empty-state"><div className="empty-icon">✍️</div><p>No signature submissions yet</p></div>
                  : <div className="table-wrap">
                      <table>
                        <thead><tr><th>User</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
                        <tbody>
                          {verifications.map(v => (
                            <tr key={v._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {v.user?.profilePhoto
                                    ? <img src={v.user.profilePhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0f1117' }}>{v.user?.fullName?.[0]}</div>
                                  }
                                  <div><div style={{ fontWeight: 600, fontSize: 13 }}>{v.user?.fullName}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>@{v.user?.username}</div></div>
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${v.status === 'verified' ? 'badge-success' : v.status === 'rejected' ? 'badge-danger' : v.status === 'pending_verification' ? 'badge-warning' : 'badge-muted'}`}>
                                  {v.status === 'pending_verification' ? '⏳ Pending' : v.status === 'verified' ? '✅ Verified' : v.status === 'rejected' ? '❌ Rejected' : 'Not Started'}
                                </span>
                              </td>
                              <td style={{ fontSize: 11, color: 'var(--text-dim)' }}>{v.termsAcceptedAt ? new Date(v.termsAcceptedAt).toLocaleDateString() : '—'}</td>
                              <td>
                                {v.signatureImage && (
                                  <button className="btn btn-ghost btn-sm" onClick={() => setVerifySelected(v)}>
                                    {v.status === 'pending_verification' ? '🔍 Verify' : '👁️ View'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            )}

            {/* User progress */}
            {tab === 'progress' && (
              <div className="card">
                {progress.length === 0
                  ? <div className="empty-state"><div className="empty-icon">👥</div><p>No users yet</p></div>
                  : <div className="table-wrap">
                      <table>
                        <thead><tr><th>User</th><th>Assigned</th><th>Completed</th><th>Remaining</th><th>Progress</th></tr></thead>
                        <tbody>
                          {progress.map(p => {
                            const pct = p.assignedCount > 0 ? Math.round((p.filledCount / p.assignedCount) * 100) : 0;
                            return (
                              <tr key={p.user._id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {p.user.profilePhoto
                                      ? <img src={p.user.profilePhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                                      : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6c8eff,#00e5c3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0f1117' }}>{p.user.fullName?.[0]}</div>
                                    }
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.user.fullName}</span>
                                  </div>
                                </td>
                                <td style={{ fontSize: 13 }}>{p.assignedCount}</td>
                                <td style={{ fontSize: 13, color: 'var(--success)' }}>{p.filledCount}</td>
                                <td style={{ fontSize: 13, color: 'var(--warning)' }}>{p.remainingCount}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 80, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                                      <div style={{ height: '100%', background: 'var(--success)', width: `${pct}%` }}></div>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            )}

            {/* Filled records */}
            {tab === 'records' && (
              <div className="card">
                {filledRecords.length === 0
                  ? <div className="empty-state"><div className="empty-icon">📝</div><p>No filled records yet</p></div>
                  : <div className="table-wrap">
                      <table>
                        <thead><tr><th>Filled By</th><th>Name</th><th>Unique ID</th><th>Amount</th><th>Phone</th><th>Date</th><th></th></tr></thead>
                        <tbody>
                          {filledRecords.map(r => (
                            <tr key={r._id}>
                              <td style={{ fontSize: 13 }}>{r.assignedTo?.fullName}</td>
                              <td style={{ fontSize: 13 }}>{r.filledName}</td>
                              <td style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{r.filledUniqueId}</td>
                              <td style={{ fontSize: 13 }}>${r.filledAmount}</td>
                              <td style={{ fontSize: 12 }}>{r.filledPhoneNumber}</td>
                              <td style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(r.filledAt).toLocaleDateString()}</td>
                              <td><button className="btn btn-ghost btn-sm" onClick={() => setRecordSelected(r)}>👁️</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            )}
          </>
      }
    </>
  );
}
