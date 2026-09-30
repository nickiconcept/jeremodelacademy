import React, { useState } from 'react';
import api from '../utils/api';

export default function RequiredPasswordChange({ user, onComplete, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmation) {
      setError('The new passwords do not match.');
      return;
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Use at least 12 characters, including uppercase, lowercase, and a number.');
      return;
    }

    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      await onComplete();
    } catch (requestError) {
      setError(requestError.message || 'Could not change the password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const accountId = user?.admission_number || user?.username || 'your account ID';

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-primary)' }}>
      <section className="glass-panel" style={{ width: '100%', maxWidth: 460, padding: 32, background: 'var(--bg-surface)' }}>
        <h1 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Change your default password</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your initial password is your account ID (<strong>{accountId}</strong>). Change it before continuing to the portal.
        </p>
        {error && <p role="alert" style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, color: 'var(--text-primary)' }}>
            Current password
            <input className="form-control" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          </label>
          <label style={{ display: 'grid', gap: 6, color: 'var(--text-primary)' }}>
            New password
            <input className="form-control" type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>
          <label style={{ display: 'grid', gap: 6, color: 'var(--text-primary)' }}>
            Confirm new password
            <input className="form-control" type="password" autoComplete="new-password" minLength={12} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Updating password…' : 'Change password and continue'}
          </button>
        </form>
        <button className="btn btn-secondary" type="button" onClick={onLogout} style={{ width: '100%', marginTop: 12 }}>
          Sign out
        </button>
      </section>
    </main>
  );
}
