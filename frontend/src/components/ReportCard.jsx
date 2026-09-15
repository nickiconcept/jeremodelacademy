import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowLeft, Award, X, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../utils/api';

export default function ReportCard({ data, settings, onClose, closeLabel, isBulk = false }) {
  if (!data) return null;

  const { student, grades, attendance, term, academic_year, position, total_students, class_average, behavioral } = data;

  const isSecondary = (student.tier || '').toLowerCase() === 'jss' || (student.tier || '').toLowerCase() === 'sss';
  const behaviorMainHeading = isSecondary 
    ? "Character Development & Skills Evaluation (Rating Scale 1 to 5)"
    : "Affective & Psychomotor Evaluation (Rating Scale 1 to 5)";
  const affectiveColHeading = isSecondary ? "Character Development" : "Affective Area";
  const psychomotorColHeading = isSecondary ? "Skills" : "Psychomotor Skills";

  const getPhotoSrc = (photo) => {
    if (!photo) return null;
    return photo.startsWith('data:') ? photo : `http://localhost:5000${photo}`;
  };

  const [localRemarks, setLocalRemarks] = useState(data.remarks || {});
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const reportRef = React.useRef(null);
  
  // Term Average score
  const activeTermAverage = grades && grades.length > 0 
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / grades.length).toFixed(1)
    : '0.0';

  useEffect(() => {
    const shouldGenerateAi = settings?.remark_generation_mode === 'ai' && !data.remarks?.is_ai_generated;
    
    if (shouldGenerateAi) {
      const generateMissingRemarks = async () => {
        setIsGeneratingAi(true);
        try {
          const perfSummary = `Student Name: ${student.full_name}, Term Average: ${activeTermAverage}%, Total Subjects: ${grades?.length || 0}. Please provide a constructive remark based on this performance.`;
          
          // Call generation for Teacher
          const tRes = await api.generateAIRemark({
            student_id: student.id,
            term: term,
            academic_year: academic_year,
            performance_summary: perfSummary,
            type: 'teacher'
          });
          
          if (tRes && tRes.remark) {
            setLocalRemarks(prev => ({...prev, class_teacher_remark: tRes.remark.class_teacher_remark, is_ai_generated: 1}));
          }

          // Call generation for Principal
          const pRes = await api.generateAIRemark({
            student_id: student.id,
            term: term,
            academic_year: academic_year,
            performance_summary: perfSummary,
            type: 'principal'
          });
          
          if (pRes && pRes.remark) {
            setLocalRemarks(prev => ({...prev, principal_remark: pRes.remark.principal_remark, is_ai_generated: 1}));
          }

        } catch (err) {
          console.error("Failed to generate AI remarks dynamically:", err);
        } finally {
          setIsGeneratingAi(false);
        }
      };

      generateMissingRemarks();
    }
  }, [settings?.remark_generation_mode, data.remarks, student.id, term, academic_year, activeTermAverage, student.full_name, grades?.length]);

  const handleExportPDF = () => {
    const element = reportRef.current;
    if (!element) return;
    
    const opt = {
      margin:       0.2,
      filename:     `${student?.admission_number || 'student'}_report.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const is3rdTerm = term === '3rd Term';
  const classTier = (student?.tier || 'jss').toLowerCase();
    const isPrimary = classTier.includes('primary');

  // Term Grand Total
  const activeTermGrandTotal = grades && grades.length > 0 
    ? grades.reduce((sum, g) => sum + (g.total_score || 0), 0)
    : 0;

  // Annual Cumulative average for 3rd Term
  const overallCumAverage = is3rdTerm && grades && grades.length > 0
    ? (grades.reduce((sum, g) => sum + parseFloat(g.cum_average || 0), 0) / grades.length).toFixed(1)
    : '0.0';

  const schoolName = settings?.landing_school_name || 'Jere Model Academy';
  const schoolTagline = settings?.landing_tagline || 'KADUNA STATE, NIGERIA';
  const schoolAddress = settings?.landing_address || 'Jere Kagarko LGA, Kaduna State.';

  const showPosition = settings ? (parseInt(settings.result_show_position) !== 0) : true;
  const showAverage = settings ? (parseInt(settings.result_show_average) !== 0) : true;

  const getGradeStyle = (grade) => {
    switch (grade) {
      case 'A': return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
      case 'B': return { bg: '#e0f2fe', color: '#075985', border: '#7dd3fc' };
      case 'C': return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a' };
      case 'D': return { bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
      default:  return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    }
  };
  const getGradeBadgeStyle = getGradeStyle;

  const getOrdinalSuffix = (i) => {
    if (!i) return '';
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const getRemark = (gradeLetter) => {
    switch (gradeLetter) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Credit';
      case 'D': return 'Pass';
      default:  return 'Fail';
    }
  };

  const modalContent = (
    <div className={isBulk ? "bulk-card-wrapper" : "modal-overlay"}>
      <div className={isBulk ? "bulk-card-inner" : "modal-content glass-panel"} style={isBulk ? { backgroundColor: '#fff', color: '#000', padding: '0px' } : { maxWidth: '940px', backgroundColor: '#fff', color: '#000', padding: '24px' }}>
        
        {/* Navigation / Action bar (Hidden in bulk printing loop to avoid duplicate header bars) */}
        {!isBulk && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }} className="no-print">
            <button className="btn btn-secondary" onClick={onClose || (() => window.history.back())} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #ccc', padding: '8px 16px', fontSize: '0.85rem' }}>
              <ArrowLeft size={16} />
              <span>{closeLabel ? closeLabel : onClose ? 'Back to Results' : 'Back to Dashboard'}</span>
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="badge badge-success" style={{ padding: '6px 12px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} />
                {isPrimary ? 'Primary Template' : 'Secondary Template'}
              </span>

              <button className="btn btn-secondary" onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontWeight: 'bold', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }} title="Download as PDF">
                <Download size={16} />
                <span>Export to PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* PRINTABLE REPORT CARD CONTAINER */}
        <div className="modern-report-card print-area" ref={reportRef}>
          
          {/* HEADER BANNER */}
          <div className="m-header">
            <div className="m-header-brand">
              {settings?.school_logo_url ? (
                <img src={settings?.school_logo_url} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', border: '3px solid rgba(255,255,255,0.2)', backgroundColor: '#ffffff', padding: '6px' }} />
              ) : (
                <div className="m-logo-box">JMA</div>
              )}
              <div>
                <h1 className="m-school-title">{schoolName}</h1>
                <p className="m-school-subtitle">{schoolTagline}</p>
                <p className="m-school-address">{schoolAddress}</p>
              </div>
            </div>
            <div className="m-report-badge">
              <div className="m-badge-title">OFFICIAL REPORT CARD</div>
              <div className="m-badge-session">{term} · {academic_year}</div>
            </div>
          </div>

          {/* STUDENT BIODATA GRID */}
          <div className="m-biodata-grid">
            <div className="m-bio-details">
              <div className="m-bio-field"><span>Student Name:</span> <strong>{student.full_name}</strong></div>
              <div className="m-bio-field"><span>Admission No:</span> <code>{student.admission_number}</code></div>
              <div className="m-bio-field"><span>Class Arm:</span> <strong>{student.class_name || 'N/A'}</strong></div>
              <div className="m-bio-field"><span>Gender / Sex:</span> <span>{student.sex || 'N/A'}</span></div>
              <div className="m-bio-field"><span>School Year:</span> <span>{academic_year}</span></div>
              <div className="m-bio-field"><span>School Term:</span> <span>{term}</span></div>
            </div>

            <div className="m-photo-frame">
              {student.passport_photo ? (
                <img src={getPhotoSrc(student.passport_photo)} alt="Passport" />
              ) : (
                <div className="m-photo-placeholder">STUDENT PHOTO</div>
              )}
            </div>
          </div>

          {/* ACADEMIC MARKS MATRIX */}
            <div className="m-table-wrapper">
              <table className="m-matrix-table">
                <thead>
                  {is3rdTerm ? (
                    <tr>
                      <th style={{ textAlign: 'left' }}>Subject (s)</th>
                      {(!settings?.max_ca_count || settings.max_ca_count >= 1) && <th>{settings?.ca1_name || 'CA 1'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 2) && <th>{settings?.ca2_name || 'CA 2'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 3) && <th>{settings?.ca3_name || 'CA 3'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 4) && <th>{settings?.ca4_name || 'CA 4'} (10)</th>}
                      <th>{settings?.exam_name || 'Exam'} (60)</th>
                      <th>3rd Term Total (100)</th>
                      <th>1st Term (100)</th>
                      <th>2nd Term (100)</th>
                      <th>Cumm Avg</th>
                      {showPosition && <th>Subj. Pos</th>}
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ textAlign: 'left' }}>Subject (s)</th>
                      {(!settings?.max_ca_count || settings.max_ca_count >= 1) && <th>{settings?.ca1_name || 'CA 1'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 2) && <th>{settings?.ca2_name || 'CA 2'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 3) && <th>{settings?.ca3_name || 'CA 3'} (10)</th>}
                      {(!settings?.max_ca_count || settings.max_ca_count >= 4) && <th>{settings?.ca4_name || 'CA 4'} (10)</th>}
                      <th>{settings?.exam_name || 'Exam'} (60)</th>
                      <th>Total Score (100)</th>
                      {showPosition && <th>Subj. Pos</th>}
                      <th>Grade</th>
                      <th>Remark</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(!grades || grades.length === 0) ? (
                    <tr>
                      <td colSpan={showPosition ? 10 : 9} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No grade entries submitted for this term.
                      </td>
                    </tr>
                  ) : (
                    grades.map((g, idx) => {
                      const caTotal = (g.ca1 || 0) + (g.ca2 || 0) + (g.ca3 || 0) + (g.ca4 || 0);
                      const badgeStyle = getGradeBadgeStyle(is3rdTerm ? g.cum_grade : g.grade_letter);

                      if (is3rdTerm) {
                        return (
                          <tr key={idx}>
                            <td className="subject-name">{g.subject_name}</td>
                            {(!settings?.max_ca_count || settings.max_ca_count >= 1) && <td>{g.ca1 ?? 0}</td>}
                            {(!settings?.max_ca_count || settings.max_ca_count >= 2) && <td>{g.ca2 ?? 0}</td>}
                            {(!settings?.max_ca_count || settings.max_ca_count >= 3) && <td>{g.ca3 ?? 0}</td>}
                            {(!settings?.max_ca_count || settings.max_ca_count >= 4) && <td>{g.ca4 ?? 0}</td>}
                            <td>{g.exam_score ?? 0}</td>
                            <td style={{ fontWeight: 'bold' }}>{g.total_score}</td>
                            <td>{g.term1_total}</td>
                            <td>{g.term2_total}</td>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>{g.cum_average}%</td>
                            {showPosition && <td style={{ fontWeight: 'bold' }}>{g.subject_position ? `${g.subject_position}${getOrdinalSuffix(g.subject_position)}` : '-'}</td>}
                            <td>
                              <span className="m-grade-chip" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}>
                                {g.cum_grade}
                              </span>
                            </td>
                            <td className="remark-cell">{getRemark(g.cum_grade)}</td>
                          </tr>
                        );
                      } else {
                        return (
                          <tr key={idx}>
                            <td className="subject-name">{g.subject_name}</td>
                            <td>{g.ca1 ?? 0}</td>
                            <td>{g.ca2 ?? 0}</td>
                            <td>{g.ca3 ?? 0}</td>
                            <td>{g.ca4 ?? 0}</td>
                            <td>{g.exam_score ?? 0}</td>
                            <td style={{ fontWeight: 'bold' }}>{g.total_score ?? 0}</td>
                            {showPosition && <td style={{ fontWeight: 'bold' }}>{g.subject_position ? `${g.subject_position}${getOrdinalSuffix(g.subject_position)}` : '-'}</td>}
                            <td>
                              <span className="m-grade-chip" style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color, borderColor: badgeStyle.border }}>
                                {g.grade_letter}
                              </span>
                            </td>
                            <td className="remark-cell">{getRemark(g.grade_letter)}</td>
                          </tr>
                        );
                      }
                    })
                  )}
                </tbody>
              </table>
            </div>

          {/* ACADEMIC SUMMARY & ATTENDANCE BOX */}
          <div className="m-summary-grid">
            <div className="m-summary-card">
              <h4>Academic Performance Summary</h4>
              <div className="m-summary-rows">
                <div><span>Total Subjects Taken:</span> <strong>{grades?.length || 0}</strong></div>
                <div><span>Total Score:</span> <strong>{activeTermGrandTotal}</strong></div>
                <div>
                  <span>{is3rdTerm ? 'Annual Cumulative Average:' : 'Term Average Score:'}</span>
                  <strong style={{ fontSize: '1.05rem', color: '#1d4ed8' }}>
                    {is3rdTerm ? `${overallCumAverage}%` : `${activeTermAverage}%`}
                  </strong>
                </div>
                {showPosition && position && (
                  <div><span>Class Rank / Position:</span> <strong>{position} out of {total_students}</strong></div>
                )}
                {showAverage && class_average && (
                  <div><span>Class Overall Average:</span> <strong>{parseFloat(class_average).toFixed(1)}%</strong></div>
                )}
                <div><span>Highest Score in Class:</span> <span>{parseFloat(data.highest_average || 0).toFixed(1)}%</span></div>
                <div><span>Lowest Score in Class:</span> <span>{parseFloat(data.lowest_average || 0).toFixed(1)}%</span></div>
                {is3rdTerm && (
                  <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                    <span>Promotion Status:</span>
                    <strong style={{ textTransform: 'uppercase', color: parseFloat(overallCumAverage) >= 50 ? '#059669' : '#dc2626' }}>
                      {parseFloat(overallCumAverage) >= 50 ? 'Promoted to Next Class 🎓' : parseFloat(overallCumAverage) >= 40 ? 'Promoted on Trial' : 'Repeat Class'}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="m-summary-card">
              <h4>Attendance & Conduct Record</h4>
              <div className="m-summary-rows">
                <div><span>Days School Opened:</span> <strong>{attendance?.total || 0} Days</strong></div>
                <div><span>Days Present:</span> <strong style={{ color: '#059669' }}>{attendance?.present || 0} Days</strong></div>
                <div><span>Days Absent:</span> <strong style={{ color: '#dc2626' }}>{attendance?.absent || 0} Days</strong></div>
                <div>
                  <span>Attendance Percentage:</span>
                  <strong>
                    {attendance?.total > 0 ? `${((attendance.present / attendance.total) * 100).toFixed(1)}%` : '100%'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* AFFECTIVE & PSYCHOMOTOR DOMAINS GRID */}
          <div className="m-behavior-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>
                {behaviorMainHeading}
              </h4>
              <div style={{ display: 'flex', gap: '10px', fontSize: '0.65rem', color: '#475569', backgroundColor: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#1e40af' }}>KEY:</strong>
                <span><strong>5</strong> – Excellent</span>
                <span><strong>4</strong> – High</span>
                <span><strong>3</strong> – Acceptable</span>
                <span><strong>2</strong> – Developing</span>
                <span><strong>1</strong> – Needs Attention</span>
              </div>
            </div>

            <div className="m-behavior-grid" style={{ gridTemplateColumns: isSecondary ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)' }}>
              {(() => {
                const expectedSection = isSecondary ? 'secondary' : 'primary';
                const affectiveSkills = Array.isArray(behavioral)
                  ? behavioral.filter(b => 
                      (b.category || '').toLowerCase() === 'affective' &&
                      (!b.target_section || b.target_section.toLowerCase() === 'all' || b.target_section.toLowerCase() === expectedSection)
                    )
                  : [];

                const hasDynamicSkills = Array.isArray(behavioral) && behavioral.length > 0;
                const displayList = hasDynamicSkills
                  ? affectiveSkills.map(b => ({ name: b.name, val: b.rating ?? 0 }))
                  : (isSecondary ? [] : [
                      { name: 'Punctuality', val: behavioral?.punctuality ?? 0 },
                      { name: 'Neatness & Dressing', val: behavioral?.neatness ?? 0 },
                      { name: 'Honesty & Integrity', val: behavioral?.honesty ?? 0 },
                      { name: 'Self Control & Discipline', val: behavioral?.self_control ?? 0 },
                      { name: 'Peer Relationship', val: behavioral?.peer_relationship ?? 0 }
                    ]);

                let col1, col2, col3;
                if (isSecondary) {
                  const itemsPerCol = Math.ceil(displayList.length / 3);
                  col1 = displayList.slice(0, itemsPerCol);
                  col2 = displayList.slice(itemsPerCol, itemsPerCol * 2);
                  col3 = displayList.slice(itemsPerCol * 2);
                } else {
                  const midIndex = Math.ceil(displayList.length / 2);
                  col1 = displayList.slice(0, midIndex);
                  col2 = displayList.slice(midIndex);
                  col3 = [];
                }

                return (
                  <>
                    <div className="m-behavior-col">
                      <div className="m-behavior-header">{affectiveColHeading}</div>
                      {col1.map((item, idx) => (
                        <div key={idx} className="m-behavior-row">
                          <span>{item.name}</span>
                          <strong>{item.val}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="m-behavior-col">
                      <div className="m-behavior-header">{affectiveColHeading}</div>
                      {col2.map((item, idx) => (
                        <div key={idx} className="m-behavior-row">
                          <span>{item.name}</span>
                          <strong>{item.val}</strong>
                        </div>
                      ))}
                    </div>
                    {isSecondary && (
                      <div className="m-behavior-col">
                        <div className="m-behavior-header">{affectiveColHeading}</div>
                        {col3.map((item, idx) => (
                          <div key={idx} className="m-behavior-row">
                            <span>{item.name}</span>
                            <strong>{item.val}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {(() => {
                const expectedSection = isSecondary ? 'secondary' : 'primary';
                const psychomotorSkills = Array.isArray(behavioral)
                  ? behavioral.filter(b => 
                      (b.category || '').toLowerCase() === 'psychomotor' &&
                      (!b.target_section || b.target_section.toLowerCase() === 'all' || b.target_section.toLowerCase() === expectedSection)
                    )
                  : [];

                const hasDynamicSkills = Array.isArray(behavioral) && behavioral.length > 0;
                const displayList = hasDynamicSkills
                  ? psychomotorSkills.map(b => ({ name: b.name, val: b.rating ?? 0 }))
                  : (isSecondary ? [] : [
                      { name: 'Sports & Games', val: behavioral?.sports ?? 0 },
                      { name: 'Craft & Manual Skills', val: behavioral?.manual_skills ?? 0 },
                      { name: 'Verbal Fluency', val: behavioral?.verbal_fluency ?? 0 },
                      { name: 'Musical Skills', val: behavioral?.musical_skills ?? 0 },
                      { name: 'Handwriting & Neatness', val: behavioral?.handwriting ?? 0 }
                    ]);

                const midIndex = Math.ceil(displayList.length / 2);
                const col3 = displayList.slice(0, midIndex);
                const col4 = displayList.slice(midIndex);

                return (
                  <>
                    <div className="m-behavior-col">
                      <div className="m-behavior-header">{psychomotorColHeading}</div>
                      {col3.map((item, idx) => (
                        <div key={idx} className="m-behavior-row">
                          <span>{item.name}</span>
                          <strong>{item.val}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="m-behavior-col">
                      <div className="m-behavior-header">{psychomotorColHeading}</div>
                      {col4.map((item, idx) => (
                        <div key={idx} className="m-behavior-row">
                          <span>{item.name}</span>
                          <strong>{item.val}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* OFFICIAL REMARKS & SIGNATURE STAMPS */}
          <div className="m-remarks-block">
            <div className="m-remark-row">
              <div className="m-remark-label">Class Teacher's Remark:</div>
              <div className="m-remark-text">
                {isGeneratingAi ? (
                  <span style={{ color: '#0ea5e9', fontStyle: 'italic' }}>Generating AI Remark...</span>
                ) : (
                  localRemarks?.class_teacher_remark || (parseFloat(is3rdTerm ? overallCumAverage : activeTermAverage) >= 50 
                    ? 'A very good result. Keep it up.' 
                    : 'You need to work harder next term.')
                )}
              </div>
              <div className="m-sign-box" style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                {student.form_master_signature ? (
                  <img src={student.form_master_signature} alt="Form Teacher Signature" style={{ height: '38px', objectFit: 'contain', marginBottom: '2px', backgroundColor: '#fff', borderBottom: '1px solid #64748b' }} />
                ) : (
                  <div style={{ height: '24px', borderBottom: '1px dashed #cbd5e1', width: '100%', marginBottom: '2px' }}></div>
                )}
                <span>Sign: <strong>{student.form_master_name || 'Form Teacher'}</strong></span>
              </div>
            </div>

            <div className="m-remark-row">
              <div className="m-remark-label">Principal / Headmaster Note:</div>
              <div className="m-remark-text">
                {isGeneratingAi ? (
                  <span style={{ color: '#0ea5e9', fontStyle: 'italic' }}>Generating AI Remark...</span>
                ) : (
                  localRemarks?.principal_remark || (parseFloat(is3rdTerm ? overallCumAverage : activeTermAverage) >= 40
                    ? 'Good performance. Keep up the hard work in the coming session.'
                    : 'Fair result. Parent guidance is recommended.')
                )}
              </div>
              <div className="m-sign-box" style={{ minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                {settings?.principal_signature ? (
                  <img src={settings.principal_signature} alt="Principal Signature" style={{ height: '38px', objectFit: 'contain', marginBottom: '2px', backgroundColor: '#fff', borderBottom: '1px solid #64748b' }} />
                ) : (
                  <div style={{ height: '24px', borderBottom: '1px dashed #cbd5e1', width: '100%', marginBottom: '2px' }}></div>
                )}
                <span>Sign: <strong>{settings?.principal_name || 'Principal Stamp (JMA)'}</strong></span>
              </div>
            </div>
          </div>

          {/* FUTURE TERM INFORMATION BAR */}
          <div className="m-footer-bar">
            <div>Unpaid Balance: <strong>₦{parseFloat(student.unpaid_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
            <div>Next Term Fee: <strong>{data.next_term_fee || 'Not Set'}</strong></div>
            <div>Next Term Begins: <strong>{settings?.next_term_begins || '13/04/2026'}</strong></div>
            <div>Next Term Ends: <strong>{settings?.next_term_ends || '--/--/----'}</strong></div>
          </div>

        </div>

        {/* EMBEDDED A4 PRINT MEDIA STYLES */}
        <style>{`
          .modern-report-card {
            background: #ffffff;
            color: #0f172a;
            font-family: 'Inter', -apple-system, sans-serif;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 16px;
            font-size: 11px;
            line-height: 1.3;
          }

          .m-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #1e40af;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .m-header-brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .m-logo-box {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: #fff;
            font-weight: 900;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }
          .m-school-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .m-school-subtitle {
            margin: 2px 0 0 0;
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
          }
          .m-school-address {
            margin: 1px 0 0 0;
            font-size: 0.72rem;
            color: #64748b;
          }
          .m-report-badge {
            text-align: right;
            border-left: 2px solid #e2e8f0;
            padding-left: 14px;
          }
          .m-badge-title {
            font-weight: 800;
            font-size: 0.95rem;
            color: #1e40af;
            text-transform: uppercase;
          }
          .m-badge-session {
            font-size: 0.75rem;
            color: #475569;
            font-weight: 600;
          }

          .m-biodata-grid {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 12px;
          }
          .m-bio-details {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 16px;
          }
          .m-bio-field {
            font-size: 0.78rem;
          }
          .m-bio-field span {
            color: #64748b;
            margin-right: 4px;
          }
          .m-photo-frame {
            width: 80px;
            height: 90px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            overflow: hidden;
            background: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .m-photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .m-photo-placeholder {
            font-size: 0.65rem;
            font-weight: bold;
            color: #94a3b8;
            text-align: center;
          }

          .m-table-wrapper {
            margin-bottom: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
          }
          .m-matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
          }
          .m-matrix-table th {
            background-color: #1e40af;
            color: #ffffff;
            padding: 7px 6px;
            font-weight: 700;
            text-align: center;
            border: 1px solid #1e3a8a;
          }
          .m-matrix-table td {
            padding: 6px 6px;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .m-matrix-table td.subject-name {
            text-align: left;
            font-weight: 600;
            color: #0f172a;
          }
          .m-matrix-table td.remark-cell {
            text-align: left;
            font-style: italic;
            color: #475569;
          }
          .m-grade-chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 0.75rem;
            border: 1px solid transparent;
          }

          .m-summary-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .m-summary-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            background: #fff;
          }
          .m-summary-card h4 {
            margin: 0 0 8px 0;
            font-size: 0.82rem;
            color: #1e40af;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            text-transform: uppercase;
          }
          .m-summary-rows {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 0.76rem;
          }
          .m-summary-rows div {
            display: flex;
            justify-content: space-between;
          }

          .m-behavior-section {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 12px;
            background: #f8fafc;
          }
          .m-behavior-grid {
            display: grid;
            gap: 12px;
          }
          .m-behavior-col {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px;
          }
          .m-behavior-header {
            font-weight: 700;
            font-size: 0.72rem;
            color: #1e40af;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 4px;
          }
          .m-behavior-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.72rem;
            padding: 2px 0;
            border-bottom: 1px dashed #f1f5f9;
          }
          .m-behavior-key {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px;
            font-size: 0.68rem;
            color: #475569;
          }
          .m-key-title {
            font-weight: 800;
            color: #1e40af;
            margin-bottom: 4px;
            text-align: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
          }

          .m-remarks-block {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .m-remark-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.76rem;
          }
          .m-remark-label {
            font-weight: 700;
            min-width: 140px;
            color: #1e293b;
          }
          .m-remark-text {
            flex: 1;
            font-style: italic;
            color: #334155;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 2px;
          }
          .m-sign-box {
            font-size: 0.72rem;
            color: #64748b;
          }
          .m-sign-box span {
            font-family: monospace;
            font-weight: bold;
            color: #0f172a;
            text-decoration: underline;
          }

          .m-footer-bar {
            display: flex;
            justify-content: space-between;
            background: #1e40af;
            color: #fff;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 0.76rem;
            font-weight: 600;
          }

          /* A4 PRINT MEDIA STYLES */
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 8mm;
            }
            body {
              background: #fff !important;
              color: #000 !important;
            }
            .modal-overlay, .modal-content {
              position: static !important;
              max-width: 100% !important;
              padding: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
            .modern-report-card {
              border: 1px solid #000 !important;
              padding: 10px !important;
              font-size: 9.5px !important;
              line-height: 1.2 !important;
              box-shadow: none !important;
              page-break-after: always;
            }
            .m-matrix-table th {
              background-color: #1e40af !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .m-grade-chip {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .m-footer-bar {
              background-color: #1e40af !important;
              color: #ffffff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </div>
  );

  if (isBulk) {
    return modalContent;
  }
  
  return ReactDOM.createPortal(modalContent, document.body);
}
