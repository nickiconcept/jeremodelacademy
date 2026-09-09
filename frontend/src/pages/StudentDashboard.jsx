import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ReportCard from '../components/ReportCard';
import Toast from '../components/Toast';
import { ArrowLeft, Award, CreditCard, FileText, ShieldCheck, CheckCircle, Lock, Unlock, Receipt, X, Download, Key, BookOpen, User, Bell, AlertTriangle, BarChart2, Search, Calendar, History } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGlobalUI } from '../contexts/GlobalUIContext';
import Swal from 'sweetalert2';

export default function StudentDashboard({ user, settings, activeTab, subTab }) {
  const { showAlert } = useGlobalUI();
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (subTab) return subTab;
    if (activeTab && activeTab !== 'dashboard') return activeTab;
    return 'overview';
  });
  const [isIdCardFlipped, setIsIdCardFlipped] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTerm, setHistoryTerm] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Student statistics
  const [timeline, setTimeline] = useState([]);
  const [unlockedPins, setUnlockedPins] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Result check PIN prompts
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedTermForRC, setSelectedTermForRC] = useState(null);
  const [pinInput, setPinInput] = useState('');

  // Unlocked Result data
  const [activeReportCardData, setActiveReportCardData] = useState(null);

  // Selected receipt for printing
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Status messages
  const [notify, setNotify] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Scheme of Work States
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [schemeWeeks, setSchemeWeeks] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadStudentData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab && activeTab !== 'dashboard') {
      setActiveSubTab(activeTab);
    } else if (activeTab === 'dashboard') {
      setActiveSubTab('overview');
    }

    if (subTab) {
      setActiveSubTab(subTab);
    }
  }, [activeTab, subTab]);

  const loadClassSubjects = async () => {
    try {
      const allClassSubjects = await api.getClassSubjects();
      const filtered = allClassSubjects.filter(cs => cs.class_id === user.class_id);
      setStudentSubjects(filtered);
      if (filtered.length > 0) {
        setSelectedSubjectId(filtered[0].subject_id);
      }
    } catch (err) {
      setErrorMsg('Failed to load class subjects: ' + err.message);
    }
  };

  const loadStudentSchemes = async (subId) => {
    if (!subId) return;
    try {
      const data = await api.getSchemes({
        class_id: user.class_id,
        subject_id: subId,
        term: settings?.active_term || '3rd Term'
      });
      const newWeeks = Array.from({ length: 12 }, (_, i) => {
        const wkNum = i + 1;
        const entry = data.find(item => item.week === wkNum);
        return {
          week: wkNum,
          topic: entry ? entry.topic : '',
          objectives: entry ? entry.objectives || '' : ''
        };
      });
      setSchemeWeeks(newWeeks);
    } catch (err) {
      setErrorMsg('Failed to load scheme: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'schemes' && user?.class_id) {
      loadClassSubjects();
    }
  }, [activeSubTab, user?.class_id]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadStudentSchemes(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  const loadStudentData = async () => {
    if (!user?.id) return;
    try {
      const [tlRes, feeData, att] = await Promise.all([
        api.getStudentTimeline(user.id),
        api.getStudentFees(user.id),
        api.getStudentAttendance(user.id)
      ]);
      setTimeline(tlRes.timeline || []);
      setUnlockedPins(tlRes.unlockedPins || []);
      setInvoices(feeData.invoices || []);
      setReceipts(feeData.receipts || []);
      setAttendance(att);
    } catch (err) {
      setErrorMsg('Failed to load data: ' + err.message);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const handleTermClick = (item) => {
    const pinBinding = unlockedPins.find(p => p.term === item.term && p.academic_year === item.academic_year);
    const isUnlocked = pinBinding && pinBinding.usage_count < 5;
    if (isUnlocked) {
      fetchReportCard(item.term, item.academic_year);
    } else {
      setSelectedTermForRC(item);
      setShowPinModal(true);
    }
  };

  const handleViewHistory = async (item) => {
    setHistoryTerm(item);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const searchStr = `${item.term} ${item.academic_year}`;
      const res = await api.get(`/activity-logs?action=check_result&search=${encodeURIComponent(searchStr)}`);
      setHistoryLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchReportCard = async (term, academic_year) => {
    if (!user?.id) return;
    try {
      const data = await api.getReportCard(user.id, term, academic_year);
      setActiveReportCardData(data);
      await loadStudentData(); // Update PIN usage count in the UI
    } catch (err) {
      if (err.message && err.message.includes('Outstanding school fees')) {
        Swal.fire({
          title: 'Access Denied',
          text: 'Outstanding school fees must be cleared first.',
          icon: 'error',
          confirmButtonColor: 'var(--primary)',
          confirmButtonText: 'OK'
        });
      } else {
        showAlert(err.message, 'error', 'Failed to load report card');
      }
    }
  };

  const handleVerifyPinSubmit = async (e) => {
    e.preventDefault();
    if (!pinInput || !selectedTermForRC) return;
    setErrorMsg('');
    setNotify('');
    try {
      const res = await api.verifyPin(pinInput, selectedTermForRC.term, selectedTermForRC.academic_year);
      const maxChecks = settings?.pin_max_checks ? parseInt(settings.pin_max_checks) : 5;
      const usageCount = res.pin ? parseInt(res.pin.usage_count) : 0;
      const remaining = Math.max(0, maxChecks - usageCount - 1); // Subtract 1 because fetchReportCard uses a check
      
      setNotify(`${res.message} You have ${remaining} checks remaining.`);
      setShowPinModal(false);
      await fetchReportCard(selectedTermForRC.term, selectedTermForRC.academic_year);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const receiptRef = React.useRef(null);

  const downloadReceiptPDF = () => {
    const element = receiptRef.current;
    if (!element) return;
    const opt = {
      margin: 0.3,
      filename: `receipt_${activeReceipt?.receipt_number || 'slip'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');
  const outstandingDebt = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount_due - inv.amount_paid), 0);
  const totalPaid = receipts.reduce((sum, r) => sum + Number(r.amount_paid), 0);

  // Hero header component shared across tabs
  const HeroHeader = ({ icon: Icon, title, subtitle, right }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: '15px',
      background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
      padding: '24px', color: 'white',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0
        }}>
          <Icon size={24} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{subtitle}</p>
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );

  if (isInitialLoad) return <LoadingSpinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

      {/* Toast Notifications */}
      <Toast message={notify} type="success" onClose={() => setNotify('')} duration={4000} />
      <Toast message={errorMsg} type="error" onClose={() => setErrorMsg('')} duration={5000} />

      {/* ==========================================
          TAB 1: OVERVIEW & ALERTS
          ========================================== */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Hero Welcome Banner */}
          <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
              padding: '28px 28px 20px',
              color: 'white',
              display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap'
            }}>
              {/* Passport photo */}
              <div style={{
                width: '90px', height: '110px',
                border: '3px solid rgba(255,255,255,0.5)', borderRadius: '10px',
                overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0
              }}>
                {user.passport_photo ? (
                  <img src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:8000${user.passport_photo}`} alt="Student Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <User size={36} style={{ opacity: 0.6 }} color="white" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Portal</p>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: '800' }}>{user.full_name}</h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
                    Adm. No: <strong>{user.admission_number}</strong>
                  </span>
                  <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
                    Class: <strong>{user.class_name || 'Not Enrolled'}</strong>
                  </span>
                  <span style={{ fontSize: '0.85rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
                    Term: <strong>{settings?.active_term}</strong>
                  </span>
                </div>
              </div>
              {/* Quick stats pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                <div style={{ backgroundColor: outstandingDebt > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', border: `1px solid ${outstandingDebt > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`, borderRadius: '10px', padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: outstandingDebt > 0 ? '#fca5a5' : '#86efac' }}>Outstanding</div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>₦{outstandingDebt.toLocaleString()}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>Results</div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{timeline.length} Term{timeline.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* Bottom: status bar */}
            <div style={{ padding: '14px 28px', display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--success)', fontWeight: '600' }}>
                <CheckCircle size={14} /> Active Enrollment
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <Award size={14} /> Session: {settings?.active_session}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <CreditCard size={14} /> Paid: ₦{totalPaid.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Fee Debt Alert */}
              {outstandingDebt > 0 && (
                <div className="glass-panel" style={{ overflow: 'hidden', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', padding: '18px 22px', color: 'white', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <AlertTriangle size={24} />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1rem' }}>Outstanding Fees: ₦{outstandingDebt.toLocaleString()}</div>
                      <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Result PINs are only issued after all fees are settled.</div>
                    </div>
                  </div>
                  <div style={{ padding: '14px 22px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    *Visit the finance office to make payment and obtain your result PIN.
                  </div>
                </div>
              )}

              {/* 3D Student ID Card */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 0' }}>
                <div style={{ perspective: '1200px', width: '340px', height: '214px', cursor: 'pointer' }} onClick={() => setIsIdCardFlipped(!isIdCardFlipped)}>
                  <div style={{
                    width: '100%', height: '100%', position: 'relative',
                    transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformStyle: 'preserve-3d',
                    transform: isIdCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    borderRadius: '12px'
                  }}>
                  {/* Front of Card */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)',
                    border: '1px solid rgba(255,255,255,0.8)'
                  }}>
                    {/* Holographic overlay */}
                    <div style={{
                      position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none',
                      background: 'linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.8) 40%, rgba(255,215,0,0.3) 50%, rgba(255,255,255,0.8) 60%, transparent 80%)'
                    }}></div>

                    {/* Header */}
                    <div style={{ 
                      background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', 
                      padding: '12px 18px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <ShieldCheck size={14} color="#1e3a8a" />
                        </div>
                        <div style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '0.9rem', textTransform: 'uppercase' }}>{settings?.landing_school_name || 'Jere Model Academy'}</div>
                      </div>
                      <div style={{ fontSize: '0.65rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>STUDENT</div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '15px 18px', display: 'flex', gap: '18px', flex: 1, position: 'relative' }}>
                      {/* Watermark */}
                      <div style={{ position: 'absolute', right: '10px', bottom: '10px', opacity: 0.05, transform: 'scale(3)' }}>
                        <ShieldCheck size={40} />
                      </div>

                      {/* Photo */}
                      <div style={{ 
                        width: '75px', height: '90px', 
                        border: '3px solid white', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        borderRadius: '6px', overflow: 'hidden', backgroundColor: '#e2e8f0',
                        position: 'relative', zIndex: 1
                      }}>
                        {user.passport_photo ? (
                          <img src={user.passport_photo.startsWith('data:') ? user.passport_photo : `http://localhost:8000${user.passport_photo}`} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={40} color="#94a3b8" style={{ margin: '22px auto', display: 'block' }} />
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, position: 'relative', zIndex: 1, justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', textTransform: 'uppercase' }}>{user.full_name}</div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'x-4px y-2px', fontSize: '0.75rem', marginTop: '4px' }}>
                          <div style={{ color: '#64748b', fontWeight: '600' }}>ID:</div>
                          <div style={{ color: '#1e3a8a', fontWeight: '800' }}>{user.admission_number}</div>
                          
                          <div style={{ color: '#64748b', fontWeight: '600' }}>CLASS:</div>
                          <div style={{ color: '#334155', fontWeight: '700' }}>{user.class_name || 'N/A'}</div>
                          
                          <div style={{ color: '#64748b', fontWeight: '600' }}>DOB:</div>
                          <div style={{ color: '#334155', fontWeight: '700' }}>{user.date_of_birth || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '6px 0', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Tap to flip card
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid #cbd5e1'
                  }}>
                    {/* Magnetic Strip */}
                    <div style={{ backgroundColor: '#0f172a', height: '40px', width: '100%', marginTop: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}></div>
                    
                    {/* Back Body */}
                    <div style={{ padding: '12px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.7rem', color: '#475569', lineHeight: '1.4', marginBottom: '8px' }}>
                        <strong>Property of {settings?.landing_school_name || 'Jere Model Academy'}.</strong><br/>
                        This card must be worn at all times while on school grounds. If found, please return to the school administration office.
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: '#334155', backgroundColor: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '6px' }}>
                        <div><strong>GENDER:</strong> {user.sex || 'N/A'}</div>
                        <div><strong>ISSUED:</strong> 2026/2027</div>
                        <div style={{ gridColumn: 'span 2' }}><strong>ADDRESS:</strong> Jere, Kaduna State, Nigeria</div>
                      </div>
                      
                      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                        {/* Barcode representation */}
                        <div style={{ height: '25px', width: '80%', margin: '0 auto', backgroundImage: 'repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 5px, transparent 5px, transparent 8px, #0f172a 8px, #0f172a 12px, transparent 12px, transparent 14px)' }}></div>
                        <div style={{ fontSize: '0.65rem', marginTop: '2px', letterSpacing: '3px', fontFamily: 'monospace' }}>{user.admission_number}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Quick Info Sidebar */}
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '18px 22px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={20} />
                <div style={{ fontWeight: '700' }}>My Info</div>
              </div>
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Current Term', value: settings.active_term },
                  { label: 'Academic Session', value: settings.active_session },
                  { label: 'Class', value: user.class_name || 'Not Enrolled' },
                  { label: 'Gender', value: user.sex || '—' },
                  { label: 'Religion', value: user.religion || '—' },
                  {
                    label: 'Unpaid Fees',
                    value: `₦${outstandingDebt.toLocaleString()}`,
                    valueColor: outstandingDebt > 0 ? 'var(--danger)' : 'var(--success)'
                  },
                  {
                    label: 'Status',
                    custom: <span className="badge badge-success">Active</span>
                  },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < arr.length - 1 ? '14px' : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.label}</span>
                    {row.custom || <strong style={{ color: row.valueColor || 'var(--text-primary)', fontSize: '0.9rem' }}>{row.value}</strong>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: REPORT CARDS ACADEMIC TIMELINE
          ========================================== */}
      {activeSubTab === 'results' && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          <HeroHeader
            icon={Award}
            title="My Results"
            subtitle="Click a term below to view your result card. Enter your PIN when prompted."
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '600' }}>
                <FileText size={14} /> {timeline.length} Term Record{timeline.length !== 1 ? 's' : ''}
              </div>
            }
          />

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Award size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ margin: 0 }}>No academic records found on this profile.</p>
              </div>
            ) : (
              timeline.map((item, idx) => {
                const pinBinding = unlockedPins.find(p => p.term === item.term && p.academic_year === item.academic_year);
                const isUnlocked = pinBinding && pinBinding.usage_count < 5;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '18px 22px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: isUnlocked ? 'rgba(34,197,94,0.04)' : 'var(--bg-primary)',
                      borderLeft: `5px solid ${isUnlocked ? 'var(--success)' : 'rgba(59,130,246,0.4)'}`,
                      borderRadius: '10px', border: `1px solid ${isUnlocked ? 'rgba(34,197,94,0.2)' : 'var(--border-color)'}`,
                      borderLeftWidth: '5px', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px 0' }}>{item.academic_year} — {item.term}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {isUnlocked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                            <Key size={13} /> Unlocked — Checks Remaining: {Math.max(0, (parseInt(settings?.pin_max_checks) || 5) - pinBinding.usage_count)}
                            <button onClick={() => handleViewHistory(item)} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem', padding: 0 }}>
                              View History
                            </button>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                            <Lock size={13} /> Enter PIN to view results
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      className="btn"
                      onClick={() => handleTermClick(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: isUnlocked ? 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)' : undefined,
                        backgroundColor: isUnlocked ? undefined : 'var(--bg-secondary)',
                        color: isUnlocked ? 'white' : 'var(--text-primary)',
                        border: isUnlocked ? 'none' : '1px solid var(--border-color)',
                        padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer'
                      }}
                    >
                      {isUnlocked ? <><Unlock size={14} /> View Report Card</> : <><Key size={14} /> Enter PIN</>}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: INVOICES & RECEIPTS LEDGER
          ========================================== */}
      {activeSubTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total Charged', value: `₦${invoices.reduce((s, i) => s + Number(i.amount_due), 0).toLocaleString()}`, icon: FileText, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)' },
              { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' },
              { label: 'Outstanding', value: `₦${outstandingDebt.toLocaleString()}`, icon: outstandingDebt > 0 ? AlertTriangle : CheckCircle, color: outstandingDebt > 0 ? '#dc2626' : '#16a34a', bg: outstandingDebt > 0 ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)', border: outstandingDebt > 0 ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)' },
              { label: 'Payment Receipts', value: receipts.length, icon: Receipt, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
            ].map((card, i) => (
              <div key={i} className="glass-panel" style={{ padding: '18px 20px', backgroundColor: card.bg, border: `1px solid ${card.border}`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${card.border}` }}>
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: card.color }}>{card.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Invoices */}
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              <HeroHeader
                icon={CreditCard}
                title="School Fees"
                subtitle="All invoices issued to your account"
              />
              <div style={{ padding: '20px' }}>
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="school-table">
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px 14px' }}>Fee Name</th>
                        <th style={{ padding: '12px 14px' }}>Amount</th>
                        <th style={{ padding: '12px 14px' }}>Paid</th>
                        <th style={{ padding: '12px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No invoices on record.</td></tr>
                      ) : invoices.map((inv, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px 14px', fontWeight: '600' }}>
                            <div>{inv.title.split(' - ')[0]}</div>
                            {inv.title.split(' - ').length > 1 && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>
                                {inv.title.split(' - ').slice(1).join(' - ')}
                              </div>
                            )}
                            <span className="badge" style={{ fontSize: '0.7rem', marginTop: '3px', backgroundColor: 'var(--bg-primary)', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
                              {inv.category || 'School Fees'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>₦{Number(inv.amount_due).toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>₦{Number(inv.amount_paid).toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                              {inv.status === 'paid' ? 'Paid' : inv.status === 'partial' ? 'Partial' : 'Unpaid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Receipts */}
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
              <HeroHeader
                icon={Receipt}
                title="Receipts"
                subtitle="Payment receipts — click View to print or download"
              />
              <div style={{ padding: '20px' }}>
                <div className="table-container" style={{ marginTop: 0 }}>
                  <table className="school-table">
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px 14px' }}>Receipt No.</th>
                        <th style={{ padding: '12px 14px' }}>Fee Name</th>
                        <th style={{ padding: '12px 14px' }}>Amount Paid</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No payments logged yet.</td></tr>
                      ) : receipts.map((rec, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{rec.receipt_number}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '600' }}>{rec.title.split(' - ')[0]}</div>
                            {rec.title.split(' - ').length > 1 && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {rec.title.split(' - ').slice(1).join(' - ')}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>₦{Number(rec.amount_paid).toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              className="btn"
                              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.3)', backgroundColor: 'rgba(37,99,235,0.07)', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}
                              onClick={() => setActiveReceipt(rec)}
                            >
                              <Download size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: SCHOOL RULES & UNDERTAKING HANDBOOK
          ========================================== */}
      {activeSubTab === 'rules' && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          <HeroHeader
            icon={ShieldCheck}
            title="School Rules & Handbook"
            subtitle={`${settings?.landing_school_name || 'Jere Model Academy'} — Student Undertaking & Code of Conduct`}
            right={
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid rgba(34,197,94,0.4)' }}>
                <CheckCircle size={14} /> Signed Undertaking
              </span>
            }
          />

          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Requirements */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(37,99,235,0.2)' }}>
                  <FileText size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{ margin: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '4px', color: 'var(--primary)', flex: 1 }}>I. STUDENT REQUIREMENTS</h4>
              </div>
              <ul style={{ paddingLeft: '20px', lineHeight: '2', color: 'var(--text-secondary)', margin: 0 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Books:</strong> 12 60-page books for Junior Secondary, and 12 80-page books for Senior Secondary.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Math Tools:</strong> 1 Math Set, and 1 scientific calculator (for Senior Secondary).</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Attire & Items:</strong> 1 pair of white socks, 1 broom, 1 pair of brown sandals, and 1 school bag.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Textbooks:</strong> English and Mathematics textbooks are required.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Sports:</strong> Sports wear (₦2,500) from the sports office.</li>
              </ul>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

            {/* Rules */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(37,99,235,0.2)' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <h4 style={{ margin: 0, borderBottom: '2px solid var(--primary)', paddingBottom: '4px', color: 'var(--primary)', flex: 1 }}>II. GENERAL SCHOOL RULES</h4>
              </div>
              <ol style={{ paddingLeft: '20px', lineHeight: '2', color: 'var(--text-secondary)', margin: 0 }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Afternoon Lessons:</strong> All students must attend afternoon lessons from 2:30pm to 3:30pm (Monday to Wednesday).</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Be on Time:</strong> All students must be in school by 7:45am.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>No Phones:</strong> Cellphones are not allowed in school.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>English Language:</strong> No speaking of pidgin or local languages; only correct English is allowed.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Grooming:</strong> No face paint, tattoos, rings, or long fingernails.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>School Fees:</strong> All school fees must be paid by mid-term.</li>
              </ol>
            </div>

            {/* Signed confirmation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px' }}>
              <CheckCircle size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: '700', color: 'var(--success)' }}>Undertaking Form Confirmed</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>You have agreed to comply with all school rules and regulations upon enrollment.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: SCHEME OF WORK VIEW (READ-ONLY)
          ========================================== */}
      {activeSubTab === 'schemes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Hero Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '15px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
            padding: '24px', color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
                <BookOpen size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Scheme of Work</h3>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  12-week course outline for your class — {settings?.active_term || '3rd Term'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: '600' }}>
              <FileText size={14} /> {studentSubjects.length} Subject{studentSubjects.length !== 1 ? 's' : ''} Available
            </div>
          </div>

          {/* Subject selector */}
          <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', borderRadius: '0', borderTop: 'none' }}>
            <div className="form-group" style={{ margin: 0, maxWidth: '360px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Select Subject</label>
              <select
                className="form-control"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">Choose subject...</option>
                {studentSubjects.map((sub, idx) => (
                  <option key={idx} value={sub.subject_id}>{sub.subject_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheme table */}
          {!selectedSubjectId ? (
            <div className="glass-panel" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', textAlign: 'center', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <BookOpen size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>No subjects mapped to your class or none selected.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', borderTop: 'none' }}>
              {/* Subject sub-header */}
              <div style={{
                padding: '14px 22px', borderBottom: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(30,58,138,0.04) 100%)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)' }}>
                      {studentSubjects.find(s => s.subject_id === parseInt(selectedSubjectId) || s.subject_id === selectedSubjectId)?.subject_name || 'Subject'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {settings?.active_term || '3rd Term'} · {settings?.active_session || 'Current Session'}
                    </div>
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--success)', border: '1px solid rgba(22,163,74,0.2)' }}>
                  {schemeWeeks.filter(w => w.topic).length} / 12 Weeks Filled
                </span>
              </div>

              <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                <table className="school-table" style={{ margin: 0 }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center', padding: '14px' }}>Week</th>
                      <th style={{ width: '38%', padding: '14px' }}>Title & Subtitle</th>
                      <th style={{ padding: '14px' }}>Content / Objectives</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemeWeeks.map((w, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: '14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: w.topic ? 'var(--primary)' : 'var(--border-color)',
                            color: w.topic ? '#fff' : 'var(--text-muted)',
                            fontWeight: '700', fontSize: '0.8rem'
                          }}>{w.week}</span>
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          {w.topic ? (
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{w.topic}</div>
                              {w.subtitle && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '3px', fontWeight: '500' }}>
                                  📌 {w.subtitle}
                                </div>
                              )}
                            </div>
                          ) : (
                            <em style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No topic defined yet</em>
                          )}
                        </td>
                        <td style={{ color: w.objectives ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.88rem', verticalAlign: 'top', whiteSpace: 'pre-line', padding: '12px 14px' }}>
                          {w.objectives || <em>—</em>}
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

      {/* ==========================================
          MODAL: ENTER RESULT VERIFICATION PIN
          ========================================== */}
      {showPinModal && selectedTermForRC && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden', padding: 0 }}>
            {/* Modal Hero */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '28px', textAlign: 'center', color: 'white', position: 'relative' }}>
              <button className="modal-close" onClick={() => setShowPinModal(false)} style={{ color: 'white', position: 'absolute', top: '12px', right: '16px' }}>✕</button>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '2px solid rgba(255,255,255,0.4)' }}>
                <Key size={28} color="white" />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem' }}>Enter Result PIN</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>
                {selectedTermForRC.academic_year} — {selectedTermForRC.term}
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <form onSubmit={handleVerifyPinSubmit}>
                <div className="form-group">
                  <label style={{ textAlign: 'center', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Your 12-Character PIN</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCD-1234-XYZ9"
                    className="form-control"
                    style={{ textTransform: 'uppercase', fontSize: '1.4rem', textAlign: 'center', letterSpacing: '0.15em', fontWeight: '700' }}
                    maxLength="14"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                    *This PIN can check results up to 5 times.
                  </small>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', fontSize: '1rem' }}>
                  <Key size={16} /> Verify & View Results
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: REPORT CARD RENDERER
          ========================================== */}
      {activeReportCardData && (
        <ReportCard
          data={activeReportCardData}
          settings={settings}
          onClose={() => setActiveReportCardData(null)}
        />
      )}

      {/* ==========================================
          MODAL: RECEIPT PRINT LAYOUT
          ========================================== */}
      {activeReceipt && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px', backgroundColor: '#fff', color: '#000', overflow: 'hidden', padding: 0 }}>
            <div className="no-print" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                <Receipt size={18} /> Payment Receipt
              </div>
              <button className="modal-close" onClick={() => setActiveReceipt(null)} style={{ color: 'white', position: 'static', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div className="print-area" style={{ fontFamily: '"Inter", "Segoe UI", sans-serif', padding: '20px 10px', color: '#000' }} ref={receiptRef}>
              <div style={{ textAlign: 'center', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', marginBottom: '10px' }}>
                  <Receipt size={24} />
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800', color: '#000' }}>{settings?.landing_school_name || 'Jere Model Academy'}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#000' }}>{settings?.landing_tagline || 'KADUNA STATE, NIGERIA'}</p>
                <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px', color: '#000' }}>
                  OFFICIAL PAYMENT RECEIPT
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Receipt No:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{activeReceipt.receipt_number || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Date:</span>
                  <strong>{activeReceipt.payment_date || new Date().toLocaleDateString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Student Name:</span>
                  <strong>{user?.full_name || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Admission No:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{user?.admission_number || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#000' }}>Class:</span>
                  <strong>{user?.class_name || 'N/A'}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Fee Description</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#000', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
                  {activeReceipt.title || 'School Fee'}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                  {activeReceipt.true_amount_due !== undefined && activeReceipt.true_amount_due !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#000' }}>Total Billed:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(activeReceipt.true_amount_due).toLocaleString()}</span>
                    </div>
                  )}
                  {activeReceipt.true_amount_paid !== undefined && activeReceipt.true_amount_paid !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#000' }}>Cumulative Paid To Date:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>₦{Number(activeReceipt.true_amount_paid).toLocaleString()}</span>
                    </div>
                  )}
                  {activeReceipt.true_amount_due !== undefined && activeReceipt.true_amount_due !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                      <span>Current Balance Owed:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>₦{Math.max(0, Number(activeReceipt.true_amount_due) - Number(activeReceipt.true_amount_paid)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>This Payment</div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>via {activeReceipt.payment_method || 'Cash'}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1d4ed8', fontFamily: 'monospace' }}>
                  ₦{Number(activeReceipt.amount_paid).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                {activeReceipt.status === 'paid' ? (
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
                  {settings?.principal_signature ? (
                    <img src={settings.principal_signature} alt="Authorized Signature" style={{ height: '40px', objectFit: 'contain', marginBottom: '2px' }} />
                  ) : (
                    <div style={{ width: '120px', borderBottom: '1px solid #000', margin: '20px auto 5px auto' }}></div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: '#000' }}>Authorized Signature</div>
                </div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#000' }}>~ Thank you for your payment! ~</p>
                <p style={{ margin: '0' }}>Logged by: {activeReceipt.logged_by_name || 'Accounts Office'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #eee' }} className="no-print">
              <button className="btn btn-secondary" onClick={() => setActiveReceipt(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={16} /> Back to Fees
              </button>
              <button className="btn btn-primary" onClick={downloadReceiptPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 6: MY ATTENDANCE CALENDAR
          ========================================== */}
      {activeSubTab === 'attendance' && (
        <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}>
          <HeroHeader
            icon={Calendar}
            title="My Attendance"
            subtitle="Track your daily attendance records."
          />
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--primary)" /> 90-Day Attendance History
              </h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div> Present</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div> Absent</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div> Late</span>
              </div>
            </div>

            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No attendance records found yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                {attendance.map((record, index) => {
                  let bgColor = 'var(--bg-primary)';
                  let color = 'var(--text-secondary)';
                  if (record.status === 'present') { bgColor = '#10b981'; color = 'white'; }
                  if (record.status === 'absent') { bgColor = '#ef4444'; color = 'white'; }
                  if (record.status === 'late') { bgColor = '#f59e0b'; color = 'white'; }
                  
                  return (
                    <div key={index} style={{ 
                      backgroundColor: bgColor, color, 
                      padding: '10px 5px', borderRadius: '6px', 
                      textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.9 }}>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{new Date(record.date).getDate()}</span>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.9 }}>{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIN History Modal */}
      {showHistoryModal && historyTerm && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 1050 }}>
          <div className="modal-content scale-in" style={{ maxWidth: '500px', width: '90%', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} /> PIN Usage History
              </h3>
              <button className="btn-close" onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Usage history for <strong>{historyTerm.term} {historyTerm.academic_year}</strong>
              </p>
              
              {loadingHistory ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <LoadingSpinner />
                  <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading history...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No usage history found.</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historyLogs.map((log, idx) => (
                    <li key={log.id || idx} style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          Check #{historyLogs.length - idx}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {log.description}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowHistoryModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
