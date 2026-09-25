import React from 'react';
import { BookOpen, ChevronRight, CreditCard, FileSpreadsheet, GraduationCap, Settings, UserPlus, Users } from 'lucide-react';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function MobileAdminOverview({ settings, students, teachers, classes, subjects, feesReport, resultProgress, onNavigate, onRegisterStudent }) {
  const totalCollected = (feesReport || []).reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
  const outstanding = (feesReport || []).reduce((sum, fee) => sum + Math.max(0, Number(fee.amount_due || 0) - Number(fee.amount_paid || 0)), 0);
  const progress = resultProgress?.summary?.percentage || 0;

  return (
    <section className="mobile-admin-overview">
      <div className="mobile-admin-overview__hero">
        <p>SCHOOL ADMINISTRATION</p>
        <h2>School at a glance</h2>
        <span>{settings?.active_session || 'Academic session'} · {settings?.active_term || 'Current term'}</span>
        <button type="button" onClick={onRegisterStudent}><UserPlus size={18} /> Register Student</button>
      </div>

      <div className="mobile-admin-overview__metrics">
        <button type="button" onClick={() => onNavigate('students')}><span className="students"><Users size={20} /></span><strong>{students.length}</strong><small>Students</small></button>
        <button type="button" onClick={() => onNavigate('teachers')}><span className="teachers"><GraduationCap size={20} /></span><strong>{teachers.length}</strong><small>Teachers</small></button>
        <button type="button" onClick={() => onNavigate('classes')}><span className="classes"><BookOpen size={20} /></span><strong>{classes.length}</strong><small>Classes</small></button>
        <button type="button" onClick={() => onNavigate('subjects', 'list')}><span className="subjects"><FileSpreadsheet size={20} /></span><strong>{subjects.length}</strong><small>Subjects</small></button>
      </div>

      <div className="mobile-admin-overview__heading"><div><p>QUICK TASKS</p><h3>School operations</h3></div></div>
      <div className="mobile-admin-overview__tasks">
        <button type="button" onClick={() => onNavigate('attendance', 'mark')}><span><Users size={19} /></span><strong>Mark Attendance</strong><ChevronRight size={17} /></button>
        <button type="button" onClick={() => onNavigate('student-results', 'enter-marks')}><span><FileSpreadsheet size={19} /></span><strong>Enter Marks</strong><ChevronRight size={17} /></button>
        <button type="button" onClick={() => onNavigate('fees', 'invoices')}><span><CreditCard size={19} /></span><strong>Fees & Billing</strong><ChevronRight size={17} /></button>
        <button type="button" onClick={() => onNavigate('settings', 'academic')}><span><Settings size={19} /></span><strong>Academic Settings</strong><ChevronRight size={17} /></button>
      </div>

      <div className="mobile-admin-overview__heading"><div><p>FINANCE</p><h3>Fee collection</h3></div><button type="button" onClick={() => onNavigate('fees', 'report')}>Records <ChevronRight size={16} /></button></div>
      <div className="mobile-admin-overview__finance">
        <div><small>Collected</small><strong>{formatNaira(totalCollected)}</strong></div>
        <div><small>Outstanding</small><strong>{formatNaira(outstanding)}</strong></div>
      </div>

      <button type="button" className="mobile-admin-overview__progress" onClick={() => onNavigate('student-results', 'enter-marks')}>
        <span><FileSpreadsheet size={20} /></span><div><small>RESULT UPLOAD TRACKER</small><strong>{progress}% complete</strong><i><b style={{ width: `${progress}%` }} /></i></div><ChevronRight size={18} />
      </button>
    </section>
  );
}
