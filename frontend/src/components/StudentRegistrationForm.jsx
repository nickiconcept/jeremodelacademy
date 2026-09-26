import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { ArrowLeft, Edit2, X, User, Save, Upload, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function StudentRegistrationForm({ student, onClose, onUpdate }) {
  if (!student) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...student });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = React.useRef(null);

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

  const formRef = React.useRef(null);

  const handleExportPDF = () => {
    const element = formRef.current;
    if (!element) return;
    // Temporarily force the hidden print form visible for capture by overriding !important
    element.style.setProperty('display', 'block', 'important');
    const opt = {
      margin:       0.3,
      filename:     `${student?.admission_number || 'student'}_profile.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.removeProperty('display');
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.updateStudent(student.id, formData);
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

  return createPortal(
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
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Student Profile</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', paddingRight: '40px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
              <Edit2 size={16} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger no-print">{error}</div>}

        {/* SCREEN VIEW (MODERN PROFILE CARD) */}
        <div className="no-print">
          {!isEditing ? (
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {student.passport_photo ? (
                  <img src={student.passport_photo} alt="Student" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>
                    👤
                  </div>
                )}
                <h3 style={{ marginTop: '15px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{student.full_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '5px 0' }}>{student.admission_number}</p>
                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{student.class_name || 'Unassigned'}</span>
              </div>
              
              <div style={{ flex: '1 1 400px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div><strong>Date of Birth:</strong> {student.date_of_birth || 'N/A'}</div>
                  <div><strong>Sex:</strong> {student.sex || 'N/A'}</div>
                  <div><strong>Religion:</strong> {student.religion || 'N/A'}</div>
                  <div><strong>Handicapped:</strong> {student.handicapped ? `Yes (${student.handicap_details})` : 'No'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Contact & Background</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {student.address_residence || 'N/A'}</div>
                  <div><strong>Local Gov:</strong> {student.local_government || 'N/A'}</div>
                  <div><strong>State of Origin:</strong> {student.state_of_origin || 'N/A'}</div>
                  <div><strong>Last School:</strong> {student.last_school_attended || 'N/A'}</div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>Parent / Guardian</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><strong>Name:</strong> {student.parent_name || 'N/A'}</div>
                  <div><strong>Phone:</strong> {student.parent_phone || 'N/A'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {student.parent_address || 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                {formData.passport_photo ? (
                  <img src={formData.passport_photo} alt="Student" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary-light)' }} />
                ) : (
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '2rem', color: '#94a3b8' }}>👤</div>
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
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" name="full_name" value={formData.full_name || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Admission No</label>
                    <input type="text" className="form-control" name="custom_admission_number" value={formData.custom_admission_number || formData.admission_number || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Sex</label>
                    <select className="form-control" name="sex" value={formData.sex || ''} onChange={handleChange} required>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Religion</label>
                    <input type="text" className="form-control" name="religion" value={formData.religion || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Last School</label>
                    <input type="text" className="form-control" name="last_school_attended" value={formData.last_school_attended || ''} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Residential Address</label>
                  <textarea className="form-control" name="address_residence" value={formData.address_residence || ''} onChange={handleChange} required></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                  <div className="form-group">
                    <label>LGA</label>
                    <input type="text" className="form-control" name="local_government" value={formData.local_government || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>State of Origin</label>
                    <input type="text" className="form-control" name="state_of_origin" value={formData.state_of_origin || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Parent/Guardian Name</label>
                    <input type="text" className="form-control" name="parent_name" value={formData.parent_name || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Parent Phone</label>
                    <input type="text" className="form-control" name="parent_phone" value={formData.parent_phone || ''} onChange={handleChange} required />
                  </div>
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

        {/* PRINTABLE AREA (Only visible during print) */}
        <div className="print-area" ref={formRef} style={{ padding: '40px', backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
          <style>{`
            @media screen {
              .print-area { display: none !important; }
            }
          `}</style>
          
          {/* Header */}
          <table style={{ width: '100%', borderBottom: '3px solid #1d4ed8', paddingBottom: '10px', marginBottom: '20px' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Jere Model Academy</h2>
                  <p style={{ margin: '0', fontSize: '14px', color: '#444' }}>Opposite Jabal-Annur Mosque, New Abuja Road</p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#444' }}>Jere Kagarko LGA, Kaduna State</p>
                </td>
                <td style={{ textAlign: 'right', width: '130px', verticalAlign: 'top' }}>
                  <div style={{ width: '120px', height: '120px', border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', display: 'inline-block', textAlign: 'center', lineHeight: '120px' }}>
                    {student.passport_photo ? (
                      <img src={student.passport_photo} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>No Photo</span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', margin: '20px 0', textTransform: 'uppercase', backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
            Student Profile Information
          </div>

          {/* Reusable styles for the tables */}
          {(() => {
            const labelStyle = { width: '40%', fontWeight: 'bold', fontSize: '12px', color: '#555', padding: '8px', borderBottom: '1px solid #eee', textTransform: 'uppercase', verticalAlign: 'middle' };
            const valueStyle = { width: '60%', fontSize: '14px', color: '#000', padding: '8px', borderBottom: '1px solid #eee', fontWeight: '500', verticalAlign: 'middle' };
            const sectionHeader = { fontSize: '16px', fontWeight: 'bold', color: '#1e40af', borderBottom: '2px solid #1e40af', paddingBottom: '4px', marginBottom: '10px', marginTop: '20px', textTransform: 'uppercase' };

            return (
              <>
                <div style={sectionHeader}>Personal Information</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={labelStyle}>Full Name</td><td style={valueStyle}>{student.full_name || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Date of Birth</td><td style={valueStyle}>{student.date_of_birth || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Gender</td><td style={valueStyle}>{student.sex || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Religion</td><td style={valueStyle}>{student.religion || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Handicapped</td><td style={valueStyle}>{student.handicapped ? `YES - ${student.handicap_details || 'N/A'}` : 'NO'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={sectionHeader}>Academic Details</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={labelStyle}>Admission Number</td><td style={valueStyle}>{student.admission_number || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Class of Entry</td><td style={valueStyle}>{student.class_of_entry || student.class_name || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Term / Year of Entry</td><td style={valueStyle}>{student.term_year_of_entry || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Last School Attended</td><td style={valueStyle}>{student.last_school_attended || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={sectionHeader}>Contact & Origin</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={labelStyle}>State of Origin</td><td style={valueStyle}>{student.state_of_origin || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Local Government</td><td style={valueStyle}>{student.local_government || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Address of Residence</td><td style={valueStyle}>{student.address_residence || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                <div style={sectionHeader}>Parent / Guardian Details</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                  <tbody>
                    <tr>
                      <td style={labelStyle}>Name of Parent/Guardian</td><td style={valueStyle}>{student.parent_name || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Phone Number</td><td style={valueStyle}>{student.parent_phone || '-'}</td>
                    </tr>
                    <tr>
                      <td style={labelStyle}>Parent Address</td><td style={valueStyle}>{student.parent_address || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            );
          })()}

          <div style={{ marginTop: '40px', paddingTop: '15px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '12px', color: '#777' }}>
            Generated on {new Date().toLocaleDateString()} | Jere Model Academy Official Document
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
