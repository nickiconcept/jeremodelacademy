import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Upload, Save, Globe, Image, Calendar, Link2, Info, School } from 'lucide-react';
import api from '../utils/api';
import Swal from 'sweetalert2';

// ── Shared hero style (matches all other admin tabs) ──────────────
const HERO_STYLE = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  flexWrap: 'wrap', gap: '15px',
  background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)',
  padding: '24px', margin: '-24px -24px 24px -24px',
  borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
  color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
};

const TABS = [
  { key: 'school',  label: 'School Info',   icon: <School size={15} /> },
  { key: 'slider',  label: 'Hero Slider',   icon: <Image size={15} /> },
  { key: 'about',   label: 'About Us',      icon: <Info size={15} /> },
  { key: 'social',  label: 'Social Media',  icon: <Link2 size={15} /> },
  { key: 'events',  label: 'Events & News', icon: <Calendar size={15} /> },
];

export default function AdminWebsiteTab({ settings, fetchSettings }) {
  const [slides, setSlides]   = useState([]);
  const [events, setEvents]   = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({
    landing_school_name: '', landing_tagline: '', landing_address: '',
    landing_phone: '', landing_email: '', landing_hero_desc: '',
  });
  const [aboutUs, setAboutUs] = useState('');
  const [social, setSocial]   = useState({ facebook_url: '', twitter_url: '', instagram_url: '' });
  const [newSlide, setNewSlide]   = useState({ image: null, caption: '' });
  const [slidePreview, setSlidePreview] = useState(null);
  const [eventForm, setEventForm] = useState({ id: null, title: '', description: '', event_date: '', image: null });
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState('');
  const [activeTab, setActiveTab] = useState('school');

  // Sync from settings prop
  useEffect(() => {
    if (settings) {
      setSchoolInfo({
        landing_school_name: settings.landing_school_name || '',
        landing_tagline:     settings.landing_tagline     || '',
        landing_address:     settings.landing_address     || '',
        landing_phone:       settings.landing_phone       || '',
        landing_email:       settings.landing_email       || '',
        landing_hero_desc:   settings.landing_hero_desc   || '',
      });
      setAboutUs(settings.about_us_content || '');
      setSocial({
        facebook_url:  settings.facebook_url  || '',
        twitter_url:   settings.twitter_url   || '',
        instagram_url: settings.instagram_url || '',
      });
    }
  }, [settings]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, eRes] = await Promise.all([api.getSlides(), api.getEvents()]);
      setSlides(sRes.data || []);
      setEvents(eRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Savers ───────────────────────────────────────────────────────
  const save = async (key, fn) => {
    try { setSaving(key); await fn(); if (fetchSettings) await fetchSettings(); toast('Saved successfully!'); }
    catch (err) { 
      let msg = err.response?.data?.message || 'Failed to save. Please try again.';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join('<br>');
      }
      Swal.fire({ icon: 'error', title: 'Error', html: msg }); 
    }
    finally { setSaving(''); }
  };

  const toast = (msg) => Swal.fire({ icon: 'success', title: msg, timer: 1600, showConfirmButton: false, toast: true, position: 'top-end' });

  const handleSaveSchoolInfo = () => save('school', () => api.updateSchoolInfo(schoolInfo));
  const handleSaveAbout      = () => save('about',  () => api.updateAboutUs(aboutUs));
  const handleSaveSocial     = () => save('social', () => api.updateSocialLinks(social));

  // ── Slides ──────────────────────────────────────────────────────
  const handleSlideImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setNewSlide({ ...newSlide, image: file }); setSlidePreview(URL.createObjectURL(file)); }
  };
  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!newSlide.image) return Swal.fire('Error', 'Please select an image first.', 'error');
    const fd = new FormData();
    fd.append('image', newSlide.image);
    fd.append('caption', newSlide.caption);
    try {
      setSaving('slide');
      await api.addSlide(fd);
      setNewSlide({ image: null, caption: '' }); setSlidePreview(null);
      loadData(); toast('Slide added!');
    } catch (err) { 
      let msg = err.response?.data?.message || 'Failed to add slide. Use a JPG or PNG image.';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join('<br>');
      }
      Swal.fire({ icon: 'error', title: 'Error', html: msg }); 
    }
    finally { setSaving(''); }
  };
  const handleDeleteSlide = async (id) => {
    const r = await Swal.fire({ title: 'Delete slide?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#d33' });
    if (r.isConfirmed) { await api.deleteSlide(id); loadData(); }
  };

  // ── Events ──────────────────────────────────────────────────────
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', eventForm.title); fd.append('description', eventForm.description);
    fd.append('event_date', eventForm.event_date);
    if (eventForm.image) fd.append('image', eventForm.image);
    try {
      if (eventForm.id) await api.updateEvent(eventForm.id, fd);
      else              await api.createEvent(fd);
      setShowEventModal(false); loadData(); toast('Event saved!');
    } catch (err) { 
      let msg = err.response?.data?.message || 'Failed to save event';
      if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join('<br>');
      }
      Swal.fire({ icon: 'error', title: 'Error', html: msg }); 
    }
  };
  const handleDeleteEvent = async (id) => {
    const r = await Swal.fire({ title: 'Delete event?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#d33' });
    if (r.isConfirmed) { await api.deleteEvent(id); loadData(); }
  };
  const openAddEvent  = () => { setEventForm({ id: null, title: '', description: '', event_date: '', image: null }); setShowEventModal(true); };
  const openEditEvent = (ev) => { setEventForm({ ...ev, image: null }); setShowEventModal(true); };

  // ── Tab bar style (inline — no Bootstrap dependency) ────────────
  const tabBtnStyle = (key) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '9px 16px', border: '1px solid',
    borderColor: activeTab === key ? '#0EA5E9' : '#dee2e6',
    borderBottom: activeTab === key ? '2px solid #0EA5E9' : '1px solid #dee2e6',
    background: activeTab === key ? '#E0F2FE' : '#fff',
    color: activeTab === key ? '#0284C7' : '#555',
    fontWeight: activeTab === key ? 700 : 500,
    fontSize: '0.86rem', borderRadius: '8px 8px 0 0',
    cursor: 'pointer', marginRight: '4px', marginBottom: '-1px',
    transition: 'all 0.2s ease',
  });

  const isBusy = (key) => saving === key;

  const SaveBtn = ({ skey, label }) => (
    <button
      onClick={() => { if (skey === 'school') handleSaveSchoolInfo(); else if (skey === 'about') handleSaveAbout(); else if (skey === 'social') handleSaveSocial(); }}
      disabled={isBusy(skey)}
      style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 22px', background:'white', color:'var(--primary)', border:'2px solid rgba(255,255,255,0.5)', borderRadius:'8px', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}
    >
      {isBusy(skey) ? 'Saving…' : <><Save size={14}/>{label}</>}
    </button>
  );

  if (loading) return (
    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
      <div className="spinner-border text-primary mx-auto" style={{ width: '2.5rem', height: '2.5rem' }} />
      <p className="mt-3 text-muted">Loading Website CMS…</p>
    </div>
  );

  return (
    <div className="card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '24px' }}>

        {/* ── HERO HEADER ───────────────────────────────────────────── */}
        <div style={HERO_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px', display: 'flex' }}>
              <Globe size={28} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem' }}>Website CMS</h3>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Manage your school's public website content</p>
            </div>
          </div>
          {/* Active tab save button in hero */}
          {activeTab === 'school' && <SaveBtn skey="school" label="Save School Info" />}
          {activeTab === 'about'  && <SaveBtn skey="about"  label="Save About Us" />}
          {activeTab === 'social' && <SaveBtn skey="social" label="Save Social Links" />}
          {activeTab === 'slider' && (
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{slides.length} slide{slides.length !== 1 ? 's' : ''} uploaded</span>
          )}
          {activeTab === 'events' && (
            <button onClick={openAddEvent}
              style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 22px', background:'rgba(255,255,255,0.15)', color:'white', border:'2px solid rgba(255,255,255,0.5)', borderRadius:'8px', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>
              <Plus size={15} /> Add New Event
            </button>
          )}
        </div>

        {/* ── TAB BAR ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '2px solid #dee2e6', marginBottom: '24px' }}>
          {TABS.map(t => (
            <button key={t.key} style={tabBtnStyle(t.key)} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── SCHOOL INFO ─────────────────────────────────────────────── */}
        {activeTab === 'school' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'landing_school_name', label: 'School Name', placeholder: 'e.g. Jere Model Academy', full: false },
              { key: 'landing_tagline', label: 'Tagline / Motto', placeholder: 'e.g. Inspiring Excellence…', full: false },
              { key: 'landing_hero_desc', label: 'Hero Description', placeholder: 'Short text shown on hero', full: true },
              { key: 'landing_address', label: 'Address', placeholder: 'e.g. No 1 School Road, Kaduna State', full: true },
              { key: 'landing_phone', label: 'Phone Number', placeholder: '+234 (0) 123 456 7890', full: false },
              { key: 'landing_email', label: 'Email Address', placeholder: 'info@school.edu', full: false },
            ].map(f => (
              <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>{f.label}</label>
                <input type={f.key === 'landing_email' ? 'email' : 'text'}
                  value={schoolInfo[f.key]} placeholder={f.placeholder}
                  onChange={e => setSchoolInfo({ ...schoolInfo, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── HERO SLIDER ─────────────────────────────────────────────── */}
        {activeTab === 'slider' && (
          <div>
            <form onSubmit={handleAddSlide} style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
              <h6 style={{ fontWeight: 700, marginBottom: '14px' }}>Upload New Slide</h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '5px' }}>Image File (JPG, PNG)*</label>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleSlideImageChange} required
                    style={{ width: '100%', padding: '7px 12px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', marginBottom: '5px' }}>Caption (Optional)</label>
                  <input type="text" placeholder="Enter slide caption…"
                    value={newSlide.caption} onChange={e => setNewSlide({ ...newSlide, caption: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={isBusy('slide')}
                  style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'var(--primary)', color:'white', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', whiteSpace:'nowrap' }}>
                  <Upload size={14} /> {isBusy('slide') ? 'Uploading…' : 'Add Slide'}
                </button>
              </div>
              {slidePreview && <img src={slidePreview} alt="preview" style={{ marginTop: '12px', height: '80px', borderRadius: '8px', border: '2px solid #0EA5E9' }} />}
            </form>

            <h6 style={{ fontWeight: 700, marginBottom: '14px', color: '#334155' }}>Current Slides ({slides.length})</h6>
            {slides.length === 0
              ? <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No slides uploaded yet.</p>
              : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {slides.map(slide => (
                    <div key={slide.id} style={{ position: 'relative', width: '150px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <img src={slide.image_url} alt="Slide" style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                      {slide.caption && (
                        <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px' }}>{slide.caption}</div>
                      )}
                      <button onClick={() => handleDeleteSlide(slide.id)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── ABOUT US ─────────────────────────────────────────────────── */}
        {activeTab === 'about' && (
          <div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>This text appears in the "About Us" section of the landing page. Use new lines to separate paragraphs.</p>
            <textarea value={aboutUs} onChange={e => setAboutUs(e.target.value)}
              rows={12} placeholder="Write your school's About Us content here…"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #dde5f0', borderRadius: '10px', fontSize: '0.93rem', lineHeight: 1.7, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        )}

        {/* ── SOCIAL LINKS ──────────────────────────────────────────────── */}
        {activeTab === 'social' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {[
              { key: 'facebook_url',  label: '🔵 Facebook URL',  placeholder: 'https://facebook.com/yourpage' },
              { key: 'twitter_url',   label: '⬛ Twitter / X URL', placeholder: 'https://twitter.com/yourpage' },
              { key: 'instagram_url', label: '🟣 Instagram URL',  placeholder: 'https://instagram.com/yourpage' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>{f.label}</label>
                <input type="url" value={social[f.key]} placeholder={f.placeholder}
                  onChange={e => setSocial({ ...social, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── EVENTS ──────────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          events.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <h5 style={{ color: '#64748b' }}>No Events Yet</h5>
                <p>Click "Add New Event" above to create your first event.</p>
              </div>
            )
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {['Title', 'Date', 'Description', 'Image', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#4A5878', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(ev => (
                      <tr key={ev.id} style={{ borderBottom: '1px solid #f0f4fa' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0D1829' }}>{ev.title}</td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: '#0EA5E9', fontWeight: 600, fontSize: '0.85rem' }}>
                          {new Date(ev.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748b', maxWidth: '260px' }}>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {ev.image_url
                            ? <img src={ev.image_url} alt="" style={{ height: '40px', width: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                            : <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No image</span>}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button onClick={() => openEditEvent(ev)}
                            style={{ marginRight: '6px', padding: '5px 12px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleDeleteEvent(ev.id)}
                            style={{ padding: '5px 10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>

      {/* ── EVENT MODAL ─────────────────────────────────────────────── */}
      {showEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ ...HERO_STYLE, margin: 0, borderRadius: 0, padding: '18px 24px' }}>
              <h5 style={{ margin: 0, fontWeight: 800 }}>{eventForm.id ? '✏️ Edit Event' : '➕ Add New Event'}</h5>
              <button onClick={() => setShowEventModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <form onSubmit={handleSaveEvent} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Event Title *</label>
                  <input type="text" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Annual Sports Day"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Date *</label>
                  <input type="date" required value={eventForm.event_date} onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Image (Optional)</label>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={e => setEventForm({ ...eventForm, image: e.target.files[0] })}
                    style={{ width: '100%', padding: '7px 12px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.88rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Description *</label>
                  <textarea required rows={4} value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Describe the event…"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #dde5f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowEventModal(false)}
                  style={{ padding: '9px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit"
                  style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 22px', background:'var(--primary)', color:'white', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer' }}>
                  <Save size={14} /> {eventForm.id ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
