import React, { useState, useRef } from 'react';
import api from '../utils/api';
import SignaturePad from './SignaturePad';
import { ArrowLeft, Edit2, X, User, Upload, Save } from 'lucide-react';

export default function TeacherProfileCard({ teacher, onClose, onUpdate }) {
  if (!teacher) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...teacher, digital_signature: teacher.digital_signature || teacher.signature || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Passport photo must be a JPG, JPEG, or PNG file.');
        return;
      }
      if (file.size > 150 * 1024) {
        setError('Passport photo must be less than 150KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, passport_photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.digital_signature?.trim()) {
      setError('Please draw and accept the teacher’s signature before saving.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const computedFullName = [formData.surname, formData.first_name, formData.other_names].filter(Boolean).join(' ');
      const payload = { ...formData, full_name: computedFullName };
      await api.updateTeacher(teacher.id, payload);
      setIsEditing(false);
      if (onUpdate) onUpdate(); // Refresh parent data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '850px', backgroundColor: 'var(--bg-surface)' }}>
        <button className="modal-close no-print" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Teacher Profile</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingRight: '40px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
              <Edit2 size={16} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger no-print">{error}</div>}

        <div className="no-print">
          {!isEditing ? (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {teacher.passport_photo ? (
                  <img src={teacher.passport_photo} alt="Teacher" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>
                    🧑‍🏫
                  </div>
                )}
                <h3 style={{ marginTop: '15px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{teacher.full_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '5px 0' }}>{teacher.username}</p>
                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{teacher.status || 'Active'}</span>
              </div>
              
              <div style={{ flex: '1 1 400px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Professional Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div><strong>Email:</strong> {teacher.email || 'N/A'}</div>
                  <div><strong>Phone Number:</strong> {teacher.phone_number || 'N/A'}</div>
                  <div><strong>Employed:</strong> {teacher.created_at ? teacher.created_at.split(' ')[0] : 'N/A'}</div>
                  <div><strong>Category of Employment:</strong> {teacher.employment_category || 'N/A'}</div>
                  <div><strong>Qualification:</strong> {teacher.qualification || 'N/A'}</div>
                  <div><strong>Discipline:</strong> {teacher.discipline || 'N/A'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div><strong>Surname:</strong> {teacher.surname || 'N/A'}</div>
                  <div><strong>First Name:</strong> {teacher.first_name || 'N/A'}</div>
                  <div><strong>Other Names:</strong> {teacher.other_names || 'N/A'}</div>
                  <div><strong>Date of Birth:</strong> {teacher.date_of_birth || 'N/A'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Location</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {teacher.address || 'N/A'}</div>
                  <div><strong>State of Residence:</strong> {teacher.state_of_residence || 'N/A'}</div>
                  <div><strong>LGA of Residence:</strong> {teacher.lga_of_residence || 'N/A'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Digital Signature</h4>
                <div>
                  {(teacher.digital_signature || teacher.signature) ? (
                    <img src={teacher.digital_signature || teacher.signature} alt="Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', padding: '4px' }} />
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No signature on file</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {formData.passport_photo ? (
                  <img src={formData.passport_photo} alt="Teacher" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>🧑‍🏫</div>
                )}
                <div style={{ marginTop: '10px' }}>
                  <input type="file" accept="image/*" ref={photoInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => photoInputRef.current && photoInputRef.current.click()}>
                    {formData.passport_photo ? 'Change Photo' : 'Add Photo'}
                  </button>
                </div>
              </div>

              <div style={{ flex: '1 1 400px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Edit Information</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Full Name <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(auto-computed from name fields below)</span></label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                      value={[formData.surname, formData.first_name, formData.other_names].filter(Boolean).join(' ')}
                      placeholder="Will be generated from Surname, First Name & Other Names"
                    />
                  </div>
                  <div className="form-group">
                    <label>Surname</label>
                    <input type="text" className="form-control" name="surname" required value={formData.surname || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" name="first_name" required value={formData.first_name || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Other Names</label>
                    <input type="text" className="form-control" name="other_names" value={formData.other_names || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" className="form-control" name="phone_number" required value={formData.phone_number || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Discipline</label>
                    <input type="text" className="form-control" name="discipline" required value={formData.discipline || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" name="email" required value={formData.email || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Employment Category</label>
                    <select className="form-control" name="employment_category" required value={formData.employment_category || ''} onChange={handleChange}>
                      <option value="">Select Category</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Teaching Practice">Teaching Practice</option>
                      <option value="SIWES/IT">SIWES/IT</option>
                      <option value="Corp Member">Corp Member</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Qualification</label>
                    <select className="form-control" name="qualification" required value={formData.qualification || ''} onChange={handleChange}>
                      <option value="">Select Qualification</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="B.Ed">B.Ed</option>
                      <option value="B.A">B.A</option>
                      <option value="NCE">NCE</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Residential Address</label>
                  <textarea className="form-control" name="address" required value={formData.address || ''} onChange={handleChange}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label>LGA</label>
                    <input type="text" className="form-control" name="lga_of_residence" required value={formData.lga_of_residence || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>State of Residence</label>
                    <input type="text" className="form-control" name="state_of_residence" required value={formData.state_of_residence || ''} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Digital Signature (required)</label>
                  {formData.digital_signature ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={formData.digital_signature} alt="Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff' }} />
                      <button 
                        type="button" 
                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px' }}
                        onClick={() => setFormData({ ...formData, digital_signature: '' })}
                      >✕</button>
                    </div>
                  ) : (
                    <SignaturePad onSave={(dataUrl) => setFormData({ ...formData, digital_signature: dataUrl })} />
                  )}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
