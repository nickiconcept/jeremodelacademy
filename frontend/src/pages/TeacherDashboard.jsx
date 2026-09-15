import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ClassBroadsheet from '../components/ClassBroadsheet';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';

import { useGlobalUI } from '../contexts/GlobalUIContext';
import { ArrowLeft, Pencil, CheckSquare, BarChart2, FileSpreadsheet, FileText, Save, Search, Users, Award, CheckCircle, XCircle, Plus, Lock, Printer, BookOpen, Clock, UploadCloud, CircleCheck, Hourglass, Eye, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeacherDashboard({ user, settings, activeTab, subTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  const attendanceReportRef = React.useRef(null);
  const schemeReportRef = React.useRef(null);

  const handleDownloadAttendancePDF = () => {
    const element = attendanceReportRef.current;
    if (!element) return;
    const opt = {
      margin: 0.3,
      filename: `Attendance_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleDownloadSchemePDF = () => {
    const element = schemeReportRef.current;
    if (!element) return;
    const opt = {
      margin: 0.3,
      filename: `Scheme_Of_Work.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };
  
  // Teacher metadata
  const [assignments, setAssignments] = useState({ subjects: [], formClass: null });
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [resultProgress, setResultProgress] = useState(null);
  const [showUploadDetails, setShowUploadDetails] = useState(false);
  
  // Marks Entry States
  const [selectedClassSubject, setSelectedClassSubject] = useState(null); // {class_id, class_name, subject_id, subject_name}
  const [studentsGrades, setStudentsGrades] = useState([]);
  
  // Attendance States
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [attendanceReportStartDate, setAttendanceReportStartDate] = useState('');
  const [attendanceReportEndDate, setAttendanceReportEndDate] = useState('');
  const [attendanceReportView, setAttendanceReportView] = useState('summary');
  const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState('take'); // 'take' or 'report'

  // Broadsheet States
  const [broadsheetData, setBroadsheetData] = useState(null);

  // Behavioral / Psychomotor States
  const [skillsList, setSkillsList] = useState([]);
  const [behavioralStudents, setBehavioralStudents] = useState({ rated: [], unrated: [] });
  const [evaluatingStudent, setEvaluatingStudent] = useState(null);
  const [skillRatings, setSkillRatings] = useState({});

  // Search & Filter States
  const [gradesSearch, setGradesSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [behavioralSearch, setBehavioralSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  // My Students States
  const [formClassStudents, setFormClassStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    surname: '', first_name: '', other_names: '', full_name: '', class_id: '',
    date_of_birth: '', sex: 'Male', religion: 'Islam',
    address_residence: '', last_school_attended: '', passport_photo: '',
    local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
    parent_name: '', parent_address: '', parent_phone: '', has_offline_debt: false, offline_debt_amount: ''
  });

  // Status banners
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      loadTeacherInfo(),
      loadResultProgress()
    ]).finally(() => {
      setIsInitialLoad(false);
    });
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
      if (activeTab === 'attendance' && assignments.formClass) {
        fetchAttendance(assignments.formClass.id, attendanceDate);
      }
      if (activeTab === 'broadsheet' && assignments.formClass) {
        fetchBroadsheet(assignments.formClass.id);
      }
      if (activeTab === 'behavioral' && assignments.formClass) {
        loadBehavioralRoster();
      }
      if (activeTab === 'schemes' && assignments.subjects.length > 0 && teacherSchemeAssignIdx === '') {
        setTeacherSchemeAssignIdx(0);
      }
      if (activeTab === 'students' && assignments.formClass) {
        loadFormClassStudents(assignments.formClass.id);
      }
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }

    if (subTab && activeTab === 'attendance') {
      setActiveAttendanceSubTab(subTab);
    }
  }, [activeTab, subTab, assignments.formClass, assignments.subjects]);

  useEffect(() => {
    if (activeSubTab === 'attendance' && activeAttendanceSubTab === 'report' && assignments.formClass) {
      fetchAttendanceReport();
    }
  }, [activeSubTab, activeAttendanceSubTab, attendanceReportStartDate, attendanceReportEndDate, attendanceReportView, assignments.formClass]);

  const loadResultProgress = async () => {
    try {
      const data = await api.getTeacherResultProgress();
      setResultProgress(data);
    } catch (err) {
      console.error('Failed to load result progress:', err);
    }
  };

  const loadTeacherInfo = async () => {
    try {
      const info = await api.getTeacherAssignments();
      setAssignments(info);
      if (info.formClass) {
        // Automatically fetch broadsheet and attendance for form class initially
        fetchBroadsheet(info.formClass.id);
        fetchAttendance(info.formClass.id, attendanceDate);
      }
    } catch (err) {
      setErrorMsg('Failed to sync teacher assignments: ' + err.message);
    }
  };

  // ==========================================
  // MY STUDENTS LOGIC
  // ==========================================
  const loadFormClassStudents = async (classId) => {
    if (!classId) return;
    setStudentsLoading(true);
    try {
      const allStudents = await api.getStudents();
      const classStudents = allStudents.filter(s => s.class_id === classId);
      setFormClassStudents(classStudents);
    } catch (err) {
      setErrorMsg('Failed to load class students: ' + err.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!assignments.formClass) return;
    setNotify('');
    setErrorMsg('');
    try {
      const payload = { ...studentForm, class_id: assignments.formClass.id };
      const res = await api.registerStudent(payload);
      setNotify(`Student registered! Admission No: ${res.admission_number}`);
      setShowStudentModal(false);
      setStudentForm({
        surname: '', first_name: '', other_names: '', full_name: '', class_id: '',
        date_of_birth: '', sex: 'Male', religion: 'Islam',
        address_residence: '', last_school_attended: '', passport_photo: '',
        local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
        parent_name: '', parent_address: '', parent_phone: '', has_offline_debt: false, offline_debt_amount: ''
      });
      loadFormClassStudents(assignments.formClass.id);
    } catch (err) {
      setErrorMsg('Failed to register student: ' + err.message);
    }
  };

  // ==========================================
  // MARKS ENTRY LOGIC
  // ==========================================
  const handleSelectClassSubjectForGrades = async (assign) => {
    setSelectedClassSubject(assign);
    setNotify('');
    setErrorMsg('');
    try {
      const grades = await api.getGradesForEntry(assign.class_id, assign.subject_id, settings.active_term, settings.active_session);
      setStudentsGrades(grades);
      setActiveSubTab('grades');
    } catch (err) {
      setErrorMsg('Failed to load grade book: ' + err.message);
    }
  };

  const handleGradeFieldChange = (studentId, field, value) => {
    if (value !== '') {
      const numVal = parseFloat(value);
      if (['ca1', 'ca2', 'ca3', 'ca4'].includes(field) && numVal > 10) {
        setErrorMsg('CA score cannot exceed 10 marks.');
        return;
      }
      if (field === 'exam_score' && numVal > 60) {
        setErrorMsg('Exam score cannot exceed 60 marks.');
        return;
      }
    }

    setStudentsGrades(prev => prev.map(g => {
      if (g.student_id === studentId) {
        const updated = { ...g, [field]: value };
        
        // Auto-calculate total and grade letter
        const c1 = parseFloat(field === 'ca1' ? value : updated.ca1 || 0);
        const c2 = parseFloat(field === 'ca2' ? value : updated.ca2 || 0);
        const c3 = parseFloat(field === 'ca3' ? value : updated.ca3 || 0);
        const c4 = parseFloat(field === 'ca4' ? value : updated.ca4 || 0);
        const exam = parseFloat(field === 'exam_score' ? value : updated.exam_score || 0);
        
        const total = c1 + c2 + c3 + c4 + exam;
        updated.total_score = total;
        
        // Grade Letter mapping
        if (total >= 75) { updated.grade_letter = 'A'; updated.remark = 'Excellent'; }
        else if (total >= 60) { updated.grade_letter = 'B'; updated.remark = 'Very Good'; }
        else if (total >= 50) { updated.grade_letter = 'C'; updated.remark = 'Good'; }
        else if (total >= 40) { updated.grade_letter = 'D'; updated.remark = 'Pass'; }
        else { updated.grade_letter = 'F'; updated.remark = 'Fail'; }

        return updated;
      }
      return g;
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedClassSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.saveGrades({
        class_id: selectedClassSubject.class_id,
        subject_id: selectedClassSubject.subject_id,
        term: settings.active_term,
        academic_year: settings.active_session,
        grades: studentsGrades
      });
      setNotify('Grades submitted and saved successfully!');
      // Reload broadsheet to keep synchronized
      if (assignments.formClass) fetchBroadsheet(assignments.formClass.id);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // ATTENDANCE LOGIC
  // ==========================================
  const fetchAttendance = async (classId, date) => {
    try {
      const roster = await api.getAttendance(classId, date);
      setAttendanceRoster(roster);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance roster: ' + err.message);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRoster(prev => prev.map(r => r.student_id === studentId ? { ...r, status } : r));
  };

  const handleSaveAttendance = async () => {
    if (!assignments.formClass) return;

    const submitAttendance = async (lat = null, lng = null) => {
      try {
        const records = attendanceRoster.map(r => ({
          student_id: r.student_id,
          status: r.status || 'present'
        }));
        await api.saveAttendance({
          class_id: assignments.formClass.id,
          date: attendanceDate,
          records,
          lat,
          lng
        });
        setNotify(`Attendance successfully registered for ${attendanceDate}!`);
      } catch (err) {
        setErrorMsg(err.message);
      }
    };

    if (navigator.geolocation) {
      setNotify("Verifying your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          submitAttendance(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // If user denies or error occurs, try submitting anyway.
          // The backend will reject it if geofencing is strictly configured.
          submitAttendance(null, null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      submitAttendance(null, null);
    }
  };

  const fetchAttendanceReport = async () => {
    if (!assignments.formClass) return;
    try {
      const data = await api.getAttendanceReport(assignments.formClass.id, attendanceReportStartDate, attendanceReportEndDate, attendanceReportView);
      setAttendanceReport(data);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance report: ' + err.message);
    }
  };

  // ==========================================
  // BROADSHEET LOGIC
  // ==========================================
  const fetchBroadsheet = async (classId) => {
    try {
      const sheet = await api.getBroadsheet(classId, settings.active_term, settings.active_session);
      setBroadsheetData(sheet);
    } catch (err) {
      setErrorMsg('Failed to sync broadsheet: ' + err.message);
    }
  };

  const loadBehavioralRoster = async () => {
    if (!assignments.formClass) return;
      try {
        // 1. Fetch Skills
        const fetchedSkills = await api.getSkills(assignments.formClass.tier);
        setSkillsList(fetchedSkills);

      // 2. Fetch Rated/Unrated Students
      const data = await api.getSkillsStudents(assignments.formClass.id, settings.active_term, settings.active_session);
      
      const rated = Array.isArray(data) ? data.filter(s => s.status === 'Rated') : [];
      const unrated = Array.isArray(data) ? data.filter(s => s.status === 'Unrated') : [];
      setBehavioralStudents({ rated, unrated });
    } catch (err) {
      setErrorMsg('Failed to load psychomotor data: ' + err.message);
    }
  };

  const handleSelectStudentForEval = async (student) => {
    setEvaluatingStudent(student);
    setNotify('');
    setErrorMsg('');
    try {
      const existing = await api.getStudentSkillsEvaluation(student.id, settings.active_term, settings.active_session);
      const ratingsMap = {};
      existing.forEach(r => { ratingsMap[`${r.skill_id}_${r.category}`] = r.rating; });
      setSkillRatings(ratingsMap);
    } catch (err) {
      setErrorMsg('Failed to fetch existing ratings: ' + err.message);
    }
  };

  const handleSaveSkillEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingStudent) return;
    setNotify('');
    setErrorMsg('');
    
    // Validate all skills have a rating
    for (let skill of skillsList) {
      if (!skillRatings[`${skill.id}_${skill.category}`]) {
        setErrorMsg(`Please select a rating for ${skill.name}`);
        return;
      }
    }

    try {
      const payload = {
        student_id: evaluatingStudent.id,
        term: settings.active_term,
        session: settings.active_session,
        ratings: skillsList.map(skill => ({
          skill_id: skill.id,
          category: skill.category,
          rating: skillRatings[`${skill.id}_${skill.category}`]
        }))
      };
      await api.saveStudentSkillsEvaluation(payload);
      setNotify('Skills evaluation saved successfully!');
      setEvaluatingStudent(null);
      loadBehavioralRoster(); // Reload roster to move student to 'rated'
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // TEACHER SCHEME OF WORK LOGIC
  // ==========================================
  const [teacherSchemeAssignIdx, setTeacherSchemeAssignIdx] = useState('');
  const [teacherSchemeTerm, setTeacherSchemeTerm] = useState('1st Term');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [teacherSchemeWeeks, setTeacherSchemeWeeks] = useState(Array.from({ length: 12 }, (_, i) => ({ week: i + 1, topic: '', objectives: '', id: null })));

  const loadTeacherSchemes = async () => {
    if (teacherSchemeAssignIdx === '') return;
    const assign = assignments.subjects[teacherSchemeAssignIdx];
    if (!assign) return;

    try {
      const data = await api.getSchemes({
        class_id: assign.class_id,
        subject_id: assign.subject_id,
        term: teacherSchemeTerm,
        academic_session: settings?.active_session
      });

      const newWeeks = Array.from({ length: 12 }, (_, i) => {
        const wkNum = i + 1;
        const entry = data.find(item => item.week === wkNum);
        return {
          week: wkNum,
          topic: entry ? entry.topic : '',
          objectives: entry ? entry.objectives || '' : '',
          id: entry ? entry.id : null
        };
      });
      setTeacherSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load schemes of work: ' + err.message);
    }
  };

  const handleTeacherSchemeFieldChange = (weekNum, field, value) => {
    setTeacherSchemeWeeks(prev => prev.map(w => {
      if (w.week === weekNum) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  const handleSaveTeacherSchemeWeek = async (weekObj) => {
    setNotify('');
    setErrorMsg('');
    if (teacherSchemeAssignIdx === '') return;
    const assign = assignments.subjects[teacherSchemeAssignIdx];
    if (!assign) return;

    if (!weekObj.topic) {
      setErrorMsg(`Topic for Week ${weekObj.week} is required to save.`);
      return;
    }

    try {
      await api.saveScheme({
        class_id: assign.class_id,
        subject_id: assign.subject_id,
        term: teacherSchemeTerm,
        week: weekObj.week,
        topic: weekObj.topic,
        objectives: weekObj.objectives
      });
      setNotify(`Successfully saved Week ${weekObj.week} Scheme of Work!`);
      loadTeacherSchemes();
    } catch (err) {
      setErrorMsg(`Failed to save Week ${weekObj.week}: ` + err.message);
    }
  };

  const handleMarkTreated = async (schemeId) => {
    if (!schemeId) return;
    try {
      await api.post('/sow/mark-treated', {
        scheme_of_work_id: schemeId,
        class_id: assignments.subjects[teacherSchemeAssignIdx]?.class_id,
        academic_session: settings?.active_session
      });
      // Update local state to reflect change immediately
      setTeacherSchemeWeeks(prev => prev.map(s =>
        s.id === schemeId
          ? { ...s, progress: { status: 'completed', completed_at: new Date().toISOString() } }
          : s
      ));
      setNotify("Topic marked as successfully treated!");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to mark topic as treated.");
    }
  };



  useEffect(() => {
    if (activeSubTab === 'schemes' && teacherSchemeAssignIdx !== '') {
      loadTeacherSchemes();
    }
  }, [activeSubTab, teacherSchemeAssignIdx, teacherSchemeTerm]);

  if (isInitialLoad) return <LoadingSpinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
      
      {/* Toast Notifications */}
      <Toast message={notify} type="success" onClose={() => setNotify('')} duration={4000} />
      <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} duration={5000} />



      {/* ==========================================
          TAB 1: ASSIGNED SUBJECTS INDEX
          ========================================== */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* RESULT UPLOAD PROGRESS WIDGET */}
          <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>My Assigned Subjects</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Select a subject stream below to open the grading spreadsheet.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {assignments.subjects.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                  You are not currently assigned to teach any subjects.
                </div>
              ) : (
                assignments.subjects.map((assign, idx) => (
                  <button
                    key={idx}
                    className="btn"
                    style={{ 
                      display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', textAlign: 'left', 
                      backgroundColor: '#f8fafc', color: 'var(--text-primary)', border: '1px solid var(--border-color)', 
                      borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    onClick={() => handleSelectClassSubjectForGrades(assign)}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>{assign.class_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{assign.subject_name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', marginTop: 'auto' }}>
                      <Pencil size={14} /> Enter Marks
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Form Master Status</h3>
            </div>
            {assignments.formClass ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary)', padding: '20px', 
                  borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Form Master of</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>{assignments.formClass.name}</div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} style={{ color: 'var(--primary)' }} />
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                  As Form Master, you have access to daily attendance checklists and the complete class broadsheet for academic reviews.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <button className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setActiveSubTab('attendance'); fetchAttendance(assignments.formClass.id, attendanceDate); }}>
                    <CheckSquare size={16} /> Mark Attendance
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }} onClick={() => { setActiveSubTab('broadsheet'); fetchBroadsheet(assignments.formClass.id); }}>
                    <FileSpreadsheet size={16} /> View Class Results
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }} onClick={() => { setActiveSubTab('behavioral'); loadBehavioralRoster(); }}>
                    <Award size={16} /> Evaluate Psychomotor
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid var(--border-color)' }} onClick={() => { setActiveSubTab('remarks'); }}>
                    <Sparkles size={16} /> Manage Remarks
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                You are not currently assigned as a Class Teacher for any class.
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '28px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                  <BarChart2 size={24} style={{ color: 'var(--primary)' }} /> Result Upload Progress
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
                  Marks submission overview for <strong>{resultProgress?.term || 'Current Term'} ({resultProgress?.academic_year || 'Session'})</strong>
                </p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => setShowUploadDetails(!showUploadDetails)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showUploadDetails ? 'Collapse Details' : 'View Details'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '30px', alignItems: 'center' }}>
              {/* Donut Chart */}
              <div style={{ height: '220px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: resultProgress?.summary?.completed || 0, color: '#10b981' },
                        { name: 'In Progress', value: resultProgress?.summary?.in_progress || 0, color: '#f59e0b' },
                        { name: 'Pending', value: resultProgress?.summary?.pending || 0, color: '#ef4444' }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {[
                        { name: 'Completed', value: resultProgress?.summary?.completed || 0, color: '#10b981' },
                        { name: 'In Progress', value: resultProgress?.summary?.in_progress || 0, color: '#f59e0b' },
                        { name: 'Pending', value: resultProgress?.summary?.pending || 0, color: '#ef4444' }
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage */}
                <div style={{ 
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                  textAlign: 'center', pointerEvents: 'none' 
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: resultProgress?.summary?.percentage === 100 ? '#10b981' : 'var(--text-primary)', lineHeight: '1' }}>
                    {resultProgress?.summary?.percentage || 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Done</div>
                </div>
              </div>

              {/* Summary Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}><BookOpen size={16} /> Total Subjects</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e40af' }}>{resultProgress?.summary?.total || 0}</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}><CircleCheck size={16} /> Fully Uploaded</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46' }}>{resultProgress?.summary?.completed || 0}</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}><Hourglass size={16} /> In Progress</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400e' }}>{resultProgress?.summary?.in_progress || 0}</div>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}><Clock size={16} /> Pending Uploads</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#991b1b' }}>{resultProgress?.summary?.pending || 0}</div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
                        {showUploadDetails && resultProgress?.details && resultProgress.details.length > 0 && (
              <div style={{ overflowX: 'auto', marginTop: '10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table className="school-table" style={{ width: '100%', fontSize: '0.9rem', margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '14px' }}>Class Arm</th>
                      <th style={{ padding: '14px' }}>Subject</th>
                      <th style={{ padding: '14px' }}>Progress</th>
                      <th style={{ padding: '14px' }}>Status</th>
                      <th style={{ padding: '14px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultProgress.details.map((item, idx) => (
                      <tr key={idx} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '14px' }}><strong>{item.class_name}</strong></td>
                        <td style={{ padding: '14px' }}>{item.subject_name}</td>
                        <td style={{ padding: '14px', width: '220px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${item.percentage}%`, 
                                height: '100%', 
                                backgroundColor: item.status === 'Completed' ? '#10b981' : item.status === 'In Progress' ? '#f59e0b' : '#ef4444' 
                              }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', minWidth: '40px', color: 'var(--text-secondary)' }}>
                              {item.uploaded_count}/{item.total_students}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                            backgroundColor: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : item.status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.status === 'Completed' ? '#10b981' : item.status === 'In Progress' ? '#d97706' : '#ef4444'
                          }}>
                            {item.status === 'Completed' ? <CircleCheck size={14} /> : item.status === 'In Progress' ? <Hourglass size={14} /> : <Clock size={14} />}
                            {item.status}
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
                            onClick={() => handleSelectClassSubjectForGrades({ class_id: item.class_id, class_name: item.class_name, subject_id: item.subject_id, subject_name: item.subject_name })}
                          >
                            <UploadCloud size={14} style={{ color: 'var(--primary)' }} />
                            {item.status === 'Completed' ? 'View/Edit' : 'Upload Marks'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {activeSubTab === 'remarks' && assignments.formClass && (
        <RemarksManager 
          classId={assignments.formClass.id} 
          term={settings?.active_term} 
          session={settings?.active_session} 
          type="teacher"
          generationMode={settings?.remark_generation_mode || 'manual'}
          onBack={() => setActiveSubTab('overview')} 
        />
      )}

      {/* ==========================================
          TAB 2: GRADES ENTRY SHEET (SPREADSHEET LAYOUT)
          ========================================== */}
      {activeSubTab === 'grades' && !selectedClassSubject && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Pencil size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Enter Marks</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Select a subject below to open the grading spreadsheet.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '600' }}>
              <FileText size={14} /> {assignments.subjects.length} subject{assignments.subjects.length !== 1 ? 's' : ''} assigned
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {assignments.subjects.length === 0 ? (
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', gap: '12px', textAlign: 'center' }}>
                  <FileText size={40} style={{ opacity: 0.3 }} />
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>You are not currently assigned to teach any subjects.</p>
                </div>
              ) : (
                assignments.subjects.map((assign, idx) => (
                  <button
                    key={idx}
                    className="btn"
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', textAlign: 'left', backgroundColor: 'rgba(217,119,6,0.05)', color: 'var(--text-primary)', border: '1.5px solid rgba(217,119,6,0.2)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,119,6,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(217,119,6,0.05)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => handleSelectClassSubjectForGrades(assign)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BookOpen size={18} style={{ color: '#d97706' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{assign.subject_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{assign.class_name}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#d97706' }}>
                      <Pencil size={13} /> Enter Marks →
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'grades' && selectedClassSubject && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                className="btn no-print"
                onClick={() => { setSelectedClassSubject(null); setActiveSubTab('overview'); }}
                style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', transition: 'all 0.2s' }}
                title="Back to overview"
              >←</button>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Pencil size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{selectedClassSubject.subject_name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {selectedClassSubject.class_name} · {settings.active_term} · {settings.active_session}
                </p>
              </div>
            </div>
            {!settings.result_entry_open ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '700', border: '1px dashed rgba(255,255,255,0.3)' }}>
                <Lock size={14} /> Locked by Admin
              </div>
            ) : (
              <button
                className="btn no-print"
                onClick={handleSaveGrades}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1.5px solid rgba(255,255,255,0.5)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              >
                <Save size={16} /> Save Marks
              </button>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            {/* Student Search */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Search student by name or admission no..."
                  value={gradesSearch}
                  onChange={(e) => setGradesSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grade-table-container">
              <table className="grade-entry-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Admission No</th>
                    {(!settings.max_ca_count || settings.max_ca_count >= 1) && <th style={{ width: '90px' }}>{settings.ca1_name || 'CA 1'} (10)</th>}
                    {(!settings.max_ca_count || settings.max_ca_count >= 2) && <th style={{ width: '90px' }}>{settings.ca2_name || 'CA 2'} (10)</th>}
                    {(!settings.max_ca_count || settings.max_ca_count >= 3) && <th style={{ width: '90px' }}>{settings.ca3_name || 'CA 3'} (10)</th>}
                    {(!settings.max_ca_count || settings.max_ca_count >= 4) && <th style={{ width: '90px' }}>{settings.ca4_name || 'CA 4'} (10)</th>}
                    <th style={{ width: '110px' }}>{settings.exam_name || 'Exam'} (60)</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Total (100)</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsGrades.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students registered in this class.</td>
                    </tr>
                  ) : (
                    studentsGrades.filter(g =>
                      g.full_name.toLowerCase().includes(gradesSearch.toLowerCase()) ||
                      g.admission_number.toLowerCase().includes(gradesSearch.toLowerCase())
                    ).map((g, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{g.full_name}</td>
                        <td><code>{g.admission_number}</code></td>
                        {(!settings.max_ca_count || settings.max_ca_count >= 1) && (
                          <td>
                            <input type="number" min="0" max="10" className="grade-input" value={g.ca1 ?? 0} onChange={(e) => handleGradeFieldChange(g.student_id, 'ca1', e.target.value)} disabled={!settings.result_entry_open} />
                          </td>
                        )}
                        {(!settings.max_ca_count || settings.max_ca_count >= 2) && (
                          <td>
                            <input type="number" min="0" max="10" className="grade-input" value={g.ca2 ?? 0} onChange={(e) => handleGradeFieldChange(g.student_id, 'ca2', e.target.value)} disabled={!settings.result_entry_open} />
                          </td>
                        )}
                        {(!settings.max_ca_count || settings.max_ca_count >= 3) && (
                          <td>
                            <input type="number" min="0" max="10" className="grade-input" value={g.ca3 ?? 0} onChange={(e) => handleGradeFieldChange(g.student_id, 'ca3', e.target.value)} disabled={!settings.result_entry_open} />
                          </td>
                        )}
                        {(!settings.max_ca_count || settings.max_ca_count >= 4) && (
                          <td>
                            <input type="number" min="0" max="10" className="grade-input" value={g.ca4 ?? 0} onChange={(e) => handleGradeFieldChange(g.student_id, 'ca4', e.target.value)} disabled={!settings.result_entry_open} />
                          </td>
                        )}
                        <td>
                          <input type="number" min="0" max="60" className="grade-input" value={g.exam_score ?? 0} onChange={(e) => handleGradeFieldChange(g.student_id, 'exam_score', e.target.value)} disabled={!settings.result_entry_open} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="grade-total-col">{g.total_score ?? 0}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`grade-badge ${g.grade_letter === 'F' ? 'grade-badge-fail' : 'grade-badge-pass'}`}>{g.grade_letter || '-'}</span>
                        </td>
                        <td>
                          <input type="text" className="grade-remark-input" value={g.remark || ''} onChange={(e) => handleGradeFieldChange(g.student_id, 'remark', e.target.value)} disabled={!settings.result_entry_open} placeholder="Auto remark..." />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: CLASS ATTENDANCE SHEET (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'attendance' && !assignments.formClass && (
        <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Class Attendance</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>You must be assigned as a Form Master to manage class attendance.</p>
          </div>
        </div>
      )}
      {activeSubTab === 'attendance' && assignments.formClass && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <CheckSquare size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Class Attendance: {assignments.formClass.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Track daily attendance and generate summary reports.</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
          {/* Sub Navigation for Attendance */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }} className="no-print">
            <button
              onClick={() => setActiveAttendanceSubTab('take')}
              style={{
                padding: '8px 18px',
                background: activeAttendanceSubTab === 'take' ? 'var(--primary)' : 'transparent',
                border: '1px solid ' + (activeAttendanceSubTab === 'take' ? 'var(--primary)' : 'var(--border-color)'),
                borderRadius: '20px',
                color: activeAttendanceSubTab === 'take' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.88rem',
                transition: 'all 0.2s'
              }}
            >
              Take Attendance
            </button>
            <button
              onClick={() => setActiveAttendanceSubTab('report')}
              style={{
                padding: '8px 18px',
                background: activeAttendanceSubTab === 'report' ? 'var(--primary)' : 'transparent',
                border: '1px solid ' + (activeAttendanceSubTab === 'report' ? 'var(--primary)' : 'var(--border-color)'),
                borderRadius: '20px',
                color: activeAttendanceSubTab === 'report' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.88rem',
                transition: 'all 0.2s'
              }}
            >
              Attendance Report
            </button>
          </div>

          {activeAttendanceSubTab === 'take' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Select the date and mark each student's roll call status.</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="no-print">
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '170px' }}
                    value={attendanceDate}
                    onChange={(e) => { setAttendanceDate(e.target.value); fetchAttendance(assignments.formClass.id, e.target.value); }}
                    min={!settings.allow_past_attendance ? new Date().toISOString().split('T')[0] : undefined}
                    max={!settings.allow_past_attendance ? new Date().toISOString().split('T')[0] : undefined}
                  />
                  <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleSaveAttendance}><Save size={15} /> Save Attendance</button>
                </div>
              </div>

              {/* Attendance Search */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }} className="no-print">
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '300px', padding: '10px' }}
                  placeholder="Search student by name..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                />
              </div>

              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table className="school-table" style={{ width: '100%', margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '14px' }}>Student Name</th>
                      <th style={{ padding: '14px' }}>Admission Number</th>
                      <th style={{ padding: '14px' }}>Roll Call Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRoster.filter(r =>
                      r.full_name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
                      r.admission_number.toLowerCase().includes(attendanceSearch.toLowerCase())
                    ).map((r, idx) => (
                      <tr key={idx} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ fontWeight: '600', padding: '14px' }}>{r.full_name}</td>
                        <td style={{ padding: '14px' }}><code style={{ backgroundColor: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{r.admission_number}</code></td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'present')}
                              className="btn"
                              style={{
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'present' || !r.status ? '#10b981' : 'transparent',
                                color: r.status === 'present' || !r.status ? '#fff' : '#10b981',
                                border: '1.5px solid #10b981',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              ✓ Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'absent')}
                              className="btn"
                              style={{
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'absent' ? '#ef4444' : 'transparent',
                                color: r.status === 'absent' ? '#fff' : '#ef4444',
                                border: '1.5px solid #ef4444',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              ✕ Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(r.student_id, 'late')}
                              className="btn"
                              style={{
                                padding: '6px 16px',
                                fontSize: '0.8rem',
                                backgroundColor: r.status === 'late' ? '#f59e0b' : 'transparent',
                                color: r.status === 'late' ? '#fff' : '#f59e0b',
                                border: '1.5px solid #f59e0b',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              ⏰ Late
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Select a date range to view student attendance summary.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }} className="no-print">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>From:</span>
                    <input type="date" className="form-control" style={{ width: '150px', padding: '6px' }} value={attendanceReportStartDate} onChange={(e) => setAttendanceReportStartDate(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>To:</span>
                    <input type="date" className="form-control" style={{ width: '150px', padding: '6px' }} value={attendanceReportEndDate} onChange={(e) => setAttendanceReportEndDate(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>View:</span>
                    <select className="form-control" style={{ width: '120px', padding: '6px' }} value={attendanceReportView} onChange={(e) => setAttendanceReportView(e.target.value)}>
                      <option value="summary">Summary</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <button className="btn btn-secondary no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDownloadAttendancePDF}><Download size={15} /> Download PDF</button>
                </div>
              </div>
              <div ref={attendanceReportRef} style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: '#fff', padding: '10px' }}>
                <table className="school-table" style={{ width: '100%', margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '14px' }}>Student Name</th>
                      <th style={{ padding: '14px' }}>Admission Number</th>
                      {attendanceReportView === 'monthly' && <th style={{ padding: '14px' }}>Month</th>}
                      {attendanceReportView === 'weekdays' ? (
                        <>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Mon</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Tue</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Wed</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Thu</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Fri</th>
                        </>
                      ) : (
                        <>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Present</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Absent</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Late</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Total Days</th>
                          <th style={{ textAlign: 'center', padding: '14px' }}>Attendance %</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceReport.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No attendance records found for this period.</td>
                      </tr>
                    ) : (
                      attendanceReport.map((r, idx) => {
                        const ratio = r.total_days > 0 ? Math.round((r.present_count / r.total_days) * 100) : 0;
                        return (
                          <tr key={idx} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ fontWeight: '600', padding: '14px' }}>{r.full_name}</td>
                            <td style={{ padding: '14px' }}><code style={{ backgroundColor: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{r.admission_number}</code></td>
                            {attendanceReportView === 'monthly' && <td style={{ padding: '14px', fontWeight: 'bold' }}>{r.month}</td>}
                            
                            {attendanceReportView === 'weekdays' ? (
                              <>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{r.mon_present || 0}</span> / <span style={{ color: '#ef4444' }}>{r.mon_absent || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{r.tue_present || 0}</span> / <span style={{ color: '#ef4444' }}>{r.tue_absent || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{r.wed_present || 0}</span> / <span style={{ color: '#ef4444' }}>{r.wed_absent || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{r.thu_present || 0}</span> / <span style={{ color: '#ef4444' }}>{r.thu_absent || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{r.fri_present || 0}</span> / <span style={{ color: '#ef4444' }}>{r.fri_absent || 0}</span></td>
                              </>
                            ) : (
                              <>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#10b981', fontWeight: '700', fontSize: '1rem' }}>{r.present_count || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#ef4444', fontWeight: '700', fontSize: '1rem' }}>{r.absent_count || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px' }}><span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '1rem' }}>{r.late_count || 0}</span></td>
                                <td style={{ textAlign: 'center', padding: '14px', fontWeight: '700' }}>{r.total_days || 0}</td>
                                <td style={{ textAlign: 'center', padding: '14px' }}>
                                  <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700',
                                    backgroundColor: ratio >= 80 ? 'rgba(16,185,129,0.1)' : ratio >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: ratio >= 80 ? '#10b981' : ratio >= 50 ? '#f59e0b' : '#ef4444'
                                  }}>
                                    {ratio}%
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: CLASS BROADSHEET MATRIX (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'broadsheet' && assignments.formClass && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <FileSpreadsheet size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Class Result — {assignments.formClass.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {settings.active_term} · {settings.active_session} · Full broadsheet matrix
                </p>
              </div>
            </div>
            {/* The ClassBroadsheet component below provides its own Download PDF and Export to Excel buttons */}
          </div>
          <ClassBroadsheet
            data={broadsheetData}
            className={assignments.formClass.name}
            term={settings.active_term}
            session={settings.active_session}
            settings={settings}
            hideExport={true}
          />
        </div>
      )}
      {activeSubTab === 'broadsheet' && !assignments.formClass && (
        <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Class Results</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>You must be assigned as a Form Master to view class broadsheets.</p>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: BEHAVIORAL & PSYCHOMOTOR GRADES (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'behavioral' && !assignments.formClass && (
        <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={32} style={{ color: '#f59e0b' }} />
            </div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Behavioral Traits</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>You must be assigned as a Form Master to evaluate psychomotor traits.</p>
          </div>
        </div>
      )}
      {activeSubTab === 'behavioral' && assignments.formClass && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Award size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Behavioral Traits & Psychomotor Ratings</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Evaluate students on a scale of 1 (Poor) to 5 (Excellent).</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
          {!evaluatingStudent ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ fontWeight: '700', marginBottom: '8px', display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem' }}>Select Student to Evaluate</label>
                <select 
                  className="form-control" 
                  onChange={(e) => {
                    const stId = parseInt(e.target.value);
                    if (!stId) return;
                    const st = [...behavioralStudents.unrated, ...behavioralStudents.rated].find(s => s.id === stId);
                    if (st) handleSelectStudentForEval(st);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a student --</option>
                  {behavioralStudents.unrated.length > 0 && (
                    <optgroup label="Not Evaluated Yet">
                      {behavioralStudents.unrated.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                      ))}
                    </optgroup>
                  )}
                  {behavioralStudents.rated.length > 0 && (
                    <optgroup label="Already Evaluated">
                      {behavioralStudents.rated.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number}) ✅</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0 }}>Evaluating: <span style={{ color: 'var(--primary)' }}>{evaluatingStudent.full_name}</span></h4>
                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setEvaluatingStudent(null)}>Cancel / Back</button>
              </div>

              <form onSubmit={handleSaveSkillEvaluation}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {skillsList.map(skill => (
                    <div key={skill.id} style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>
                        {skill.name} 
                        <span className="badge" style={{ float: 'right', fontSize: '0.7rem', backgroundColor: skill.category === 'AFFECTIVE' ? '#e0f2fe' : '#fef3c7', color: skill.category === 'AFFECTIVE' ? '#075985' : '#92400e' }}>{skill.category}</span>
                      </label>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <label key={rating} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={`skill_${skill.id}_${skill.category}`}
                              value={rating}
                              checked={skillRatings[`${skill.id}_${skill.category}`] === rating}
                              onChange={() => setSkillRatings(prev => ({ ...prev, [`${skill.id}_${skill.category}`]: rating }))}
                              required
                            />
                            <span style={{ fontSize: '0.85rem', marginTop: '6px', fontWeight: skillRatings[`${skill.id}_${skill.category}`] === rating ? 'bold' : 'normal' }}>{rating}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {skillsList.length === 0 && <p style={{ color: 'var(--danger)', marginTop: '10px' }}>No skills configured by admin yet.</p>}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} disabled={skillsList.length === 0}>
                    <Save size={15} /> Save Evaluation
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: TEACHER SCHEME OF WORK
          ========================================== */}
      {activeSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Premium Hero Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <BookOpen size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Scheme of Work</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Review and update the weekly course outline for your assigned subjects.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {teacherSchemeAssignIdx !== '' && (
                <button
                  className="btn no-print"
                  onClick={handleDownloadSchemePDF}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1.5px solid rgba(255,255,255,0.5)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                >
                  <Download size={15} /> Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '0', borderTop: 'none' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Subject</label>
                <select
                  className="form-control"
                  value={teacherSchemeAssignIdx}
                  onChange={(e) => setTeacherSchemeAssignIdx(e.target.value)}
                >
                  <option value="">Choose assigned subject...</option>
                  {assignments.subjects.map((assign, idx) => (
                    <option key={idx} value={idx}>{assign.subject_name} - {assign.class_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Term</label>
                <select
                  className="form-control"
                  value={teacherSchemeTerm}
                  onChange={(e) => setTeacherSchemeTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scheme Table */}
          {teacherSchemeAssignIdx === '' ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BookOpen size={32} style={{ color: '#6366f1' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Select a subject above to load the scheme of work.</p>
            </div>
          ) : (
            <div ref={schemeReportRef} className="glass-panel" style={{ backgroundColor: '#fff', overflow: 'hidden', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none', padding: '10px' }}>
              {/* Subject Info Sub-Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(30,58,138,0.04) 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {assignments.subjects[teacherSchemeAssignIdx]?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {assignments.subjects[teacherSchemeAssignIdx]?.class_name || 'Class'} · {teacherSchemeTerm}
                    </div>
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                  {teacherSchemeWeeks.filter(w => w.topic).length} / 12 Weeks Filled
                </span>
              </div>

              {/* Table */}
              <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                <table className="school-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>Week</th>
                      <th style={{ width: '30%' }}>Title & Subtitle</th>
                      <th>Content / Objectives</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSchemeWeeks.map((w, idx) => (
                      <tr key={idx} style={{ backgroundColor: w.topic ? 'transparent' : 'rgba(255,59,48,0.03)' }}>
                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          {w.topic ? (
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{w.topic}</div>
                              {w.subtitle && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '3px', fontWeight: '500' }}>
                                  📌 {w.subtitle}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not specified</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.88rem', verticalAlign: 'top', whiteSpace: 'pre-line' }}>
                          {w.objectives || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}
                        </td>
                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '12px' }}>
                          {w.topic ? (
                            w.progress?.status === 'completed' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                <CheckCircle size={14} /> Treated
                              </span>
                            ) : (
                              <button 
                                className="btn btn-primary"
                                style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px' }}
                                onClick={() => handleMarkTreated(w.id)}
                              >
                                Mark Treated
                              </button>
                            )
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ==========================================
          MY STUDENTS TAB (FORM MASTER)
          ========================================== */}
      {activeSubTab === 'students' && !assignments.formClass && (
        <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ margin: 0 }}>My Students</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>You must be assigned as a Form Master to view your class students.</p>
          </div>
        </div>
      )}

      {activeSubTab === 'students' && assignments.formClass && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          {/* Premium Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>My Students — {assignments.formClass.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  {formClassStudents.length} student{formClassStudents.length !== 1 ? 's' : ''} enrolled in your class
                </p>
              </div>
            </div>
            {/* Register Button — only if admin permits */}
            {settings.allow_fm_register_student === 1 ? (
              <button
                className="btn"
                onClick={() => setShowStudentModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1.5px solid rgba(255,255,255,0.5)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              >
                <Plus size={16} /> Register New Student
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(255,255,255,0.3)' }}>
                <Lock size={14} /> Registration disabled by admin
              </div>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            {/* Search bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or admission number..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Student List */}
            {studentsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading students…</div>
            ) : formClassStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0 }}>No students enrolled in {assignments.formClass.name} yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table className="school-table" style={{ width: '100%', margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '14px' }}>#</th>
                      <th style={{ padding: '14px' }}>Student Name</th>
                      <th style={{ padding: '14px' }}>Admission No.</th>
                      <th style={{ padding: '14px' }}>Gender</th>
                      <th style={{ padding: '14px' }}>Date of Birth</th>
                      <th style={{ padding: '14px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formClassStudents
                      .filter(s =>
                        s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        (s.admission_number || '').toLowerCase().includes(studentSearch.toLowerCase())
                      )
                      .map((s, idx) => (
                      <tr
                        key={s.id}
                        style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                              backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--border-color)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {s.passport_photo
                                ? <img src={s.passport_photo} alt={s.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <Users size={18} style={{ color: 'var(--text-muted)' }} />
                              }
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{s.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>{s.admission_number || '—'}</code>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600',
                            backgroundColor: s.sex === 'Female' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)',
                            color: s.sex === 'Female' ? '#db2777' : '#2563eb'
                          }}>{s.sex || '—'}</span>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{s.date_of_birth || '—'}</td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => setViewingStudent(s)}
                              title="View Profile"
                              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                            >
                              <Eye size={14} /> View
                            </button>
                            {settings.allow_fm_edit_student === 1 && (
                              <button
                                onClick={() => setViewingStudent(s)}
                                title="Edit Student"
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', backgroundColor: 'rgba(59,130,246,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: '600', color: '#2563eb', transition: 'all 0.2s' }}
                              >
                                <Pencil size={14} /> Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MY STUDENTS — REGISTER MODAL
          ========================================== */}
      {showStudentModal && assignments.formClass && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)', maxWidth: '540px', width: '95%' }}>
            <button className="modal-close" onClick={() => setShowStudentModal(false)}>✕</button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Plus size={20} style={{ color: 'var(--primary)' }} /> Register New Student
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Registering into: <strong style={{ color: 'var(--primary)' }}>{assignments.formClass.name}</strong>
            </p>
            <form onSubmit={handleRegisterStudent} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Passport Photo:</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setStudentForm({ ...studentForm, passport_photo: reader.result });
                    reader.readAsDataURL(file);
                  }
                }} />
                {studentForm.passport_photo && <span style={{ marginLeft: '10px', color: 'var(--success)' }}>✓ Added</span>}
              </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Surname</label>
                    <input type="text" className="form-control" required value={studentForm.surname} onChange={(e) => {
                      const newSurname = e.target.value;
                      const computedFullname = `${newSurname} ${studentForm.first_name} ${studentForm.other_names}`.replace(/\s+/g, ' ').trim();
                      setStudentForm({ ...studentForm, surname: newSurname, full_name: computedFullname });
                    }} />
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" required value={studentForm.first_name} onChange={(e) => {
                      const newFirstname = e.target.value;
                      const computedFullname = `${studentForm.surname} ${newFirstname} ${studentForm.other_names}`.replace(/\s+/g, ' ').trim();
                      setStudentForm({ ...studentForm, first_name: newFirstname, full_name: computedFullname });
                    }} />
                  </div>
                  <div className="form-group">
                    <label>Other Names</label>
                    <input type="text" className="form-control" value={studentForm.other_names} onChange={(e) => {
                      const newOthernames = e.target.value;
                      const computedFullname = `${studentForm.surname} ${studentForm.first_name} ${newOthernames}`.replace(/\s+/g, ' ').trim();
                      setStudentForm({ ...studentForm, other_names: newOthernames, full_name: computedFullname });
                    }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Display Full Name</label>
                    <input type="text" className="form-control" required readOnly style={{ backgroundColor: 'var(--bg-secondary)' }} value={studentForm.full_name} />
                  </div>
                  <div className="form-group">
                    <label>Last School Attended</label>
                    <input type="text" className="form-control" value={studentForm.last_school_attended} onChange={(e) => setStudentForm({ ...studentForm, last_school_attended: e.target.value })} />
                  </div>
                </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" className="form-control" value={studentForm.date_of_birth} onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Sex</label>
                  <select className="form-control" value={studentForm.sex} onChange={(e) => setStudentForm({ ...studentForm, sex: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Religion</label>
                  <select className="form-control" value={studentForm.religion} onChange={(e) => setStudentForm({ ...studentForm, religion: e.target.value })}>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>LGA of Origin</label>
                  <input type="text" className="form-control" value={studentForm.local_government} onChange={(e) => setStudentForm({ ...studentForm, local_government: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State of Origin</label>
                  <input type="text" className="form-control" value={studentForm.state_of_origin} onChange={(e) => setStudentForm({ ...studentForm, state_of_origin: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={studentForm.handicapped} onChange={(e) => setStudentForm({ ...studentForm, handicapped: e.target.checked })} />
                  Is student handicapped?
                </label>
                {studentForm.handicapped && (
                  <input type="text" className="form-control" placeholder="Specify handicap details..." value={studentForm.handicap_details} onChange={(e) => setStudentForm({ ...studentForm, handicap_details: e.target.value })} />
                )}
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Parent / Guardian Name</label>
                  <input type="text" className="form-control" value={studentForm.parent_name} onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parent Phone Number</label>
                  <input type="text" className="form-control" value={studentForm.parent_phone} onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Parent Home Address</label>
                <textarea className="form-control" value={studentForm.parent_address} onChange={(e) => setStudentForm({ ...studentForm, parent_address: e.target.value })} />
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
              {settings?.allow_offline_debt === 1 && (
                <div className="form-group" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    <input type="checkbox" checked={studentForm.has_offline_debt} onChange={(e) => setStudentForm({ ...studentForm, has_offline_debt: e.target.checked })} />
                    Student owes an outstanding fee from offline records?
                  </label>
                  {studentForm.has_offline_debt && (
                    <div style={{ marginTop: '15px' }}>
                      <label>Outstanding Amount (₦)</label>
                      <input type="number" min="0" className="form-control" placeholder="e.g. 5000" value={studentForm.offline_debt_amount} onChange={(e) => setStudentForm({ ...studentForm, offline_debt_amount: e.target.value })} />
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={15} /> Register Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MY STUDENTS — PROFILE VIEWER MODAL
          ========================================== */}
      {viewingStudent && (
        <StudentRegistrationForm
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onUpdate={() => {
            setViewingStudent(null);
            loadFormClassStudents(assignments.formClass.id);
          }}
        />
      )}

    </div>
  );
}
