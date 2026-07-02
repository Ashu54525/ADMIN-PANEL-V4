import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function MyForms() {
  const [verification, setVerification] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/forms/verification/my'), api.get('/forms/records/my-progress')])
      .then(([v, p]) => { setVerification(v.data.verification); setProgress(p.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>;

  const pct = progress?.assignedCount > 0 ? Math.round((progress.filledCount / progress.assignedCount) * 100) : 0;

  return (
    <>
      <h1 className="page-title">Form Status</h1>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,142,255,0.12)' }}>📋</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{progress?.assignedCount ?? 0}</div>
          <div className="stat-label">Assigned to You</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,214,143,0.12)' }}>✅</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{progress?.filledCount ?? 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,179,71,0.12)' }}>⏳</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{(progress?.assignedCount ?? 0) - (progress?.filledCount ?? 0)}</div>
          <div className="stat-label">Remaining</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg,#6c8eff,#00e5c3)', width: `${pct}%`, transition: 'width 0.4s ease' }}></div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 14 }}>Verification Timeline</h3>
        {[
          { label: 'Terms & Signature Uploaded', done: verification?.termsAccepted, date: verification?.termsAcceptedAt, icon: '📜' },
          { label: 'Signature Verified by Admin', done: verification?.signatureVerified, rejected: verification?.status === 'rejected', date: verification?.signatureVerifiedAt, icon: '✍️' },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              background: step.rejected ? 'rgba(255,77,106,0.15)' : step.done ? 'rgba(0,214,143,0.15)' : 'var(--surface2)',
              border: `2px solid ${step.rejected ? 'var(--danger)' : step.done ? 'var(--success)' : 'var(--border)'}`
            }}>{step.icon}</div>
            <div style={{ flex: 1, paddingTop: 5 }}>
              <div style={{ fontSize: 14, fontWeight: step.done ? 600 : 400, color: step.rejected ? 'var(--danger)' : step.done ? 'var(--text)' : 'var(--text-muted)' }}>
                {step.label}{step.rejected && ' — Rejected'}
              </div>
              {step.date && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{new Date(step.date).toLocaleString()}</div>}
            </div>
          </div>
        ))}
        {verification?.adminNotes && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(108,142,255,0.08)', border: '1px solid rgba(108,142,255,0.2)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 11, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>Admin Notes</div>
            <div style={{ fontSize: 13 }}>{verification.adminNotes}</div>
          </div>
        )}
      </div>
    </>
  );
}
