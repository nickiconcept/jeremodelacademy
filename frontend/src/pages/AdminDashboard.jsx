import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import StudentRegistrationForm from '../components/StudentRegistrationForm';
import TeacherProfileCard from '../components/TeacherProfileCard';
import SignaturePad from '../components/SignaturePad';
import BulkResultPrinter from '../components/BulkResultPrinter';
import BulkReceiptPrinter from '../components/BulkReceiptPrinter';
import PrintPinCards from '../components/PrintPinCards';
import ClassBroadsheet from '../components/ClassBroadsheet';
import ReportCard from '../components/ReportCard';
import ManageGraduatesModal from '../components/ManageGraduatesModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import StatCard from '../components/StatCard';
import Pagination from '../components/Pagination';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import {
  ArrowLeft,
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
  Plus,
  Search,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Download,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserPlus,
  User,
  Clock,
  CircleCheck,
  Hourglass,
  UploadCloud,
  Star,
  Trash,
  Printer
} from 'lucide-react';

// Modern Bar Chart Component
function ModernBarChart({ title, subtitle, data, height = 240 }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span> {title}
        </h4>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '2px 0 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
            <RechartsTooltip cursor={{ fill: 'var(--bg-secondary)', opacity: 0.4 }} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// Modern Pie Chart Component
function ModernPieChart({ title, subtitle, data, size = 220 }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🍩</span> {title}
        </h4>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', padding: '10px 0' }}>
        <div style={{ width: size, height: size, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius={size / 2 - 30}
                outerRadius={size / 2 - 10}
                paddingAngle={5}
                dataKey="value"
                nameKey="label"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || `hsl(${(index * 110) % 360}, 85%, 55%)`} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Badge */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              {total >= 1000 ? `₦${(total / 1000).toFixed(0)}k` : total}
            </div>
          </div>
        </div>

        {/* Legend Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '160px' }}>
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            const color = item.color || `hsl(${(idx * 110) % 360}, 85%, 55%)`;

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: color, display: 'inline-block' }}></span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {val >= 1000 ? `₦${(val / 1000).toFixed(0)}k` : val}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', width: '40px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}




  // Strict Promotion Hierarchy Mapping
  const getValidTargets = (sourceId, allClasses) => {
    if (!sourceId || !allClasses.length) return [];
    
    // Find class names to build logic dynamically or use hardcoded IDs
    const sourceClass = allClasses.find(c => c.id == sourceId);
    if (!sourceClass) return [];
    const sName = sourceClass.name;

    // Graduate Lock
    if (sName.includes('Graduate')) return [];

    let targetNames = [];
    let isGraduating = false;
    
    // Nursery 1 -> Nursery 2 -> Nursery 3 -> Nursery Graduates
    if (sName === 'Nursery 1') targetNames = ['Nursery 2'];
    if (sName === 'Nursery 2') targetNames = ['Nursery 3'];
    if (sName === 'Nursery 3') targetNames = ['Nursery Graduates Waiting Room'];
    
    // Primary 1 -> 2 -> 3 -> 4 -> 5 -> Primary Graduates
    if (sName === 'Primary 1') targetNames = ['Primary 2'];
    if (sName === 'Primary 2') targetNames = ['Primary 3'];
    if (sName === 'Primary 3') targetNames = ['Primary 4'];
    if (sName === 'Primary 4') targetNames = ['Primary 5'];
    if (sName === 'Primary 5') targetNames = ['Primary Graduates Waiting Room'];
    
    // JSS
    if (sName === 'JSS 1A') targetNames = ['JSS 2A'];
    if (sName === 'JSS 1B') targetNames = ['JSS 2B'];
    if (sName === 'JSS 2A') targetNames = ['JSS 3A'];
    if (sName === 'JSS 2B') targetNames = ['JSS 3B'];
    if (sName === 'JSS 3A') targetNames = ['JSS Graduates Waiting Room'];
    if (sName === 'JSS 3B') targetNames = ['JSS Graduates Waiting Room'];
    
    // SSS (1A/1B -> 2A/2B/2C -> 3A/3B/3C)
    if (sName === 'SSS 1A' || sName === 'SSS 1B') targetNames = ['SSS 2A', 'SSS 2B', 'SSS 2C'];
    if (sName === 'SSS 2A') targetNames = ['SSS 3A'];
    if (sName === 'SSS 2B') targetNames = ['SSS 3B'];
    if (sName === 'SSS 2C') targetNames = ['SSS 3C'];
    if (sName === 'SSS 3A' || sName === 'SSS 3B' || sName === 'SSS 3C') {
        isGraduating = true;
    }

    let filtered = allClasses.filter(c => targetNames.includes(c.name));
    if (isGraduating) {
      filtered.push({ id: 'graduate', name: '🎓 Graduated Alumni (Complete Schooling)' });
    }
    return filtered;
  };

export default function AdminDashboard({ settings, fetchSettings, activeTab, subTab, onSelectTab }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [settingsSubTab, setSettingsSubTab] = useState('academic');
  const [resultsSubTab, setResultsSubTab] = useState('bulk');
  const [subjectsSubTab, setSubjectsSubTab] = useState('list');
  const [showGraduatesModal, setShowGraduatesModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // PDF export refs
  const schemeRef = useRef(null);
  const paymentReportRef = useRef(null);
  const feeSummaryRef = useRef(null);
  const receiptSlipRef = useRef(null);
  const attendanceReportRefAdmin = useRef(null);
  const scoresheetRefAdmin = useRef(null);
  const bulkScoresheetRefAdmin = useRef(null);

  const exportPDF = (ref, filename, orientation = 'portrait') => {
    const element = ref.current;
    if (!element) return;
    
    // If the main element is hidden, temporarily show it so html2canvas can capture it
    const originalDisplay = element.style.display;
    if (originalDisplay === 'none') {
      element.style.display = 'block';
    }

    // Add class to remove max-height and overflow restrictions for full capture
    element.classList.add('pdf-exporting');

    // Temporarily show .only-print elements inside the container
    const printHeaders = element.querySelectorAll('.only-print');
    printHeaders.forEach(el => el.style.display = 'block');

    // Temporarily hide .no-print elements inside the container
    const noPrintItems = element.querySelectorAll('.no-print');
    const originalNoPrintDisplays = [];
    noPrintItems.forEach(el => {
      originalNoPrintDisplays.push(el.style.display);
      el.style.display = 'none';
    });

    html2pdf().set({
      margin:      0.3,
      filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF:       { unit: 'in', format: 'a4', orientation }
    }).from(element).save().then(() => {
      printHeaders.forEach(el => el.style.display = 'none');
      noPrintItems.forEach((el, index) => {
        el.style.display = originalNoPrintDisplays[index];
      });
      element.classList.remove('pdf-exporting');
      if (originalDisplay === 'none') {
        element.style.display = 'none';
      }
    });
  };
  
  // Single Result View states
  const [singleResultClassId, setSingleResultClassId] = useState('');
  const [singleResultStudentId, setSingleResultStudentId] = useState('');
  const [singleResultTerm, setSingleResultTerm] = useState(settings?.active_term || '3rd Term');
  const [singleResultSession, setSingleResultSession] = useState(settings?.active_session || '');
  const [singleReportCardData, setSingleReportCardData] = useState(null);
  const [singleResultLoading, setSingleResultLoading] = useState(false);
  const [singleResultError, setSingleResultError] = useState('');

  const handleFetchSingleResult = async (e) => {
    if (e) e.preventDefault();
    if (!singleResultStudentId) return;
    setSingleResultLoading(true);
    setSingleResultError('');
    try {
      const data = await api.getReportCard(
        singleResultStudentId,
        singleResultTerm || settings?.active_term || '3rd Term',
        singleResultSession || settings?.active_session || ''
      );
      setSingleReportCardData(data);
    } catch (err) {
      setSingleResultError(err.message || 'Failed to fetch student report card.');
    } finally {
      setSingleResultLoading(false);
    }
  };
  
  // Data lists
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [pins, setPins] = useState([]);
  
  // Pagination States
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(20);
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherPageSize, setTeacherPageSize] = useState(20);
  const [subjectPage, setSubjectPage] = useState(1);
  const [subjectPageSize, setSubjectPageSize] = useState(20);
  const [assignTeacherPage, setAssignTeacherPage] = useState(1);
  const [assignTeacherPageSize, setAssignTeacherPageSize] = useState(20);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(20);
  const [activityLogPage, setActivityLogPage] = useState(1);
  const [activityLogPageSize, setActivityLogPageSize] = useState(20);

  const [pinPage, setPinPage] = useState(1);
  const [pinPageSize, setPinPageSize] = useState(20);
  const [billingPage, setBillingPage] = useState(1);
  const [billingPageSize, setBillingPageSize] = useState(20);
  const [customInvoicePage, setCustomInvoicePage] = useState(1);
  const [customInvoicePageSize, setCustomInvoicePageSize] = useState(20);
  const [feeStructPage, setFeeStructPage] = useState(1);
  const [feeStructPageSize, setFeeStructPageSize] = useState(20);
  const [modalInvoicePage, setModalInvoicePage] = useState(1);
  const [modalInvoicePageSize, setModalInvoicePageSize] = useState(20);
  const [modalReceiptPage, setModalReceiptPage] = useState(1);
  const [modalReceiptPageSize, setModalReceiptPageSize] = useState(20);
  const [collationPage, setCollationPage] = useState(1);
  const [collationPageSize, setCollationPageSize] = useState(20);
  const [classPage, setClassPage] = useState(1);
  const [classPageSize, setClassPageSize] = useState(20);
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'affective', target_section: 'secondary' });
  
  // Registration form states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEditSkillModal, setShowEditSkillModal] = useState(false);
  const [skillEditForm, setSkillEditForm] = useState({ id: '', name: '', category: 'affective', target_section: 'secondary' });
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [showPrintPinsModal, setShowPrintPinsModal] = useState(false);

  // Selected details
  const [selectedStudentForForm, setSelectedStudentForForm] = useState(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState(null);
  
  // Form input states
  
    const [isReturningStudent, setIsReturningStudent] = useState(false);
    const [selectedGraduateId, setSelectedGraduateId] = useState('');
    const [graduateStudents, setGraduateStudents] = useState([]);

    const [studentForm, setStudentForm] = useState({
    surname: '', first_name: '', other_names: '', full_name: '', class_id: '',
    date_of_birth: '', class_of_entry: '', term_year_of_entry: '',
    last_school_attended: '', address_residence: '', sex: 'Male', religion: 'Islam',
    local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
    parent_name: '', parent_address: '', parent_phone: '', passport_photo: '', custom_admission_number: '',
    has_offline_debt: false, offline_debt_amount: ''
  });
  
  const [teacherForm, setTeacherForm] = useState({ 
    full_name: '', email: '', passport_photo: '',
    surname: '', first_name: '', other_names: '', address: '', state_of_residence: '', lga_of_residence: '', signature: '',
    phone_number: '', date_of_birth: '', qualification: '', discipline: '', employment_category: ''
  });
  const [classForm, setClassForm] = useState({ name: '', tier: 'jss' });
  const [subjectForm, setSubjectForm] = useState({ name: '', tier: 'jss', class_ids: [] });
  const [assignForm, setAssignForm] = useState({ class_ids: [], subject_id: '', teacher_id: '' });
  const [feeForm, setFeeForm] = useState({ title: '', category: 'School Fees', amount: '', class_id: '', tier: '' });
  const [showIndividualFeeModal, setShowIndividualFeeModal] = useState(false);
  const [individualFeeForm, setIndividualFeeForm] = useState({ title: '', category: 'Other Fees', amount: '' });
  const [payForm, setPayForm] = useState({ invoice_id: '', amount_paid: '', payment_method: 'Cash', student_name: '' });
  const [pinCount, setPinCount] = useState(20);

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState('all');
  const [teacherClassFilter, setTeacherClassFilter] = useState('');
  const [showArchivedTeachers, setShowArchivedTeachers] = useState(false);
  
  const [feeSearch, setFeeSearch] = useState('');
  const [feeClassFilter, setFeeClassFilter] = useState('');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState('');
  
  const [pinSearch, setPinSearch] = useState('');
  const [pinStatusFilter, setPinStatusFilter] = useState('all');
  
  const [customInvoiceSearch, setCustomInvoiceSearch] = useState('');
  const [customInvoiceClassFilter, setCustomInvoiceClassFilter] = useState('');
  
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectTierFilter, setSubjectTierFilter] = useState('all');
  
  const [assignClassFilter, setAssignClassFilter] = useState('');
  const [assignTeacherStatusFilter, setAssignTeacherStatusFilter] = useState('all');
  
  const [classSearch, setClassSearch] = useState('');
  const [classStreamFilter, setClassStreamFilter] = useState('all');
  const [classFormMasterFilter, setClassFormMasterFilter] = useState('all');
  
  // Promotion manager states
  const [promoSource, setPromoSource] = useState('');
  const [promoTarget, setPromoTarget] = useState('');
  const [promotedClassIds, setPromotedClassIds] = useState([]);
  const [selectedStudentIdsForPromo, setSelectedStudentIdsForPromo] = useState([]);
  const [promoStudentSearch, setPromoStudentSearch] = useState('');
  
  const [showAutoPromoteModal, setShowAutoPromoteModal] = useState(false);
  const [autoPromoForm, setAutoPromoForm] = useState({
    source_class_id: '',
    mode: 'standard',
    global_passmark: 50,
    global_target_id: '',
    science_passmark: 50,
    science_target_id: '',
    arts_passmark: 50,
    arts_target_id: '',
    commercial_passmark: 50,
    commercial_target_id: ''
  });

  const [showAllClassesInPromo, setShowAllClassesInPromo] = useState(false);

  // PIN Generator options
  const [genPinTerm, setGenPinTerm] = useState('');
  const [genPinSession, setGenPinSession] = useState('');

  // Portal Settings Form
  const [settingsForm, setSettingsForm] = useState({
    active_session: '',
    active_term: '',
    result_entry_open: 1,
    allow_past_attendance: 0,
    allow_fm_register_student: 0,
    allow_fm_edit_student: 0,
    max_ca_count: 4,
    landing_school_name: '',
    landing_tagline: '',
    landing_hero_title: '',
    landing_hero_desc: '',
    landing_address: '',
    result_show_position: 1,
    result_show_average: 1,
    contact_phone: '',
    contact_email: '',
    ca1_name: 'CA 1',
    ca2_name: 'CA 2',
    ca3_name: 'CA 3',
    ca4_name: 'CA 4',
    exam_name: 'Exam',
    games_master_name: '',
    games_master_remark: '',
    house_master_name: '',
    house_master_remark: '',
    principal_name: '',
    principal_signature: '',
    next_term_fee: '',
    next_term_begins: '',
    next_term_ends: '',
    last_term_debit: ''
  });

  // Notifications
  const { showToast, confirm, showAlert } = useGlobalUI();
  const setNotify = (msg) => { if (msg) showAlert(msg, 'success'); };
  const setErrorMsg = (msg) => { if (msg) showAlert(msg, 'error'); };

  // Academic Sessions Management
  const [sessions, setSessions] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  // Subject Edit modal states
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectEditForm, setSubjectEditForm] = useState({ name: '', tier: 'jss' });

  // Class Edit modal states
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classEditForm, setClassEditForm] = useState({ name: '', tier: 'jss' });

  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  // Admin Attendance report states
  const [activeAdminAttendanceSubTab, setActiveAdminAttendanceSubTab] = useState('mark'); // 'mark' or 'report'
  const [adminAttendanceReport, setAdminAttendanceReport] = useState([]);
  const [adminReportClassId, setAdminReportClassId] = useState('');
  const [adminReportStartDate, setAdminReportStartDate] = useState('');
  const [adminReportEndDate, setAdminReportEndDate] = useState('');

  // Fees MVP reports and structure management states
  const [feeStructures, setFeeStructures] = useState([]);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [editingFeeStructure, setEditingFeeStructure] = useState(null);
  const [newFeeStructureForm, setNewFeeStructureForm] = useState({ title: '', category: 'School Fees', amount: '', tier: 'jss' });
  const [feesReport, setFeesReport] = useState([]);
  const [activeFeesSubTab, setActiveFeesSubTab] = useState('invoices'); // 'invoices' or 'structures' or 'report'
  const [customInvoices, setCustomInvoices] = useState([]);
  const [showEditCustomInvoiceModal, setShowEditCustomInvoiceModal] = useState(false);
  const [editingCustomInvoice, setEditingCustomInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Payment Report filter & history states
  const [paymentReportSearch, setPaymentReportSearch] = useState('');
  const [paymentReportClassFilter, setPaymentReportClassFilter] = useState('');
  const [paymentReportStatusFilter, setPaymentReportStatusFilter] = useState('all');
  const [paymentReportCategoryFilter, setPaymentReportCategoryFilter] = useState('');
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [studentHistoryData, setStudentHistoryData] = useState({ invoices: [], receipts: [] });
  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  // Admin Result Progress Tracker
  const [adminResultProgress, setAdminResultProgress] = useState(null);
  const [showUploadDetails, setShowUploadDetails] = useState(false);
  const [adminProgressFilter, setAdminProgressFilter] = useState('all');
  const [adminProgressSearch, setAdminProgressSearch] = useState('');

  const loadAdminResultProgress = async () => {
    try {
      const data = await api.getAdminResultProgress();
      setAdminResultProgress(data);
    } catch (err) {
      console.error('Failed to load admin result progress:', err);
    }
  };

  // Admin Broadsheet states
  const [adminBroadsheetClassId, setAdminBroadsheetClassId] = useState('');
  const [adminBroadsheetData, setAdminBroadsheetData] = useState(null);
  const [adminBroadsheetLoading, setAdminBroadsheetLoading] = useState(false);

  const fetchAdminBroadsheet = async (classId) => {
    if (!classId) return;
    setAdminBroadsheetLoading(true);
    try {
      const term = settings?.active_term || '3rd Term';
      const year = settings?.active_session || '2026/2027';
      const res = await api.getBroadsheet(classId, term, year);
      setAdminBroadsheetData(res);
    } catch (err) {
      console.error('Failed to load broadsheet data:', err);
    } finally {
      setAdminBroadsheetLoading(false);
    }
  };

  const fetchPromotedClasses = async () => {
    try {
      const activeSess = settings?.active_session || '';
      const ids = await api.getPromotedClasses(activeSess);
      setPromotedClassIds(ids || []);
    } catch (err) {
      console.error('Failed to load promoted classes:', err);
    }
  };

  const handleResetPromotedClasses = async () => {
    try {
      const activeSess = settings?.active_session || '';
      await api.resetPromotedClasses(activeSess);
      setNotify(`Promotion status reset for session ${activeSess}.`);
      fetchPromotedClasses();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Seed standard passport photos
  const seedMockPassport = (type) => {
    const avatars = {
      student: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60',
      teacher: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
    };
    if (type === 'student') setStudentForm(prev => ({ ...prev, passport_photo: avatars.student }));
    if (type === 'teacher') setTeacherForm(prev => ({ ...prev, passport_photo: avatars.teacher }));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'promotions') {
      fetchPromotedClasses();
    }
  }, [activeSubTab, settings]);

  useEffect(() => {
    if (promoSource) {
      const sourceStuds = students.filter(s => s.class_id === parseInt(promoSource));
      setSelectedStudentIdsForPromo(sourceStuds.map(s => s.id));
    } else {
      setSelectedStudentIdsForPromo([]);
    }
  }, [promoSource, students]);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        active_session: settings.active_session || '',
        active_term: settings.active_term || '',
        result_entry_open: settings.result_entry_open || 1,
        landing_school_name: settings.landing_school_name || '',
        landing_tagline: settings.landing_tagline || '',
        landing_hero_title: settings.landing_hero_title || '',
        landing_hero_desc: settings.landing_hero_desc || '',
        landing_address: settings.landing_address || '',
        result_show_position: settings.result_show_position === undefined ? 1 : settings.result_show_position,
        result_show_average: settings.result_show_average === undefined ? 1 : settings.result_show_average,
        contact_phone: settings.contact_phone || '',
        contact_email: settings.contact_email || '',
        ca1_name: settings.ca1_name || 'CA 1',
        ca2_name: settings.ca2_name || 'CA 2',
        ca3_name: settings.ca3_name || 'CA 3',
        ca4_name: settings.ca4_name || 'CA 4',
        exam_name: settings.exam_name || 'Exam',
        games_master_name: settings.games_master_name || '',
        games_master_remark: settings.games_master_remark || '',
        house_master_name: settings.house_master_name || '',
        house_master_remark: settings.house_master_remark || '',
        principal_name: settings.principal_name || '',
        principal_signature: settings.principal_signature || '',
        next_term_fee: settings.next_term_fee || '',
        next_term_begins: settings.next_term_begins || '',
        next_term_ends: settings.next_term_ends || '',
        last_term_debit: settings.last_term_debit || '',
        allow_past_attendance: settings.allow_past_attendance || 0,
        allow_fm_register_student: settings.allow_fm_register_student || 0,
        allow_fm_edit_student: settings.allow_fm_edit_student || 0,
        max_ca_count: settings.max_ca_count || 4
      });
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }

    if (subTab) {
      if (activeTab === 'subjects') setSubjectsSubTab(subTab);
      else if (activeTab === 'attendance') setActiveAdminAttendanceSubTab(subTab);
      else if (activeTab === 'student-results') setResultsSubTab(subTab);
      else if (activeTab === 'fees') setActiveFeesSubTab(subTab);
      else if (activeTab === 'settings') {
        if (subTab === 'landing' || subTab === 'website') {
          setSettingsSubTab('website');
        } else if (subTab === 'grading' || subTab === 'reports') {
          setSettingsSubTab('reports');
        } else if (subTab === 'sessions') {
          setSettingsSubTab('academic');
        } else {
          setSettingsSubTab(subTab);
        }
      }
    }
  }, [activeTab, subTab]);

  useEffect(() => {
    if (activeSubTab === 'broadsheet') {
      if (adminBroadsheetClassId) {
        fetchAdminBroadsheet(adminBroadsheetClassId);
      }
    }
  }, [activeSubTab, adminBroadsheetClassId]);

  const loadSessions = async () => {
    try {
      const data = await api.getAcademicSessions();
      setSessions(data);
    } catch (err) {
      setErrorMsg('Failed to load academic sessions: ' + err.message);
    }
  };

    const loadCustomInvoices = async () => {
    try {
      const data = await api.getCustomInvoices();
      setCustomInvoices(data);
    } catch (err) {
      console.error('Failed to load custom invoices:', err);
    }
  };

  const loadFeeStructures = async () => {
    try {
      const data = await api.getFeeStructures();
      setFeeStructures(data);
    } catch (err) {
      setErrorMsg('Failed to load fee structures: ' + err.message);
    }
  };



  const handleEditFeeStructureClick = (struct) => {
    setEditingFeeStructure(struct);
    setNewFeeStructureForm({
      title: struct.title || '',
      category: struct.category || 'School Fees',
      amount: struct.amount || '',
      tier: struct.tier || 'jss'
    });
    setShowFeeStructureModal(true);
  };

  const loadFeesReport = async () => {
    try {
      const data = await api.getPaidFeesReport();
      setFeesReport(data);
    } catch (err) {
      setErrorMsg('Failed to load fees report: ' + err.message);
    }
  };

  const handleOpenStudentPaymentHistory = async (studentId, studentInfo = {}) => {
    setSelectedStudentForHistory(studentInfo.student_id ? studentInfo : { student_id: studentId, ...studentInfo });
    setLoadingStudentHistory(true);
    try {
      const data = await api.getStudentFees(studentId);
      setStudentHistoryData(data);
    } catch (err) {
      setErrorMsg('Failed to load student payment history: ' + err.message);
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  const handleExportPaymentReportExcel = (list) => {
    if (!list || list.length === 0) return;

    let csv = '\uFEFF';
    csv += `"${(settingsForm?.landing_school_name || 'Jere Model Academy').replace(/"/g, '""')}"\r\n`;
    csv += `"STUDENT PAYMENT COLLECTIONS AUDIT REPORT"\r\n\r\n`;
    
    csv += `"Student Name","Admission No","Class Arm","Fee Description","Total Billed (NGN)","Amount Paid (NGN)","Balance Owed (NGN)","Payment Status"\r\n`;

    list.forEach(inv => {
      const remaining = inv.amount_due - inv.amount_paid;
      csv += `"${(inv.full_name || '').replace(/"/g, '""')}","${(inv.admission_number || '').replace(/"/g, '""')}","${(inv.class_name || 'Unassigned').replace(/"/g, '""')}","${(inv.title || '').replace(/"/g, '""')}",${inv.amount_due},${inv.amount_paid},${remaining},"${inv.status}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadAllData = async () => {
    try {
      const [studList, teachList, clsList, subList, csList, pinList, skillsList] = await Promise.all([
        api.getStudents(),
        api.getTeachers(),
        api.getClasses(),
        api.getSubjects(),
        api.getClassSubjects(),
        api.getPins(),
        api.getSkills()
      ]);
      
      setStudents([...studList].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      setTeachers([...teachList].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      setClasses([...clsList].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setSubjects(subList);
      setClassSubjects(csList);
      setPins(pinList);
      setSkills(skillsList);

      await Promise.all([
        loadSessions(),
        loadFeeStructures(),
        loadCustomInvoices(),
        loadFeesReport(),
        loadAdminResultProgress()
      ]);
    } catch (err) {
      setErrorMsg('Failed to sync school database: ' + err.message);
    } finally {
      setIsInitialLoad(false);
    }
  };

  
    // Fast-Track Helpers
    const handleClassSelectionForRegistration = (classId) => {
      let finalClassId = classId;
      
      // Auto-balancing logic for JSS 1 and SSS 1
      const targetClass = classes.find(c => c.id == classId);
      if (targetClass && (targetClass.name.startsWith('JSS 1') || targetClass.name.startsWith('SSS 1'))) {
         const prefix = targetClass.name.startsWith('JSS 1') ? 'JSS 1' : 'SSS 1';
         const armA = classes.find(c => c.name === `${prefix}A`);
         const armB = classes.find(c => c.name === `${prefix}B`);
         if (armA && armB) {
             const countA = students.filter(s => s.class_id == armA.id).length;
             const countB = students.filter(s => s.class_id == armB.id).length;
             // If A has more students than B, strictly assign to B to balance. Otherwise A.
             if (countA > countB) {
                 finalClassId = armB.id;
             } else {
                 finalClassId = armA.id;
             }
         }
      }
      
      setStudentForm(prev => ({ ...prev, class_id: finalClassId }));
      
      // Contextual Graduate Pulling
      if (isReturningStudent) {
         const finalClass = classes.find(c => c.id == finalClassId);
         if (finalClass) {
             let gradClassName = '';
             if (finalClass.tier === 'jss') gradClassName = 'Primary Graduates Waiting Room';
             else if (finalClass.tier === 'sss') gradClassName = 'JSS Graduates Waiting Room';
             else if (finalClass.tier === 'primary') gradClassName = 'Nursery Graduates Waiting Room';
             
             const gradClass = classes.find(c => c.name === gradClassName);
             if (gradClass) {
                 const grads = students.filter(s => s.class_id == gradClass.id);
                 setGraduateStudents(grads);
             } else {
                 setGraduateStudents([]);
             }
         }
      }
    };
    
    const handleGraduateSelect = (studentId) => {
       const grad = students.find(s => s.id == studentId);
       if (grad) {
           setSelectedGraduateId(grad.id);
           setStudentForm(prev => ({
               ...prev,
               surname: grad.surname || '',
               first_name: grad.first_name || '',
               other_names: grad.other_names || '',
               full_name: grad.full_name || '',
               date_of_birth: grad.date_of_birth || '',
               sex: grad.sex || 'Male',
               religion: grad.religion || 'Islam',
               parent_name: grad.parent_name || '',
               parent_phone: grad.parent_phone || '',
               parent_address: grad.parent_address || '',
               address_residence: grad.address_residence || '',
               state_of_origin: grad.state_of_origin || '',
               local_government: grad.local_government || '',
               passport_photo: grad.passport_photo || ''
           }));
       }
    };

    const handleStudentRegister = async (e) => {
    e.preventDefault();
    try {
      if (isReturningStudent && selectedGraduateId) {
          const res = await api.fastTrackGraduate({
              student_id: selectedGraduateId,
              class_id: studentForm.class_id
          });
          setNotify(res.message || 'Student successfully re-enrolled from graduate list!');
      } else {
          const res = await api.registerStudent(studentForm);
          setNotify(`Student registered successfully! Auto-Admission Number: ${res.admission_number}`);
      }
      setShowStudentModal(false);
      loadAllData();
      // Reset form
      setStudentForm({
        surname: '', first_name: '', other_names: '', full_name: '', class_id: '',
        date_of_birth: '', class_of_entry: '', term_year_of_entry: '',
        last_school_attended: '', address_residence: '', sex: 'Male', religion: 'Islam',
        local_government: '', state_of_origin: '', handicapped: false, handicap_details: '',
        parent_name: '', parent_address: '', parent_phone: '', passport_photo: '', custom_admission_number: '',
        has_offline_debt: false, offline_debt_amount: '', status: 'active'
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmed = await confirm({ title: 'Delete Student', message: 'Are you sure you want to delete this student? This action cannot be undone.', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    try {
      await api.deleteStudent(studentId);
      setNotify("Student deleted successfully!");
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    const confirmed = await confirm({ title: 'Delete Teacher', message: 'Are you sure you want to delete this teacher? This action cannot be undone.', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    try {
      await api.deleteTeacher(teacherId);
      setNotify("Teacher deleted successfully.");
      loadAllData();
    } catch (err) {
      setErrorMsg("Failed to delete teacher.");
    }
  };

  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    try {
      const computedFullName = [teacherForm.surname, teacherForm.first_name, teacherForm.other_names].filter(Boolean).join(' ');
      const payload = { ...teacherForm, full_name: computedFullName };
      
      await api.registerTeacher(payload);
      setNotify('Teacher registered successfully!');
      setShowTeacherModal(false);
      loadAllData();
      setTeacherForm({ 
        full_name: '', email: '', passport_photo: '',
        surname: '', first_name: '', other_names: '', address: '', state_of_residence: '', lga_of_residence: '', signature: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleClassCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createClass(classForm);
      setNotify('Class stream created successfully!');
      setShowClassModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleBulkSubjectClassSelect = (type, isEditMode = false) => {
    let ids = [];
    if (type === 'all') {
      ids = classes.map(c => c.id);
    } else if (type === 'nursery') {
      ids = classes.filter(c => c.name.toLowerCase().includes('nursery')).map(c => c.id);
    } else if (type === 'primary') {
      ids = classes.filter(c => c.name.toLowerCase().includes('primary')).map(c => c.id);
    } else if (type === 'jss') {
      ids = classes.filter(c => c.name.toLowerCase().includes('jss')).map(c => c.id);
    } else if (type === 'sss') {
      ids = classes.filter(c => c.name.toLowerCase().includes('sss')).map(c => c.id);
    }
    
    if (isEditMode) {
      setSubjectEditForm(prev => ({ ...prev, class_ids: ids }));
    } else {
      setSubjectForm(prev => ({ ...prev, class_ids: ids }));
    }
  };

  const handleSubjectCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createSubject(subjectForm);
      setNotify('Curriculum Subject seeded successfully!');
      setShowSubjectModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.assignSubjectTeacher(assignForm.class_ids, assignForm.subject_id, assignForm.teacher_id, isEditingAssignment);
      setNotify('Subject Teacher mapped successfully!');
      setShowAssignModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleFormMasterAssign = async (classId, teacherId) => {
    try {
      await api.assignFormMaster(classId, teacherId);
      setNotify('Form Master updated successfully!');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleFeeInvoiceCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...feeForm };
      if (payload.tier === 'all') {
        payload.all_classes = true;
        payload.tier = '';
      }
      await api.addFeeInvoice(payload);
      setNotify('Fees invoice generated and posted successfully!');
      setShowFeeModal(false);
      setFeeForm({ title: '', category: 'School Fees', amount: '', class_id: '', tier: '' });
      // Optimistic load for speed
      await Promise.all([
        loadCustomInvoices(),
        loadFeesReport()
      ]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleIndividualFeeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentForHistory) return;
    const studentId = selectedStudentForHistory.student_id || selectedStudentForHistory.id;
    try {
      await api.addFeeInvoice({
        ...individualFeeForm,
        student_id: studentId
      });
      setNotify('Individual fee posted successfully!');
      setShowIndividualFeeModal(false);
      setIndividualFeeForm({ title: '', category: 'Other Fees', amount: '' });
      // Refresh only the specific student's ledger and fees report
      await Promise.all([
        handleOpenStudentPaymentHistory(studentId, selectedStudentForHistory),
        loadFeesReport()
      ]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEditSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSkill(skillEditForm.id, skillEditForm);
      setNotify('Skill updated successfully!');
      setShowEditSkillModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSkillCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addSkill(skillForm);
      setNotify('Skill added successfully!');
      setSkillForm({ name: '', category: 'affective', target_section: 'secondary' });
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSkillDelete = async (id, category) => {
    const confirmed = await confirm({ title: 'Delete Skill', message: 'Are you sure you want to delete this skill?', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    try {
      await api.deleteSkill(id, category);
      setNotify('Skill deleted successfully!');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogPayment = async (e) => {
    e.preventDefault();
    const invoice = studentHistoryData?.invoices?.find(inv => inv.id === payForm.invoice_id);
    if (invoice) {
      if (invoice.status === 'Paid' || Number(invoice.amount_paid) >= Number(invoice.amount_due)) {
        setErrorMsg('This invoice has already been fully paid.');
        return;
      }
      if (Number(invoice.amount_paid) + Number(payForm.amount_paid) > Number(invoice.amount_due)) {
        setErrorMsg(`Payment exceeds the balance. Remaining balance is ₦${Number(invoice.amount_due) - Number(invoice.amount_paid)}`);
        return;
      }
    }
    try {
      const res = await api.logFeePayment({
        invoice_id: payForm.invoice_id,
        amount_paid: payForm.amount_paid,
        payment_method: payForm.payment_method
      });
      setNotify(`Payment Logged successfully! Receipt generated: ${res.receipt_number}`);
      setShowPayModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGeneratePins = async () => {
    try {
      await api.generatePins(pinCount, '', '');
      setNotify(`Bulk generated ${pinCount} universal Result Checker PINs!`);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      setNotify('System settings updated successfully!');
      fetchSettings();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };


  const handleAutoPromoteSubmit = async () => {
    try {
      if (!autoPromoForm.source_class_id) {
        setErrorMsg("Please select a source class.");
        return;
      }
      setLoading(true);
      const res = await api.autoPromote(autoPromoForm);
      setNotify(res.message || "Auto-promotion successful!");
      setShowAutoPromoteModal(false);
      loadAllData();
      fetchPromotedClasses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionBulk = async (e) => {

    e.preventDefault();
    if (!promoSource || !promoTarget) {
      setErrorMsg('Select both current and target class streams.');
      return;
    }
    if (promoSource === promoTarget) {
      setErrorMsg('Students cannot be promoted to the same class.');
      return;
    }
    if (selectedStudentIdsForPromo.length === 0) {
      setErrorMsg('Please check at least one student to promote.');
      return;
    }
    try {
      await api.promoteBulk(promoSource, promoTarget, selectedStudentIdsForPromo);
      const targetName = promoTarget === 'graduate' ? 'Graduated Alumni' : classes.find(c => c.id === parseInt(promoTarget))?.name || 'Target Class';
      setNotify(`Successfully promoted ${selectedStudentIdsForPromo.length} student(s) to ${targetName}!`);
      loadAllData();
      fetchPromotedClasses();
      setPromoSource('');
      setPromoTarget('');
      setSelectedStudentIdsForPromo([]);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // MIGRATED STATUS CHANGING HANDLER
  // ==========================================
  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      // Optimistic update for instant UI feedback
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, status: newStatus } : s));
      setTeachers(prev => prev.map(t => t.id === userId ? { ...t, status: newStatus } : t));

      await api.updateUserStatus(userId, newStatus);
      setNotify('User status updated successfully.');
      
      // Silently fetch to ensure data consistency
      api.getStudents().then(data => setStudents([...data].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))));
      api.getTeachers().then(data => setTeachers([...data].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))));
    } catch (err) {
      setErrorMsg('Failed to update status: ' + err.message);
      loadAllData(); // Revert on failure
    }
  };

  // ==========================================
  // ACADEMIC SESSIONS LOGIC
  // ==========================================
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.createAcademicSession(newSessionName);
      setNotify('Academic session created successfully!');
      setNewSessionName('');
      setShowSessionModal(false);
      loadSessions();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSetActiveSession = async (sessionId) => {
    setNotify('');
    setErrorMsg('');
    try {
      const res = await api.setActiveSession(sessionId);
      setNotify(res.message);
      fetchSettings();
      loadSessions();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // CLASS CRUD LOGIC
  // ==========================================
  const handleEditClassClick = (cls) => {
    setSelectedClass(cls);
    setClassEditForm({ 
      name: cls.name, 
      tier: cls.tier
    });
    setShowEditClassModal(true);
  };

  const handleEditClassSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.editClass(selectedClass.id, classEditForm);
      setNotify('Class details updated successfully!');
      setShowEditClassModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteClass = async (id) => {
    const confirmed = await confirm({ title: 'Delete Class', message: 'Are you sure you want to delete this class? This will also unassign form masters.', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    try {
      await api.deleteClass(id);
      setNotify('Class deleted successfully!');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEditClassSubjectClick = (cs) => {
    setIsEditingAssignment(true);
    setAssignForm({
      class_ids: [cs.class_id],
      subject_id: cs.subject_id,
      teacher_id: cs.teacher_id || ''
    });
    setShowAssignModal(true);
  };

  // ==========================================
  // SUBJECT CRUD LOGIC
  // ==========================================
  const handleEditSubjectClick = (sub) => {
    setSelectedSubject(sub);
    setSubjectEditForm({ 
      name: sub.name, 
      tier: sub.tier, 
      class_ids: sub.classes ? sub.classes.map(c => c.class_id) : [] 
    });
    setShowEditSubjectModal(true);
  };

  const handleEditSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.updateSubject(selectedSubject.id, {
        name: subjectEditForm.name,
        tier: subjectEditForm.tier,
        class_ids: subjectEditForm.class_ids
      });
      setNotify('Subject curriculum details updated successfully!');
      setShowEditSubjectModal(false);
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const confirmed = await confirm({ title: 'Delete Subject', message: 'Are you sure you want to delete this subject? This will delete all mapped grades and schemes of work for this subject.', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) {
      return;
    }
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteSubject(subjectId);
      setNotify('Subject curriculum successfully deleted.');
      loadAllData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // ==========================================
  // FEE STRUCTURE CRUD LOGIC
  // ==========================================
    const handleDeleteCustomInvoiceGroup = async (group) => {
    const confirmed = await confirm({ title: 'Delete Invoices', message: `Are you sure you want to delete all invoices for ${group.title}?`, confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    try {
      await api.deleteCustomInvoiceGroup(group);
      loadCustomInvoices();
      loadFeesReport();
      setNotify('Custom invoices deleted successfully.');
    } catch (err) {
      setErrorMsg('Failed to delete custom invoices: ' + err.message);
    }
  };

  const handleEditCustomInvoiceGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateCustomInvoiceGroup({
        old_title: editingCustomInvoice.old_title,
        old_category: editingCustomInvoice.old_category,
        old_amount_due: editingCustomInvoice.old_amount_due,
        class_id: editingCustomInvoice.class_id,
        tier: editingCustomInvoice.tier,
        title: editingCustomInvoice.title,
        category: editingCustomInvoice.category,
        amount: editingCustomInvoice.amount
      });
      setShowEditCustomInvoiceModal(false);
      setEditingCustomInvoice(null);
      loadCustomInvoices();
      loadFeesReport();
      setNotify('Custom invoice group updated successfully.');
    } catch (err) {
      setErrorMsg('Failed to update custom invoice group: ' + err.message);
    }
  };

  const handleCreateFeeStructure = async (e) => {
    e.preventDefault();
    setNotify('');
    setErrorMsg('');
    try {
      if (editingFeeStructure) {
        await api.updateFeeStructure(
          editingFeeStructure.id,
          newFeeStructureForm.title,
          newFeeStructureForm.amount,
          newFeeStructureForm.tier,
          newFeeStructureForm.category
        );
        setNotify('Fee Structure updated successfully!');
      } else {
        await api.addFeeStructure(
          newFeeStructureForm.title,
          newFeeStructureForm.amount,
          newFeeStructureForm.tier,
          newFeeStructureForm.category
        );
        setNotify('Tier Fee Structure added successfully!');
      }
      setEditingFeeStructure(null);
      setNewFeeStructureForm({ title: '', category: 'School Fees', amount: '', tier: 'jss' });
      setShowFeeStructureModal(false);
      loadFeeStructures();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteFeeStructure = async (id) => {
    const confirmed = await confirm({ title: 'Delete Fee Structure', message: 'Are you sure you want to delete this fee structure?', confirmText: 'Delete', type: 'danger' });
    if (!confirmed) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteFeeStructure(id);
      setNotify('Fee structure deleted successfully.');
      loadFeeStructures();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGenerateTermlyFee = async () => {
    const confirmed = await confirm({ title: 'Generate Fees', message: 'Are you sure you want to generate school fees for all active students for this term?', confirmText: 'Generate', type: 'primary' });
    if (!confirmed) return;
    setNotify('');
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.generateTermlyFees();
      if (res.count === 0) {
        setNotify('Operation completed. No new fees generated (they might already exist for this term).');
      } else {
        setNotify(`Successfully generated ${res.count} new fee invoices.`);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ADMIN ATTENDANCE REPORT LOGIC
  // ==========================================
  const loadAdminAttendanceReport = async () => {
    if (!adminReportClassId) return;
    setNotify('');
    setErrorMsg('');
    try {
      const data = await api.getAttendanceReport(adminReportClassId, adminReportStartDate, adminReportEndDate);
      setAdminAttendanceReport(data);
    } catch (err) {
      setErrorMsg('Failed to fetch attendance report: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'attendance' && activeAdminAttendanceSubTab === 'report' && adminReportClassId) {
      loadAdminAttendanceReport();
    }
  }, [activeSubTab, activeAdminAttendanceSubTab, adminReportClassId, adminReportStartDate, adminReportEndDate]);

  // ==========================================
  // ADMIN ATTENDANCE LOGIC
  // ==========================================
  const [adminAttendanceClass, setAdminAttendanceClass] = useState('');
  const [adminAttendanceDate, setAdminAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminAttendanceRoster, setAdminAttendanceRoster] = useState([]);

  const loadAdminAttendance = async (classId, date) => {
    if (!classId) return;
    try {
      const roster = await api.getAttendance(classId, date);
      setAdminAttendanceRoster(roster);
    } catch (err) {
      setErrorMsg('Failed to load attendance roster: ' + err.message);
    }
  };

  const handleAdminAttendanceStatusChange = (studentId, newStatus) => {
    setAdminAttendanceRoster(prev => prev.map(item => {
      if (item.student_id === studentId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const handleSaveAdminAttendance = async () => {
    if (!adminAttendanceClass) return;
    setNotify('');
    setErrorMsg('');
    try {
      const records = adminAttendanceRoster.map(item => ({
        student_id: item.student_id,
        status: item.status || 'present'
      }));
      await api.saveAttendance({
        class_id: adminAttendanceClass,
        date: adminAttendanceDate,
        records
      });
      setNotify('Attendance saved successfully!');
      loadAdminAttendance(adminAttendanceClass, adminAttendanceDate);
    } catch (err) {
      setErrorMsg('Failed to save attendance: ' + err.message);
    }
  };

  // ==========================================
  // ADMIN SCHEME OF WORK LOGIC
  // ==========================================
  const [adminSchemeClass, setAdminSchemeClass] = useState('');
  const [adminSchemeSubject, setAdminSchemeSubject] = useState('');
  const [adminSchemeTerm, setAdminSchemeTerm] = useState('3rd Term');
  const [adminSchemeWeeks, setAdminSchemeWeeks] = useState(Array.from({ length: 12 }, (_, i) => ({ week: i + 1, topic: '', subtitle: '', objectives: '', id: null })));

  // Admin Enter Marks States
  const [adminGradesClass, setAdminGradesClass] = useState('');
  const [adminGradesSubject, setAdminGradesSubject] = useState('');
  const [adminStudentsGrades, setAdminStudentsGrades] = useState([]);
  
  // Admin Print Scoresheet states
  const [adminScoresheetClass, setAdminScoresheetClass] = useState('');
  const [adminScoresheetSubject, setAdminScoresheetSubject] = useState('');
  const [adminGradesSearch, setAdminGradesSearch] = useState('');

  useEffect(() => {
    if (adminSchemeClass) {
      const filtered = classSubjects.filter(cs => cs.class_id === parseInt(adminSchemeClass));
      const hasSelected = filtered.some(cs => cs.subject_id === parseInt(adminSchemeSubject));
      if (!hasSelected) {
        setAdminSchemeSubject(filtered.length > 0 ? String(filtered[0].subject_id) : '');
      }
    } else {
      setAdminSchemeSubject('');
    }
  }, [adminSchemeClass, classSubjects]);

  const loadAdminSchemes = async () => {
    if (!adminSchemeClass || !adminSchemeSubject) return;
    try {
      const data = await api.getSchemes({
        class_id: adminSchemeClass,
        subject_id: adminSchemeSubject,
        term: adminSchemeTerm
      });
      
      const newWeeks = Array.from({ length: 12 }, (_, i) => {
        const wkNum = i + 1;
        const entry = data.find(item => item.week === wkNum);
        return {
          week: wkNum,
          topic: entry ? entry.topic : '',
          subtitle: entry ? entry.subtitle || '' : '',
          objectives: entry ? entry.objectives || '' : '',
          id: entry ? entry.id : null
        };
      });
      setAdminSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load schemes: ' + err.message);
    }
  };

  const handleAdminSchemeFieldChange = (weekNum, field, value) => {
    setAdminSchemeWeeks(prev => prev.map(w => {
      if (w.week === weekNum) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  const handleSaveAdminSchemeWeek = async (weekObj) => {
    setNotify('');
    setErrorMsg('');
    if (!weekObj.topic) {
      setErrorMsg(`Topic Title for Week ${weekObj.week} is required to save.`);
      return;
    }
    try {
      await api.saveScheme({
        class_id: parseInt(adminSchemeClass),
        subject_id: parseInt(adminSchemeSubject),
        term: adminSchemeTerm,
        week: weekObj.week,
        topic: weekObj.topic,
        subtitle: weekObj.subtitle,
        objectives: weekObj.objectives
      });
      setNotify(`Successfully saved Week ${weekObj.week} Scheme of Work!`);
      loadAdminSchemes();
    } catch (err) {
      setErrorMsg(`Failed to save Week ${weekObj.week}: ` + err.message);
    }
  };

  const handleDeleteAdminSchemeWeek = async (weekObj) => {
    if (!weekObj.id) {
      handleAdminSchemeFieldChange(weekObj.week, 'topic', '');
      handleAdminSchemeFieldChange(weekObj.week, 'subtitle', '');
      handleAdminSchemeFieldChange(weekObj.week, 'objectives', '');
      return;
    }
    setNotify('');
    setErrorMsg('');
    try {
      await api.deleteScheme(weekObj.id);
      setNotify(`Successfully deleted Week ${weekObj.week} entry.`);
      loadAdminSchemes();
    } catch (err) {
      setErrorMsg(`Failed to delete Week ${weekObj.week}: ` + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'attendance' && adminAttendanceClass) {
      loadAdminAttendance(adminAttendanceClass, adminAttendanceDate);
    }
  }, [activeSubTab, adminAttendanceClass, adminAttendanceDate]);

  useEffect(() => {
    if (subjectsSubTab === 'schemes' && adminSchemeClass && adminSchemeSubject) {
      loadAdminSchemes();
    }
  }, [subjectsSubTab, adminSchemeClass, adminSchemeSubject, adminSchemeTerm]);

  useEffect(() => {
    if (adminGradesClass) {
      const filtered = classSubjects.filter(cs => cs.class_id === parseInt(adminGradesClass));
      const hasSelected = filtered.some(cs => cs.subject_id === parseInt(adminGradesSubject));
      if (!hasSelected) {
        setAdminGradesSubject(filtered.length > 0 ? String(filtered[0].subject_id) : '');
      }
    } else {
      setAdminGradesSubject('');
    }
  }, [adminGradesClass, classSubjects]);

  const loadAdminGrades = async () => {
    if (!adminGradesClass || !adminGradesSubject) return;
    try {
      const data = await api.getGradesForEntry(
        parseInt(adminGradesClass),
        parseInt(adminGradesSubject),
        settings.active_term,
        settings.active_session
      );
      setAdminStudentsGrades(data);
    } catch (err) {
      setErrorMsg('Failed to load grades: ' + err.message);
    }
  };

  const handleAdminGradeChange = (studentId, field, value) => {
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

    setAdminStudentsGrades(prev => prev.map(g => {
      if (g.student_id === studentId) {
        const updated = { ...g, [field]: value };
        const c1 = parseFloat(field === 'ca1' ? value : updated.ca1 || 0);
        const c2 = parseFloat(field === 'ca2' ? value : updated.ca2 || 0);
        const c3 = parseFloat(field === 'ca3' ? value : updated.ca3 || 0);
        const c4 = parseFloat(field === 'ca4' ? value : updated.ca4 || 0);
        const ex = parseFloat(field === 'exam_score' ? value : updated.exam_score || 0);
        const tot = c1 + c2 + c3 + c4 + ex;
        updated.total_score = isNaN(tot) ? 0 : tot;
        
        let gradeLetter = 'F';
        if (updated.total_score >= 70) gradeLetter = 'A';
        else if (updated.total_score >= 60) gradeLetter = 'B';
        else if (updated.total_score >= 50) gradeLetter = 'C';
        else if (updated.total_score >= 40) gradeLetter = 'D';
        else if (updated.total_score >= 30) gradeLetter = 'E';
        updated.grade_letter = gradeLetter;
        
        return updated;
      }
      return g;
    }));
  };

  const handleAdminSaveGrades = async () => {
    if (!adminGradesClass || !adminGradesSubject) return;
    setNotify('');
    setErrorMsg('');
    try {
      await api.saveGrades({
        class_id: parseInt(adminGradesClass),
        subject_id: parseInt(adminGradesSubject),
        term: settings.active_term,
        academic_year: settings.active_session,
        grades: adminStudentsGrades
      });
      setNotify('Grades submitted and saved successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'student-results' && resultsSubTab === 'enter-marks' && adminGradesClass && adminGradesSubject) {
      loadAdminGrades();
    }
  }, [activeSubTab, resultsSubTab, adminGradesClass, adminGradesSubject, settings.active_term, settings.active_session]);

  if (isInitialLoad) return <LoadingSpinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
      {/* Toast Notifications are now handled by GlobalUIProvider */}



      {/* =======================================================
          TAB 1: OVERVIEW METRICS & 3D ANALYTICS
          ======================================================= */}
      {activeSubTab === 'overview' && (() => {
        // Calculate class distribution data for 3D column chart
        const classEnrollmentData = classes.map((c, idx) => {
          const count = students.filter(s => s.class_id === c.id).length;
          const colors = [
            { main: '#38ef7d', top: '#a8ff78' },
            { main: '#0072ff', top: '#00c6ff' },
            { main: '#E100FF', top: '#ff8a00' },
            { main: '#ff9900', top: '#ffdb58' },
            { main: '#825a2c', top: '#d4a373' },
            { main: '#F9D423', top: '#fff07c' }
          ];
          const colorPair = colors[idx % colors.length];
          return {
            label: c.name,
            value: count,
            color: colorPair.main,
            colorTop: colorPair.top
          };
        });

        // Calculate Revenue Distribution for 3D Pie Chart
        const totalPaid = feesReport.reduce((sum, f) => sum + (f.amount_paid || 0), 0);
        const totalOwed = feesReport.reduce((sum, f) => sum + Math.max(0, (f.amount_due || 0) - (f.amount_paid || 0)), 0);
        const feeRevenuePieData = [
          { label: 'Amount Paid (Collected)', value: totalPaid, color: 'var(--success)' },
          { label: 'Balance Owed (Pending)', value: totalOwed, color: 'var(--danger)' }
        ];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Actions */}
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚡</span> Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => { onSelectTab('students'); setShowStudentModal(true); }}>
                  <Plus size={16} /> Register Student
                </button>
                <button className="btn btn-success" onClick={() => { onSelectTab('teachers'); setShowTeacherModal(true); }} style={{ backgroundColor: 'var(--success)' }}>
                  <Plus size={16} /> Add Teacher
                </button>
                <button className="btn btn-warning" onClick={() => onSelectTab('fees')} style={{ backgroundColor: 'var(--warning)', color: 'white' }}>
                  <Receipt size={16} /> Record Payment
                </button>
                <button className="btn btn-secondary" onClick={() => onSelectTab('settings')}>
                  <Settings size={16} /> Portal Settings
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard label="STUDENTS REGISTERED" value={students.length} icon={<Users size={24} />} variant="primary" />
              <StatCard label="ACADEMIC TEACHERS" value={teachers.length} icon={<GraduationCap size={24} />} variant="success" />
              <StatCard label="CLASS ARMS" value={classes.length} icon={<School size={24} />} variant="warning" />
              <StatCard label="SUBJECTS OFFERED" value={subjects.length} icon={<BookOpen size={24} />} variant="danger" />
            </div>

            {/* Visual 3D Analytics Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <ModernBarChart
                title="Student Class Arm Enrollment"
                subtitle="Distribution of registered students across active class streams"
                data={classEnrollmentData.length > 0 ? classEnrollmentData : [
                  { label: 'JSS 1', value: 35, color: '#38ef7d', colorTop: '#a8ff78' },
                  { label: 'JSS 2', value: 28, color: '#0072ff', colorTop: '#00c6ff' },
                  { label: 'JSS 3', value: 42, color: '#E100FF', colorTop: '#ff8a00' },
                  { label: 'SSS 1', value: 30, color: '#ff9900', colorTop: '#ffdb58' },
                  { label: 'SSS 2', value: 25, color: '#825a2c', colorTop: '#d4a373' },
                  { label: 'SSS 3', value: 20, color: '#F9D423', colorTop: '#fff07c' }
                ]}
              />

              <ModernPieChart
                title="School Fees Collection Summary"
                subtitle="Ratio of collected school fees versus pending outstanding balances"
                data={feeRevenuePieData}
              />
            </div>

            {/* ADMIN OVERALL SCHOOL RESULT UPLOAD PROGRESS - DONUT CHART */}
            <div className="glass-panel" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                    <BarChart2 size={24} style={{ color: 'var(--primary)' }} /> School-Wide Result Upload Tracker
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '6px 0 0 0' }}>
                    Marks submission overview for <strong>{adminResultProgress?.term || 'Current Term'} ({adminResultProgress?.academic_year || 'Session'})</strong>
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

              {/* Donut + Counters Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '30px', alignItems: 'center' }}>
                {/* Donut Chart */}
                <div style={{ height: '220px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: adminResultProgress?.summary?.completed || 0, color: '#10b981' },
                          { name: 'In Progress', value: adminResultProgress?.summary?.in_progress || 0, color: '#f59e0b' },
                          { name: 'Pending', value: adminResultProgress?.summary?.pending || 0, color: '#ef4444' }
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
                          { name: 'Completed', value: adminResultProgress?.summary?.completed || 0, color: '#10b981' },
                          { name: 'In Progress', value: adminResultProgress?.summary?.in_progress || 0, color: '#f59e0b' },
                          { name: 'Pending', value: adminResultProgress?.summary?.pending || 0, color: '#ef4444' }
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
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
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: adminResultProgress?.summary?.percentage === 100 ? '#10b981' : 'var(--text-primary)', lineHeight: '1' }}>
                      {adminResultProgress?.summary?.percentage || 0}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Done</div>
                  </div>
                </div>

                {/* Summary Counters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}><BookOpen size={16} /> Total Allocations</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e40af' }}>{adminResultProgress?.summary?.total || 0}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}><CircleCheck size={16} /> Fully Uploaded</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#065f46' }}>{adminResultProgress?.summary?.completed || 0}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}><Hourglass size={16} /> In Progress</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#92400e' }}>{adminResultProgress?.summary?.in_progress || 0}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}><Clock size={16} /> Pending Uploads</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#991b1b' }}>{adminResultProgress?.summary?.pending || 0}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Roster Table */}
              {showUploadDetails && adminResultProgress?.details && adminResultProgress.details.length > 0 && (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  {/* Filter Bar */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px', padding: '14px 14px 0' }}>
                    <input
                      type="text"
                      placeholder="Search class, subject or teacher..."
                      value={adminProgressSearch}
                      onChange={(e) => setAdminProgressSearch(e.target.value)}
                      className="form-control"
                      style={{ flex: '1 1 200px', padding: '7px 12px', fontSize: '0.83rem' }}
                    />
                    {['all', 'Completed', 'In Progress', 'Pending'].map(f => (
                      <button
                        key={f}
                        onClick={() => setAdminProgressFilter(f)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          borderRadius: '20px',
                          border: `1px solid ${
                            f === 'Completed' ? '#86efac' :
                            f === 'In Progress' ? '#fde68a' :
                            f === 'Pending' ? '#fca5a5' : 'var(--border-color)'
                          }`,
                          backgroundColor: adminProgressFilter === f
                            ? (f === 'Completed' ? '#dcfce7' : f === 'In Progress' ? '#fef3c7' : f === 'Pending' ? '#fee2e2' : 'var(--primary)')
                            : 'var(--bg-secondary)',
                          color: adminProgressFilter === f
                            ? (f === 'Completed' ? '#15803d' : f === 'In Progress' ? '#b45309' : f === 'Pending' ? '#b91c1c' : '#fff')
                            : 'var(--text-secondary)',
                          fontWeight: adminProgressFilter === f ? '700' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                  </div>
                  <table className="school-table" style={{ width: '100%', fontSize: '0.9rem', margin: 0 }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '14px' }}>Class Arm</th>
                        <th style={{ padding: '14px' }}>Subject</th>
                        <th style={{ padding: '14px' }}>Assigned Teacher</th>
                        <th style={{ padding: '14px' }}>Progress</th>
                        <th style={{ padding: '14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminResultProgress.details
                        .filter(item =>
                          (adminProgressFilter === 'all' || item.status === adminProgressFilter) &&
                          (adminProgressSearch === '' ||
                            item.class_name.toLowerCase().includes(adminProgressSearch.toLowerCase()) ||
                            item.subject_name.toLowerCase().includes(adminProgressSearch.toLowerCase()) ||
                            (item.teacher_name || '').toLowerCase().includes(adminProgressSearch.toLowerCase())
                          )
                        )
                        .map((item, idx) => (
                        <tr key={idx} style={{ transition: 'background-color 0.2s', borderBottom: '1px solid var(--border-color)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '14px' }}><strong>{item.class_name}</strong></td>
                          <td style={{ padding: '14px' }}>{item.subject_name}</td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={14} style={{ color: 'var(--text-secondary)' }} />
                              {item.teacher_name}
                            </div>
                          </td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* =======================================================
          TAB 2: STUDENT REGISTRY
          ======================================================= */}
      {activeSubTab === 'students' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Student Roster</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Click any student's name to view and print their official registration profile.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowGraduatesModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                <Users size={16} /> Manage Graduates
              </button>
              <button className="btn btn-primary" onClick={() => setShowStudentModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                <Plus size={16} /> Register New Student
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minWidth: '200px', padding: '10px' }}
              placeholder="Search student by name or admission number..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: '200px', padding: '10px' }}
              value={studentClassFilter}
              onChange={(e) => setStudentClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {(() => {
            const filteredStudents = students.filter(student => {
              const matchesSearch = student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                    student.admission_number.toLowerCase().includes(studentSearch.toLowerCase());
              const matchesClass = studentClassFilter === '' || student.class_id === parseInt(studentClassFilter);
              return matchesSearch && matchesClass;
            });
            const paginatedStudents = filteredStudents.slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize);
            
            return (
              <>
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="school-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Passport</th>
                        <th>Full Name</th>
                        <th>Admission Number</th>
                        <th>Class Arm</th>
                        <th>Parent Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((student, idx) => (
                  <tr key={idx}>
                    <td>
                      <div
                        style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer' }}
                        onClick={() => setSelectedStudentForForm(student)}
                        title="Click to view student profile"
                      >
                        {student.passport_photo && <img src={student.passport_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForForm(student)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.95rem',
                          textAlign: 'left',
                          textDecoration: 'hover'
                        }}
                        title="Click to view student profile"
                      >
                        {student.full_name}
                      </button>
                    </td>
                    <td><code>{student.admission_number}</code></td>
                    <td>{student.class_name || 'Unassigned'}</td>
                    <td>{student.parent_name} ({student.parent_phone})</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                        value={student.status || 'active'}
                        onChange={(e) => handleUserStatusChange(student.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={studentPage} 
              totalItems={filteredStudents.length} 
              pageSize={studentPageSize} 
              onPageChange={setStudentPage} 
              onPageSizeChange={setStudentPageSize} 
            />
          </div>
        </>
      );
    })()}
  </div>
)}

      {/* =======================================================
          TAB 3: STAFF REGISTRY
          ======================================================= */}
      {activeSubTab === 'teachers' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', maxWidth: '100%', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                <Users size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Teacher Registry</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Full record of registered school academic staff.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => { setTeacherForm({ full_name: '', username: '', phone: '', email: '', temp_password: '' }); setShowTeacherModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                <Plus size={16} /> Register Teacher
              </button>
              <button
                onClick={() => setShowArchivedTeachers(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: !showArchivedTeachers ? 'white' : 'rgba(255,255,255,0.15)', color: !showArchivedTeachers ? 'var(--primary)' : 'white', fontWeight: !showArchivedTeachers ? '700' : '400', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                Active Teachers
              </button>
              <button
                onClick={() => setShowArchivedTeachers(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: showArchivedTeachers ? 'white' : 'rgba(255,255,255,0.15)', color: showArchivedTeachers ? 'var(--primary)' : 'white', fontWeight: showArchivedTeachers ? '700' : '400', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                Archived Teachers
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1, minWidth: '250px', padding: '10px' }}
              placeholder="Search teacher by name or username..."
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
            />
            <select
              className="form-control"
              style={{ width: '200px', padding: '10px' }}
              value={teacherClassFilter}
              onChange={(e) => setTeacherClassFilter(e.target.value)}
            >
              <option value="">All Class Streams</option>
              {classes.map((cls, idx) => (
                <option key={idx} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>

          {(() => {
            const filteredTeachers = teachers.filter(teach => {
              const matchesSearch = (teach.full_name.toLowerCase().includes(teacherSearch.toLowerCase()) || teach.username.toLowerCase().includes(teacherSearch.toLowerCase()));
              const matchesStatus = showArchivedTeachers ? teach.status === 'archived' : teach.status !== 'archived';
              
              let matchesClass = true;
              if (teacherClassFilter !== '') {
                const isFormMaster = classes.some(c => c.name === teacherClassFilter && c.form_master_id === teach.id);
                const isSubjectTeacher = classSubjects.some(cs => cs.class_name === teacherClassFilter && cs.teacher_id === teach.id);
                matchesClass = isFormMaster || isSubjectTeacher;
              }
              
              return matchesSearch && matchesStatus && matchesClass;
            });
            const paginatedTeachers = filteredTeachers.slice((teacherPage - 1) * teacherPageSize, teacherPage * teacherPageSize);
            
            return (
              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Employment Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.map((teach, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                        {teach.passport_photo ? <img src={teach.passport_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : teach.full_name.charAt(0)}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTeacherForProfile(teach)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        title="Click to view teacher profile"
                      >
                        {teach.full_name}
                      </button>
                    </td>
                    <td><code>{teach.username}</code></td>
                    <td>{teach.created_at ? teach.created_at.split(' ')[0] : 'N/A'}</td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto', minWidth: '110px' }}
                        value={teach.status || 'active'}
                        onChange={(e) => handleUserStatusChange(teach.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                        onClick={() => handleDeleteTeacher(teach.id)}
                        title="Delete Teacher"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={teacherPage} 
                  totalItems={filteredTeachers.length} 
                  pageSize={teacherPageSize} 
                  onPageChange={setTeacherPage} 
                  onPageSizeChange={setTeacherPageSize} 
                />
              </div>
            );
          })()}
        </div>
      )}

      {/* =======================================================
          TAB 4: CLASSES & SUBJECTS CONFIG
          ======================================================= */}
      {activeSubTab === 'classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Class List */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <School size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Class Streams</h3>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowClassModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                <Plus size={16} /> Create Class
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-control"
                style={{ flex: 1, minWidth: '220px', padding: '10px' }}
                placeholder="Search class name..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
              />
              <select
                className="form-control"
                style={{ width: '200px', padding: '10px' }}
                value={classStreamFilter}
                onChange={(e) => setClassStreamFilter(e.target.value)}
              >
                <option value="all">All Sections (Tiers)</option>
                <option value="nursery">Nursery School</option>
                <option value="primary">Primary School</option>
                <option value="jss">Junior Secondary</option>
                <option value="sss">Senior Secondary</option>
              </select>
              <select
                className="form-control"
                style={{ width: '200px', padding: '10px' }}
                value={classFormMasterFilter}
                onChange={(e) => setClassFormMasterFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Form Master Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            
            {(() => {
              const filteredClasses = classes.filter(c => {
                const query = classSearch.toLowerCase();
                const matchesSearch = c.name.toLowerCase().includes(query);
                const matchesStream = classStreamFilter === 'all' || c.tier === classStreamFilter;
                const isAssigned = !!c.form_master_id;
                const matchesMaster = classFormMasterFilter === 'all' || 
                                      (classFormMasterFilter === 'assigned' ? isAssigned : !isAssigned);
                return matchesSearch && matchesStream && matchesMaster;
              });
              const paginatedClasses = filteredClasses.slice((classPage - 1) * classPageSize, classPage * classPageSize);
              return (
                <div className="table-container">
              <table className="school-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Tier</th>
                    <th>Form Master</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClasses.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No classes found.</td></tr>
                  ) : (
                    paginatedClasses.map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{c.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.tier}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                          value={c.form_master_id || ''}
                          onChange={(e) => handleFormMasterAssign(c.id, e.target.value)}
                        >
                          <option value="">Assign Master...</option>
                          {teachers.map((t, idx) => (
                            <option key={idx} value={t.id}>{t.full_name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}
                          title="Edit"
                          onClick={() => handleEditClassClick(c)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete"
                          onClick={() => handleDeleteClass(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination 
                currentPage={classPage} 
                totalItems={filteredClasses.length} 
                pageSize={classPageSize} 
                onPageChange={setClassPage} 
                onPageSizeChange={setClassPageSize} 
              />
            </div>
          );
        })()}
          </div>

        </div>
      )}

      {/* =======================================================
          TAB 5: SUBJECTS CURRICULUM MANAGEMENT
          ======================================================= */}
      {activeSubTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Sub-Tab Navigation handled by Sidebar */}

          {subjectsSubTab === 'list' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <BookOpen size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Curriculum Subjects</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>View, add, edit, or delete subjects in the school curriculum.</p>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => { setSubjectForm({ name: '', tier: 'primary', class_ids: [] }); setShowSubjectModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                  <Plus size={16} /> Add Subject
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 1, minWidth: '220px', padding: '10px' }}
                  placeholder="Search subject by name..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '200px', padding: '10px' }}
                  value={subjectTierFilter}
                  onChange={(e) => setSubjectTierFilter(e.target.value)}
                >
                  <option value="all">All Tiers</option>
                  <option value="nursery">Nursery School</option>
                  <option value="primary">Primary School</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>

          {(() => {
            const filteredSubjects = subjects.filter(sub => {
              const query = subjectSearch.toLowerCase();
              const matchesSearch = sub.name.toLowerCase().includes(query);
              const matchesTier = subjectTierFilter === 'all' || sub.tier === subjectTierFilter;
              return matchesSearch && matchesTier;
            });
            const paginatedSubjects = filteredSubjects.slice((subjectPage - 1) * subjectPageSize, subjectPage * subjectPageSize);
            return (
              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Subject Name</th>
                      <th>Tier Level</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubjects.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects found on this page.</td>
                      </tr>
                    ) : (
                      paginatedSubjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{sub.name}</td>
                      <td style={{ textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--primary)' }}>{sub.tier}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', display: 'inline-flex', marginRight: '6px' }}
                          title="Edit"
                          onClick={() => handleEditSubjectClick(sub)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', display: 'inline-flex' }}
                          title="Delete"
                          onClick={() => handleDeleteSubject(sub.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={subjectPage} 
                  totalItems={filteredSubjects.length} 
                  pageSize={subjectPageSize} 
                  onPageChange={setSubjectPage} 
                  onPageSizeChange={setSubjectPageSize} 
                />
              </div>
            );
          })()}
        </div>
      )}

          {subjectsSubTab === 'assignments' && (
            <>
              {/* Subject Assignments */}
              <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <BookOpen size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Subject Assignments</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setShowSubjectModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                  <Plus size={16} /> Register Subject
                </button>
                <button className="btn btn-primary" onClick={() => { setIsEditingAssignment(false); setAssignForm({ class_ids: [], subject_id: '', teacher_id: '' }); setShowAssignModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                  <Users size={16} /> Assign Teacher
                </button>
              </div>
            </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <select
                  className="form-control"
                  style={{ width: '200px', padding: '10px' }}
                  value={assignClassFilter}
                  onChange={(e) => setAssignClassFilter(e.target.value)}
                >
                  <option value="">All Class Streams</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  style={{ width: '200px', padding: '10px' }}
                  value={assignTeacherStatusFilter}
                  onChange={(e) => setAssignTeacherStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

          {(() => {
            const filteredClassSubjects = classSubjects.filter(cs => {
              const matchesClass = assignClassFilter === '' || cs.class_name === assignClassFilter;
              const isAssigned = !!cs.teacher_name;
              const matchesStatus = assignTeacherStatusFilter === 'all' || 
                                    (assignTeacherStatusFilter === 'assigned' ? isAssigned : !isAssigned);
              return matchesClass && matchesStatus;
            });
            const paginatedClassSubjects = filteredClassSubjects.slice((assignTeacherPage - 1) * assignTeacherPageSize, assignTeacherPage * assignTeacherPageSize);
            return (
              <div className="table-container">
                <table className="school-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Subject Teacher</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClassSubjects.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No subject assignments found on this page.</td>
                      </tr>
                    ) : (
                      paginatedClassSubjects.map((cs, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{cs.class_name}</td>
                      <td>{cs.subject_name}</td>
                      <td>
                        <span style={{ fontWeight: '500', color: cs.teacher_name ? 'inherit' : 'var(--danger)' }}>
                          {cs.teacher_name || '🚨 Unassigned'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Edit Teacher"
                          onClick={() => handleEditClassSubjectClick(cs)}
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <Pagination 
                  currentPage={assignTeacherPage} 
                  totalItems={filteredClassSubjects.length} 
                  pageSize={assignTeacherPageSize} 
                  onPageChange={setAssignTeacherPage} 
                  onPageSizeChange={setAssignTeacherPageSize} 
                />
              </div>
            );
          })()}
        </div>

          </>


          )}

        {subjectsSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>

          {/* Filter Bar */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-20px -20px 20px -20px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Book size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Scheme of Work Manager</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Create and edit the weekly course outline for any class subject.</p>
                </div>
              </div>
              {adminSchemeClass && adminSchemeSubject && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white' }}
                  onClick={() => exportPDF(schemeRef, 'scheme_of_work.pdf', 'portrait')}
                >
                  <Download size={16} /> Download PDF
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Arm</label>
                <select
                  className="form-control"
                  value={adminSchemeClass}
                  onChange={(e) => setAdminSchemeClass(e.target.value)}
                >
                  <option value="">Select Class...</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 180px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject</label>
                <select
                  className="form-control"
                  value={adminSchemeSubject}
                  onChange={(e) => setAdminSchemeSubject(e.target.value)}
                >
                  <option value="">Choose Subject...</option>
                  {classSubjects
                    .filter(cs => cs.class_id === parseInt(adminSchemeClass))
                    .map((cs, idx) => (
                      <option key={idx} value={cs.subject_id}>{cs.subject_name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, flex: '1 1 150px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Term</label>
                <select
                  className="form-control"
                  value={adminSchemeTerm}
                  onChange={(e) => setAdminSchemeTerm(e.target.value)}
                >
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scheme Table */}
          {!adminSchemeClass || !adminSchemeSubject ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a class and subject above to manage the scheme of work.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              {/* Table Header Info */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                backgroundColor: 'var(--primary-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 'bold', flexShrink: 0
                  }}>📚</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {classSubjects.find(cs => cs.class_id === parseInt(adminSchemeClass) && cs.subject_id === parseInt(adminSchemeSubject))?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {classes.find(c => c.id === parseInt(adminSchemeClass))?.name || 'Class'} · {adminSchemeTerm}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                    {adminSchemeWeeks.filter(w => w.topic).length} / 12 Weeks Filled
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="table-container" style={{ margin: 0, borderRadius: 0 }} ref={schemeRef}>
                <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '15px' }}>
                  <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h2>
                  <h4 style={{ margin: '0 0 10px 0' }}>Scheme of Work: {classSubjects.find(cs => cs.class_id === parseInt(adminSchemeClass) && cs.subject_id === parseInt(adminSchemeSubject))?.subject_name || 'Subject'} ({classes.find(c => c.id === parseInt(adminSchemeClass))?.name || 'Class'})</h4>
                  <p style={{ margin: '0', fontSize: '0.9rem' }}>Term: {adminSchemeTerm} | Session: {settings?.active_session || 'Current Session'}</p>
                </div>
                <table className="school-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>Week</th>
                      <th style={{ width: '38%' }}>Title & Subtitle</th>
                      <th>Content / Objectives (Text Area)</th>
                      <th style={{ width: '120px', textAlign: 'center' }} className="no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSchemeWeeks.map((w, idx) => (
                      <tr key={idx} style={{ backgroundColor: w.topic ? 'transparent' : 'rgba(var(--danger-rgb, 255,59,48), 0.03)' }}>
                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <label className="no-print" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '3px', display: 'block', letterSpacing: '0.03em' }}>Topic Title</label>
                              <div className="only-print" style={{ display: 'none', fontWeight: '700', fontSize: '0.92rem', color: '#000' }}>{w.topic || '-'}</div>
                              <input
                                type="text"
                                className="form-control no-print"
                                style={{ fontSize: '0.88rem', padding: '8px 10px', margin: 0 }}
                                placeholder="e.g. Introduction to Algebra"
                                value={w.topic}
                                onChange={(e) => handleAdminSchemeFieldChange(w.week, 'topic', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="no-print" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '3px', display: 'block', letterSpacing: '0.03em' }}>Subtitle / Theme</label>
                              <div className="only-print" style={{ display: 'none', fontSize: '0.8rem', color: '#444', marginTop: '3px', fontWeight: '500' }}>{w.subtitle ? `?? ${w.subtitle}` : ''}</div>
                              <input
                                type="text"
                                className="form-control no-print"
                                style={{ fontSize: '0.82rem', padding: '7px 10px', margin: 0 }}
                                placeholder="e.g. Linear Equations & Variables"
                                value={w.subtitle || ''}
                                onChange={(e) => handleAdminSchemeFieldChange(w.week, 'subtitle', e.target.value)}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          <label className="no-print" style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '3px', display: 'block', letterSpacing: '0.03em' }}>Detailed Content & Learning Objectives</label>
                          <div className="only-print" style={{ display: 'none', fontSize: '0.85rem', color: '#000', whiteSpace: 'pre-wrap' }}>{w.objectives || '-'}</div>
                          <textarea
                            className="form-control no-print"
                            rows={3}
                            style={{ fontSize: '0.85rem', padding: '8px 10px', margin: 0, resize: 'vertical', width: '100%' }}
                            placeholder="Enter detailed weekly lesson outline, objectives, activities, and teacher remarks..."
                            value={w.objectives || ''}
                            onChange={(e) => handleAdminSchemeFieldChange(w.week, 'objectives', e.target.value)}
                          />
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 10px', verticalAlign: 'top', paddingTop: '32px' }} className="no-print">
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleSaveAdminSchemeWeek(w)}
                            >
                              Save
                            </button>
                            {(w.id || w.topic || w.subtitle || w.objectives) && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => handleDeleteAdminSchemeWeek(w)}
                                title="Clear this week"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
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

              </div>
      )}

      {/* =======================================================
          TAB 5: FINANCE & INVOICES LEDGER
          ======================================================= */}
      {/* =======================================================
          TAB 5: FINANCE & INVOICES LEDGER
          ======================================================= */}
      {activeSubTab === 'fees' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          
          {/* Sub Navigation handled by Sidebar */}

          {/* SUBTAB 1: BILLING & INVOICES (UNIQUE STUDENT ROSTER) */}
          {activeFeesSubTab === 'invoices' && (() => {
            // Aggregate invoices by student so each student appears ONLY ONCE
            const studentMap = {};

            // Seed with all registered students
            students.forEach(s => {
              const cName = s.class_name || (classes.find(c => c.id === s.class_id)?.name) || 'Unassigned';
              studentMap[s.id] = {
                student_id: s.id,
                full_name: s.full_name,
                admission_number: s.admission_number,
                class_id: s.class_id,
                class_name: cName,
                total_billed: 0,
                total_paid: 0,
                invoices_count: 0,
                parent_phone: s.parent_phone,
                passport_photo: s.passport_photo
              };
            });

            // Aggregate invoice totals
            feesReport.forEach(inv => {
              if (studentMap[inv.student_id]) {
                studentMap[inv.student_id].total_billed += (inv.amount_due || 0);
                studentMap[inv.student_id].total_paid += (inv.amount_paid || 0);
                studentMap[inv.student_id].invoices_count += 1;
              } else {
                studentMap[inv.student_id] = {
                  student_id: inv.student_id,
                  full_name: inv.full_name,
                  admission_number: inv.admission_number,
                  class_id: null,
                  class_name: inv.class_name || 'Unassigned',
                  total_billed: inv.amount_due || 0,
                  total_paid: inv.amount_paid || 0,
                  invoices_count: 1
                };
              }
            });

            const uniqueStudentList = Object.values(studentMap).filter(st => {
              const matchesSearch = (st.full_name || '').toLowerCase().includes(feeSearch.toLowerCase()) ||
                                    (st.admission_number || '').toLowerCase().includes(feeSearch.toLowerCase());
              const matchesClass = feeClassFilter === '' || st.class_name === classes.find(c => c.id === parseInt(feeClassFilter))?.name;
              return matchesSearch && matchesClass;
            });

            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                      <Receipt size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Student Invoices Ledger</h3>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        Click any student to view payment records, log parent payments, or print official receipts.
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setShowFeeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}>
                    <Plus size={16} /> Bill Students
                  </button>
                </div>

                {/* Search & Filter Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1, minWidth: '220px', padding: '10px' }}
                    placeholder="Search student by name or admission number..."
                    value={feeSearch}
                    onChange={(e) => setFeeSearch(e.target.value)}
                  />
                  <select
                    className="form-control"
                    style={{ width: '200px', padding: '10px' }}
                    value={feeClassFilter}
                    onChange={(e) => setFeeClassFilter(e.target.value)}
                  >
                    <option value="">All Class Streams</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="table-container" style={{ margin: 0 }}>
                  <table className="school-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th>Student Details</th>
                        <th>Class</th>
                        <th style={{ textAlign: 'right' }}>Total Fees</th>
                        <th style={{ textAlign: 'right' }}>Paid</th>
                        <th style={{ textAlign: 'right' }}>Debt</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueStudentList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                            No student billing records found.
                          </td>
                        </tr>
                      ) : (
                        uniqueStudentList.slice((billingPage - 1) * billingPageSize, billingPage * billingPageSize).map((st, idx) => {
                          const balance = Math.max(0, st.total_billed - st.total_paid);
                          let status = 'unpaid';
                          if (st.total_billed === 0) status = 'none';
                          else if (st.total_paid >= st.total_billed) status = 'paid';
                          else if (st.total_paid > 0) status = 'partial';

                          return (
                            <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => handleOpenStudentPaymentHistory(st.student_id, st)}>
                              <td style={{ fontWeight: '600' }}>
                                <div style={{ color: 'var(--primary)', fontWeight: '700' }}>{st.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  ID: <code style={{ fontSize: '0.72rem' }}>{st.admission_number}</code>
                                </div>
                              </td>
                              <td>{st.class_name}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₦{st.total_billed.toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>₦{st.total_paid.toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                ₦{balance.toLocaleString()}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${status === 'paid' ? 'badge-success' : status === 'partial' ? 'badge-warning' : status === 'unpaid' ? 'badge-danger' : 'badge-secondary'}`}>
                                  {status === 'paid' ? 'Fully Paid' : status === 'partial' ? 'Partial' : status === 'unpaid' ? 'Unpaid' : 'No Invoices'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={billingPage} 
                    totalItems={uniqueStudentList.length} 
                    pageSize={billingPageSize} 
                    onPageChange={setBillingPage} 
                    onPageSizeChange={setBillingPageSize} 
                  />
                </div>
              </>
            );
          })()}

                    {activeFeesSubTab === 'custom' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>Other Fees (Custom Invoices)</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage ad-hoc invoices assigned to classes or cohorts.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setNewFeeStructureForm({ title: '', category: 'Uniform/Books', amount: '', tier: 'jss' }); setShowFeeModal(true); }}>+ Add Other Fees</button>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 1, minWidth: '220px', padding: '10px' }}
                  placeholder="Search fee title..."
                  value={customInvoiceSearch}
                  onChange={(e) => setCustomInvoiceSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '200px', padding: '10px' }}
                  value={customInvoiceClassFilter}
                  onChange={(e) => setCustomInvoiceClassFilter(e.target.value)}
                >
                  <option value="">All Class Streams</option>
                  {classes.map((cls, idx) => (
                    <option key={idx} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const filteredInvoices = customInvoices.filter(inv => {
                  const query = customInvoiceSearch.toLowerCase();
                  const matchesSearch = inv.title.toLowerCase().includes(query);
                  const matchesClass = customInvoiceClassFilter === '' || (inv.class_name && inv.class_name === customInvoiceClassFilter);
                  return matchesSearch && matchesClass;
                });
                const paginatedInvoices = filteredInvoices.slice((customInvoicePage - 1) * customInvoicePageSize, customInvoicePage * customInvoicePageSize);
                
                return (
                  <div className="table-container">
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Billed Amount</th>
                          <th>Target Cohort</th>
                          <th>Total Assigned</th>
                          <th>Fully Paid</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInvoices.length === 0 ? (
                          <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No custom invoices found.</td></tr>
                        ) : (
                          paginatedInvoices.map((inv, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{inv.title}</td>
                          <td><span className="badge badge-outline">{inv.category}</span></td>
                          <td style={{ color: '#10b981', fontWeight: '700' }}>₦{Number(inv.amount_due).toLocaleString()}</td>
                          <td>{inv.class_name ? `Class: ${inv.class_name}` : `Tier: ${inv.tier ? inv.tier.toUpperCase() : 'N/A'}`}</td>
                          <td>{inv.assigned_students} Students</td>
                          <td>{inv.fully_paid} Paid</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', marginRight: '5px' }} onClick={() => {
                              setEditingCustomInvoice({
                                old_title: inv.title,
                                old_category: inv.category,
                                old_amount_due: inv.amount_due,
                                class_id: inv.class_id,
                                tier: inv.tier,
                                title: inv.title,
                                category: inv.category,
                                amount: inv.amount_due
                              });
                              setShowEditCustomInvoiceModal(true);
                            }}>Edit</button>
                            <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteCustomInvoiceGroup(inv)}>Delete</button>
                          </td>
                        </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    <Pagination 
                      currentPage={customInvoicePage} 
                      totalItems={filteredInvoices.length} 
                      pageSize={customInvoicePageSize} 
                      onPageChange={setCustomInvoicePage} 
                      onPageSizeChange={setCustomInvoicePageSize} 
                    />
                  </div>
                );
              })()}
            </>
          )}

          {/* SUBTAB 2: FEE STRUCTURES */}
          {activeFeesSubTab === 'structures' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <Layers size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>School Fee Structures</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Define default termly school fees billed per education levels.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleGenerateTermlyFee}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}
                  >
                    Generate {settings?.active_term && settings?.active_session ? `${settings.active_term} ${settings.active_session}` : 'Active Term and Session'} School Fees
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setEditingFeeStructure(null);
                      setNewFeeStructureForm({ title: '', category: 'School Fees', amount: '', tier: 'jss' });
                      setShowFeeStructureModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '20px' }}
                  >
                    <Plus size={16} /> Add Structure
                  </button>
                </div>
              </div>

              {(() => {
                const paginatedFeeStructures = feeStructures.slice((feeStructPage - 1) * feeStructPageSize, feeStructPage * feeStructPageSize);
                return (
                  <div className="table-container" style={{ margin: 0 }}>
                    <table className="school-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Fee Title</th>
                          <th>Total Fees</th>
                          <th>Class Tier</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeStructures.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>No structures configured yet.</td>
                          </tr>
                        ) : (
                          paginatedFeeStructures.map((struct, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{struct.title}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₦{struct.amount.toLocaleString()}</td>
                          <td style={{ textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 'bold' }}>{struct.tier}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', display: 'inline-flex', marginRight: '6px' }}
                              title="Edit"
                              onClick={() => handleEditFeeStructureClick(struct)}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', display: 'inline-flex' }}
                              title="Delete"
                              onClick={() => handleDeleteFeeStructure(struct.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={feeStructPage} 
                    totalItems={feeStructures.length} 
                    pageSize={feeStructPageSize} 
                    onPageChange={setFeeStructPage} 
                    onPageSizeChange={setFeeStructPageSize} 
                  />
                </div>
              );
            })()}
            </>
          )}

          {/* SUBTAB 3: PAYMENT RECORDS (FORMERLY PAID FEES REPORT) */}
          {activeFeesSubTab === 'report' && (() => {
            const filteredList = feesReport.filter(inv => {
              const amountDue = parseFloat(inv.amount_due) || 0;
              const amountPaid = parseFloat(inv.amount_paid) || 0;
              const remaining = Math.max(0, amountDue - amountPaid);
              const calculatedStatus = remaining <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid');
              
              const matchesSearch = (inv.full_name || '').toLowerCase().includes(paymentReportSearch.toLowerCase()) ||
                                    (inv.admission_number || '').toLowerCase().includes(paymentReportSearch.toLowerCase());
              const matchesClass = paymentReportClassFilter === '' || inv.class_name === classes.find(c => c.id === parseInt(paymentReportClassFilter))?.name;
              const matchesStatus = paymentReportStatusFilter === 'all' || calculatedStatus === paymentReportStatusFilter;
              
              return matchesSearch && matchesClass && matchesStatus;
            });

            const totalBilled = filteredList.reduce((sum, item) => sum + (item.amount_due || 0), 0);
            const totalPaid = filteredList.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
            const totalRemaining = Math.max(0, totalBilled - totalPaid);

            // Chart 1 Data: 3D Summary Chart (Total Fees vs Paid vs Debt)
            const financialSummary3DData = [
              { label: 'Total Fees', value: totalBilled, color: '#3b82f6', colorTop: '#60a5fa' },
              { label: 'Paid', value: totalPaid, color: '#10b981', colorTop: '#34d399' },
              { label: 'Debt', value: totalRemaining, color: '#ef4444', colorTop: '#f87171' }
            ];

            // Chart 2 Data: Revenue Collection per Class Stream
            const classRevenueMap = {};
            filteredList.forEach(item => {
              const cName = item.class_name || 'Unassigned';
              if (!classRevenueMap[cName]) classRevenueMap[cName] = 0;
              classRevenueMap[cName] += (item.amount_paid || 0);
            });

            const classRevenueColumnData = Object.keys(classRevenueMap).map((cName, idx) => {
              const colors = [
                { main: '#38ef7d', top: '#a8ff78' },
                { main: '#0072ff', top: '#00c6ff' },
                { main: '#E100FF', top: '#ff8a00' },
                { main: '#ff9900', top: '#ffdb58' },
                { main: '#825a2c', top: '#d4a373' }
              ];
              const colorPair = colors[idx % colors.length];
              return {
                label: cName,
                value: classRevenueMap[cName],
                color: colorPair.main,
                colorTop: colorPair.top
              };
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} ref={paymentReportRef}>
                {/* Header & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                      <CreditCard size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Student Payment Records Audit</h3>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        Financial records analytics and student termly payment status ledger.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }} className="no-print">
                    <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white' }} onClick={() => handleExportPaymentReportExcel(filteredList)}>
                      📊 Export to Excel
                    </button>
                    <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)', color: 'white' }} onClick={() => exportPDF(paymentReportRef, 'payment_report.pdf', 'landscape')}>
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>

                {/* Status Filter Buttons & Controls */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
                  <input
                    ref={(el) => { if (!paymentReportRef.current && el) paymentReportRef.current = el.closest('[data-payment-report]'); }}
                    type="text"
                    className="form-control"
                    style={{ flex: '1 1 200px', padding: '9px 12px', fontSize: '0.85rem' }}
                    placeholder="Search student, admission no, or fee..."
                    value={paymentReportSearch}
                    onChange={(e) => setPaymentReportSearch(e.target.value)}
                  />

                  <select
                    className="form-control"
                    style={{ width: '150px', padding: '9px 12px', fontSize: '0.85rem' }}
                    value={paymentReportClassFilter}
                    onChange={(e) => setPaymentReportClassFilter(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className={`btn ${paymentReportStatusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      onClick={() => setPaymentReportStatusFilter('all')}
                    >
                      All Records
                    </button>
                    <button
                      type="button"
                      className={`btn ${paymentReportStatusFilter === 'paid' ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      onClick={() => setPaymentReportStatusFilter('paid')}
                    >
                      Fully Paid
                    </button>
                    <button
                      type="button"
                      className={`btn ${paymentReportStatusFilter === 'partial' ? 'btn-warning' : 'btn-secondary'}`}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      onClick={() => setPaymentReportStatusFilter('partial')}
                    >
                      Partial Payment
                    </button>
                    <button
                      type="button"
                      className={`btn ${paymentReportStatusFilter === 'unpaid' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      onClick={() => setPaymentReportStatusFilter('unpaid')}
                    >
                      Unpaid (Zero Paid)
                    </button>
                  </div>
                </div>

                {/* Printable Official Document Header */}
                <div className="only-print" style={{ display: 'none', marginBottom: '16px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase', color: '#000' }}>
                    {settingsForm?.landing_school_name || 'Jere Model Academy'}
                  </h2>
                  <h4 style={{ margin: '4px 0', fontSize: '1rem', color: '#444' }}>
                    STUDENT PAYMENT COLLECTIONS AUDIT REPORT
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#333' }}>
                    Academic Session: <strong>{settings?.active_session || '2026/2027'}</strong> | Term: <strong>{settings?.active_term || '3rd Term'}</strong> | Date: <strong>{new Date().toLocaleDateString()}</strong>
                  </div>
                  {paymentReportStatusFilter !== 'all' && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px', color: '#000' }}>
                      Status Filter: {paymentReportStatusFilter.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Streamlined Payment Records Table */}
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="school-table" style={{ margin: 0, fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Student Details</th>
                        <th>Class</th>
                        <th style={{ textAlign: 'right' }}>Total Fees</th>
                        <th style={{ textAlign: 'right' }}>Paid</th>
                        <th style={{ textAlign: 'right' }}>Debt</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                            No payment records found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredList.slice((paymentPage - 1) * paymentPageSize, paymentPage * paymentPageSize).map((inv, idx) => {
                          const remaining = Math.max(0, inv.amount_due - inv.amount_paid);
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenStudentPaymentHistory(inv.student_id, inv)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '0.85rem',
                                    textAlign: 'left',
                                    display: 'block'
                                  }}
                                  title="Click to view complete payment profile & receipts"
                                >
                                  {inv.full_name}
                                </button>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  ID: <code style={{ fontSize: '0.7rem' }}>{inv.admission_number}</code>
                                </div>
                              </td>
                              <td>{inv.class_name || 'Unassigned'}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₦{(parseFloat(inv.amount_due) || 0).toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold' }}>₦{(parseFloat(inv.amount_paid) || 0).toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: remaining > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>
                                ₦{remaining.toLocaleString()}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {remaining <= 0 ? (
                                  <span className="badge badge-success">Fully Paid</span>
                                ) : (parseFloat(inv.amount_paid) || 0) > 0 ? (
                                  <span className="badge badge-warning">Partial</span>
                                ) : (
                                  <span className="badge badge-danger">Unpaid</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={paymentPage} 
                    totalItems={filteredList.length} 
                    pageSize={paymentPageSize} 
                    onPageChange={setPaymentPage} 
                    onPageSizeChange={setPaymentPageSize} 
                  />
                </div>
              </div>
            );
          })()}

          {/* SUBTAB 4: PAYMENT SUMMARY (MVP TERM FINANCIAL BREAKDOWN) */}
          {activeFeesSubTab === 'summary' && (() => {
            const totalBilled = feesReport.reduce((sum, item) => sum + (item.amount_due || 0), 0);
            const totalPaid = feesReport.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
            const totalDebt = Math.max(0, totalBilled - totalPaid);
            const collectionRate = totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : '0.0';

            const classRevenueMap = {};
            const classBilledMap = {};
            const classStudentCountMap = {};

            classes.forEach(c => {
              classRevenueMap[c.name] = 0;
              classBilledMap[c.name] = 0;
              classStudentCountMap[c.name] = 0;
            });

            students.forEach(s => {
              const cName = s.class_name || (classes.find(c => c.id === s.class_id)?.name) || 'Unassigned';
              if (classStudentCountMap[cName] !== undefined) {
                classStudentCountMap[cName] += 1;
              } else {
                classStudentCountMap[cName] = 1;
              }
            });

            feesReport.forEach(item => {
              const cName = item.class_name || 'Unassigned';
              if (classRevenueMap[cName] === undefined) classRevenueMap[cName] = 0;
              if (classBilledMap[cName] === undefined) classBilledMap[cName] = 0;
              classRevenueMap[cName] += (item.amount_paid || 0);
              classBilledMap[cName] += (item.amount_due || 0);
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} ref={feeSummaryRef}>
                {/* Header & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', borderRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                      <BarChart2 size={28} color="white" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.5px' }}>School Fees Payment Summary</h3>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        Term: <strong>{settings?.active_term || '3rd Term'}</strong> ({settings?.active_session || '2026/2027'}) | Executive MVP breakdown of school fee collections & outstanding debt balances.
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-primary no-print" style={{ fontSize: '0.85rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} onClick={() => exportPDF(feeSummaryRef, 'fee_summary.pdf')}>
                    <Download size={18} /> Download PDF
                  </button>
                </div>

                {/* Printable Official Header */}
                <div className="only-print" style={{ display: 'none', marginBottom: '16px', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', textTransform: 'uppercase', color: '#000' }}>
                    {settingsForm?.landing_school_name || 'Jere Model Academy'}
                  </h2>
                  <h4 style={{ margin: '4px 0', fontSize: '1rem', color: '#444' }}>
                    EXECUTIVE TERM FINANCIAL PAYMENT SUMMARY REPORT
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#333' }}>
                    Academic Session: <strong>{settings?.active_session || '2026/2027'}</strong> | Term: <strong>{settings?.active_term || '3rd Term'}</strong> | Date: <strong>{new Date().toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* 4 Executive Financial Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
                  <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#3b82f6', opacity: 0.08, transform: 'rotate(-15deg)' }}><Receipt size={90} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Fees Billed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginTop: '6px' }}>
                      ₦{totalBilled.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #10b981', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#10b981', opacity: 0.08, transform: 'rotate(-15deg)' }}><CheckCircle size={90} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue Paid</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#065f46', marginTop: '6px' }}>
                      ₦{totalPaid.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#ef4444', opacity: 0.08, transform: 'rotate(-15deg)' }}><AlertCircle size={90} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outstanding Debt</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#991b1b', marginTop: '6px' }}>
                      ₦{totalDebt.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #8b5cf6', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#8b5cf6', opacity: 0.08, transform: 'rotate(-15deg)' }}><TrendingUp size={90} /></div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Collection Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#5b21b6', marginTop: '6px' }}>
                      {collectionRate}%
                    </div>
                  </div>
                </div>

                {/* Class Stream Financial Summary Table */}
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '1.05rem', margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={20} color="var(--primary)" /> Class Stream Financial Breakdown</h4>
                  <div className="table-container" style={{ margin: 0, borderRadius: 'var(--radius-md)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                          <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Class</th>
                          <th style={{ padding: '14px 18px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Students</th>
                          <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Fees</th>
                          <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Paid</th>
                          <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Debt</th>
                          <th style={{ padding: '14px 18px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Collection Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(classRevenueMap).length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No class financial summary data available.</td>
                          </tr>
                        ) : (
                          Object.keys(classRevenueMap).map((cName, idx) => {
                            const billed = classBilledMap[cName] || 0;
                            const paid = classRevenueMap[cName] || 0;
                            const debt = Math.max(0, billed - paid);
                            const count = classStudentCountMap[cName] || 0;
                            const rate = billed > 0 ? ((paid / billed) * 100).toFixed(1) : (paid > 0 ? '100.0' : '0.0');

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--text-primary)' }}>{cName}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>{count}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>₦{billed.toLocaleString()}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--success)', fontWeight: '700' }}>₦{paid.toLocaleString()}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'right', color: debt > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '700' }}>₦{debt.toLocaleString()}</td>
                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                  <span className={`badge ${parseFloat(rate) >= 100 ? 'badge-success' : parseFloat(rate) > 0 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                                    {rate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()}

          {/* SUBTAB 5: BULK PRINT RECEIPTS */}
          {activeFeesSubTab === 'print_receipts' && (
            <BulkReceiptPrinter
              classes={classes}
              sessions={sessions}
              currentTerm={settings?.active_term}
              currentSession={settings?.active_session}
              settings={settings}
              onClose={() => setActiveFeesSubTab('invoices')}
            />
          )}

        </div>
      )}

      {/* =======================================================
          TAB: STUDENT RESULTS WORKSPACE (BULK PRINT, BROADSHEET & PINS)
          ======================================================= */}
      {activeSubTab === 'student-results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Sub-Tab Navigation handled by Sidebar */}

          {/* Sub-Tab: Single Student Result View */}
          {resultsSubTab === 'single' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Search size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Single Student Result Lookup</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Select a class arm and student to generate and view their official terminal report card.
                  </p>
                </div>
              </div>

              <form onSubmit={handleFetchSingleResult} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Select Class Arm</label>
                  <select
                    className="form-control"
                    value={singleResultClassId}
                    onChange={(e) => {
                      setSingleResultClassId(e.target.value);
                      setSingleResultStudentId('');
                    }}
                  >
                    <option value="">Select Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Select Student</label>
                  <select
                    className="form-control"
                    value={singleResultStudentId}
                    onChange={(e) => setSingleResultStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students
                      .filter(s => !singleResultClassId || String(s.class_id) === String(singleResultClassId))
                      .map((st, idx) => (
                        <option key={idx} value={st.id}>{st.full_name} ({st.admission_number || 'No ADM'})</option>
                      ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Term</label>
                  <select
                    className="form-control"
                    value={singleResultTerm}
                    onChange={(e) => setSingleResultTerm(e.target.value)}
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>School Year</label>
                  <select
                    className="form-control"
                    value={singleResultSession}
                    onChange={(e) => setSingleResultSession(e.target.value)}
                  >
                    {sessions.map((s, idx) => (
                      <option key={idx} value={s.session_name}>{s.session_name}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Search size={16} /> View Report Card
                </button>
              </form>

              {singleResultError && (
                <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{singleResultError}</div>
              )}

              {singleResultLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--primary)' }}>
                  <h4>Loading Report Card...</h4>
                </div>
              ) : singleReportCardData ? (
                <ReportCard
                  data={singleReportCardData}
                  settings={settings}
                  onClose={() => setSingleReportCardData(null)}
                />
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)' }}>
                  <p>Select a student above and click <strong>View Report Card</strong> to inspect their terminal results.</p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 1: Bulk Print Cards */}
          {resultsSubTab === 'bulk' && (
            <BulkResultPrinter
              classes={classes}
              sessions={sessions}
              currentTerm={settings?.active_term}
              currentSession={settings?.active_session}
              settings={settings}
              isStandalonePage={true}
              onBack={() => setActiveSubTab('overview')}
            />
          )}

          {/* Sub-Tab 2: Class Broadsheet */}
          {resultsSubTab === 'broadsheet' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', minWidth: 0, maxWidth: '100%', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <FileSpreadsheet size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Class Results Broadsheet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Select a class arm to view master score broadsheet, export to Excel CSV, or print.</p>
                  </div>
                </div>
              </div>

              {adminBroadsheetLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--primary)' }}>
                  <h4>Loading Class Broadsheet...</h4>
                </div>
              ) : (
                <ClassBroadsheet
                  data={adminBroadsheetData}
                  className={classes.find(c => c.id === parseInt(adminBroadsheetClassId))?.name || 'Class'}
                  term={settings?.active_term}
                  session={settings?.active_session}
                  settings={settings}
                  classes={classes}
                  onBack={() => {
                    if (adminBroadsheetClassId) {
                      setAdminBroadsheetClassId('');
                      setAdminBroadsheetData(null);
                    } else {
                      setActiveSubTab('overview');
                    }
                  }}
                  onClassSelect={(id) => {
                    setAdminBroadsheetClassId(id);
                    fetchAdminBroadsheet(id);
                  }}
                  selectedClassId={adminBroadsheetClassId}
                />
              )}
            </div>
          )}

          {/* Sub-Tab 3: Result PINs */}
          {resultsSubTab === 'pins' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <Key size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Result Verification Tokens (PINs)</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Alphanumeric tokens required by students to verify results. Max usage limit of 5 checks applies.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(5px)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>Count</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ width: '90px', padding: '8px' }}
                      value={pinCount}
                      onChange={(e) => setPinCount(e.target.value)}
                    />
                  </div>

                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '9px 18px' }} onClick={handleGeneratePins}>Bulk Generate</button>
                  <button className="btn btn-secondary" style={{ alignSelf: 'flex-end', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowPrintPinsModal(true)}>
                    <Printer size={16} /> Print Filtered PINs
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: '300px', padding: '10px' }}
                  placeholder="Search PIN code or student..."
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ maxWidth: '200px', padding: '10px' }}
                  value={pinStatusFilter}
                  onChange={(e) => setPinStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Partial)</option>
                  <option value="not_used">Not Used (New)</option>
                  <option value="exhausted">Used (Exhausted)</option>
                </select>
              </div>

              {(() => {
                const filteredPins = pins.filter(p => {
                  const query = pinSearch.toLowerCase();
                  const matchesSearch = p.pin.toLowerCase().includes(query) ||
                         (p.student_name && p.student_name.toLowerCase().includes(query)) ||
                         (p.admission_number && p.admission_number.toLowerCase().includes(query));
                  
                  let matchesStatus = true;
                  if (pinStatusFilter === 'active') {
                    matchesStatus = p.status === 'active' && p.usage_count > 0;
                  } else if (pinStatusFilter === 'not_used') {
                    matchesStatus = p.status === 'active' && (!p.usage_count || p.usage_count === 0);
                  } else if (pinStatusFilter === 'exhausted') {
                    matchesStatus = p.status === 'exhausted';
                  }

                  return matchesSearch && matchesStatus;
                });
                const paginatedPins = filteredPins.slice((pinPage - 1) * pinPageSize, pinPage * pinPageSize);
                
                return (
                  <div className="table-container" style={{ maxHeight: 'none', overflowY: 'visible' }}>
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th>Result Checker PIN</th>
                          <th>Term / Session</th>
                          <th>Assigned Student</th>
                          <th>Checks Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPins.length === 0 ? (
                          <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No PINs found.</td></tr>
                        ) : paginatedPins.map((p, idx) => (
                          <tr key={idx}>
                            <td><strong style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>{p.pin}</strong></td>
                            <td>{p.term ? `${p.term} (${p.academic_year})` : 'Universal (Any Term/Session)'}</td>
                            <td>{p.student_name ? `${p.student_name} (${p.admission_number})` : 'Unused Token'}</td>
                            <td><strong>{Math.max(0, parseInt(settingsForm?.pin_max_checks || 5) - p.usage_count)} / {parseInt(settingsForm?.pin_max_checks || 5)}</strong></td>
                            <td>
                              <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <Pagination 
                      currentPage={pinPage} 
                      totalItems={filteredPins.length} 
                      pageSize={pinPageSize} 
                      onPageChange={setPinPage} 
                      onPageSizeChange={setPinPageSize} 
                    />
                  </div>
                );
              })()}
            </div>
          )}

          {resultsSubTab === 'enter-marks' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <Pencil size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Enter Student Marks</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Select a class and subject to enter or edit grades.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(5px)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Class</label>
                    <select className="form-control" value={adminGradesClass} onChange={(e) => setAdminGradesClass(e.target.value)}>
                      <option value="">Select Class...</option>
                      {classes.map((cls, idx) => <option key={idx} value={cls.id}>{cls.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Subject</label>
                    <select className="form-control" value={adminGradesSubject} onChange={(e) => setAdminGradesSubject(e.target.value)}>
                      <option value="">Choose...</option>
                      {classSubjects.filter(cs => cs.class_id === parseInt(adminGradesClass)).map((cs, idx) => (
                        <option key={idx} value={cs.subject_id}>{cs.subject_name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '9px 18px' }} onClick={handleAdminSaveGrades}>
                    Save Marks
                  </button>
                </div>
              </div>

              {adminGradesClass && adminGradesSubject ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: '300px', padding: '10px' }}
                      placeholder="Search student by name..."
                      value={adminGradesSearch}
                      onChange={(e) => setAdminGradesSearch(e.target.value)}
                    />
                  </div>
                  <div className="grade-table-container">
                    <table className="grade-entry-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Admission No</th>
                          <th>{settings.ca1_name || 'CA 1'} (10)</th>
                          <th>{settings.ca2_name || 'CA 2'} (10)</th>
                          <th>{settings.ca3_name || 'CA 3'} (10)</th>
                          <th>{settings.ca4_name || 'CA 4'} (10)</th>
                          <th>Exam (60)</th>
                          <th>Total</th>
                          <th>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminStudentsGrades.length === 0 ? (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</td>
                          </tr>
                        ) : (
                          adminStudentsGrades.filter(g => 
                            g.full_name.toLowerCase().includes(adminGradesSearch.toLowerCase()) ||
                            g.admission_number.toLowerCase().includes(adminGradesSearch.toLowerCase())
                          ).map((g, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{g.full_name}</td>
                              <td><code>{g.admission_number}</code></td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca1 !== null ? g.ca1 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca1', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca2 !== null ? g.ca2 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca2', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca3 !== null ? g.ca3 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca3', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="10" placeholder="-" value={g.ca4 !== null ? g.ca4 : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'ca4', e.target.value)} />
                              </td>
                              <td>
                                <input type="number" className="grade-input" min="0" max="60" placeholder="-" value={g.exam_score !== null && g.exam_score !== undefined ? g.exam_score : ''} onChange={(e) => handleAdminGradeChange(g.student_id, 'exam_score', e.target.value)} />
                              </td>
                              <td>
                                <span className="grade-total">{g.total_score || 0}</span>
                              </td>
                              <td>
                                <span className={`grade-badge grade-${g.grade_letter || 'F'}`}>{g.grade_letter || '-'}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
                  <p>Please select a class and subject to view and enter marks.</p>
                </div>
              )}
            </div>
          )}

          {resultsSubTab === 'blank-scoresheet' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <FileText size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Print Scoresheet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Select a class and subject to generate a printable scoresheet.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(5px)' }} className="no-print">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Class</label>
                    <select className="form-control" value={adminScoresheetClass} onChange={(e) => { setAdminScoresheetClass(e.target.value); setAdminScoresheetSubject(''); }}>
                      <option value="">Select Class...</option>
                      {classes.map((cls, idx) => <option key={idx} value={cls.id}>{cls.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>Subject (Optional)</label>
                    <select className="form-control" value={adminScoresheetSubject} onChange={(e) => setAdminScoresheetSubject(e.target.value)} disabled={!adminScoresheetClass}>
                      <option value="">Choose...</option>
                      <option value="all">All Subjects</option>
                      {classSubjects.filter(cs => cs.class_id === parseInt(adminScoresheetClass)).map((cs, idx) => (
                        <option key={idx} value={cs.subject_id}>{cs.subject_name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={() => {
                    if (adminScoresheetSubject === 'all') {
                      exportPDF(bulkScoresheetRefAdmin, 'all_subjects_blank_scoresheets.pdf', 'portrait');
                    } else {
                      exportPDF(scoresheetRefAdmin, 'blank_scoresheet.pdf', 'portrait');
                    }
                  }} disabled={!adminScoresheetClass} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', marginTop: '18px' }}>
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              </div>

              {adminScoresheetClass ? (
                <div className="table-container" ref={scoresheetRefAdmin}>
                  <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h2>
                    <h4 style={{ margin: '0 0 10px 0' }}>Print Scoresheet: {classes.find(c => c.id === parseInt(adminScoresheetClass))?.name || 'Class'} {adminScoresheetSubject ? `- ${classSubjects.find(cs => cs.subject_id === parseInt(adminScoresheetSubject))?.subject_name}` : ''}</h4>
                    <p style={{ margin: '0', fontSize: '0.9rem' }}>Term: {settings?.active_term || 'Current Term'} | Session: {settings?.active_session || 'Current Session'}</p>
                  </div>
                  <table className="school-table blank-scoresheet-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>S/N</th>
                        <th style={{ width: '100px' }}>Adm No</th>
                        <th>Student Name</th>
                        <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA1</th>
                        <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA2</th>
                        <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA3</th>
                        <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA4</th>
                        <th style={{ width: '80px', textAlign: 'center', padding: '4px' }}>Total</th>
                        <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>Exam</th>
                        <th style={{ width: '80px', textAlign: 'center', padding: '4px' }}>G.Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.class_id === parseInt(adminScoresheetClass)).map((student, idx) => (
                        <tr key={student.id}>
                          <td>{idx + 1}</td>
                          <td><code>{student.admission_number}</code></td>
                          <td><strong>{student.full_name}</strong></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                          <td style={{ padding: '6px' }}></td>
                        </tr>
                      ))}
                      {students.filter(s => s.class_id === parseInt(adminScoresheetClass)).length === 0 && (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No students found in this class.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📝</div>
                  <p>Please select a class to generate a print scoresheet.</p>
                </div>
              )}

              {/* Hidden Bulk Printable Print Scoresheet */}
              {adminScoresheetClass && (
                <div ref={bulkScoresheetRefAdmin} style={{ display: 'none' }}>
                  {classSubjects.filter(cs => cs.class_id === parseInt(adminScoresheetClass)).map((subject, subjIdx) => (
                    <div key={subjIdx} style={{ pageBreakBefore: subjIdx > 0 ? 'always' : 'auto' }} className="bulk-single-card-page">
                      <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '15px', paddingTop: subjIdx > 0 ? '20px' : '0' }}>
                        <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h2>
                        <h4 style={{ margin: '0 0 10px 0' }}>Print Scoresheet: {classes.find(c => c.id === parseInt(adminScoresheetClass))?.name || 'Class'} - {subject.subject_name}</h4>
                        <p style={{ margin: '0', fontSize: '0.9rem' }}>Term: {settings?.active_term || 'Current Term'} | Session: {settings?.active_session || 'Current Session'}</p>
                      </div>
                      <table className="school-table blank-scoresheet-table" style={{ fontSize: '0.78rem', width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>S/N</th>
                            <th style={{ width: '100px' }}>Adm No</th>
                            <th>Student Name</th>
                            <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA1</th>
                            <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA2</th>
                            <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA3</th>
                            <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>CA4</th>
                            <th style={{ width: '80px', textAlign: 'center', padding: '4px' }}>Total</th>
                            <th style={{ width: '65px', textAlign: 'center', padding: '4px' }}>Exam</th>
                            <th style={{ width: '80px', textAlign: 'center', padding: '4px' }}>G.Tot</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.filter(s => s.class_id === parseInt(adminScoresheetClass)).map((student, idx) => (
                            <tr key={student.id}>
                              <td>{idx + 1}</td>
                              <td><code>{student.admission_number}</code></td>
                              <td><strong>{student.full_name}</strong></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                              <td style={{ padding: '6px' }}></td>
                            </tr>
                          ))}
                          {students.filter(s => s.class_id === parseInt(adminScoresheetClass)).length === 0 && (
                            <tr>
                              <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>No students found in this class.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  {classSubjects.filter(cs => cs.class_id === parseInt(adminScoresheetClass)).length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center' }}>No subjects available for this class.</div>
                  )}
                </div>
              )}

            </div>
          )}

      {resultsSubTab === 'promotions' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Move Students to Next Class</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Select a class stream to view student checklist, check students to advance, and promote to their new class for session {settings?.active_session || ''}.
                </p>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveSubTab('overview')} style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', color: 'white', borderRadius: '20px' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>

          {/* Promoted Classes Notice */}
          {promotedClassIds.length > 0 && (
            <div style={{ padding: '10px 16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span>
                ℹ️ <strong>{promotedClassIds.length} class(es)</strong> already promoted in <strong>{settings?.active_session}</strong> are hidden from selection.
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={() => setShowAllClassesInPromo(!showAllClassesInPromo)}
                >
                  {showAllClassesInPromo ? 'Hide Promoted Classes' : 'Show All Classes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={handleResetPromotedClasses}
                >
                  Reset Session Promotion Status
                </button>
                  <button className="btn btn-warning" style={{ fontSize: "0.82rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px", color: "#000", fontWeight: "bold" }} onClick={() => setShowAutoPromoteModal(true)}><Star size={14} /> Auto-Promote by Passmark</button>
              </div>
            </div>
          )}

          <form onSubmit={handlePromotionBulk}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 'bold' }}>Current Class Stream</label>
                <select
                  className="form-control"
                  value={promoSource}
                  onChange={(e) => setPromoSource(e.target.value)}
                  required
                >
                  <option value="">Select Class...</option>
                  {classes
                    .filter(c => showAllClassesInPromo || !promotedClassIds.includes(c.id))
                    .map((c, idx) => (
                      <option key={idx} value={c.id}>
                        {c.name} {promotedClassIds.includes(c.id) ? ' (Promoted)' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 'bold' }}>Target Destination Class</label>
                <select
                  className="form-control"
                  value={promoTarget}
                  onChange={(e) => setPromoTarget(e.target.value)}
                  required
                >
                  <option value="">Select Target Class...</option>
                  {classes.map((c, idx) => (
                    <option key={idx} value={c.id}>{c.name}</option>
                  ))}
                  <option value="graduate">🎓 Graduated Alumni (Complete Schooling)</option>
                </select>
              </div>
            </div>

            {/* Student Roster Checklist */}
            {promoSource ? (() => {
              const sourceStudents = students.filter(s => s.class_id === parseInt(promoSource));
              const filteredStudents = sourceStudents.filter(s => 
                s.full_name.toLowerCase().includes(promoStudentSearch.toLowerCase()) || 
                s.admission_number.toLowerCase().includes(promoStudentSearch.toLowerCase())
              );
              const targetClassName = promoTarget === 'graduate' 
                ? 'Graduated Alumni' 
                : (classes.find(c => c.id === parseInt(promoTarget))?.name || 'Target Class');
              const sourceClassName = classes.find(c => c.id === parseInt(promoSource))?.name || 'Current Class';

              return (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>
                        Registered Students in {sourceClassName} ({sourceStudents.length})
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
                        Check students who pass to advance to {promoTarget ? targetClassName : 'target class'}. Unchecked students stay in {sourceClassName}.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        style={{ width: '220px', padding: '6px 12px', fontSize: '0.85rem' }}
                        placeholder="Search student name..."
                        value={promoStudentSearch}
                        onChange={(e) => setPromoStudentSearch(e.target.value)}
                      />

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => {
                          if (selectedStudentIdsForPromo.length === sourceStudents.length) {
                            setSelectedStudentIdsForPromo([]);
                          } else {
                            setSelectedStudentIdsForPromo(sourceStudents.map(s => s.id));
                          }
                        }}
                      >
                        {selectedStudentIdsForPromo.length === sourceStudents.length ? '☐ Deselect All' : '☑ Select All'}
                      </button>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={sourceStudents.length > 0 && selectedStudentIdsForPromo.length === sourceStudents.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIdsForPromo(sourceStudents.map(s => s.id));
                                } else {
                                  setSelectedStudentIdsForPromo([]);
                                }
                              }}
                            />
                          </th>
                          <th>Admission No</th>
                          <th>Student Full Name</th>
                          <th>Promotion Action Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                              No registered students found in {sourceClassName}.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((stud, idx) => {
                            const isChecked = selectedStudentIdsForPromo.includes(stud.id);
                            return (
                              <tr key={idx} style={{ backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.04)' : 'transparent' }}>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedStudentIdsForPromo(prev => prev.filter(id => id !== stud.id));
                                      } else {
                                        setSelectedStudentIdsForPromo(prev => [...prev, stud.id]);
                                      }
                                    }}
                                  />
                                </td>
                                <td><code>{stud.admission_number}</code></td>
                                <td><strong>{stud.full_name}</strong></td>
                                <td>
                                  {isChecked ? (
                                    <span className="badge badge-success">
                                      Promote → {targetClassName}
                                    </span>
                                  ) : (
                                    <span className="badge badge-warning" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
                                      Keep in {sourceClassName}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span>
                      Selected for Promotion: <strong>{selectedStudentIdsForPromo.length}</strong> of <strong>{sourceStudents.length}</strong> students
                    </span>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={selectedStudentIdsForPromo.length === 0 || !promoTarget}
                      style={{ padding: '10px 24px', fontWeight: 'bold' }}
                    >
                      🎓 Promote Selected ({selectedStudentIdsForPromo.length})
                    </button>
                  </div>
                </div>
              );
            })() : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)' }}>
                <p>Select a current class stream above to view its student roster checklist.</p>
              </div>
            )}
          </form>
        </div>
      )}
      </div>
    )}

      {/* =======================================================
          TAB 7: SYSTEM PORTAL SETTINGS
          ======================================================= */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Sub-Tab Navigation handled by Sidebar */}

          {/* Sub-Tab 1: School Year & Term */}
          {settingsSubTab === 'academic' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <CalendarCheck size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>School Year & Term Setup</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Set the current school year, select the active term, and manage teacher grade entry permissions.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <CalendarCheck size={18} style={{ color: 'var(--primary)' }} />
                      Current School Year
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        className="form-control"
                        value={sessions.find(s => s.session_name === settingsForm.active_session)?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleSetActiveSession(val);
                            const sess = sessions.find(s => s.id === parseInt(val));
                            if (sess) setSettingsForm(prev => ({ ...prev, active_session: sess.session_name }));
                          }
                        }}
                        style={{ flex: 1, backgroundColor: 'var(--bg-surface)' }}
                      >
                        <option value="">-- Choose School Year --</option>
                        {sessions.map((s, idx) => (
                          <option key={idx} value={s.id}>
                            {s.session_name} {s.is_current ? '(Current Year)' : '(Past Year)'}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowSessionModal(true)}
                        style={{ padding: '0 16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                        title="Add New School Year"
                      >
                        <span>+ New</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <CalendarCheck size={18} style={{ color: 'var(--primary)' }} />
                      Current School Term
                    </label>
                    <select
                      className="form-control"
                      value={settingsForm.active_term}
                      onChange={(e) => setSettingsForm({ ...settingsForm, active_term: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                      <option value="3rd Term">3rd Term</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Lock size={18} style={{ color: 'var(--primary)' }} />
                      Allow Teachers to Upload Result
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_entry_open === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_entry_open: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_entry_open === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
                </div>

                <h4 style={{ marginTop: '30px', marginBottom: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={20} color="var(--primary)" />
                  Permissions & Constraints
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Clock size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Take Past Attendance
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_past_attendance === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_past_attendance: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_past_attendance === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <UserPlus size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Register Students
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_fm_register_student === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_fm_register_student: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_fm_register_student === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Pencil size={18} style={{ color: 'var(--primary)' }} />
                      Allow Form Masters to Edit Student Info
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.allow_fm_edit_student === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, allow_fm_edit_student: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.allow_fm_edit_student === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Award size={18} style={{ color: 'var(--primary)' }} />
                      Show Student Rank in Class?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_position === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_position: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_position === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <BarChart2 size={18} style={{ color: 'var(--primary)' }} />
                      Show Class Average Score?
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={settingsForm.result_show_average === 1} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, result_show_average: e.target.checked ? 1 : 0 })}
                        style={{ width: '18px', height: '18px', marginRight: '10px', accentColor: 'var(--primary)' }}
                      />
                      {settingsForm.result_show_average === 1 ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                      Number of CAs Allowed
                    </label>
                    <select
                      className="form-control"
                      value={String(settingsForm.max_ca_count || 4)}
                      onChange={(e) => setSettingsForm({ ...settingsForm, max_ca_count: parseInt(e.target.value) })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    >
                      <option value="1">1 CA</option>
                      <option value="2">2 CAs</option>
                      <option value="3">3 CAs</option>
                      <option value="4">4 CAs</option>
                    </select>
                  </div>
                </div>



                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Save size={18} />
                      Save Academic Settings
                    </button>
                  </div>
              </form>
            </div>
          )}

          {/* Sub-Tab 2: Report Card Display */}
          {settingsSubTab === 'reports' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <FileText size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Report Card Display & Signature Settings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Choose what information shows on student report cards and customize test column headers and official remarks.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateSettings}>


                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pencil size={18} /> Test & Exam Column Names
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1st Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca1_name} onChange={e => setSettingsForm({ ...settingsForm, ca1_name: e.target.value })} placeholder="CA 1" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2nd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca2_name} onChange={e => setSettingsForm({ ...settingsForm, ca2_name: e.target.value })} placeholder="CA 2" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>3rd Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca3_name} onChange={e => setSettingsForm({ ...settingsForm, ca3_name: e.target.value })} placeholder="CA 3" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>4th Test Column</label>
                      <input type="text" className="form-control" value={settingsForm.ca4_name} onChange={e => setSettingsForm({ ...settingsForm, ca4_name: e.target.value })} placeholder="CA 4" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Final Exam Column</label>
                      <input type="text" className="form-control" value={settingsForm.exam_name} onChange={e => setSettingsForm({ ...settingsForm, exam_name: e.target.value })} placeholder="Exam" />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Official Signatures & Dates
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                    
                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1', padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div>
                          <label>Principal / Headmaster Name</label>
                          <input type="text" className="form-control" value={settingsForm.principal_name} onChange={e => setSettingsForm({ ...settingsForm, principal_name: e.target.value })} placeholder="e.g. Principal Stamp (JMA)" style={{ marginBottom: '16px' }} />
                        </div>
                        <div>
                          <label>Principal Digital Signature</label>
                          {settingsForm.principal_signature ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img src={settingsForm.principal_signature} alt="Principal Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', padding: '4px' }} />
                              <button 
                                type="button" 
                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px' }}
                                onClick={() => setSettingsForm({ ...settingsForm, principal_signature: '' })}
                              >✕</button>
                            </div>
                          ) : (
                            <SignaturePad onSave={(dataUrl) => setSettingsForm({ ...settingsForm, principal_signature: dataUrl })} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <label>Next Term Opening Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_begins} onChange={e => setSettingsForm({ ...settingsForm, next_term_begins: e.target.value })} placeholder="e.g. 13/04/2026" />
                    </div>
                    <div className="form-group" style={{ margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
                      <label>Next Term Closing Date</label>
                      <input type="text" className="form-control" value={settingsForm.next_term_ends} onChange={e => setSettingsForm({ ...settingsForm, next_term_ends: e.target.value })} placeholder="e.g. 24/07/2026" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} />
                    Save Report Card Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab: Behavioral Domains (Skills) */}
          {settingsSubTab === 'skills' && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Sparkles size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Affective & Psychomotor Skills Configuration</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Manage behavioral traits and skills evaluated by form masters for students' report cards.
                  </p>
                </div>
              </div>
              <div style={{ paddingTop: '24px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                  <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Add New Skill</h4>
                    <form onSubmit={handleSkillCreate}>
                      <div className="form-group">
                        <label>Skill Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Punctuality" 
                          required 
                          value={skillForm.name}
                          onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select 
                          className="form-control" 
                          value={skillForm.category}
                          onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                        >
                          <option value="affective">Affective Domain (Character)</option>
                          <option value="psychomotor">Psychomotor Domain (Skills)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Target Section</label>
                        <select 
                          className="form-control" 
                          value={skillForm.target_section}
                          onChange={(e) => setSkillForm({ ...skillForm, target_section: e.target.value })}
                        >
                          <option value="secondary">Secondary Section (JSS / SSS)</option>
                          <option value="primary">Primary Section (Nursery / Primary)</option>
                          <option value="all">Both Sections (All Classes)</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Skill</button>
                    </form>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Existing Skills</h4>
                    <div className="table-container" style={{ margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                      <table className="school-table" style={{ margin: 0 }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                          <tr>
                            <th>Skill Name</th>
                            <th>Category</th>
                            <th>Target Section</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {skills.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No skills found.</td></tr>
                          ) : (
                            skills.map(s => (
                              <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: (s.category || '').toLowerCase() === 'affective' ? '#e0f2fe' : '#fef3c7',
                                    color: (s.category || '').toLowerCase() === 'affective' ? '#075985' : '#92400e',
                                    textTransform: 'uppercase',
                                    fontSize: '0.72rem'
                                  }}>
                                    {s.category}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    textTransform: 'capitalize',
                                    fontSize: '0.72rem'
                                  }}>
                                    {s.target_section || 'Secondary'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    title="Edit" 
                                    style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '5px' }} 
                                    onClick={() => {
                                      setSkillEditForm(s);
                                      setShowEditSkillModal(true);
                                    }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button className="btn btn-danger" title="Delete" style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleSkillDelete(s.id, s.category)}><Trash2 size={14} /></button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Website & Contact Info */}
          {(settingsSubTab === 'website' || settingsSubTab === 'landing') && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <Globe size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Portal Landing Page & Contact Settings</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Customize the school name, taglines, hero banner text, and official contact address displayed on the landing page and receipts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Globe size={18} style={{ color: 'var(--primary)' }} />
                      School Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_school_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_school_name: e.target.value })}
                      required
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <FileText size={18} style={{ color: 'var(--primary)' }} />
                      School Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_tagline || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_tagline: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Award size={18} style={{ color: 'var(--primary)' }} />
                      Hero Title (Landing Page Banner)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_hero_title || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_hero_title: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <LayoutDashboard size={18} style={{ color: 'var(--primary)' }} />
                      Hero Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settingsForm.landing_hero_desc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_hero_desc: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    ></textarea>
                  </div>

                  <div className="form-group" style={{ margin: 0, padding: '20px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                      <Globe size={18} style={{ color: 'var(--primary)' }} />
                      Official School Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.landing_address || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, landing_address: e.target.value })}
                      style={{ backgroundColor: 'var(--bg-surface)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={18} />
                    Save Landing Page Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab 4: Move Students Up */}
          {(settingsSubTab === 'promotion' || settingsSubTab === 'promotions') && (
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <GraduationCap size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Move Students to Next Class</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Promote a whole class of students up to their new class for the new school year. Student past grade records stay safely saved in their timeline.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePromotionBulk} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Current Class</label>
                  <select
                    className="form-control"
                    value={promoSource}
                    onChange={(e) => {
                      const newSource = e.target.value;
                      setPromoSource(newSource);
                      if (newSource) {
                        const targets = getValidTargets(newSource, classes);
                        if (targets.length === 1) {
                          setPromoTarget(targets[0].id);
                        } else {
                          setPromoTarget('');
                        }
                      } else {
                        setPromoTarget('');
                      }
                    }}
                    required
                  >
                    <option value="">Select Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 'bold' }}>New Class</label>
                  {(() => {
                    const sourceClass = classes.find(c => c.id == promoSource);
                    const isGraduateSource = sourceClass && sourceClass.name.includes('Graduate');
                    const validTargets = getValidTargets(promoSource, classes);
                    
                    if (isGraduateSource) {
                      return <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem' }}>Cannot Promote from Graduate Classes here. Use the Registration Page.</div>;
                    }
                    
                    return (
                      <select
                        className="form-control"
                        value={promoTarget}
                        onChange={(e) => setPromoTarget(e.target.value)}
                        required
                        disabled={!promoSource}
                      >
                        <option value="">Select Target Class...</option>
                        {validTargets.map((c, idx) => (
                          <option key={idx} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <button type="submit" className="btn btn-danger" style={{ padding: '10px 20px' }}>
                  Move Students Up ➔
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* =======================================================
          TAB 8: ATTENDANCE MANAGEMENT (ADMIN)
          ======================================================= */}
      {activeSubTab === 'attendance' && (
        <div className="glass-panel" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
          
          {/* Sub Navigation handled by Sidebar */}

          {activeAdminAttendanceSubTab === 'mark' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <CalendarCheck size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Class Attendance Management</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Select a class and date to view or mark attendance roster.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }} className="no-print">
                <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                  <label>Select Class Arm</label>
                  <select
                    className="form-control"
                    value={adminAttendanceClass}
                    onChange={(e) => setAdminAttendanceClass(e.target.value)}
                  >
                    <option value="">Select Class...</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                  <label>Attendance Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={adminAttendanceDate}
                    onChange={(e) => setAdminAttendanceDate(e.target.value)}
                  />
                </div>
              </div>

              {!adminAttendanceClass ? (
                <p style={{ color: 'var(--text-muted)' }}>Please select a class stream to manage attendance roster.</p>
              ) : (
                <div>
                  <div className="table-container">
                    <table className="school-table">
                      <thead>
                        <tr>
                          <th>Admission Number</th>
                          <th>Student Name</th>
                          <th>Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminAttendanceRoster.length === 0 ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center' }}>No students enrolled in this class.</td>
                          </tr>
                        ) : (
                          adminAttendanceRoster.map((item, idx) => (
                            <tr key={idx}>
                              <td><code>{item.admission_number}</code></td>
                              <td style={{ fontWeight: '600' }}>{item.full_name}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'present')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'present' || !item.status ? 'var(--success)' : 'transparent',
                                      color: item.status === 'present' || !item.status ? '#fff' : 'var(--success)',
                                      border: '1px solid var(--success)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'absent')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'absent' ? 'var(--danger)' : 'transparent',
                                      color: item.status === 'absent' ? '#fff' : 'var(--danger)',
                                      border: '1px solid var(--danger)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdminAttendanceStatusChange(item.student_id, 'late')}
                                    className="btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8rem',
                                      backgroundColor: item.status === 'late' ? 'var(--warning)' : 'transparent',
                                      color: item.status === 'late' ? '#fff' : 'var(--warning)',
                                      border: '1px solid var(--warning)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    Late
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {adminAttendanceRoster.length > 0 && (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '20px', width: '200px' }}
                      onClick={handleSaveAdminAttendance}
                    >
                      Save Attendance
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '24px', margin: '-24px -24px 24px -24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  <BarChart2 size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.5px' }}>Attendance Summary Report</h3>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    View cumulative class attendance tallies by date range.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }} className="no-print">
                <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
                  <label>Select Class</label>
                  <select
                    className="form-control"
                    value={adminReportClassId}
                    onChange={(e) => setAdminReportClassId(e.target.value)}
                  >
                    <option value="">Select Class...</option>
                    {classes.map((cls, idx) => (
                      <option key={idx} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={adminReportStartDate}
                    onChange={(e) => setAdminReportStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={adminReportEndDate}
                    onChange={(e) => setAdminReportEndDate(e.target.value)}
                  />
                </div>

                <button className="btn btn-secondary no-print" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => exportPDF(attendanceReportRefAdmin, 'attendance_report.pdf', 'landscape')}><Download size={16} /> Download PDF</button>
              </div>

              {!adminReportClassId ? (
                <p style={{ color: 'var(--text-muted)' }}>Please select a class stream to load report summary.</p>
              ) : (
                <div className="table-container" ref={attendanceReportRefAdmin}>
                  <div className="only-print" style={{ display: 'none', textAlign: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: '0 0 5px 0' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h2>
                    <h4 style={{ margin: '0 0 10px 0' }}>Attendance Report: {classes.find(c => c.id === parseInt(adminReportClassId))?.name || 'Class'}</h4>
                    <p style={{ margin: '0', fontSize: '0.9rem' }}>Date Range: {adminReportStartDate || 'Start'} to {adminReportEndDate || 'End'}</p>
                  </div>
                  <table className="school-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Admission Number</th>
                        <th style={{ textAlign: 'center' }}>Present Days</th>
                        <th style={{ textAlign: 'center' }}>Absent Days</th>
                        <th style={{ textAlign: 'center' }}>Late Days</th>
                        <th style={{ textAlign: 'center' }}>Total Days</th>
                        <th style={{ textAlign: 'center' }}>Attendance Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const paginatedReport = adminAttendanceReport.slice((collationPage - 1) * collationPageSize, collationPage * collationPageSize);
                        if (paginatedReport.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found.</td>
                            </tr>
                          );
                        }
                        return paginatedReport.map((r, idx) => {
                          const ratio = r.total_days > 0 ? Math.round((r.present_count / r.total_days) * 100) : 0;
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>{r.full_name}</td>
                              <td><code>{r.admission_number}</code></td>
                              <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 'bold' }}>{r.present_count}</td>
                              <td style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>{r.absent_count}</td>
                              <td style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: 'bold' }}>{r.late_count}</td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{r.total_days}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span 
                                  className="badge" 
                                  style={{ 
                                    backgroundColor: ratio >= 80 ? 'var(--success-light)' : ratio >= 50 ? 'var(--warning-light)' : 'var(--danger-light)', 
                                    color: ratio >= 80 ? 'var(--success)' : ratio >= 50 ? 'var(--warning)' : 'var(--danger)' 
                                  }}
                                >
                                  {ratio}%
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                  <Pagination 
                    currentPage={collationPage} 
                    totalItems={adminAttendanceReport.length} 
                    pageSize={collationPageSize} 
                    onPageChange={setCollationPage} 
                    onPageSizeChange={setCollationPageSize} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =======================================================
          TAB 9: SCHEME OF WORK MANAGEMENT (ADMIN)
          ======================================================= */}
      {/* =======================================================
          MODAL: EDIT SKILL
          ======================================================= */}
      {showEditSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowEditSkillModal(false)}>×</button>
            <h3>Edit Behavioral Skill</h3>
            <form onSubmit={handleEditSkillSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Skill Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Punctuality" 
                  required 
                  value={skillEditForm.name}
                  onChange={(e) => setSkillEditForm({ ...skillEditForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control" 
                  value={skillEditForm.category}
                  onChange={(e) => setSkillEditForm({ ...skillEditForm, category: e.target.value })}
                >
                  <option value="affective">Affective Domain (Character)</option>
                  <option value="psychomotor">Psychomotor Domain (Skills)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Section</label>
                <select 
                  className="form-control" 
                  value={skillEditForm.target_section}
                  onChange={(e) => setSkillEditForm({ ...skillEditForm, target_section: e.target.value })}
                >
                  <option value="secondary">Secondary Section (JSS / SSS)</option>
                  <option value="primary">Primary Section (Nursery / Primary)</option>
                  <option value="all">Both Sections (All Classes)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Skill</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: BULK PRINT RESULT
          ======================================================= */}
      {/* =======================================================
          MODAL: STUDENT REGISTRATION FORM
          ======================================================= */}
      {showGraduatesModal && (
        <ManageGraduatesModal
          onClose={() => setShowGraduatesModal(false)}
          classes={classes}
          fetchStudents={loadAllData}
        />
      )}

      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowStudentModal(false)}>✕</button>
            <h3>Register Student</h3>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--primary)' }}>
                <input 
                  type="checkbox" 
                  checked={isReturningStudent} 
                  onChange={(e) => {
                    setIsReturningStudent(e.target.checked);
                    if (!e.target.checked) {
                      setGraduateStudents([]);
                      setSelectedGraduateId('');
                    } else if (studentForm.class_id) {
                      // Trigger re-evaluation of target class to fetch grads
                      handleClassSelectionForRegistration(studentForm.class_id);
                    }
                  }} 
                />
                Register Returning Student (From Graduate List)
              </label>
            </div>

            {isReturningStudent && (
              <div className="form-group" style={{ marginBottom: '20px', padding: '15px', border: '1px solid var(--primary-light)', borderRadius: '8px' }}>
                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Select Graduate Student</label>
                {graduateStudents.length > 0 ? (
                  <select 
                    className="form-control" 
                    value={selectedGraduateId}
                    onChange={(e) => handleGraduateSelect(e.target.value)}
                  >
                    <option value="">-- Choose a student --</option>
                    {graduateStudents.map(g => (
                      <option key={g.id} value={g.id}>{g.full_name} ({g.admission_number || 'No Admin No'})</option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '5px 0' }}>
                    {studentForm.class_id ? "No students found in the corresponding graduate waiting room for this class." : "Select a 'Class of Entry' below first to see available graduates."}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleStudentRegister} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px' }}>
                <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Passport Photo (Max 150kb):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {studentForm.passport_photo && (
                    <img src={studentForm.passport_photo} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />
                  )}
                  <input type="file" accept=".jpg,.jpeg,.png" className="form-control" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 150 * 1024) {
                        alert("Image size exceeds 150KB limit.");
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => setStudentForm({ ...studentForm, passport_photo: reader.result });
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Class of Entry</label>
                  <select className="form-control" required value={studentForm.class_id} onChange={(e) => handleClassSelectionForRegistration(e.target.value)}>
                    <option value="">Select Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
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
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={studentForm.status} onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Student</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: TEACHER REGISTRATION FORM
          ======================================================= */}
      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowTeacherModal(false)}>✕</button>
            <h3>Register Teacher</h3>

            <form onSubmit={handleTeacherRegister} style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Passport Photo:</label>
                <input type="file" accept="image/*" className="form-control" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                      setErrorMsg('Passport photo must be a JPG, JPEG, or PNG file.');
                      return;
                    }
                    if (file.size > 150 * 1024) {
                      setErrorMsg('Passport photo must be less than 150KB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => setTeacherForm({ ...teacherForm, passport_photo: reader.result });
                    reader.readAsDataURL(file);
                  }
                }} required={!teacherForm.passport_photo} />
                {teacherForm.passport_photo && (
                  <div style={{ marginLeft: '15px' }}>
                    <img src={teacherForm.passport_photo} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--primary)' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Surname</label>
                  <input type="text" className="form-control" required value={teacherForm.surname} onChange={(e) => setTeacherForm({ ...teacherForm, surname: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" className="form-control" required value={teacherForm.first_name} onChange={(e) => setTeacherForm({ ...teacherForm, first_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Other Names</label>
                  <input type="text" className="form-control" value={teacherForm.other_names} onChange={(e) => setTeacherForm({ ...teacherForm, other_names: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Full Name <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(auto-computed from name fields above)</span></label>
                <input
                  type="text"
                  className="form-control"
                  readOnly
                  style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                  value={[teacherForm.surname, teacherForm.first_name, teacherForm.other_names].filter(Boolean).join(' ')}
                  placeholder="Will be generated automatically"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" required value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" className="form-control" required value={teacherForm.phone_number} onChange={(e) => setTeacherForm({ ...teacherForm, phone_number: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" className="form-control" required value={teacherForm.date_of_birth} onChange={(e) => setTeacherForm({ ...teacherForm, date_of_birth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Discipline</label>
                  <input type="text" className="form-control" required placeholder="e.g. Mathematics" value={teacherForm.discipline} onChange={(e) => setTeacherForm({ ...teacherForm, discipline: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Qualification</label>
                  <select className="form-control" required value={teacherForm.qualification} onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })}>
                    <option value="">Select Qualification</option>
                    <option value="M.Sc">M.Sc</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="B.Ed">B.Ed</option>
                    <option value="B.A">B.A</option>
                    <option value="NCE">NCE</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category of Employment</label>
                  <select className="form-control" required value={teacherForm.employment_category} onChange={(e) => setTeacherForm({ ...teacherForm, employment_category: e.target.value })}>
                    <option value="">Select Category</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Teaching Practice">Teaching Practice</option>
                    <option value="SIWES/IT">SIWES/IT</option>
                    <option value="Corp Member">Corp Member</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Home Address</label>
                <input type="text" className="form-control" required value={teacherForm.address} onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>State of Residence</label>
                  <input type="text" className="form-control" required value={teacherForm.state_of_residence} onChange={(e) => setTeacherForm({ ...teacherForm, state_of_residence: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>LGA of Residence</label>
                  <input type="text" className="form-control" required value={teacherForm.lga_of_residence} onChange={(e) => setTeacherForm({ ...teacherForm, lga_of_residence: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Digital Signature</span>
                  <label className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem', margin: 0, cursor: 'pointer' }}>
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setTeacherForm({ ...teacherForm, signature: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </label>
                {teacherForm.signature && teacherForm.signature.startsWith('data:image') ? (
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '8px' }}>
                    <img src={teacherForm.signature} alt="Signature" style={{ height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff' }} />
                    <button 
                      type="button" 
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', width: '20px', height: '20px', fontSize: '12px', lineHeight: '20px' }}
                      onClick={() => setTeacherForm({ ...teacherForm, signature: '' })}
                    >✕</button>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px' }}>
                    <SignaturePad onSave={(dataUrl) => setTeacherForm({ ...teacherForm, signature: dataUrl })} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Teacher</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: CREATE CLASS
          ======================================================= */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowClassModal(false)}>✕</button>
            <h3>Create Class</h3>
            <form onSubmit={handleClassCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Class Name</label>
                <input type="text" className="form-control" placeholder="e.g. Nursery 3 or Primary 2" required value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select className="form-control" value={classForm.tier} onChange={(e) => setClassForm({ ...classForm, tier: e.target.value })}>
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Class</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: ADD SUBJECT
          ======================================================= */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowSubjectModal(false)}>✕</button>
            <h3>Add Subject</h3>
            <form onSubmit={handleSubjectCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Subject Name</label>
                <input type="text" className="form-control" placeholder="e.g. Basic Science" required value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select className="form-control" value={subjectForm.tier} onChange={(e) => setSubjectForm({ ...subjectForm, tier: e.target.value })}>
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Map to Classes (Optional)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('all')}>All Classes</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('nursery')}>All Nursery</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('primary')}>All Primary</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('jss')}>All JSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('sss')}>All SSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setSubjectForm(prev => ({ ...prev, class_ids: [] }))}>Clear</button>
                </div>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px' }}>
                  {classes.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={subjectForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSubjectForm(prev => {
                            const newIds = checked 
                              ? [...prev.class_ids, c.id]
                              : prev.class_ids.filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Subject</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: MAP SUBJECT TEACHER
          ======================================================= */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowAssignModal(false)}>✕</button>
            <h3>Assign Teacher to Class</h3>
            <form onSubmit={handleAssignTeacher} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Select Classes to Map (Check all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '180px', overflowY: 'auto', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  {classes.map((c, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        value={c.id} 
                        checked={assignForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAssignForm(prev => {
                            const newIds = checked 
                              ? [...prev.class_ids, c.id]
                              : prev.class_ids.filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" required value={assignForm.subject_id} onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })}>
                  <option value="">Select Subject...</option>
                  {subjects.map((s, idx) => (
                    <option key={idx} value={s.id}>{s.name} ({s.tier})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Teacher</label>
                <select className="form-control" required value={assignForm.teacher_id} onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}>
                  <option value="">Select Teacher...</option>
                  {teachers.map((t, idx) => (
                    <option key={idx} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: POST TERMLY FEE
          ======================================================= */}
      {showFeeModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowFeeModal(false)}>✕</button>
            <h3>Bill Students</h3>
            
            <form onSubmit={handleFeeInvoiceCreate} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Fee Description</label>
                <input type="text" className="form-control" placeholder="e.g. School Fee 3rd Term" required value={feeForm.title} onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Payment Category</label>
                <select className="form-control" value={feeForm.category} onChange={(e) => setFeeForm({ ...feeForm, category: e.target.value })}>
                  <option value="School Fees">School Fees</option>
                  <option value="Exams Fees">Exams Fees</option>
                  <option value="Lesson Fees">Lesson Fees</option>
                  <option value="Other Fees">Other Fees</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount (₦)</label>
                <input type="number" className="form-control" placeholder="Amount in Naira" required value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} />
              </div>

              <div style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>WHO SHOULD PAY? (Choose One)</span>
                
                <div className="form-group">
                  <label>Option A: Single Class</label>
                  <select className="form-control" value={feeForm.class_id} onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value, tier: '' })}>
                    <option value="">Select Class...</option>
                    {classes.map((c, idx) => (
                      <option key={idx} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Option B: Entire School Level</label>
                  <select className="form-control" value={feeForm.tier} onChange={(e) => setFeeForm({ ...feeForm, tier: e.target.value, class_id: '' })}>
                    <option value="">Choose School Level...</option>
                    <option value="all">All School (Every Student)</option>
                    <option value="nursery">Nursery School (Nursery 1-3)</option>
                    <option value="primary">Primary School (Primary 1-6)</option>
                    <option value="jss">Junior Secondary (JSS)</option>
                    <option value="sss">Senior Secondary (SSS)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Fees</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: LOG OFFLINE CASH PAYMENT
          ======================================================= */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowPayModal(false)}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '10px' }}>
                <CreditCard size={28} />
              </div>
              <h3 style={{ margin: 0 }}>Record Fee Payment</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '5px 0 0 0' }}>Lodge a payment against an outstanding invoice.</p>
            </div>
            
            <form onSubmit={handleLogPayment}>
              {(() => {
                const inv = studentHistoryData?.invoices?.find(i => i.id === payForm.invoice_id) || {};
                const totalDue = inv.amount_due || 0;
                const totalPaid = inv.amount_paid || 0;
                const rem = totalDue - totalPaid;
                return (
                  <>
                    <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Student Name:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{payForm.student_name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Fee Description:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{inv.title || 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Term / Session:</span>
                        <strong style={{ color: 'var(--primary)' }}>{inv.term || settings?.active_term || '3rd Term'} ({inv.session || settings?.active_session || '2026/2027'})</strong>
                      </div>
                      <div style={{ borderTop: '1px dashed var(--border-color)', margin: '10px 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total Billed:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>₦{totalDue.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Previously Paid:</span>
                        <strong style={{ color: 'var(--success)' }}>₦{totalPaid.toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Remaining Balance:</span>
                        <strong style={{ color: 'var(--danger)', fontSize: '1.05rem' }}>₦{rem.toLocaleString()}</strong>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ margin: 0 }}>Amount to Pay (₦)</label>
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}
                          onClick={() => setPayForm({ ...payForm, amount_paid: rem })}
                        >
                          Pay Full Balance
                        </button>
                      </div>
                      <input 
                        type="number" 
                        className="form-control" 
                        style={{ fontSize: '1.2rem', padding: '12px', fontWeight: 'bold', letterSpacing: '1px' }}
                        value={payForm.amount_paid} 
                        onChange={(e) => setPayForm({ ...payForm, amount_paid: e.target.value })} 
                        min="1"
                        max={rem}
                        required 
                      />
                    </div>
                  </>
                );
              })()}

              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-control" style={{ padding: '10px' }} value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Bank Draft">Bank Draft</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> Record Payment & Print Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          CLICKABLE PROFILE VIEWER
          ======================================================= */}
      {selectedStudentForForm && (
        <StudentRegistrationForm
          student={selectedStudentForForm}
          onClose={() => setSelectedStudentForForm(null)}
          onUpdate={() => { setSelectedStudentForForm(null); loadAllData(); }}
        />
      )}

      {selectedTeacherForProfile && (
        <TeacherProfileCard
          teacher={selectedTeacherForProfile}
          onClose={() => setSelectedTeacherForProfile(null)}
          onUpdate={() => { setSelectedTeacherForProfile(null); loadAllData(); }}
        />
      )}

      {/* =======================================================
          MODAL: CREATE ACADEMIC SESSION
          ======================================================= */}
      {showSessionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowSessionModal(false)}>✕</button>
            <h3>Create Academic Session</h3>
            <form onSubmit={handleCreateSession} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Session Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 2026/2027" 
                  required 
                  value={newSessionName} 
                  onChange={(e) => setNewSessionName(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Session</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: EDIT CLASS DETAILS
          ======================================================= */}
      {showEditClassModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowEditClassModal(false)}>&times;</button>
            <h3>Edit Class Details</h3>
            <form onSubmit={handleEditClassSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Class Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={classEditForm.name} 
                  onChange={(e) => setClassEditForm({ ...classEditForm, name: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select 
                  className="form-control" 
                  value={classEditForm.tier} 
                  onChange={(e) => setClassEditForm({ ...classEditForm, tier: e.target.value })}
                >
                  <option value="nursery">Pre-Nursery / Nursery</option>
                  <option value="primary">Primary</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: EDIT SUBJECT DETAILS
          ======================================================= */}
      {showEditSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowEditSubjectModal(false)}>✕</button>
            <h3>Edit Subject Details</h3>
            <form onSubmit={handleEditSubjectSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Subject Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={subjectEditForm.name} 
                  onChange={(e) => setSubjectEditForm({ ...subjectEditForm, name: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select 
                  className="form-control" 
                  value={subjectEditForm.tier} 
                  onChange={(e) => setSubjectEditForm({ ...subjectEditForm, tier: e.target.value })}
                >
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Map to Classes (Optional)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('all', true)}>All Classes</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('nursery', true)}>All Nursery</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('primary', true)}>All Primary</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('jss', true)}>All JSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleBulkSubjectClassSelect('sss', true)}>All SSS</button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setSubjectEditForm(prev => ({ ...prev, class_ids: [] }))}>Clear</button>
                </div>
                <div className="checkbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '4px' }}>
                  {classes.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={subjectEditForm.class_ids && subjectEditForm.class_ids.includes(c.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSubjectEditForm(prev => {
                            const newIds = checked 
                              ? [...(prev.class_ids || []), c.id]
                              : (prev.class_ids || []).filter(id => id !== c.id);
                            return { ...prev, class_ids: newIds };
                          });
                        }} 
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

            {/* =======================================================
          MODAL: EDIT CUSTOM INVOICE
          ======================================================= */}
      {showEditCustomInvoiceModal && editingCustomInvoice && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => setShowEditCustomInvoiceModal(false)}>×</button>
            <h3>Edit Custom Invoice Group</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>This updates the invoice for all {editingCustomInvoice.assigned_students} students assigned to it.</p>
            <form onSubmit={handleEditCustomInvoiceGroupSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Invoice Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={editingCustomInvoice.title} 
                  onChange={(e) => setEditingCustomInvoice({ ...editingCustomInvoice, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Target Class / Tier (Read Only)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  readOnly 
                  style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                  value={editingCustomInvoice.class_id ? (classes.find(c => c.id === editingCustomInvoice.class_id)?.name || `Class ID: ${editingCustomInvoice.class_id}`) : `Tier: ${editingCustomInvoice.tier ? editingCustomInvoice.tier.toUpperCase() : 'All'}`} 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={editingCustomInvoice.category} 
                  onChange={(e) => setEditingCustomInvoice({ ...editingCustomInvoice, category: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Amount Due (₦)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required 
                  min="0"
                  step="0.01"
                  value={editingCustomInvoice.amount} 
                  onChange={(e) => setEditingCustomInvoice({ ...editingCustomInvoice, amount: e.target.value })} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: ADD / EDIT FEE STRUCTURE
          ======================================================= */}
      {showFeeStructureModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <button className="modal-close" onClick={() => { setShowFeeStructureModal(false); setEditingFeeStructure(null); }}>✕</button>
            <h3>{editingFeeStructure ? '✏️ Edit Fee Structure' : '➕ Add Fee Structure'}</h3>
            <form onSubmit={handleCreateFeeStructure} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Fee Title / Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nursery 2 School Fee" 
                  required 
                  value={newFeeStructureForm.title} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Amount (₦)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 35000" 
                  required 
                  value={newFeeStructureForm.amount} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, amount: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>School Level</label>
                <select 
                  className="form-control" 
                  value={newFeeStructureForm.tier} 
                  onChange={(e) => setNewFeeStructureForm({ ...newFeeStructureForm, tier: e.target.value })}
                >
                  <option value="nursery">Nursery School (Nursery 1-3)</option>
                  <option value="primary">Primary School (Primary 1-6)</option>
                  <option value="jss">Junior Secondary (JSS)</option>
                  <option value="sss">Senior Secondary (SSS)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingFeeStructure ? 'Save Changes' : 'Add Structure'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: STUDENT PAYMENT HISTORY & RECEIPTS LOG
          ======================================================= */}
      {selectedStudentForHistory && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '850px', backgroundColor: 'var(--bg-surface)', padding: '20px' }}>
            <button className="modal-close no-print" style={{ top: '15px', right: '15px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedStudentForHistory(null)}>✕</button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '25px', margin: '-20px -20px 20px -20px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              {selectedStudentForHistory.passport_photo ? (
                <img src={selectedStudentForHistory.passport_photo} alt="Student Avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                  💳
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.5px' }}>Student Payment Ledger — {selectedStudentForHistory.full_name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '8px 0 0 0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span><CalendarCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }}/> {settings?.active_term || '3rd Term'} ({settings?.active_session || '2026/2027'})</span>
                  <span><Lock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }}/> {selectedStudentForHistory.admission_number}</span>
                  <span><Users size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }}/> {selectedStudentForHistory.class_name || 'Unassigned'}</span>
                  {selectedStudentForHistory.parent_phone && <span>📞 <strong>{selectedStudentForHistory.parent_phone}</strong></span>}
                </p>
              </div>
            </div>

            {loadingStudentHistory ? (
              <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading student payment ledger...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.82rem' }}>
                
                {/* Mini Financial Tally */}
                {(() => {
                  const invs = studentHistoryData.invoices || [];
                  const recs = studentHistoryData.receipts || [];
                  const totalBilled = invs.reduce((sum, i) => sum + (i.amount_due || 0), 0);
                  const totalPaid = invs.reduce((sum, i) => sum + (i.amount_paid || 0), 0);
                  const balanceOwed = Math.max(0, totalBilled - totalPaid);

                  return (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                        <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#3b82f6', opacity: 0.1, transform: 'rotate(-15deg)' }}><Receipt size={90} /></div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Fees</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginTop: '6px' }}>
                            ₦{totalBilled.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #10b981', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#10b981', opacity: 0.1, transform: 'rotate(-15deg)' }}><CheckCircle size={90} /></div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paid</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#065f46', marginTop: '6px' }}>
                            ₦{totalPaid.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right bottom, #ffffff, #f8fafc)', border: '1px solid #e2e8f0', borderLeft: '5px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', right: '-15px', top: '-15px', color: '#ef4444', opacity: 0.1, transform: 'rotate(-15deg)' }}><AlertCircle size={90} /></div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Debt</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#991b1b', marginTop: '6px' }}>
                            ₦{balanceOwed.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Section 1: Invoices Breakdown */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Receipt size={20} color="var(--primary)" /> Fee Invoices Billed
                          </h4>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setShowIndividualFeeModal(!showIndividualFeeModal)}
                          >
                            <Plus size={14} /> Add Fee for Student
                          </button>
                        </div>

                        {showIndividualFeeModal && (
                          <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px', border: '1px solid var(--border-color)' }}>
                            <form onSubmit={handleIndividualFeeSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                              <div style={{ flex: '1', minWidth: '150px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Fee Title / Description</label>
                                <input type="text" className="form-control" placeholder="e.g. Caution Fee" required value={individualFeeForm.title} onChange={e => setIndividualFeeForm({...individualFeeForm, title: e.target.value})} />
                              </div>
                              <div style={{ width: '150px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Category</label>
                                <select className="form-control" value={individualFeeForm.category} onChange={e => setIndividualFeeForm({...individualFeeForm, category: e.target.value})}>
                                  <option value="School Fees">School Fees</option>
                                  <option value="Exams Fees">Exams Fees</option>
                                  <option value="Lesson Fees">Lesson Fees</option>
                                  <option value="Other Fees">Other Fees</option>
                                </select>
                              </div>
                              <div style={{ width: '120px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Amount (,)</label>
                                <input type="number" className="form-control" placeholder="10000" required value={individualFeeForm.amount} onChange={e => setIndividualFeeForm({...individualFeeForm, amount: e.target.value})} />
                              </div>
                              <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', height: '38px' }}>Add Fee</button>
                            </form>
                          </div>
                        )}

                        <div className="table-container" style={{ margin: 0, minHeight: '300px', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', flex: 1 }}>
                            <thead style={{ backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Fee Title</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Term & Session</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Total Fees</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Paid</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Debt</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Status</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }} className="no-print">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const paginatedInvs = invs.slice((modalInvoicePage - 1) * modalInvoicePageSize, modalInvoicePage * modalInvoicePageSize);
                                if (paginatedInvs.length === 0) {
                                  return <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '15px' }}>No invoices issued yet.</td></tr>;
                                }
                                return paginatedInvs.map((inv, idx) => {
                                  const rem = inv.amount_due - inv.amount_paid;
                                  return (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <td style={{ padding: '14px 15px', fontWeight: '600', color: 'var(--text-primary)' }}>{inv.title}</td>
                                      <td style={{ padding: '14px 15px' }}>
                                        <span className="badge" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                          {inv.term || settings?.active_term || '3rd Term'} ({inv.session || settings?.active_session || '2026/2027'})
                                        </span>
                                      </td>
                                      <td style={{ padding: '14px 15px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>₦{inv.amount_due.toLocaleString()}</td>
                                      <td style={{ padding: '14px 15px', textAlign: 'right', color: 'var(--success)', fontWeight: '700' }}>₦{inv.amount_paid.toLocaleString()}</td>
                                      <td style={{ padding: '14px 15px', textAlign: 'right', color: rem > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: '700' }}>
                                        ₦{rem.toLocaleString()}
                                      </td>
                                      <td style={{ padding: '14px 15px', textAlign: 'center' }}>
                                        <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem', padding: '5px 12px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                                          {inv.status.toUpperCase()}
                                        </span>
                                      </td>
                                      <td style={{ padding: '14px 15px', textAlign: 'center' }} className="no-print">
                                        {inv.status !== 'paid' && (
                                          <button
                                            className="btn btn-primary"
                                            style={{ padding: '6px 16px', fontSize: '0.75rem', borderRadius: '20px', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)', fontWeight: '600' }}
                                            onClick={() => {
                                              setSelectedStudentForHistory(null);
                                              setPayForm({
                                                invoice_id: inv.id,
                                                amount_paid: inv.amount_due - inv.amount_paid,
                                                payment_method: 'Cash',
                                                student_name: selectedStudentForHistory.full_name
                                              });
                                              setShowPayModal(true);
                                            }}
                                          >
                                            Record Payment
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                          <div style={{ padding: '10px 15px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                            <Pagination 
                              currentPage={modalInvoicePage} 
                              totalItems={invs.length} 
                              pageSize={modalInvoicePageSize} 
                              onPageChange={setModalInvoicePage} 
                              onPageSizeChange={setModalInvoicePageSize} 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Payment Receipts History */}
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '1.05rem', margin: '0 0 12px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={20} color="var(--primary)" /> Payment Receipts History</h4>
                        <div className="table-container" style={{ margin: 0, minHeight: '300px', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-color)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', flex: 1 }}>
                            <thead style={{ backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 1 }}>
                              <tr>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Receipt #</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Date</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Fee Item</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Amount Paid</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Logged By</th>
                                <th style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }} className="no-print">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const paginatedRecs = recs.slice((modalReceiptPage - 1) * modalReceiptPageSize, modalReceiptPage * modalReceiptPageSize);
                                if (paginatedRecs.length === 0) {
                                  return <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '15px' }}>No payment receipts recorded yet.</td></tr>;
                                }
                                return paginatedRecs.map((rec, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '12px 15px' }}><code style={{ fontSize: '0.75rem', padding: '5px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)' }}>{rec.receipt_number}</code></td>
                                    <td style={{ padding: '12px 15px', color: 'var(--text-secondary)' }}>{rec.payment_date}</td>
                                    <td style={{ padding: '12px 15px', fontWeight: '600', color: 'var(--text-primary)' }}>{rec.title}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'right', color: 'var(--success)', fontWeight: '700' }}>₦{rec.amount_paid.toLocaleString()}</td>
                                    <td style={{ padding: '12px 15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.logged_by_name || 'Staff'}</td>
                                    <td style={{ padding: '12px 15px', textAlign: 'center' }} className="no-print">
                                      <button
                                        className="btn btn-outline btn-sm"
                                        style={{ padding: '6px 14px', fontSize: '0.75rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => {
                                          const parentInvoice = studentHistoryData?.invoices?.find(
                                            i => (i.id === rec.invoice_id) || (i.title === rec.title && i.amount_due === rec.amount_due)
                                          );
                                          setSelectedReceipt({
                                            ...rec,
                                            full_name: selectedStudentForHistory.full_name,
                                            admission_number: selectedStudentForHistory.admission_number,
                                            class_name: selectedStudentForHistory.class_name,
                                            true_amount_due: parentInvoice ? parentInvoice.amount_due : rec.amount_due,
                                            true_amount_paid: parentInvoice ? parentInvoice.amount_paid : rec.amount_paid,
                                            status: parentInvoice ? (parentInvoice.amount_paid >= parentInvoice.amount_due ? 'paid' : 'partial') : (rec.amount_paid >= rec.amount_due ? 'paid' : 'partial')
                                          });
                                        }}
                                      >
                                        🖨️ Print Receipt
                                      </button>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                          <div style={{ padding: '10px 15px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                            <Pagination 
                              currentPage={modalReceiptPage} 
                              totalItems={recs.length} 
                              pageSize={modalReceiptPageSize} 
                              onPageChange={setModalReceiptPage} 
                              onPageSizeChange={setModalReceiptPageSize} 
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: OFFICIAL PAYMENT RECEIPT
          ======================================================= */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px', backgroundColor: '#fff', color: '#000' }}>
            <button className="modal-close no-print" onClick={() => setSelectedReceipt(null)} style={{ color: '#000' }}>✕</button>
            
            <div className="print-area" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', padding: '20px 10px', color: '#000' }} ref={receiptSlipRef}>
              <div style={{ textAlign: 'center', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', marginBottom: '10px' }}>
                  <Receipt size={24} />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#000' }}>{settingsForm?.landing_school_name || 'Jere Model Academy'}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#000' }}>{settingsForm?.landing_tagline || 'KADUNA STATE, NIGERIA'}</p>
                <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px', color: '#000' }}>
                  OFFICIAL PAYMENT RECEIPT
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Receipt No:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedReceipt.receipt_number || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Date:</span>
                  <strong>{selectedReceipt.payment_date || new Date().toLocaleDateString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Student Name:</span>
                  <strong>{selectedReceipt.full_name || selectedStudentForHistory?.full_name || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Admission No:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedReceipt.admission_number || selectedStudentForHistory?.admission_number || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Class:</span>
                  <strong>{selectedReceipt.class_name || selectedStudentForHistory?.class_name || 'N/A'}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Fee Description</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#000', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
                  {selectedReceipt.title || 'School Fee'}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  {selectedReceipt.true_amount_due && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#000' }}>Total Billed:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(selectedReceipt.true_amount_due).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedReceipt.true_amount_paid !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#000' }}>Cumulative Paid To Date:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(selectedReceipt.true_amount_paid).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedReceipt.true_amount_due && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                      <span>Current Balance Owed:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>₦{Math.max(0, Number(selectedReceipt.true_amount_due) - Number(selectedReceipt.true_amount_paid)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>This Payment</div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>via {selectedReceipt.payment_method || 'Cash'}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1d4ed8', fontFamily: 'monospace' }}>
                  ₦{Number(selectedReceipt.amount_paid).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                {selectedReceipt.status === 'paid' ? (
                  <div style={{ border: '2px solid #10b981', color: '#10b981', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', transform: 'rotate(-5deg)' }}>
                    PAID IN FULL
                  </div>
                ) : (
                  <div style={{ border: '2px solid #f59e0b', color: '#d97706', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    PARTIAL PAYMENT
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: '2px solid #e5e7eb', fontSize: '0.75rem', color: '#000' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                  {settingsForm?.principal_signature ? (
                    <img src={settingsForm.principal_signature} alt="Authorized Signature" style={{ height: '40px', objectFit: 'contain', marginBottom: '2px' }} />
                  ) : (
                    <div style={{ width: '120px', borderBottom: '1px solid #000', margin: '20px auto 5px auto' }}></div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: '#000' }}>Authorized Signature</div>
                </div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#000' }}>~ Thank you for your payment! ~</p>
                <p style={{ margin: '0' }}>Logged by: {selectedReceipt.logged_by_name || 'Accounts Office'}</p>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }} className="no-print">
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => exportPDF(receiptSlipRef, `receipt_${selectedReceipt?.receipt_number || 'slip'}.pdf`)}><Download size={16} /> Download PDF</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedReceipt(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result Printer Modal */}
      {showBulkPrintModal && (
        <BulkResultPrinter
          classes={classes}
          sessions={sessions}
          currentTerm={settings?.active_term}
          currentSession={settings?.active_session}
          settings={settings}
          onClose={() => setShowBulkPrintModal(false)}
        />
      )}

      {/* Print PIN Cards Modal */}
      {showPrintPinsModal && (
        <PrintPinCards
          pins={pins.filter(p => {
            const query = pinSearch.toLowerCase();
            const matchesSearch = p.pin.toLowerCase().includes(query) ||
                   (p.student_name && p.student_name.toLowerCase().includes(query)) ||
                   (p.admission_number && p.admission_number.toLowerCase().includes(query));
            
            let matchesStatus = true;
            if (pinStatusFilter === 'active') {
              matchesStatus = p.status === 'active' && p.usage_count > 0;
            } else if (pinStatusFilter === 'not_used') {
              matchesStatus = p.status === 'active' && (!p.usage_count || p.usage_count === 0);
            } else if (pinStatusFilter === 'exhausted') {
              matchesStatus = p.status === 'exhausted';
            }
            return matchesSearch && matchesStatus;
          })}
          settings={settings}
          onClose={() => setShowPrintPinsModal(false)}
        />
      )}

          </div>
  );
}


