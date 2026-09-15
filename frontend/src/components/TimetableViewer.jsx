import React from 'react';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';

export default function TimetableViewer({ timetables, role }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (!timetables || timetables.length === 0) {
    return (
      <div className="text-center py-5">
        <Calendar size={48} className="text-muted mb-3" opacity={0.5} />
        <h4 className="text-muted">No Timetable Assigned</h4>
        <p className="text-muted">Your schedule for this term has not been set yet.</p>
      </div>
    );
  }

  // Group by day and sort by start_time
  const grouped = days.map(day => ({
    day,
    entries: timetables
      .filter(t => t.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }));

  return (
    <div className="timetable-viewer">
      <div className="row">
        {grouped.map(({ day, entries }) => (
          <div key={day} className="col-12 mb-4">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-primary fw-bold">{day}</h5>
                <span className="badge bg-light text-dark rounded-pill">{entries.length} Periods</span>
              </div>
              <div className="card-body p-0">
                {entries.length === 0 ? (
                  <div className="p-4 text-center text-muted fst-italic">Free Day</div>
                ) : (
                  <div className="list-group list-group-flush">
                    {entries.map((t, idx) => (
                      <div key={t.id || idx} className="list-group-item p-3 border-bottom d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center transition-all hover-bg-light">
                        <div className="d-flex align-items-center gap-2" style={{ minWidth: '150px' }}>
                          <Clock size={16} className="text-primary" />
                          <span className="fw-bold">{t.start_time} - {t.end_time}</span>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <BookOpen size={16} className="text-info" />
                          <span className="fs-5 fw-semibold">{t.subject?.name || 'Unknown Subject'}</span>
                        </div>

                        <div className="d-flex align-items-center gap-3 text-muted">
                          {role === 'teacher' ? (
                            <span className="badge bg-secondary px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                              Class: {t.class?.name || 'Unknown'}
                            </span>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <User size={14} />
                              <span>{t.teacher?.name || 'Unassigned'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
