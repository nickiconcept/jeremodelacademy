import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, AlertCircle, Save } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';

export default function AdminManagementTab() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isElevating, setIsElevating] = useState(false);
  
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    permissions: {
      can_manage_staff: false,
      can_manage_students: false,
      can_manage_fees: false,
      can_edit_website: false,
      can_manage_results: false,
      super_admin: false,
    }
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins');
      // api.get returns { data: ... }
      setAdmins(response.data || []);
    } catch (err) {
      setErrorMsg('Failed to load admins: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setEditingId(null);
    setIsElevating(false);
    setForm({
      username: '',
      full_name: '',
      email: '',
      password: '',
      permissions: {
        can_manage_staff: false,
        can_manage_students: false,
        can_manage_fees: false,
        can_edit_website: false,
        can_manage_results: false,
        super_admin: false,
      }
    });
    setShowModal(true);
  };

  const handleOpenElevate = () => {
    setEditingId(null);
    setIsElevating(true);
    setForm({
      username: '',
      full_name: '',
      email: '',
      password: '',
      permissions: {
        can_manage_staff: false,
        can_manage_students: false,
        can_manage_fees: false,
        can_edit_website: false,
        can_manage_results: false,
        super_admin: false,
      }
    });
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingId(admin.id);
    setIsElevating(false);
    const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
    setForm({
      username: admin.username || '',
      full_name: admin.full_name || '',
      email: admin.email || '',
      password: '', // Blank unless changing
      permissions: {
        can_manage_staff: perms.includes('can_manage_staff'),
        can_manage_students: perms.includes('can_manage_students'),
        can_manage_fees: perms.includes('can_manage_fees'),
        can_edit_website: perms.includes('can_edit_website'),
        can_manage_results: perms.includes('can_manage_results'),
        super_admin: perms.includes('super_admin'),
      }
    });
    setShowModal(true);
  };

  const handleTogglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNotifyMsg('');
    
    try {
      // Convert boolean map to array of strings
      const permissionArray = Object.keys(form.permissions).filter(k => form.permissions[k]);
      
      const payload = {
        full_name: form.full_name,
        email: form.email,
        permissions: permissionArray
      };
      
      if (form.password) {
        payload.password = form.password;
      }

      if (isElevating) {
        await api.post('/admins/elevate', {
          username: form.username,
          permissions: permissionArray
        });
        setNotifyMsg('User elevated to Admin successfully.');
      } else if (editingId) {
        await api.put(`/admins/update/${editingId}`, payload);
        setNotifyMsg('Admin updated successfully.');
      } else {
        if (!form.password) throw new Error('Password is required for new admins.');
        await api.post('/admins/register', payload);
        setNotifyMsg('New Admin registered successfully.');
      }
      
      setShowModal(false);
      loadAdmins();
      
      setTimeout(() => setNotifyMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this admin's access?")) return;
    try {
      await api.delete(`/admins/delete/${id}`);
      setNotifyMsg('Admin deleted.');
      loadAdmins();
      setTimeout(() => setNotifyMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Deletion failed.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>System Administrators</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Manage top-level administrative access to the portal.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleOpenElevate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)' }}>
            <Plus size={18} /> Elevate User
          </button>
          <button className="btn" onClick={handleOpenRegister} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', color: 'var(--primary)', fontWeight: 'bold', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
            <Plus size={18} /> Register Admin
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '10px 15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      
      {notifyMsg && (
        <div style={{ padding: '10px 15px', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '8px', marginBottom: '20px' }}>
          {notifyMsg}
        </div>
      )}

      {loading ? (
        <div>Loading administrators...</div>
      ) : (
        <div className="table-responsive">
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Admin ID</th>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Roles / Permissions</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => {
                const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
                return (
                  <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{admin.username}</td>
                    <td style={{ padding: '12px' }}>{admin.full_name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{admin.email || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {perms.includes('super_admin') ? (
                          <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>Super Admin</span>
                        ) : perms.length > 0 ? (
                          perms.map(p => (
                            <span key={p} style={{ backgroundColor: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                              {p.replace('can_', '').replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No specific access</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleOpenEdit(admin)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(admin.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL rendered via Portal to prevent z-index issues */}
      {showModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)', maxWidth: '500px', width: '95%', display: 'flex', flexDirection: 'column', maxHeight: '90dvh', padding: 0, overflow: 'hidden' }}>
            <div style={{ flexShrink: 0, padding: '24px 24px 0 24px' }}>
              <button className="modal-close" onClick={() => setShowModal(false)} style={{ top: '15px', right: '15px' }}>✕</button>
              <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--primary)" /> 
                {isElevating ? 'Elevate Existing User to Admin' : editingId ? 'Edit Administrator' : 'Register Administrator'}
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              <form onSubmit={handleSubmit} id="adminForm">
              {isElevating && (
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Staff ID / Username</label>
                  <input type="text" className="form-control" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="e.g. JMA/2023/..." />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Enter the exact username of the staff member to elevate.</p>
                </div>
              )}
              
              {!isElevating && (
                <>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name</label>
                    <input type="text" className="form-control" required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                    <input type="email" className="form-control" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password {editingId && '(Leave blank to keep unchanged)'}</label>
                    <input type="password" className="form-control" required={!editingId} minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                  </div>
                </>
              )}

              <div style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Access Permissions</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.keys(form.permissions).map(key => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={form.permissions[key]} 
                        onChange={() => handleTogglePermission(key)} 
                      />
                      {key === 'super_admin' ? (
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Super Admin (All Access)</span>
                      ) : (
                        <span>{key.replace('can_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              </form>
            </div>
            
            <div style={{ flexShrink: 0, padding: '20px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="adminForm" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {isElevating ? 'Elevate User' : editingId ? 'Update Admin' : 'Register Admin'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
