import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import RequiredPasswordChange from './components/RequiredPasswordChange';
import api from './utils/api';
import { GlobalUIProvider } from './contexts/GlobalUIContext';

function AppContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash) return hash.split('/')[0];
    const saved = localStorage.getItem('jma_active_tab');
    return (saved && saved !== 'undefined' && saved !== 'null') ? saved : 'dashboard';
  });
  const [subTab, setSubTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash) return hash.split('/')[1] || null;
    const saved = localStorage.getItem('jma_active_subtab');
    return (saved && saved !== 'undefined' && saved !== 'null') ? saved : null;
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [settingsError, setSettingsError] = useState(false);
  const [sessionRestoreError, setSessionRestoreError] = useState('');

  // Sync settings and token session on mount
  useEffect(() => {
    fetchPublicSettings();
    verifySession();
  }, []);

  // Hash Routing for Browser Back/Forward Buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const parts = hash.split('/');
        setActiveTab(parts[0]);
        setSubTab(parts[1] || null);
      } else {
        const savedTab = localStorage.getItem('jma_active_tab') || 'dashboard';
        const savedSubTab = localStorage.getItem('jma_active_subtab') || null;
        setActiveTab(savedTab);
        setSubTab(savedSubTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    if (window.location.hash) {
      handlePopState();
    } else {
      const initialHash = subTab ? `#/${activeTab}/${subTab}` : `#/${activeTab}`;
      window.history.replaceState(null, '', initialHash);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tabId, subTabId = null) => {
    setActiveTab(tabId);
    setSubTab(subTabId);
    localStorage.setItem('jma_active_tab', tabId);
    if (subTabId) {
      localStorage.setItem('jma_active_subtab', subTabId);
      window.history.pushState(null, '', `#/${tabId}/${subTabId}`);
    } else {
      localStorage.removeItem('jma_active_subtab');
      window.history.pushState(null, '', `#/${tabId}`);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setSettingsError(false);
    } catch (err) {
      console.error('Failed to load system settings:', err);
      setSettingsError(true);
    }
  };

  const fetchPublicSettings = async () => {
    try {
      const data = await api.getPublicSettings();
      setSettings(data);
      setSettingsError(false);
    } catch (err) {
      console.error('Failed to load public school settings:', err);
      setSettingsError(true);
    }
  };

  const verifySession = async () => {
    const token = localStorage.getItem('jma_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.length % 4;
      if (pad) {
        base64 += '='.repeat(4 - pad);
      }
      JSON.parse(window.atob(base64));
    } catch (err) {
      console.error('Invalid saved session token:', err);
      api.logout();
      setShowLogin(true);
      setLoading(false);
      return;
    }

    try {
      // Do not render a role dashboard from unverified cached/token claims.
      const freshUser = await api.getMe();
      setUser(freshUser);
      if (!freshUser.must_change_password) {
        await fetchSettings();
      }
    } catch (err) {
      console.error('Failed to restore saved session:', err);
      const isLaravelUnauthorized = err.status === 401
        && (err.contentType || '').toLowerCase().includes('application/json');

      if (isLaravelUnauthorized) {
        api.logout();
        setShowLogin(true);
      } else {
        // Keep the token: a cPanel HTML response or network outage is not proof
        // that the user's Laravel session has expired.
        let endpoint = 'API endpoint unavailable';
        try {
          if (err.url) {
            const responseUrl = new URL(err.url);
            endpoint = `${responseUrl.host}${responseUrl.pathname}`;
          }
        } catch {
          // Keep the recovery state usable even if the response URL is malformed.
        }
        const status = err.status ? `HTTP ${err.status}` : 'No HTTP response';
        const contentType = err.contentType || 'unknown content type';
        setSessionRestoreError(`${status} · ${contentType} · ${endpoint}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (loggedInUser) => {
    if (!loggedInUser.must_change_password) {
      await fetchSettings();
    }
    setUser(loggedInUser);
    setActiveTab('dashboard'); // Default landing page
    setSubTab(null);
    localStorage.removeItem('jma_active_tab');
    localStorage.removeItem('jma_active_subtab');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setShowLogin(false);
    setActiveTab('dashboard');
    setSubTab(null);
    localStorage.removeItem('jma_active_tab');
    localStorage.removeItem('jma_active_subtab');
    localStorage.removeItem('jma_user');
    window.history.pushState(null, '', `#/dashboard`);
  };

  const retrySessionRestore = () => {
    setSessionRestoreError('');
    setSettingsError(false);
    setLoading(true);
    fetchPublicSettings();
    verifySession();
  };

  const handlePasswordChangeComplete = async () => {
    const freshUser = await api.getMe();
    await fetchSettings();
    setUser(freshUser);
  };

  if (settingsError) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', 
        background: 'var(--bg-primary, #f9fafb)', color: 'var(--text-primary, #111827)'
      }}>
        <h2 style={{ marginBottom: '10px' }}>Connection Error</h2>
        <p style={{ color: 'var(--text-muted, #6b7280)', marginBottom: '20px' }}>
          Failed to synchronize portal data. Please check if the backend server is running.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (sessionRestoreError) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        background: 'var(--bg-primary, #f9fafb)', color: 'var(--text-primary, #111827)', textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '10px' }}>Could not restore your session</h2>
        <p style={{ color: 'var(--text-muted, #6b7280)', marginBottom: '20px', maxWidth: '520px' }}>
          Your saved sign-in has been kept on this device. The server did not return a valid session response. Check your connection and try again.
        </p>
        <p role="status" style={{ color: 'var(--text-muted, #6b7280)', margin: '0 0 20px', maxWidth: '520px', fontSize: '0.82rem', overflowWrap: 'anywhere' }}>
          Diagnostic: {sessionRestoreError}
        </p>
        <button
          onClick={retrySessionRestore}
          style={{ padding: '10px 20px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: '20px',
      }}>
        {/* Pulsing logo badge */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '22px',
            border: '2px solid rgba(14,165,233,0.4)',
            animation: 'pulseRing 1.8s ease infinite',
          }} />
          {settings?.school_logo_url ? (
            <img src={settings?.school_logo_url} alt="Logo" style={{
              width: '68px', height: '68px', borderRadius: '18px', objectFit: 'contain',
              backgroundColor: '#ffffff', padding: '5px',
              boxShadow: '0 10px 32px var(--primary-glow)',
            }} />
          ) : (
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 32px var(--primary-glow)',
              color: '#fff',
              fontSize: '1.35rem',
              fontWeight: '900',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}>
              JMA
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Jere Model Academy Portal
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
            Synchronizing portal data...
          </p>
        </div>

        {/* Shimmer progress bar */}
        <div style={{
          width: '220px',
          height: '4px',
          borderRadius: '99px',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '99px' }} />
        </div>
      </div>
    );
  }

  // If not logged in, show Landing Page or Login Screen
  if (!user) {
    if (!showLogin) {
      return <LandingPage settings={settings} onEnterPortal={() => setShowLogin(true)} />;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} settings={settings} />;
  }

  if (user.must_change_password) {
    return (
      <RequiredPasswordChange
        user={user}
        onComplete={handlePasswordChangeComplete}
        onLogout={handleLogout}
      />
    );
  }

  // Logged-in view selection based on role
  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      subTab={subTab}
      onSelectTab={handleSelectTab}
      onLogout={handleLogout}
      settings={settings}
    >
      {user.role === 'admin' && (
        <AdminDashboard
          settings={settings}
          fetchSettings={fetchSettings}
          activeTab={activeTab}
          subTab={subTab}
          onSelectTab={handleSelectTab}
        />
      )}
      {user.role === 'teacher' && (
        <TeacherDashboard
          user={user}
          settings={settings}
          activeTab={activeTab}
          subTab={subTab}
          onSelectTab={handleSelectTab}
        />
      )}
      {user.role === 'student' && (
        <StudentDashboard
          user={user}
          settings={settings}
          activeTab={activeTab}
          subTab={subTab}
          onSelectTab={handleSelectTab}
        />
      )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <GlobalUIProvider>
      <AppContent />
    </GlobalUIProvider>
  );
}
