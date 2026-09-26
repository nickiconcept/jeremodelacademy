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
  Receipt,
  ListChecks,
  Printer,
  TrendingUp,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';

const menuByRole = {
  student: [{ title: 'Portal', items: [
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'schemes', label: 'Scheme of Work', icon: FileText },
    { id: 'rules', label: 'School Rules', icon: ShieldCheck },
  ] }],
  teacher: [{ title: 'Teaching tools', items: [
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'attendance', subTab: 'take', label: 'Take Attendance', icon: ClipboardList },
    { id: 'attendance', subTab: 'report', label: 'Attendance Reports', icon: BarChart3 },
    { id: 'broadsheet', label: 'Class Results', icon: FileSpreadsheet },
    { id: 'behavioral', label: 'Evaluate Students', icon: Sparkles },
    { id: 'schemes', label: 'Scheme of Work', icon: FileText },
  ] }],
  admin: [
    { title: 'School management', items: [
      { id: 'teachers', label: 'Teachers', icon: GraduationCap },
      { id: 'classes', label: 'Classes', icon: Users },
      { id: 'timetable', label: 'Timetable Manager', icon: Calendar },
      { id: 'attendance', subTab: 'mark', label: 'Mark Attendance', icon: ClipboardList },
      { id: 'attendance', subTab: 'report', label: 'Attendance Report', icon: BarChart3 },
    ] },
    { title: 'Subjects', items: [
      { id: 'subjects', subTab: 'list', label: 'All Subjects', icon: BookOpen },
      { id: 'subjects', subTab: 'assignments', label: 'Assign to Teacher', icon: Users },
      { id: 'subjects', subTab: 'schemes', label: 'Scheme of Work', icon: FileText },
      { id: 'subjects', subTab: 'tracker', label: 'SOW Tracker', icon: ListChecks },
    ] },
    { title: 'Student Results', items: [
      { id: 'student-results', subTab: 'enter-marks', label: 'Enter Marks', icon: FileSpreadsheet },
      { id: 'student-results', subTab: 'blank-scoresheet', label: 'Print Scoresheet', icon: Printer },
      { id: 'student-results', subTab: 'broadsheet', label: 'Class Broadsheet', icon: FileSpreadsheet },
      { id: 'student-results', subTab: 'single', label: 'Single Result View', icon: FileText },
      { id: 'student-results', subTab: 'bulk', label: 'Print Results', icon: Printer },
      { id: 'student-results', subTab: 'promotions', label: 'Student Promotions', icon: TrendingUp },
      { id: 'student-results', subTab: 'pins', label: 'Scratch Cards / PINs', icon: KeyRound },
      { id: 'student-results', subTab: 'remarks', label: 'Manage Remarks', icon: Sparkles },
    ] },
    { title: 'School Fees', items: [
      { id: 'fees', subTab: 'invoices', label: 'Invoices & Billing', icon: Receipt },
      { id: 'fees', subTab: 'custom', label: 'Other Fees', icon: Receipt },
      { id: 'fees', subTab: 'structures', label: 'Fee Structures', icon: BookOpen },
      { id: 'fees', subTab: 'report', label: 'Payment Records', icon: BarChart3 },
      { id: 'fees', subTab: 'print_receipts', label: 'Print Receipts', icon: Printer },
    ] },
    { title: 'Portal settings', items: [
      { id: 'settings', subTab: 'academic', label: 'Academic Settings', icon: Settings },
      { id: 'settings', subTab: 'website', label: 'Website CMS', icon: FileText },
      { id: 'settings', subTab: 'reports', label: 'Grading & Reports', icon: FileSpreadsheet },
      { id: 'settings', subTab: 'skills', label: 'Behavioral Domains', icon: Sparkles },
      { id: 'logs', label: 'Activity Logs', icon: BarChart3 },
    ] },
  ],
};

export default function MobileMoreSheet({ role, isOpen, onClose, onSelectTab, onLogout, user }) {
  let groups = menuByRole[role] || [];
  
  if (role === 'admin' && user?.permissions?.includes('super_admin')) {
    // Add a dedicated System Administration section at the very top
    groups = [
      {
        title: 'System Administration',
        items: [
          { id: 'system_admins', label: 'System Admins', icon: Shield }
        ]
      },
      ...groups
    ];
  }

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
        <div className="mobile-more-sheet__groups">
          {groups.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <div className="mobile-more-sheet__list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={`${item.id}-${item.subTab || ''}`} type="button" onClick={() => choose(item)}>
                      <span><Icon size={19} /></span><strong>{item.label}</strong><ChevronRight size={17} />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <button type="button" className="mobile-more-sheet__logout" onClick={onLogout}><LogOut size={18} /> Sign Out</button>
      </section>
    </div>
  );
}
