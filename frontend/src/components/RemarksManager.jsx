import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Sparkles, Pencil, Save, X, User } from 'lucide-react';
import Toast from './Toast';

export default function RemarksManager({ classId, term, session, type, generationMode, onBack }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [currentRemark, setCurrentRemark] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadStudents();
  }, [classId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const allStudents = await api.getStudents();
      const classStudents = allStudents.filter(s => s.class_id === classId);
      setStudents(classStudents);
    } catch (err) {
      setErrorMsg('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setCurrentRemark('');
    try {
      const remarks = await api.getStudentRemarks(student.id, term, session);
      if (remarks) {
        setCurrentRemark(type === 'teacher' ? (remarks.class_teacher_remark || '') : (remarks.principal_remark || ''));
      }
    } catch (err) {
      // Ignore if no remarks found (404)
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const result = await api.generateAiRemark({
        student_id: selectedStudent.id,
        term,
        academic_year: session,
        type
      });
      const remarkField = type === 'teacher' ? 'class_teacher_remark' : 'principal_remark';
      setCurrentRemark(result.remark?.[remarkField] || '');
      setNotify('AI Remark generated successfully! Please review and save.');
    } catch (err) {
      setErrorMsg('Failed to generate remark: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRemark = async () => {
    setIsSaving(true);
    try {
      await api.saveRemark({
        student_id: selectedStudent.id,
        term,
        academic_year: session,
        class_teacher_remark: type === 'teacher' ? currentRemark : undefined,
        principal_remark: type === 'principal' ? currentRemark : undefined
      });
      setNotify('Remark saved successfully!');
      setSelectedStudent(null);
    } catch (err) {
      setErrorMsg('Failed to save remark: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
      <Toast message={notify} type="success" onClose={() => setNotify('')} duration={3000} />
      <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} duration={5000} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
            <Pencil size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Manage {type === 'teacher' ? 'Class Teacher' : 'Principal'} Remarks</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Term: {term} | Session: {session} | Mode: {generationMode === 'ai' ? 'AI Auto-Generation Enabled' : 'Manual Entry'}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '20px' }}>
          Back
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading students...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1.5fr' : '1fr', gap: '24px' }}>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Select Student</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {students.length === 0 ? (
                <p>No students found in this class.</p>
              ) : (
                students.map(student => (
                  <div 
                    key={student.id} 
                    onClick={() => handleSelectStudent(student)}
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: selectedStudent?.id === student.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedStudent?.id === student.id ? 'var(--primary-light)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <User size={18} style={{ color: selectedStudent?.id === student.id ? 'var(--primary)' : 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: selectedStudent?.id === student.id ? 'var(--primary)' : 'var(--text-primary)' }}>{student.full_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.admission_number}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedStudent && (
            <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedStudent.full_name}</h3>
                <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setSelectedStudent(null)}><X size={16} /></button>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{type === 'teacher' ? 'Teacher Remark' : 'Principal Remark'}</span>
                  {generationMode === 'ai' && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary-light)' }}
                    >
                      <Sparkles size={14} />
                      {isGenerating ? 'Generating...' : 'Auto-Generate via AI'}
                    </button>
                  )}
                </label>
                <textarea 
                  className="form-control" 
                  rows={6}
                  value={currentRemark}
                  onChange={(e) => setCurrentRemark(e.target.value)}
                  placeholder={`Enter or generate ${type} remark...`}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveRemark}
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Remark'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
