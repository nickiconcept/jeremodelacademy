import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  KeyRound,
  Settings,
  ClipboardList,
  ShieldCheck,
  FileText,
  Sparkles,
  Users,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

const menuByRole = {
  student: [
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'schemes', label: 'Scheme of Work', icon: FileText },
    { id: 'rules', label: 'School Rules', icon: ShieldCheck },
  ],
  teacher: [
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'broadsheet', label: 'Class Results', icon: FileSpreadsheet },
    { id: 'behavioral', label: 'Evaluate Students', icon: Sparkles },
    { id: 'schemes', label: 'Scheme of Work', icon: FileText },
  ],
  admin: [
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'classes', label: 'Classes', icon: Users },
    { id: 'timetable', label: 'Timetable Manager', icon: Calendar },
    { id: 'attendance', subTab: 'mark', label: 'Attendance', icon: ClipboardList },
    { id: 'student-results', subTab: 'single', label: 'Student Results', icon: FileSpreadsheet },
    { id: 'student-results', subTab: 'pins', label: 'Scratch Cards / PINs', icon: KeyRound },
    { id: 'settings', subTab: 'academic', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Activity Logs', icon: BarChart3 },
    { id: 'subjects', subTab: 'schemes', label: 'Scheme of Work', icon: BookOpen },
  ],
};

export default function MobileMoreSheet({ role, isOpen, onClose, onSelectTab }) {
  const items = menuByRole[role] || [];

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const choose = (item) => {
    onSelectTab(item.id, item.subTab || null);
    onClose();
  };

  return (
    <div className="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="More portal features">
      <button className="mobile-more-sheet__backdrop" type="button" onClick={onClose} aria-label="Close menu" />
      <section className="mobile-more-sheet__panel">
        <div className="mobile-more-sheet__handle" aria-hidden="true" />
        <header className="mobile-more-sheet__header">
          <div>
            <p>Jere Model Academy Portal</p>
            <h2>More</h2>
          </div>
          <button type="button" className="mobile-more-sheet__close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </header>
        <div className="mobile-more-sheet__grid">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={`${item.id}-${item.subTab || ''}`} type="button" onClick={() => choose(item)}>
                <span><Icon size={21} /></span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
