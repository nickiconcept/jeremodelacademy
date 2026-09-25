import React from 'react';
import { BookOpen, CalendarCheck, ChevronRight, ClipboardList, FileSpreadsheet, Users } from 'lucide-react';

export default function MobileTeacherOverview({ user, assignments, timetables, resultProgress, onNavigate, onOpenAssignment }) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayLessons = (timetables || [])
    .filter((entry) => entry.day_of_week === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
  const progress = resultProgress?.summary?.percentage || 0;

  return (
    <section className="mobile-teacher-overview">
      <div className="mobile-teacher-overview__hero">
        <p>TEACHER PORTAL</p>
        <h2>Good day, {user.full_name?.split(' ')[0] || 'Teacher'} 👋</h2>
        <span>{assignments.subjects?.length || 0} teaching assignment{assignments.subjects?.length === 1 ? '' : 's'} this term</span>
      </div>

      {assignments.formClass ? (
        <div className="mobile-teacher-overview__form-class">
          <div><small>FORM MASTER</small><strong>{assignments.formClass.name}</strong><span>Manage your class from one place.</span></div>
          <div className="mobile-teacher-overview__form-actions">
            <button type="button" onClick={() => onNavigate('attendance')}><CalendarCheck size={18} />Attendance</button>
            <button type="button" onClick={() => onNavigate('students')}><Users size={18} />Students</button>
          </div>
        </div>
      ) : (
        <div className="mobile-teacher-overview__notice">You are not currently assigned as a Form Master.</div>
      )}

      <div className="mobile-teacher-overview__heading"><div><p>YOUR DAY</p><h3>{today}</h3></div><button type="button" onClick={() => onNavigate('timetable')}>Timetable <ChevronRight size={16} /></button></div>
      <div className="mobile-teacher-overview__schedule">
        {todayLessons.length ? todayLessons.slice(0, 3).map((lesson) => (
          <div key={lesson.id}>
            <time>{String(lesson.start_time).slice(0, 5)}</time>
            <span><strong>{lesson.type === 'class' ? (lesson.subject?.name || 'Class lesson') : (lesson.activity || 'Break')}</strong><small>{lesson.type === 'class' ? (lesson.class?.name || 'Class') : 'Schedule break'}</small></span>
          </div>
        )) : <p className="mobile-teacher-overview__empty">No lessons scheduled for today.</p>}
      </div>

      <div className="mobile-teacher-overview__heading"><div><p>ASSIGNMENTS</p><h3>Enter marks</h3></div><button type="button" onClick={() => onNavigate('grades')}>All subjects <ChevronRight size={16} /></button></div>
      <div className="mobile-teacher-overview__assignments">
        {assignments.subjects?.length ? assignments.subjects.slice(0, 4).map((assignment) => (
          <button key={`${assignment.class_id}-${assignment.subject_id}`} type="button" onClick={() => onOpenAssignment(assignment)}>
            <span><BookOpen size={19} /></span><div><strong>{assignment.subject_name}</strong><small>{assignment.class_name}</small></div><ChevronRight size={17} />
          </button>
        )) : <p className="mobile-teacher-overview__empty">No subject assignments yet.</p>}
      </div>

      <button type="button" className="mobile-teacher-overview__progress" onClick={() => onNavigate('grades')}>
        <span><FileSpreadsheet size={20} /></span><div><small>RESULT UPLOAD PROGRESS</small><strong>{progress}% complete</strong><i><b style={{ width: `${progress}%` }} /></i></div><ChevronRight size={18} />
      </button>
    </section>
  );
}
