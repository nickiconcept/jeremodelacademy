import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Book,
  FileText,
  CalendarCheck,
  CheckSquare,
  BarChart2,
  FileSpreadsheet,
  Download,
  Pencil,
  Grid,
  Key,
  CreditCard,
  Receipt,
  Layers,
  History,
  AlertCircle,
  Settings,
  Sliders,
  RotateCw,
  Globe,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  X,
  Calendar,
  Printer
} from 'lucide-react';


export default function Sidebar({ role, activeTab, subTab, onSelectTab, onLogout, user, isOpen, onClose, settings }) {
  const [openMenus, setOpenMenus] = useState({});

  const navItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'teachers', label: 'Teachers', icon: GraduationCap },
      { id: 'classes', label: 'Classes', icon: School },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        subItems: [
          { id: 'list', label: 'All Subjects', icon: Book },
          { id: 'assignments', label: 'Assign to Teacher', icon: Users },
          { id: 'schemes', label: 'Scheme of Work', icon: FileText },
          { id: 'tracker', label: 'SOW Tracker', icon: CheckSquare }
        ]
      },
      { id: 'timetable', label: 'Timetable Manager', icon: Calendar },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: CalendarCheck,
        subItems: [
          { id: 'mark', label: 'Mark Attendance', icon: CheckSquare },
          { id: 'report', label: 'Attendance Report', icon: BarChart2 }
        ]
      },
      {
        id: 'student-results',
        label: 'Student Results',
        icon: FileSpreadsheet,
        subItems: [
          { id: 'enter-marks', label: 'Enter Marks', icon: Pencil },
          { id: 'blank-scoresheet', label: 'Print Scoresheet', icon: Download },
          { id: 'broadsheet', label: 'Class Broadsheet', icon: Grid },
          { id: 'single', label: 'Single Result View', icon: FileText },
          { id: 'bulk', label: 'Print Results', icon: Download },
          { id: 'promotions', label: 'Student Promotions', icon: TrendingUp },
          { id: 'pins', label: 'Scratch Cards / PINs', icon: Key },
          { id: 'remarks', label: 'Manage Remarks', icon: Sparkles }
        ]
      },
      {
        id: 'fees',
        label: 'School Fees',
        icon: CreditCard,
        subItems: [
          { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
          { id: 'custom', label: 'Other Fees', icon: Pencil },
          { id: 'structures', label: 'Fee Structures', icon: Layers },
          { id: 'report', label: 'Payment Records', icon: History },
          { id: 'print_receipts', label: 'Print Receipts', icon: Printer }
        ]
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        subItems: [
          { id: 'academic', label: 'Academic Settings', icon: Sliders },
          { id: 'website', label: 'Website CMS', icon: Globe },
          { id: 'reports', label: 'Grading & Reports', icon: Award },
          { id: 'skills', label: 'Behavioral Domains', icon: Sparkles }
        ]
      },
      { id: 'logs', label: 'Activity Logs', icon: ClipboardList }
    ],
    teacher: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'timetable', label: 'My Timetable', icon: Calendar },
      { id: 'students', label: 'My Students', icon: Users },
      { id: 'grades', label: 'Enter Marks', icon: Pencil },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: CalendarCheck,
        subItems: [
          { id: 'take', label: 'Take Attendance', icon: CheckSquare },
          { id: 'report', label: 'Attendance Reports', icon: BarChart2 }
        ]
      },
      { id: 'broadsheet', label: 'Class Results', icon: FileSpreadsheet },
      { id: 'behavioral', label: 'Evaluate Students', icon: Sparkles },
      { id: 'schemes', label: 'Scheme of Work', icon: FileText }
    ],
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'timetable', label: 'Class Timetable', icon: Calendar },
      { id: 'attendance', label: 'My Attendance', icon: Calendar },
      { id: 'results', label: 'My Results', icon: Award },
      { id: 'schemes', label: 'Scheme of Work', icon: FileText },
      { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
      { id: 'rules', label: 'School Rules', icon: ShieldCheck }
    ]
  };

  const items = navItems[role] || [];

  useEffect(() => {
    if (activeTab) {
      setOpenMenus(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab]);

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleTabClick = (item, subItemId = null) => {
    if (item.subItems && !subItemId) {
      toggleMenu(item.id);
      if (!openMenus[item.id] && item.subItems.length > 0) {
        onSelectTab(item.id, item.subItems[0].id);
      } else {
        onSelectTab(item.id, subTab || item.subItems[0].id);
      }
    } else if (subItemId) {
      onSelectTab(item.id, subItemId);
    } else {
      onSelectTab(item.id, null);
    }

    if (onClose) onClose();
  };

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'open' : ''}`}
      style={{
        width: '268px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 90,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Branding Header ── */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-light) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {settings?.school_logo_url ? (
            <img src={settings?.school_logo_url} alt="Logo" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#ffffff', padding: '4px' }} />
          ) : (
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold',
              boxShadow: '0 4px 14px var(--primary-glow)',
              flexShrink: 0,
            }}>
              <School size={19} />
            </div>
          )}
          <div>
            <h2 style={{
              fontSize: '0.875rem', fontWeight: '800', color: 'var(--text-primary)',
              margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2,
            }}>
              {settings?.landing_school_name || 'Jere Model Academy'}
            </h2>
            <span style={{
              fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              ACADEMIC PORTAL
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mobile-only"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '8px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        padding: '14px 10px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        overflowY: 'auto',
      }}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          const hasSub = item.subItems && item.subItems.length > 0;
          const isExpanded = !!openMenus[item.id];
          const isParentActive = activeTab === item.id;

          return (
            <div key={item.id} className="sidebar-nav-item">
              {/* Main nav button */}
              <button
                onClick={() => handleTabClick(item)}
                className={`sidebar-nav-btn ${isParentActive ? 'active' : ''} ${isParentActive && hasSub ? 'parent-active' : ''}`}
                style={{
                  // Override active gradient for items WITH sub-items (use lighter style)
                  ...(isParentActive && hasSub ? {
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    boxShadow: 'none',
                  } : {}),
                }}
              >
                <div className="sidebar-icon-wrap">
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isParentActive
                      ? (hasSub ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.18)')
                      : 'transparent',
                    transition: 'var(--transition)',
                    flexShrink: 0,
                  }}>
                    <Icon
                      size={16}
                      style={{
                        color: isParentActive
                          ? (hasSub ? 'var(--primary)' : '#fff')
                          : 'var(--text-muted)',
                      }}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>
                {hasSub && (
                  <div style={{
                    color: isParentActive ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'transform 0.2s ease',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)',
                  }}>
                    {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                )}
              </button>

              {/* Sub-items */}
              {hasSub && isExpanded && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  marginLeft: '14px',
                  paddingLeft: '14px',
                  borderLeft: '2px solid var(--primary-light)',
                  marginTop: '3px',
                  marginBottom: '4px',
                }}>
                  {item.subItems.map(subItem => {
                    const SubIcon = subItem.icon;
                    const isSubActive = isParentActive && subTab === subItem.id;

                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleTabClick(item, subItem.id)}
                        className={`sidebar-sub-btn ${isSubActive ? 'active' : ''}`}
                      >
                        <SubIcon
                          size={14}
                          style={{ color: isSubActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }}
                        />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Sidebar Footer ── */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
      }}>
        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {settings?.landing_school_name || 'Jere Model Academy'} · Portal v1.0
        </p>
      </div>
    </aside>
  );
}
