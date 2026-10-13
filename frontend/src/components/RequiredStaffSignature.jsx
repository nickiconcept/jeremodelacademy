import React, { useState } from 'react';
import api from '../utils/api';
import SignaturePad from './SignaturePad';

export default function RequiredStaffSignature({ onComplete, onLogout }) {
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type) || file.size > 700 * 1024) {
      setError('Upload a PNG, JPG, WebP, or GIF signature image smaller than 700KB.');
      return;
    }
    setError('');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => { setSignature(reader.result); setUploading(false); };
    reader.onerror = () => { setError('Could not read the image. Please try again.'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!signature) { setError('Draw your signature and click Accept Signature, or upload an image.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.post('/auth/staff-signature', { signature });
      await onComplete();
    } catch (requestError) {
      setError(requestError.message || 'Could not save your signature. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-primary)' }}>
      <section className="glass-panel" style={{ width: '100%', maxWidth: 520, padding: 32, background: 'var(--bg-surface)' }}>
        <h1 style={{ marginTop: 0 }}>Add your signature</h1>
        <p>Your staff profile is missing a signature. Add it before continuing to the portal.</p>
        {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          {signature ? (
            <div>
              <img src={signature} alt="Your signature" style={{ maxWidth: '100%', maxHeight: 150, background: '#fff', border: '1px solid var(--border-color)' }} />
              <button type="button" className="btn btn-secondary" onClick={() => setSignature('')} disabled={saving}>Replace signature</button>
            </div>
          ) : <SignaturePad onSave={setSignature} />}
          <p style={{ margin: 0 }}>After drawing, click Accept Signature to confirm it.</p>
          <label>Or upload your signature image
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} disabled={saving || uploading} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving || uploading || !signature}>
            {saving ? 'Saving signature…' : uploading ? 'Reading image…' : 'Save signature and continue'}
          </button>
        </form>
        <button className="btn btn-secondary" type="button" onClick={onLogout} style={{ width: '100%', marginTop: 12 }} disabled={saving}>Sign out</button>
      </section>
    </main>
  );
}
