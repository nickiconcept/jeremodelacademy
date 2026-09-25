import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import api from '../utils/api';
import { Sun, Moon, User, LogOut, Menu as MenuIcon, ShieldAlert, Bell } from 'lucide-react';

export default function DashboardLayout({ children, user, activeTab, setActiveTab, subTab, onSelectTab, onLogout, settings }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const toggleTheme = () => {
    const dark = document.body.classList.toggle('dark');
    setIsDark(dark);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      const res = await api.changePassword(oldPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleSidebarSelectTab = (tabId, subTabId) => {
    if (onSelectTab) {
      onSelectTab(tabId, subTabId);
    } else {
      setActiveTab(tabId);
    }
  };

  // Get readable role label
  const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'teacher' ? 'Staff' : 'Student';
  const roleColor = user.role === 'admin' ? 'var(--danger)' : user.role === 'teacher' ? 'var(--success)' : 'var(--primary)';
  const roleBg = user.role === 'admin' ? 'var(--danger-light)' : user.role === 'teacher' ? 'var(--success-light)' : 'var(--primary-light)';

  // Get initials for avatar
  const initials = (user.full_name || 'U')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        role={user.role}
        activeTab={activeTab}
        subTab={subTab}
        onSelectTab={handleSidebarSelectTab}
        onLogout={onLogout}
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        settings={settings}
      />
      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''} mobile-only`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main Work Area */}
      <div className="main-content" style={{ flexGrow: 1, backgroundColor: 'var(--bg-primary)' }}>

        {/* ── Top Header Bar ── */}
        <header
          className="glass-panel no-print"
          style={{
            padding: '12px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {/* Left: Hamburger + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="mobile-only btn btn-secondary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px 12px', fontSize: '0.85rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <MenuIcon size={18} />
              <span>Menu</span>
            </button>

            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Welcome back, <span style={{ color: 'var(--primary)' }}>{user.full_name}!</span>
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.02em' }}>
                {settings?.landing_school_name || 'Jere Model Academy'} Portal
              </p>
            </div>
          </div>

          {/* Right: Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Session pill */}
            {settings && (
              <div
                className="desktop-only"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.78rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '6px 13px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  border: '1px solid rgba(14,165,233,0.2)',
                  letterSpacing: '0.02em',
                }}
              >
                {/* Live dot */}
                <span style={{
                  display: 'inline-block', width: 7, height: 7,
                  borderRadius: '50%', background: 'var(--primary)',
                  animation: 'pulseRing 2s infinite',
                  flexShrink: 0,
                }} />
                {settings.active_session} · {settings.active_term}
                {!settings.result_entry_open && (
                  <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px' }}>
                    <ShieldAlert size={13} /> Locked
                  </span>
                )}
              </div>
            )}

            {/* Date */}
            <div
              className="desktop-only"
              style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}
            >
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-icon"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '6px 12px 6px 6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              {/* Avatar */}
              {user.passport_photo ? (
                <img
                  src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:8000${user.passport_photo}`}
                  alt="Profile"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.7rem', fontWeight: '800',
                  border: '2px solid var(--primary)',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}
              <div className="desktop-only" style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user.full_name?.split(' ')[0]}
                </p>
                <p style={{ margin: 0, fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                  {roleLabel}
                </p>
              </div>
            </button>

            {/* Sign out */}
            <button
              onClick={onLogout}
              className="btn btn-secondary"
              style={{
                padding: '8px 14px', fontSize: '0.82rem',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-full)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--danger-light)';
                e.currentTarget.style.borderColor = 'var(--danger)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <LogOut size={14} />
              <span className="desktop-only">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page View */}
        <main className="portal-page-content">
          {children}
        </main>
      </div>

      <MobileBottomNav
        role={user.role}
        activeTab={activeTab}
        onSelectTab={handleSidebarSelectTab}
        onOpenMenu={() => setSidebarOpen(true)}
      />

      {/* ── User Profile Modal ── */}
      {showProfileModal && (
        <div className="modal-overlay no-print" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', backgroundColor: 'var(--bg-surface)' }}>
            <button
              className="modal-close"
              onClick={() => {
                setShowProfileModal(false);
                setPasswordError('');
                setPasswordSuccess('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >✕</button>

            {/* Avatar + Name */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: '14px' }}>
                {user.passport_photo ? (
                  <img
                    src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:8000${user.passport_photo}`}
                    alt="Passport"
                    style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 6px 20px var(--primary-glow)' }}
                  />
                ) : (
                  <div style={{
                    width: '90px', height: '90px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid var(--primary)',
                    margin: '0 auto',
                    boxShadow: '0 6px 20px var(--primary-glow)',
                    color: '#fff', fontSize: '1.5rem', fontWeight: '800',
                  }}>
                    {initials}
                  </div>
                )}
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem' }}>{user.full_name}</h3>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                backgroundColor: roleBg, color: roleColor,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {roleLabel}
              </span>
            </div>

            {/* Info grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
              marginBottom: '22px', fontSize: '0.88rem',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              padding: '16px 0',
            }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Username</strong>
                <p style={{ margin: '3px 0 0 0', fontWeight: '600', color: 'var(--text-primary)' }}>{user.username}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</strong>
                <p style={{ margin: '3px 0 0 0', fontWeight: '700', color: user.status === 'active' ? 'var(--success)' : 'var(--danger)', textTransform: 'capitalize' }}>
                  {user.status || 'Active'}
                </p>
              </div>
              {user.role !== 'student' && user.email && (
                <div style={{ gridColumn: 'span 2' }}>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</strong>
                  <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.email}</p>
                </div>
              )}
              {user.role === 'student' && (
                <>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Parent / Guardian Information</h5>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Parent Name</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_name || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Parent Phone</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_phone || 'N/A'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Parent Email</strong>
                    <p style={{ margin: '3px 0 0 0', fontWeight: '500' }}>{user.parent_email || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Change Password form */}
            <form onSubmit={handlePasswordChange} style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '18px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Change Password</h4>

              {passwordError && (
                <div style={{ padding: '9px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', marginBottom: '12px', fontWeight: '600', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ padding: '9px 14px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', marginBottom: '12px', fontWeight: '600', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {passwordSuccess}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'Current Password', value: oldPassword, onChange: e => setOldPassword(e.target.value) },
                  { label: 'New Password', value: newPassword, onChange: e => setNewPassword(e.target.value) },
                  { label: 'Confirm New Password', value: confirmPassword, onChange: e => setConfirmPassword(e.target.value) },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label style={{ fontSize: '0.78rem', fontWeight: '600', marginBottom: '5px', display: 'block', color: 'var(--text-secondary)' }}>{label}</label>
                    <input type="password" className="form-control" value={value} onChange={onChange} required />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
