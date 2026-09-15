import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, Users, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AdminSowProgress = ({ activeSession }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  useEffect(() => {
    if (activeSession) {
      fetchProgress();
    }
  }, [activeSession]);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/sow/admin-overview', {
        params: { academic_session: activeSession }
      });
      setProgressData(res.data);
    } catch (err) {
      console.error('Error fetching admin progress', err);
      setError('Failed to load teacher progress overview.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique options for filters
  const uniqueTeachers = [...new Set(progressData.map(d => d.teacher_name))].sort();
  const uniqueClasses = [...new Set(progressData.map(d => d.class_name))].sort();
  const uniqueSubjects = [...new Set(progressData.map(d => d.subject_name))].sort();

  // Apply filters
  const filteredData = progressData.filter(d => {
    if (filterTeacher && d.teacher_name !== filterTeacher) return false;
    if (filterClass && d.class_name !== filterClass) return false;
    if (filterSubject && d.subject_name !== filterSubject) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Premium Hero Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
            <BookOpen size={24} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>School Syllabus Progress</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Overview of Scheme of Work coverage across all subjects for {activeSession}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn no-print"
            onClick={fetchProgress}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1.5px solid rgba(255,255,255,0.5)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '0', borderTop: 'none' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Teacher</label>
            <select className="form-control" value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
              <option value="">All Teachers</option>
              {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Class</label>
            <select className="form-control" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Subject</label>
            <select className="form-control" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ backgroundColor: '#fff', overflow: 'hidden', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none', padding: '10px' }}>
        {loading && (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner size="md" />
          </div>
        )}

        {error && (
          <div style={{ margin: '20px', padding: '16px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} />
            <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={32} style={{ color: '#6366f1' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 5px 0' }}>No Data Available</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              {progressData.length === 0 ? "Teachers have not marked any topics as treated for this session yet." : "No records match your selected filters."}
            </p>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
            <table className="school-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Teacher Name</th>
                  <th style={{ width: '20%' }}>Class</th>
                  <th style={{ width: '20%' }}>Subject</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Topics Completed</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  const rowId = `${row.teacher_id}-${row.class_name}-${row.subject_name}`;
                  const isExpanded = expandedRow === rowId;
                  
                  return (
                    <React.Fragment key={rowId}>
                      <tr style={{ backgroundColor: isExpanded ? 'rgba(59,130,246,0.03)' : 'transparent', transition: 'all 0.2s' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem'
                            }}>
                              {row.teacher_name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{row.teacher_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{row.class_name}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{row.subject_name}</td>
                        <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                            <CheckCircle size={14} /> {row.completed_topics} Topics
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 14px' }}>
                          <button
                            onClick={() => toggleRow(rowId)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isExpanded ? (
                              <><ChevronUp size={14} /> Close</>
                            ) : (
                              <><ChevronDown size={14} /> Details</>
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && row.treated_topics_list && (
                        <tr>
                          <td colSpan="5" style={{ padding: 0 }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderBottom: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} color="var(--success)" />
                                Detailed Treated Topics List
                              </h4>
                              {row.treated_topics_list.length > 0 ? (
                                <table className="school-table" style={{ margin: 0, backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                  <thead>
                                    <tr>
                                      <th style={{ width: '80px', textAlign: 'center', padding: '10px' }}>Week</th>
                                      <th style={{ padding: '10px' }}>Topic & Subtitle</th>
                                      <th style={{ padding: '10px' }}>Date Treated</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {row.treated_topics_list.sort((a,b) => a.week - b.week).map((t, i) => (
                                      <tr key={i}>
                                        <td style={{ textAlign: 'center', padding: '10px' }}>
                                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
                                            {t.week}
                                          </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{t.topic}</div>
                                          {t.subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subtitle}</div>}
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                          {new Date(t.completed_at).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No details available.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSowProgress;
