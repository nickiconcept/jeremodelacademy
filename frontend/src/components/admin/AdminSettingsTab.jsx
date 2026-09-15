import React from 'react';
import { CalendarCheck, Lock, Clock, UserPlus, Pencil, Award, BarChart2, BookOpen, Save, FileText, Sparkles, Globe, LayoutDashboard, GraduationCap, Trash2 } from 'lucide-react';

import SignaturePad from '../SignaturePad';

const AdminSettingsTab = ({ settingsSubTab, sessions, settings, settingsForm, setSettingsForm, handleSetActiveSession, setShowSessionModal, handleUpdateSettings, settingsLoading = false, skillForm, setSkillForm, handleSkillCreate, skills, setSkillEditForm, setShowEditSkillModal, handleSkillDelete, promoSource, setPromoSource, promoTarget, setPromoTarget, handlePromotionBulk, getValidTargets, classes }) => {
  return (
    <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Sub-Tab Navigation handled by Sidebar */}

          {/* Sub-Tab 1: School Year & Term */}
          {settingsSubTab === 'academic' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <CalendarCheck size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>School Year & Term Setup</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Set the current school year, select the active term, and manage teacher grade entry permissions.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <CalendarCheck size={18} style={{ color: 'var(--primary)' }} />
                      Current School Year
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        className="form-control"
                        value={sessions.find(s => s.session_name === settingsForm.active_session)?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleSetActiveSession(val);
                            const sess = sessions.find(s => s.id === parseInt(val));
                            if (sess) setSettingsForm(prev => ({ ...prev, active_session: sess.session_name }));
                          }
                        }}
                        style={{ flex: 1, backgroundColor: 'var(--bg-surface)' }}
                      >
                        <option value="">-- Choose School Year --</option>
                        {sessions.map((s, idx) => (
                          <option key={idx} value={s.id}>
                            {s.session_name} {s.is_current ? '(Current Year)' : '(Past Year)'}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowSessionModal(true)}
                        style={{ padding: '0 16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                        title="Add New School Year"
                      >
                        <span>+ New</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <CalendarCheck size={18} style={{ color: 'var(--primary)' }} />
                      Current School Term
                    </label>
                    <select
                      className="form-control"
                      value={settingsForm.active_term}
                      onChange={(e) => setSettingsForm({ ...settingsForm, active_term: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                      <option value="3rd Term">3rd Term</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Lock size={18} style={{ color: 'var(--primary)' }} />
                      Allow Teachers to Upload Result
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_entry_open === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_entry_open: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_entry_open === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
                </div>

                <h4 style={{ marginTop: '30px', marginBottom: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={20} color="var(--primary)" />
                  Permissions & Constraints
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Clock size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Take Past Attendance
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_past_attendance === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_past_attendance: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_past_attendance === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Register Students
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_fm_register_student === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_fm_register_student: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_fm_register_student === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Pencil size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Edit Student Info
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_fm_edit_student === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_fm_edit_student: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_fm_edit_student === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Award size={18} style={{ color: 'var(--primary)' }} />
                      Show Student Rank in Class?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_position === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_position: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_position === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
                      Show Class Average Score?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_average === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_average: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_average === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                      Number of CAs Allowed
                    </label>
                    <select
                      className="form-control"
                      value={String(settingsForm.max_ca_count || 4)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, max_ca_count: parseInt(e.target.value) })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <option value="1">1 CA</option>
                      <option value="2">2 CAs</option>
                      <option value="3">3 CAs</option>
                      <option value="4">4 CAs</option>
                    </select>
                  </div>
                </div>



                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '600' }} disabled={settingsLoading}>
                      <Save size={18} /> {settingsLoading ? 'Saving Changes...' : 'Save Academic Settings'}
                    </button>
                  </div>
              </form>


            </div>
          )}

          {/* Sub-Tab 2: Report Card Display */}
          {settingsSubTab === 'reports' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <FileText size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Report Card Display & Signature Settings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Choose what information shows on student report cards and customize test column headers and official remarks.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateSettings}>


                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pencil size={18} /> Test & Exam Column Names
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1st Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca1_name} onChange={e => setSettingsForm({ ...settingsForm, ca1_name: e.target.value })} placeholder="CA 1" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2nd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca2_name} onChange={e => setSettingsForm({ ...settingsForm, ca2_name: e.target.value })} placeholder="CA 2" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>3rd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca3_name} onChange={e => setSettingsForm({ ...settingsForm, ca3_name: e.target.value })} placeholder="CA 3" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>4th Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca4_name} onChange={e => setSettingsForm({ ...settingsForm, ca4_name: e.target.value })} placeholder="CA 4" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Final Exam Column</label>
                      <input type="text" className="form-control" value={settingsForm.exam_name} onChange={e => setSettingsForm({ ...settingsForm, exam_name: e.target.value })} placeholder="Exam" />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Official Signatures & Dates
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                    
                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div>
                          <label>Principal / Headmaster Name</label>
                          <input type="text" className="form-control" value={settingsForm.principal_name} onChange={e => setSettingsForm({ ...settingsForm, principal_name: e.target.value })} placeholder="e.g. Principal Stamp (JMA)" style={{ marginBottom: '16px' }} />
                        </div>
                        <div>
                          <label>Principal Digital Signature</label>
                          {settingsForm.principal_signature ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img src={settingsForm.principal_signature} alt="Principal Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', padding: '4px' }} />
                              <button 
                                type="button" 
                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px' }}
                                onClick={() => setSettingsForm({ ...settingsForm, principal_signature: '' })}
                              >✕</button>
                            </div>
                          ) : (
                            <SignaturePad onSave={(dataUrl) => setSettingsForm({ ...settingsForm, principal_signature: dataUrl })} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <label>Next Term Opening Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_begins} onChange={e => setSettingsForm({ ...settingsForm, next_term_begins: e.target.value })} placeholder="e.g. 13/04/2026" />
                    </div>
                    <div className="form-group" style={{ margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <label>Next Term Closing Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_ends} onChange={e => setSettingsForm({ ...settingsForm, next_term_ends: e.target.value })} placeholder="e.g. 24/07/2026" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} />
                    Save Report Card Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab: Behavioral Domains (Skills) */}
          {settingsSubTab === 'skills' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Sparkles size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Affective & Psychomotor Skills Configuration</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Manage behavioral traits and skills evaluated by form masters for students' report cards.
                  </p>
                </div>
              </div>
              <div style={{ paddingTop: '24px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                  <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Add New Skill</h4>
                    <form onSubmit={handleSkillCreate}>
                      <div className="form-group">
                        <label>Skill Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Punctuality" 
                          required 
                          value={skillForm.name}
                          onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select 
                          className="form-control" 
                          value={skillForm.category}
                          onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                        >
                          <option value="affective">Affective Domain (Character)</option>
                          <option value="psychomotor">Psychomotor Domain (Skills)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Target Section</label>
                        <select 
                          className="form-control" 
                          value={skillForm.target_section}
                          onChange={(e) => setSkillForm({ ...skillForm, target_section: e.target.value })}
                        >
                          <option value="secondary">Secondary Section (JSS / SSS)</option>
                          <option value="primary">Primary Section (Nursery / Primary)</option>
                          <option value="all">Both Sections (All Classes)</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Skill</button>
                    </form>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Existing Skills</h4>
                    <div className="table-container" style={{ margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="school-table" style={{ margin: 0 }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr>
                            <th>Skill Name</th>
                            <th>Category</th>
                            <th>Target Section</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skills.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No skills found.</td></tr>
                          ) : (
                            skills.map(s => (
                              <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: (s.category || '').toLowerCase() === 'affective' ? '#e0f2fe' : '#fef3c7',
                                    color: (s.category || '').toLowerCase() === 'affective' ? '#075985' : '#92400e',
                                    textTransform: 'uppercase',
                                    fontSize: '0.72rem'
                                  }}>
                                    {s.category}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    textTransform: 'capitalize',
                                    fontSize: '0.72rem'
                                  }}>
                                    {s.target_section || 'Secondary'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    title="Edit" 
                                    style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '5px' }} 
                                    onClick={() => {
                                      setSkillEditForm(s);
                                      setShowEditSkillModal(true);
                                    }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button className="btn btn-danger" title="Delete" style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleSkillDelete(s.id, s.category)}><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Website & Contact Info */}
          {(settingsSubTab === 'website' || settingsSubTab === 'landing') && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Globe size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Portal Landing Page & Contact Settings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Customize the school name, taglines, hero banner text, and official contact address displayed on the landing page and receipts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Globe size={18} style={{ color: 'var(--primary)' }} />
                      School Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_school_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_school_name: e.target.value })}
                      required
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <FileText size={18} style={{ color: 'var(--primary)' }} />
                      School Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_tagline || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_tagline: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Award size={18} style={{ color: 'var(--primary)' }} />
                      Hero Title (Landing Page Banner)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_hero_title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_hero_title: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <LayoutDashboard size={18} style={{ color: 'var(--primary)' }} />
                      Hero Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settingsForm.landing_hero_desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_hero_desc: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    ></textarea>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Globe size={18} style={{ color: 'var(--primary)' }} />
                      Official School Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_address || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_address: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={18} /> Attendance Geofencing Configuration
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Set up to two acceptable school locations where teachers must be physically present to take attendance. Leave blank to disable geofencing.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    
                    {/* Location 1 */}
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{settingsForm.attendance_location1_name || 'School Location 1'}</h5>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location Name (e.g. Main Campus)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingsForm.attendance_location1_name || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location1_name: e.target.value })}
                          placeholder="e.g. Main Campus"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingsForm.attendance_location1_lat || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location1_lat: e.target.value })}
                          placeholder="e.g. 6.5244"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingsForm.attendance_location1_lng || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location1_lng: e.target.value })}
                          placeholder="e.g. 3.3792"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                    </div>

                    {/* Location 2 */}
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{settingsForm.attendance_location2_name || 'School Location 2'} (Optional)</h5>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location Name (e.g. Annex)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={settingsForm.attendance_location2_name || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location2_name: e.target.value })}
                          placeholder="e.g. Annex"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingsForm.attendance_location2_lat || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location2_lat: e.target.value })}
                          placeholder="e.g. 6.5244"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          value={settingsForm.attendance_location2_lng || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_location2_lng: e.target.value })}
                          placeholder="e.g. 3.3792"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                      </div>
                    </div>

                    {/* Radius */}
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Acceptable Radius</h5>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Radius (in meters)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settingsForm.attendance_radius || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, attendance_radius: e.target.value })}
                          placeholder="e.g. 100"
                          style={{ backgroundColor: 'var(--bg-surface)' }}
                        />
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '5px' }}>
                          Standard is 100 meters to account for indoor GPS inaccuracy.
                        </small>
                      </div>
                    </div>

                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} />
                    Save Landing Page Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab 4: Move Students Up */}
          {(settingsSubTab === 'promotion' || settingsSubTab === 'promotions') && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <GraduationCap size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Move Students to Next Class</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Promote a whole class of students up to their new class for the new school year. Student past grade records stay safely saved in their timeline.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePromotionBulk} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Current Class</label>
                  <select
                    className="form-control"
                    value={promoSource}
                    onChange={(e) => {
                      const newSource = e.target.value;
                      setPromoSource(newSource);
                      if (newSource) {
                        const targets = getValidTargets(newSource, classes);
                        if (targets.length === 1) {
                          setPromoTarget(targets[0].id);
                        } else {
                          setPromoTarget('');
                        }
                      } else {
                        setPromoTarget('');
                      }
                    }}
                    required
                  >
                    <option value="">Select Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 'bold' }}>New Class</label>
                  {(() => {
                    const sourceClass = classes.find(c => c.id == promoSource);
                    const isGraduateSource = sourceClass && sourceClass.name.includes('Graduate');
                    const validTargets = getValidTargets(promoSource, classes);
                    
                    if (isGraduateSource) {
                      return <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem' }}>Cannot Promote from Graduate Classes here. Use the Registration Page.</div>;
                    }
                    
                    return (
                      <select
                        className="form-control"
                        value={promoTarget}
                        onChange={(e) => setPromoTarget(e.target.value)}
                        required
                        disabled={!promoSource}
                      >
                        <option value="">Select Target Class...</option>
                        {validTargets.map((c, idx) => (
                          <option key={idx} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <button type="submit" className="btn btn-danger" style={{ padding: '10px 20px' }}>
                  Move Students Up ➔
                </button>
              </form>
            </div>
          )}

        </div>

    </>
  );
};

export default AdminSettingsTab;
