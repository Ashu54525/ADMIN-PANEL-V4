import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const TERMS = [
  "You must have to fill all the forms within time period which is 07 days.",
  "From 700 forms your 630 forms must be correct that means the company is allowing mistakes up to 70 forms only.",
  "If your work is not submitted or failed then you have to pay Rs. 5000/- as Admin/Utility charges.",
  "If you complete your work with all our terms and conditions then from your first payment Rs.5000/- (One Time charge) will be deducted from your first payment only and you get the remaining salary.",
  "If you want to cancel the agreement within 24 hours then you need to pay cancellation charges or else at the end of slot you will be charged full admin charges."
];

function TermsAndSignatureStep({ onDone }) {
  const [agreed, setAgreed] = useState(false);
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error('File must be under 3MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setSigFile(reader.result); setSigPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!agreed) { toast.error('Please accept the Terms & Conditions first.'); return; }
    if (!sigFile) { toast.error('Please upload your signature image.'); return; }
    setLoading(true);
    try {
      await api.post('/forms/verification/accept-terms', { signatureImage: sigFile });
      toast.success('Submitted! Waiting for admin to verify your signature.');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          📜 Terms and Conditions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TERMS.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{i + 1}.</span>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>

        <div
          onClick={() => setAgreed(a => !a)}
          role="checkbox"
          aria-checked={agreed}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 20,
            cursor: 'pointer', padding: '14px', background: agreed ? 'rgba(0,214,143,0.07)' : 'var(--surface2)',
            borderRadius: 'var(--radius-sm)', border: `2px solid ${agreed ? 'var(--success)' : 'var(--border)'}`,
            transition: 'var(--transition)', userSelect: 'none'
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 5, flexShrink: 0, marginTop: 1,
            border: `2px solid ${agreed ? 'var(--success)' : 'var(--text-muted)'}`,
            background: agreed ? 'var(--success)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition)'
          }}>
            {agreed && <span style={{ color: '#0f1117', fontWeight: 900, fontSize: 14, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, lineHeight: 1.6 }}>
            I have read, understood, and agree to all the Terms and Conditions listed above.
            I acknowledge that violating these terms may result in financial penalties.
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>✍️ Upload Your Signature</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Please upload a clear image of your handwritten signature. This will be verified by the admin before you can start filling forms.
        </p>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

        {sigPreview ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ border: '2px solid var(--primary)', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#fff', marginBottom: 10 }}>
              <img src={sigPreview} alt="Signature preview" style={{ width: '100%', height: 140, objectFit: 'contain', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSigFile(null); setSigPreview(null); }}>🗑️ Remove</button>
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>🔄 Change</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current.click()}
            style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)', marginBottom: 10 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload signature</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, GIF · Max 3MB</div>
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-full" onClick={submit} disabled={loading || !agreed || !sigFile} style={{ padding: '13px', fontSize: 15 }}>
        {loading ? <><span className="spinner"></span> Submitting…</> : !agreed ? '☐ Accept terms to continue' : !sigFile ? '📷 Upload signature to continue' : '✅ Submit Terms & Signature'}
      </button>
    </div>
  );
}

function PendingVerificationStep({ verification }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Verification Pending</h2>
      <div style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.3)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 6 }}>Signature Verification Status: Pending</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
          Please wait until verification is done from admin side.<br />
          If you feel like it's taking too long, you may contact your admin.
        </p>
      </div>
      {verification?.signatureImage && (
        <div style={{ textAlign: 'left' }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Your Uploaded Signature</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff' }}>
            <img src={verification.signatureImage} alt="Your signature" style={{ width: '100%', height: 100, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
}

function RejectedStep({ verification }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: 'var(--danger)' }}>Signature Rejected</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Your signature was not verified by the admin. Please contact your admin.</p>
      {verification?.adminNotes && (
        <div style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: 4 }}>Admin Notes</div>
          <div style={{ fontSize: 13 }}>{verification.adminNotes}</div>
        </div>
      )}
    </div>
  );
}

function CardFillingStep() {
  const [record, setRecord] = useState(null);
  const [fields, setFields] = useState({ filledName: '', filledUniqueId: '', filledAmount: '', filledPhoneNumber: '', filledAddress: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ filledCount: 0, assignedCount: 0, remainingUnassigned: 0 });
  const { user } = useAuth();

  const loadNext = async () => {
    setLoading(true);
    try {
      const [recRes, progRes] = await Promise.all([
        api.get('/forms/records/current'),
        api.get('/forms/records/my-progress')
      ]);
      setRecord(recRes.data.record);
      setProgress(progRes.data);
      // NOTE: fields intentionally NOT pre-filled — user must type values by looking at the card
      if (recRes.data.record) {
        setFields({ filledName: '', filledUniqueId: '', filledAmount: '', filledPhoneNumber: '', filledAddress: '' });
      }
    } catch (err) {
      toast.error('Failed to load record.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadNext(); }, []);

  const handle = e => setFields(f => ({ ...f, [e.target.name]: e.target.value }));

  // Block copy-paste, cut, and right-click context menu on form fields
  const blockClipboard = (e) => { e.preventDefault(); toast.error('Pasting/copying is not allowed. Please type the value manually.'); };
  const blockContextMenu = (e) => e.preventDefault();

  const submit = async e => {
    e.preventDefault();
    if (!record) return;
    setSubmitting(true);
    try {
      await api.post(`/forms/records/${record._id}/submit`, fields);
      toast.success('Saved! Loading next form...');
      await loadNext();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>;

  if (!record) {
    const allDone = progress.assignedCount > 0 && progress.filledCount === progress.assignedCount && progress.remainingUnassigned === 0;
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{allDone ? '🎉' : '📭'}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
          {allDone ? 'All Forms Completed!' : 'No Forms Available'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {allDone
            ? `Great job! You've completed all ${progress.filledCount} assigned forms.`
            : 'There are no more records available right now. Contact your admin.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Your Progress</span>
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{progress.filledCount} completed</span>
        </div>
        <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#6c8eff,#00e5c3)',
            width: progress.assignedCount > 0 ? `${Math.min(100, (progress.filledCount / progress.assignedCount) * 100)}%` : '0%',
            transition: 'width 0.4s ease'
          }}></div>
        </div>
      </div>

      <div
        onCopy={e => e.preventDefault()}
        onContextMenu={e => e.preventDefault()}
        style={{
          background: '#f4f4fa', borderRadius: 20, padding: '28px 24px',
          maxWidth: 380, margin: '0 auto 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          color: '#1a1a2e', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>id</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{record.uniqueId}</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #ddd' }}>
          <div style={{ fontSize: 19, fontWeight: 600 }}>{record.name}</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #ddd' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>${record.amount}</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #ddd' }}>
          <div style={{ fontSize: 15 }}>{record.phoneNumber}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, lineHeight: 1.6, color: '#444' }}>
          {record.address}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Enter the details exactly as shown above</h3>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
          ⚠️ Copy-paste is disabled. Please type each value manually by reading the card.
        </p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-control" name="filledName" value={fields.filledName} onChange={handle} required
              onPaste={blockClipboard} onCopy={blockClipboard} onCut={blockClipboard} onContextMenu={blockContextMenu}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unique ID *</label>
            <input
              className="form-control" name="filledUniqueId" value={fields.filledUniqueId} onChange={handle} required
              onPaste={blockClipboard} onCopy={blockClipboard} onCut={blockClipboard} onContextMenu={blockContextMenu}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              className="form-control" name="filledAmount" value={fields.filledAmount} onChange={handle} required
              onPaste={blockClipboard} onCopy={blockClipboard} onCut={blockClipboard} onContextMenu={blockContextMenu}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="form-control" name="filledPhoneNumber" value={fields.filledPhoneNumber} onChange={handle} required
              onPaste={blockClipboard} onCopy={blockClipboard} onCut={blockClipboard} onContextMenu={blockContextMenu}
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              className="form-control" name="filledAddress" value={fields.filledAddress} onChange={handle} required rows={3}
              onPaste={blockClipboard} onCopy={blockClipboard} onCut={blockClipboard} onContextMenu={blockContextMenu}
              autoComplete="off"
            />
          </div>

          {user?.signature && (
            <div style={{ marginBottom: 18, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
              <div className="form-label" style={{ marginBottom: 6 }}>Your Signature (attached automatically)</div>
              <img src={user.signature} alt="Signature" style={{ height: 48, objectFit: 'contain' }} />
            </div>
          )}

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting} style={{ padding: '12px' }}>
            {submitting ? <><span className="spinner"></span> Saving…</> : '✅ Submit & Get Next Form →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitForm() {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/forms/verification/my').then(r => setVerification(r.data.verification)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (!user?.permissions?.canSubmitForms) return (
    <div className="empty-state"><div className="empty-icon">🔒</div><p>You don't have permission to submit forms.</p></div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto', width: 28, height: 28 }}></div></div>;

  return (
    <>
      <h1 className="page-title">My Form</h1>
      {verification?.status === 'not_started' && <TermsAndSignatureStep onDone={load} />}
      {verification?.status === 'pending_verification' && <PendingVerificationStep verification={verification} />}
      {verification?.status === 'rejected' && <RejectedStep verification={verification} />}
      {verification?.status === 'verified' && <CardFillingStep />}
    </>
  );
}