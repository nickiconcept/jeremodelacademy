import React from 'react';
import { Award, Calendar, CalendarCheck, ChevronRight, CreditCard, FileText, WalletCards } from 'lucide-react';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function MobileStudentOverview({ user, settings, timetables, attendance, timeline, outstandingDebt, onNavigate }) {
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayClasses = (timetables || [])
    .filter((entry) => entry.day_of_week === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
  const presentDays = (attendance || []).filter((record) => record.status === 'present' || record.status === 'late').length;
  const attendanceRate = attendance?.length ? Math.round((presentDays / attendance.length) * 100) : null;
  const latestResult = timeline?.[0];

  return (
    <section className="mobile-student-overview">
      <div className="mobile-student-overview__hero">
        <div className="mobile-student-overview__greeting">
          <div>
            <p>Good to see you</p>
            <h2>{user.full_name?.split(' ')[0] || 'Student'} 👋</h2>
            <span>{user.class_name || 'Class not assigned'} · {settings?.active_term || 'Current term'}</span>
          </div>
          {user.passport_photo ? (
            <img src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:8000${user.passport_photo}`} alt="Student profile" />
          ) : (
            <div className="mobile-student-overview__avatar">{user.full_name?.slice(0, 1) || 'S'}</div>
          )}
        </div>
        <div className="mobile-student-overview__fee-status">
          <span>{outstandingDebt > 0 ? 'Outstanding fees' : 'Fee status'}</span>
          <strong>{outstandingDebt > 0 ? formatNaira(outstandingDebt) : 'Up to date'}</strong>
          <button type="button" onClick={() => onNavigate('fees')}>
            View fees <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mobile-student-overview__quick-actions" aria-label="Quick actions">
        <button type="button" onClick={() => onNavigate('results')}><span><Award size={20} /></span>Results</button>
        <button type="button" onClick={() => onNavigate('timetable')}><span><Calendar size={20} /></span>Timetable</button>
        <button type="button" onClick={() => onNavigate('attendance')}><span><CalendarCheck size={20} /></span>Attendance</button>
        <button type="button" onClick={() => onNavigate('schemes')}><span><FileText size={20} /></span>Scheme of Work</button>
      </div>

      <div className="mobile-student-overview__section-heading">
        <div><p>YOUR DAY</p><h3>{today}</h3></div>
        <button type="button" onClick={() => onNavigate('timetable')}>Full timetable <ChevronRight size={16} /></button>
      </div>

      <div className="mobile-student-overview__schedule">
        {todayClasses.length ? todayClasses.slice(0, 3).map((entry) => (
          <div key={entry.id} className="mobile-student-overview__lesson">
            <time>{String(entry.start_time).slice(0, 5)}</time>
            <div>
              <strong>{entry.type !== 'class' ? (entry.activity || 'Break') : (entry.subject?.name || 'Class lesson')}</strong>
              {entry.type === 'class' && <span>{entry.teacher?.full_name || 'Teacher to be assigned'}</span>}
            </div>
          </div>
        )) : (
          <div className="mobile-student-overview__empty">No lessons scheduled for today.</div>
        )}
      </div>

      <div className="mobile-student-overview__stats">
        <button type="button" onClick={() => onNavigate('attendance')}>
          <span className="mobile-student-overview__stat-icon attendance"><CalendarCheck size={20} /></span>
          <span><small>Attendance</small><strong>{attendanceRate === null ? '—' : `${attendanceRate}%`}</strong></span>
          <ChevronRight size={17} />
        </button>
        <button type="button" onClick={() => onNavigate('results')}>
          <span className="mobile-student-overview__stat-icon results"><WalletCards size={20} /></span>
          <span><small>Results available</small><strong>{timeline?.length || 0} term{timeline?.length === 1 ? '' : 's'}</strong></span>
          <ChevronRight size={17} />
        </button>
      </div>

      {latestResult && (
        <button type="button" className="mobile-student-overview__result-card" onClick={() => onNavigate('results')}>
          <span><Award size={21} /></span>
          <div><small>Latest result</small><strong>{latestResult.term} · {latestResult.academic_year}</strong></div>
          <ChevronRight size={18} />
        </button>
      )}
    </section>
  );
}
