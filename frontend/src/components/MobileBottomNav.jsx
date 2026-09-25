import React from 'react';
import {
  LayoutDashboard,
  Award,
  CalendarCheck,
  CreditCard,
  MoreHorizontal,
  Users,
  BookOpen,
  FileSpreadsheet,
} from 'lucide-react';

const navigationByRole = {
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'results', label: 'My Results', icon: Award },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'grades', label: 'Enter Marks', icon: FileSpreadsheet },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, subTab: 'list' },
    { id: 'fees', label: 'School Fees', icon: CreditCard, subTab: 'invoices' },
  ],
};

/** App-style navigation displayed only on phone-sized screens. */
export default function MobileBottomNav({ role, activeTab, onSelectTab, onOpenMenu }) {
  const items = navigationByRole[role] || navigationByRole.student;

  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile navigation">
      {items.map(({ id, label, icon: Icon, subTab }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            className={`mobile-bottom-nav__item ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelectTab(id, subTab || null)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mobile-bottom-nav__icon"><Icon size={21} strokeWidth={isActive ? 2.6 : 2} /></span>
            <span>{label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="mobile-bottom-nav__item"
        onClick={onOpenMenu}
        aria-label="Open all portal menus"
      >
        <span className="mobile-bottom-nav__icon"><MoreHorizontal size={23} /></span>
        <span>More</span>
      </button>
    </nav>
  );
}
