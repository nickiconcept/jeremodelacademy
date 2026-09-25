import React from 'react';
import { BookOpen, ChevronRight, CircleCheck, Clock, CreditCard, FileSpreadsheet, GraduationCap, Hourglass, Settings, UserPlus, Users } from 'lucide-react';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function MobileAdminOverview({ settings, students, teachers, classes, subjects, feesReport, resultProgress, onNavigate, onRegisterStudent }) {
  const [trackerOpen, setTrackerOpen] = React.useState(false);
  const [trackerFilter, setTrackerFilter] = React.useState('All');
  const totalCollected = (feesReport || []).reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
  const outstanding = (feesReport || []).reduce((sum, fee) => sum + Math.max(0, Number(fee.amount_due || 0) - Number(fee.amount_paid || 0)), 0);
  const progress = resultProgress?.summary?.percentage || 0;
  const summary = resultProgress?.summary || {};
  const trackedItems = (resultProgress?.details || []).filter((item) => trackerFilter === 'All' || item.status === trackerFilter);
  const statusIcon = (status) => status === 'Completed' ? CircleCheck : status === 'In Progress' ? Hourglass : Clock;

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

      <section className="mobile-result-tracker">
        <button type="button" className="mobile-result-tracker__summary" onClick={() => setTrackerOpen((open) => !open)} aria-expanded={trackerOpen}>
          <span className="mobile-result-tracker__ring" style={{ '--tracker-progress': `${progress}%` }}><b>{progress}%</b></span>
          <span className="mobile-result-tracker__intro"><small>RESULT UPLOAD TRACKER</small><strong>Marks submission progress</strong><em>{summary.completed || 0} of {summary.total || 0} allocations complete</em></span>
          <ChevronRight className={trackerOpen ? 'is-open' : ''} size={19} />
        </button>

        {trackerOpen && (
          <div className="mobile-result-tracker__details">
            <div className="mobile-result-tracker__metrics">
              <div><small>Total</small><strong>{summary.total || 0}</strong></div>
              <div className="complete"><small>Completed</small><strong>{summary.completed || 0}</strong></div>
              <div className="progress"><small>In progress</small><strong>{summary.in_progress || 0}</strong></div>
              <div className="pending"><small>Pending</small><strong>{summary.pending || 0}</strong></div>
            </div>
            <div className="mobile-result-tracker__filters" aria-label="Filter upload status">
              {['All', 'Completed', 'In Progress', 'Pending'].map((filter) => <button key={filter} type="button" className={trackerFilter === filter ? 'is-active' : ''} onClick={() => setTrackerFilter(filter)}>{filter}</button>)}
            </div>
            <div className="mobile-result-tracker__list">
              {trackedItems.length ? trackedItems.map((item, index) => {
                const StatusIcon = statusIcon(item.status);
                return <article key={`${item.class_name}-${item.subject_name}-${index}`}>
                  <div className="mobile-result-tracker__item-heading"><div><strong>{item.subject_name}</strong><span>{item.class_name} · {item.teacher_name || 'Unassigned teacher'}</span></div><em className={`status-${String(item.status).toLowerCase().replaceAll(' ', '-')}`}><StatusIcon size={14} /> {item.status}</em></div>
                  <div className="mobile-result-tracker__bar"><i><b style={{ width: `${item.percentage || 0}%` }} /></i><strong>{item.uploaded_count || 0}/{item.total_students || 0}</strong></div>
                </article>;
              }) : <p className="mobile-result-tracker__empty">No allocations match this status.</p>}
            </div>
            <button type="button" className="mobile-result-tracker__action" onClick={() => onNavigate('student-results', 'enter-marks')}>Open result entry <ChevronRight size={16} /></button>
          </div>
        )}
      </section>
    </section>
  );
}
