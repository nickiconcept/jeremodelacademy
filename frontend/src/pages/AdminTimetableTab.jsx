import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar, Clock, BookOpen, User, School, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import Swal from 'sweetalert2';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_COLORS = {
  Monday: '#0EA5E9', Tuesday: '#6366F1', Wednesday: '#10B981',
  Thursday: '#F59E0B', Friday: '#EF4444',
};

// ── Shared hero style (matches all other admin tabs) ──────────────
const HERO_STYLE = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  flexWrap: 'wrap', gap: '15px',
  background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
  padding: '24px', margin: '-24px -24px 24px -24px',
  borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
  color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
};

export default function AdminTimetableTab({ classes, subjects, teachers }) {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [adding, setAdding]         = useState(false);
  const [filterDay, setFilterDay]   = useState('All');
  const [filterClass, setFilterClass] = useState('');

  const [form, setForm] = useState({
    class_id: '', subject_id: '', teacher_id: '',
    day_of_week: 'Monday', start_time: '', end_time: '',
  });

  useEffect(() => { loadTimetables(); }, []);

  const loadTimetables = async () => {
    try {
      setLoading(true);
      const res = await api.getTimetables();
      setTimetables(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.start_time || !form.end_time)
      return Swal.fire('Missing Fields', 'Please enter both start and end time.', 'error');
    try {
      setAdding(true);
      await api.addTimetable(form);
      loadTimetables();
      setForm({ ...form, start_time: '', end_time: '', subject_id: '', teacher_id: '' });
      Swal.fire({ icon: 'success', title: 'Period Added!', timer: 1400, showConfirmButton: false, toast: true, position: 'top-end' });
    } catch (err) {
      console.error(err.response?.data);
      let msg = err.response?.data?.message || 'Failed to add entry';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join('<br>');
      }
      Swal.fire({ icon: 'error', title: 'Error', html: msg });
    } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: 'Delete this period?', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Yes, delete', confirmButtonColor: '#d33',
    });
    if (!res.isConfirmed) return;
    try { await api.deleteTimetable(id); loadTimetables(); }
    catch (err) { console.error(err); }
  };

  // Filtered list
  const filtered = timetables.filter(t => {
    const dayOk   = filterDay === 'All' || t.day_of_week === filterDay;
    const classOk = !filterClass || String(t.class_id) === String(filterClass);
    return dayOk && classOk;
  });

  // Grouped by day for timetable view
  const grouped = DAYS
    .map(day => ({ day, entries: filtered.filter(t => t.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)) }))
    .filter(g => filterDay === 'All' || g.day === filterDay);

  // ── Shared input style ────────────────────────────────────────────
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', color: '#0D1829', background: '#fff' };
  const lbl = { display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' };

  return (
    <div className="card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '24px' }}>

        {/* ── HERO HEADER ──────────────────────────────────────────────── */}
        <div style={HERO_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px', display: 'flex' }}>
              <Calendar size={28} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem' }}>Timetable Manager</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                {timetables.length} period{timetables.length !== 1 ? 's' : ''} scheduled across the school week
              </p>
            </div>
          </div>
          {/* Quick stats in hero */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>
                  {timetables.filter(t => t.day_of_week === d).length}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '2px' }}>{d.slice(0, 3)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN LAYOUT ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* ── ADD FORM SIDEBAR ───────────────────────────────────────── */}
          <div style={{ width: '290px', flexShrink: 0 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', padding: '14px 18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Plus size={16} /> Add New Period
              </div>
              <form onSubmit={handleAdd} style={{ padding: '18px' }}>

                <div style={{ marginBottom: '13px' }}>
                  <label style={lbl}><School size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />Class *</label>
                  <select size={1} style={{ ...inp, appearance: 'auto', WebkitAppearance: 'menulist', height: '38px' }} required value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '13px' }}>
                  <label style={lbl}><BookOpen size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />Subject *</label>
                  <select size={1} style={{ ...inp, appearance: 'auto', WebkitAppearance: 'menulist', height: '38px' }} required value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                    <option value="">Select Subject</option>
                    {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '13px' }}>
                  <label style={lbl}><User size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />Teacher</label>
                  <select size={1} style={{ ...inp, appearance: 'auto', WebkitAppearance: 'menulist', height: '38px', overflow: 'hidden' }}
                    value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
                    <option value="">Unassigned</option>
                    {teachers?.map(t => <option key={t.id} value={t.id}>{t.full_name || t.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '13px' }}>
                  <label style={lbl}><Calendar size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />Day *</label>
                  <select size={1} style={{ ...inp, appearance: 'auto', WebkitAppearance: 'menulist', height: '38px' }} required value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={lbl}><Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />Start *</label>
                    <input type="time" style={inp} required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div>
                    <label style={lbl}><Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />End *</label>
                    <input type="time" style={inp} required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>

                <button type="submit" disabled={adding}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>
                  <Plus size={16} /> {adding ? 'Adding…' : 'Add to Timetable'}
                </button>
              </form>
            </div>
          </div>

          {/* ── TIMETABLE VIEW ─────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px', padding: '14px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <BarChart2 size={15} style={{ color: '#64748b', marginRight: '4px' }} />
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#475569', marginRight: '6px' }}>Filter:</span>
              {['All', ...DAYS].map(d => (
                <button key={d} onClick={() => setFilterDay(d)} style={{
                  padding: '5px 13px', borderRadius: '99px', border: '1px solid',
                  borderColor: filterDay === d ? (DAY_COLORS[d] || '#0EA5E9') : '#dde5f0',
                  background: filterDay === d ? (DAY_COLORS[d] || '#0EA5E9') : '#fff',
                  color: filterDay === d ? '#fff' : '#555',
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {d === 'All' ? 'All Days' : d.slice(0, 3)}
                </button>
              ))}
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                style={{ ...inp, width: 'auto', marginLeft: '8px', padding: '5px 10px' }}>
                <option value="">All Classes</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} />
                <p style={{ marginTop: '12px' }}>Loading timetable…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '70px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Calendar size={52} style={{ opacity: 0.25, marginBottom: '14px' }} />
                <h5 style={{ color: '#64748b' }}>No Periods Found</h5>
                <p style={{ fontSize: '0.9rem' }}>Use the form on the left to add timetable entries.</p>
              </div>
            ) : (
              grouped.map(({ day, entries }) => entries.length > 0 && (
                <div key={day} style={{ marginBottom: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  {/* Day header */}
                  <div style={{ background: `linear-gradient(135deg, ${DAY_COLORS[day]}, ${DAY_COLORS[day]}cc)`, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 12px', fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{day}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {entries.length} period{entries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Entries */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Time', 'Subject', 'Teacher', 'Class', ''].map(h => (
                          <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((t, i) => (
                        <tr key={t.id} style={{ borderBottom: i < entries.length - 1 ? '1px solid #f0f4fa' : 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: DAY_COLORS[day] }}>
                              <Clock size={12} />{t.start_time} – {t.end_time}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px', fontWeight: 600, color: '#0D1829' }}>{t.subject?.name || '—'}</td>
                          <td style={{ padding: '11px 14px', color: '#475569' }}>
                            {t.teacher?.full_name || t.teacher?.name || <em style={{ color: '#94a3b8', fontStyle: 'normal' }}>Unassigned</em>}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ background: '#E0F2FE', color: '#0284C7', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                              {t.class?.name || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <button onClick={() => handleDelete(t.id)}
                              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
