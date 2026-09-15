import React, { useState } from 'react';
import { GraduationCap, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function Login({ onLoginSuccess, onBack, settings }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.login(identifier, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>

      {/* ── Left Branding Panel ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 48px',
        background: 'linear-gradient(150deg, var(--secondary) 0%, #0a1929 60%, #051121 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blob decorations */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-80px', right: '-60px',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
          animation: 'blobDrift 14s ease-in-out infinite',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '-60px', left: '-40px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          animation: 'blobDrift 18s ease-in-out infinite reverse',
        }} />

        {/* Logo badge with pulse ring */}
        <div style={{
          position: 'relative',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeSlideUp 0.5s ease both',
        }}>
          <div style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            borderRadius: '26px',
            border: '2px solid rgba(14,165,233,0.4)',
            animation: 'pulseRing 2s ease infinite',
          }} />
          {settings?.school_logo_url ? (
            <img src={settings?.school_logo_url} alt="Logo" style={{
              width: '110px', height: '110px', borderRadius: '20px', objectFit: 'contain',
              backgroundColor: '#ffffff', padding: '6px',
              boxShadow: '0 12px 36px rgba(14,165,233,0.35)'
            }} />
          ) : (
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 36px rgba(14,165,233,0.45)',
              color: '#fff',
            }}>
              <GraduationCap size={42} />
            </div>
          )}
        </div>

        {/* School name */}
        <h2 style={{
          fontSize: '1.8rem', fontWeight: '800', color: '#fff',
          textAlign: 'center', margin: '0 0 8px 0', letterSpacing: '-0.02em',
          animation: 'fadeSlideUp 0.5s 0.08s ease both',
        }}>
          Jere Model Academy
        </h2>
        <p style={{
          fontSize: '0.78rem', fontWeight: '700',
          color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em',
          textTransform: 'uppercase', margin: '0 0 48px 0',
          animation: 'fadeSlideUp 0.5s 0.14s ease both',
        }}>
          Online School Portal
        </p>

        {/* Feature pills */}
        {[
          '📊 Academic Results & Report Cards',
          '💳 Fee Tracking & Payment Receipts',
          '📋 Attendance & Class Records',
          '🔐 Secure PIN-based Result Checks',
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 18px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 'var(--radius-md)',
            width: '100%', maxWidth: '320px',
            marginBottom: '10px',
            color: 'rgba(255,255,255,0.82)',
            fontSize: '0.85rem', fontWeight: '500',
            animation: `fadeSlideUp 0.5s ${0.18 + i * 0.07}s ease both`,
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 48px',
        background: 'var(--bg-primary)',
        position: 'relative',
      }}>
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-ghost"
            style={{
              position: 'absolute', top: '28px', left: '28px',
              fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <ArrowLeft size={15} /> Back to Home
          </button>
        )}

        <div style={{
          width: '100%',
          maxWidth: '400px',
          animation: 'fadeSlideUp 0.5s ease both',
        }}>
          {/* Heading */}
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Sign in to access your school portal
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '24px',
              border: '1px solid rgba(239,68,68,0.2)',
              animation: 'fadeSlideUp 0.3s ease both',
            }}>
              <AlertCircle size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Username */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="identifier">Username / Admission Number</label>
              <input
                type="text"
                id="identifier"
                className="form-control"
                placeholder="e.g. admin or JMA/2026/0001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>
                Students: use your JMA admission number
              </small>
            </div>

            {/* Password */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    padding: '4px',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '1rem', borderRadius: 'var(--radius-md)', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p style={{
            marginTop: '32px', textAlign: 'center',
            fontSize: '0.75rem', color: 'var(--text-muted)',
            paddingTop: '20px', borderTop: '1px solid var(--border-color)',
          }}>
            Opposite Jabal-Annur Mosque, Kaduna State
          </p>
        </div>
      </div>
    </div>
  );
}
