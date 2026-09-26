import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar, ChevronRight, ChevronLeft, MapPin, Phone, Mail,
  MessageCircle, X, GraduationCap, Award, BookOpen, ShieldCheck,
  ArrowRight, ExternalLink, Menu, ChevronDown
} from 'lucide-react';
import api from '../utils/api';
import './LandingPage.css';



// ─── Animated Counter Hook ────────────────────────────────────────────────
function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function LandingPage({ settings, onEnterPortal }) {
  const [slides, setSlides] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [openFeature, setOpenFeature] = useState(null);
  const [openEvent, setOpenEvent] = useState(null);
  const [openFooterSection, setOpenFooterSection] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: 'Hello! 👋 How can I help you today?', isBot: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const statsRef = useRef(null);
  const chatEndRef = useRef(null);

  // Stat counters
  const teachers = useCountUp(45, 1500, statsVisible);
  const students = useCountUp(1200, 1800, statsVisible);
  const subjects = useCountUp(30, 1600, statsVisible);
  const portals = useCountUp(100, 1500, statsVisible);

  // ─── Data & Scroll Setup ────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sRes, eRes] = await Promise.all([api.getSlides(), api.getEvents()]);
        setSlides(sRes.data || []);
        setEvents(eRes.data || []);
      } catch (err) {
        console.error('Failed to load landing data', err);
      }
    };
    loadData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      const sections = ['home', 'events', 'about'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top >= -200 && rect.top <= 300) { setActiveSection(id); break; }
        }
      }
    };

    // IntersectionObserver for stats counter
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ─── Helpers ───────────────────────────────────────────────────────────
  const schoolName = settings?.landing_school_name || 'Jere Model Academy';
  const tagline = settings?.landing_tagline || 'Inspiring Excellence, Cultivating Leaders';
  const aboutContent = settings?.about_us_content || 'We are a premier educational institution dedicated to nurturing young minds and building the future leaders of Nigeria. Our commitment to academic rigour, moral development, and holistic education sets us apart.';

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const dynamicFeatures = [
    {
      icon: <GraduationCap size={28} />,
      title: settings?.feature1_title || 'Academic Excellence',
      desc: settings?.feature1_desc || 'Rigorous, world-class curriculum designed to prepare every student for higher education and life.',
    },
    {
      icon: <Award size={28} />,
      title: settings?.feature2_title || 'Leadership & Character',
      desc: settings?.feature2_desc || 'We nurture confident, responsible leaders grounded in strong moral and ethical values.',
    },
    {
      icon: <BookOpen size={28} />,
      title: settings?.feature3_title || 'Modern Curriculum',
      desc: settings?.feature3_desc || 'Continuously updated syllabi that blend global best practices with the Nigerian educational standard.',
    },
    {
      icon: <ShieldCheck size={28} />,
      title: settings?.feature4_title || 'Safe Environment',
      desc: settings?.feature4_desc || 'A secure, supportive campus where every child can thrive without fear or distraction.',
    },
  ];

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { text: msg, isBot: false }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { text: `Thank you for your message! An administrator will get back to you shortly. You can also reach us at ${settings?.contact_email || 'info@school.edu'}.`, isBot: true },
      ]);
    }, 900);
  };

  const formatEventDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return {
        day: d.toLocaleDateString('en-US', { day: '2-digit' }),
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    } catch { return { day: '--', month: '---', full: '' }; }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────
  return (
    <div className="lp-root">

      {/* ── NAVBAR ── */}
      <nav className="lp-nav lp-nav--solid">
        <div className="lp-nav__inner">
          <button className="lp-nav__brand" onClick={() => scrollTo('home')}>
            {settings?.school_logo_url && (
              <img src={settings.school_logo_url} alt="logo" className="lp-nav__logo" />
            )}
            <span className="lp-nav__name">{schoolName}</span>
          </button>

          <div className="lp-nav__links">
            {['home', 'events', 'about'].map(s => (
              <button
                key={s}
                className={`lp-nav__link ${activeSection === s ? 'lp-nav__link--active' : ''}`}
                onClick={() => scrollTo(s)}
              >
                {s === 'about' ? 'ABOUT US' : s.toUpperCase()}
              </button>
            ))}
            <button className="lp-nav__login" onClick={onEnterPortal}>
              LOGIN <ArrowRight size={15} />
            </button>
          </div>
          <div className="lp-nav__mobile-actions">
            <button type="button" className="lp-nav__mobile-login" onClick={onEnterPortal}>Portal</button>
            <button
              type="button"
              className="lp-nav__menu-toggle"
              aria-label="Open site navigation"
              aria-expanded={showMobileNav}
              onClick={() => setShowMobileNav((open) => !open)}
            >
              {showMobileNav ? <X size={20} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {showMobileNav && (
          <div className="lp-nav__mobile-menu">
            {['home', 'events', 'about'].map((section) => (
              <button key={section} type="button" onClick={() => { scrollTo(section); setShowMobileNav(false); }}>
                {section === 'about' ? 'About Us' : section[0].toUpperCase() + section.slice(1)}
                <ChevronRight size={16} />
              </button>
            ))}
            <button type="button" className="lp-nav__mobile-menu-login" onClick={onEnterPortal}>Enter School Portal <ArrowRight size={16} /></button>
          </div>
        )}
      </nav>

      {/* ── TICKER ── */}
      {settings?.ticker_text && (
        <div className={`lp-ticker lp-ticker--${settings?.ticker_speed || 'normal'}`}>
          <div className="lp-ticker__scroll">
            <span>{settings.ticker_text}</span>
            <span>{settings.ticker_text}</span>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="home" className="lp-hero lp-hero--centered">
        {/* Slider images (Full Background) */}
        <div className="lp-hero__slider">
          {slides.length > 0 ? (
            slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`lp-hero__slide ${idx === currentSlide ? 'lp-hero__slide--active' : ''}`}
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />
            ))
          ) : (
            <div className="lp-hero__slide lp-hero__slide--active lp-hero__slide--default" />
          )}
          <div className="lp-hero__slider-overlay-full" />
        </div>

        {/* Content overlay */}
        <div className="lp-hero__content-centered">
          <p className="lp-hero__eyebrow">Jere Model Academy · Kaduna State</p>
          <h1 className="lp-hero__title">
            {slides[currentSlide]?.caption ? slides[currentSlide].caption : (
              settings?.landing_hero_desc ? settings.landing_hero_desc : 
              <>{schoolName} is committed to the Production of World Class Graduates for the Pursuit of all round Excellence.</>
            )}
          </h1>
          <p className="lp-hero__support">A purposeful learning community for confident minds, strong character, and lifelong achievement.</p>
          <div className="lp-hero__actions">
            <button type="button" className="lp-hero__primary-action" onClick={onEnterPortal}>Enter School Portal <ArrowRight size={17} /></button>
            <button type="button" className="lp-hero__secondary-action" onClick={() => scrollTo('about')}>Discover our school</button>
          </div>
        </div>

        {/* Slider controls */}
        {slides.length > 1 && (
          <>
            <button className="lp-hero__arrow lp-hero__arrow--prev" onClick={prevSlide} aria-label="Previous">
              <ChevronLeft size={28} />
            </button>
            <button className="lp-hero__arrow lp-hero__arrow--next" onClick={nextSlide} aria-label="Next">
              <ChevronRight size={28} />
            </button>
            <div className="lp-hero__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`lp-hero__dot ${i === currentSlide ? 'lp-hero__dot--active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="lp-features">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title">What We Offer</h2>
            <div className="lp-section-bar" />
          </div>
          <div className="lp-features__grid">
            {dynamicFeatures.map((f, i) => (
              <div 
                key={i} 
                className="lp-feature-card" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <button 
                  onClick={() => setOpenFeature(openFeature === i ? null : i)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '20px', 
                    border: 'none', 
                    background: 'transparent', 
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="lp-feature-card__icon" style={{ margin: 0, padding: '12px', background: 'rgba(14,165,233,0.1)', color: 'var(--lp-primary)', borderRadius: '12px' }}>
                      {f.icon}
                    </div>
                    <h3 className="lp-feature-card__title" style={{ margin: 0, fontSize: '1.1rem' }}>{f.title}</h3>
                  </div>
                  <ChevronDown 
                    size={22} 
                    color="var(--lp-primary)" 
                    style={{ 
                      transform: openFeature === i ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.3s ease' 
                    }} 
                  />
                </button>
                
                <div style={{ 
                  maxHeight: openFeature === i ? '200px' : '0', 
                  overflow: 'hidden', 
                  transition: 'max-height 0.3s ease-in-out',
                  opacity: openFeature === i ? 1 : 0
                }}>
                  <div style={{ padding: '0 20px 24px 80px' }}>
                    <p className="lp-feature-card__desc" style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--lp-text-muted)' }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS STRIP ── */}
      <section className="lp-stats-strip" ref={statsRef}>
        <div className="lp-container">
          <div className="lp-stats-grid">
            <div className="lp-stat-box">
              <div className="lp-stat-icon"><GraduationCap size={24} /></div>
              <div className="lp-stat-info">
                <span className="lp-stat-num">{students.toLocaleString()}</span>
                <span className="lp-stat-label">Students</span>
              </div>
            </div>
            <div className="lp-stat-box">
              <div className="lp-stat-icon"><Award size={24} /></div>
              <div className="lp-stat-info">
                <span className="lp-stat-num">{teachers}</span>
                <span className="lp-stat-label">Teachers</span>
              </div>
            </div>
            <div className="lp-stat-box">
              <div className="lp-stat-icon"><BookOpen size={24} /></div>
              <div className="lp-stat-info">
                <span className="lp-stat-num">{subjects}</span>
                <span className="lp-stat-label">Subjects</span>
              </div>
            </div>
            <div className="lp-stat-box">
              <div className="lp-stat-icon"><ShieldCheck size={24} /></div>
              <div className="lp-stat-info">
                <span className="lp-stat-num">{portals}%</span>
                <span className="lp-stat-label">Standard Portal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" className="lp-events">
        <div className="lp-container">
          <div className="lp-section-header">
            <h2 className="lp-section-title lp-section-title--light">Events &amp; Updates</h2>
            <div className="lp-section-bar" />
          </div>

          {events.length > 0 ? (
            <div className="lp-events__grid">
              {events.slice(0, 8).map((ev, i) => {
                const { day, month, full } = formatEventDate(ev.event_date);
                return (
                  <article key={ev.id} className="lp-event-card" style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.08}s`, transition: 'all 0.3s ease' }}>
                    <button 
                      onClick={() => setOpenEvent(openEvent === i ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(14,165,233,0.1)', padding: '12px 16px', borderRadius: '12px', color: 'var(--lp-primary)' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1' }}>{day}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>{month}</span>
                        </div>
                        <div>
                          <p className="lp-event-card__date" style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--lp-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Calendar size={13} /> {full}
                          </p>
                          <h3 className="lp-event-card__title" style={{ margin: 0, fontSize: '1.05rem', color: 'var(--lp-text)', fontWeight: '700' }}>{ev.title}</h3>
                        </div>
                      </div>
                      <ChevronDown size={22} color="var(--lp-primary)" style={{ transform: openEvent === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                    </button>
                    
                    <div style={{ 
                      maxHeight: openEvent === i ? '600px' : '0', 
                      overflow: 'hidden', 
                      transition: 'max-height 0.4s ease-in-out',
                      opacity: openEvent === i ? 1 : 0
                    }}>
                      <div style={{ padding: '0 20px 24px 20px' }}>
                        {ev.image_url && (
                          <div style={{ height: '160px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                            <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <p className="lp-event-card__desc" style={{ margin: '0 0 16px 0', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--lp-text-muted)' }}>
                          {ev.description}
                        </p>
                        <span className="lp-event-card__more" onClick={() => setSelectedEvent(ev)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--lp-primary)', fontWeight: '700', fontSize: '0.85rem' }}>
                          Read More <ExternalLink size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="lp-events__empty">
              <Calendar size={52} />
              <h3>No Upcoming Events</h3>
              <p>Check back soon for the latest news and updates from the school.</p>
            </div>
          )}
        </div>
      </section>


      {/* ── ABOUT US ── */}
      <section id="about" className="lp-about">
        <div className="lp-container">
          <div className="lp-about__content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="lp-section-header" style={{ marginBottom: '24px' }}>
              <h2 className="lp-section-title">About {schoolName}</h2>
              <div className="lp-section-bar" />
            </div>

            {/* Image side */}
            <div className="lp-about__img-wrap" style={{ maxWidth: '600px', margin: '0 auto 36px auto' }}>
              <div className="lp-about__img-frame">
                {settings?.about_us_image_url
                  ? <img src={settings.about_us_image_url} alt="About" className="lp-about__img" />
                  : (settings?.school_logo_url
                      ? <img src={settings.school_logo_url} alt="About" className="lp-about__img" />
                      : <div className="lp-about__img-placeholder"><GraduationCap size={72} /></div>
                    )
                }
              </div>
              <div className="lp-about__badge">
                <Award size={20} />
                <span>Nigerian Educational Excellence</span>
              </div>
            </div>

            {/* Text side */}
            <div className="lp-about__text" style={{ textAlign: 'left' }}>
              {aboutContent.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__grid">
            {/* Col 1: Brand */}
            <div className="lp-footer__col lp-footer__col--brand">
              <div className="lp-footer__logo-wrap">
                {settings?.school_logo_url ? (
                  <img src={settings.school_logo_url} alt="logo" className="lp-footer__logo" />
                ) : (
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', marginBottom: '10px' }}>{schoolName}</div>
                )}
              </div>
              <p className="lp-footer__tagline">{tagline}</p>
              <div className="lp-footer__socials">
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Facebook">
                    <span className="lp-footer__social-icon">f</span>
                    <span className="lp-footer__social-text">Facebook</span>
                  </a>
                )}
                {settings?.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Twitter">
                    <span className="lp-footer__social-icon">𝕏</span>
                    <span className="lp-footer__social-text">Twitter</span>
                  </a>
                )}
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Instagram">
                    <span className="lp-footer__social-icon">in</span>
                    <span className="lp-footer__social-text">Instagram</span>
                  </a>
                )}
              </div>
            </div>

            {/* Col 2: Explore (Mobile Accordion) */}
            <div className="lp-footer__col lp-footer__col--accordion">
              <button 
                className="lp-footer__heading-btn" 
                onClick={() => setOpenFooterSection(openFooterSection === 'explore' ? null : 'explore')}
              >
                Explore <ChevronDown size={16} style={{ transform: openFooterSection === 'explore' ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <h4 className="lp-footer__heading-desktop">Explore</h4>
              <ul className={`lp-footer__links ${openFooterSection === 'explore' ? 'open' : ''}`}>
                <li><button onClick={() => scrollTo('home')}>Home</button></li>
                <li><button onClick={() => scrollTo('events')}>Events & Updates</button></li>
                <li><button onClick={() => scrollTo('about')}>About Us</button></li>
                <li><button onClick={onEnterPortal}>School Portal</button></li>
              </ul>
            </div>

            {/* Col 3: Resources (Mobile Accordion) */}
            <div className="lp-footer__col lp-footer__col--accordion">
              <button 
                className="lp-footer__heading-btn" 
                onClick={() => setOpenFooterSection(openFooterSection === 'resources' ? null : 'resources')}
              >
                Resources <ChevronDown size={16} style={{ transform: openFooterSection === 'resources' ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <h4 className="lp-footer__heading-desktop">Resources</h4>
              <ul className={`lp-footer__links ${openFooterSection === 'resources' ? 'open' : ''}`}>
                <li><button>Admissions Info</button></li>
                <li><button>Student Life</button></li>
                <li><button>Academic Calendar</button></li>
                <li><button>Gallery</button></li>
              </ul>
            </div>

            {/* Col 4: Contact (Mobile Accordion) */}
            <div className="lp-footer__col lp-footer__col--accordion">
              <button 
                className="lp-footer__heading-btn" 
                onClick={() => setOpenFooterSection(openFooterSection === 'contact' ? null : 'contact')}
              >
                Contact Us <ChevronDown size={16} style={{ transform: openFooterSection === 'contact' ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              <h4 className="lp-footer__heading-desktop">Contact Us</h4>
              <ul className={`lp-footer__contact ${openFooterSection === 'contact' ? 'open' : ''}`}>
                <li><MapPin size={15} /><span>{settings?.landing_address || 'Kaduna State, Nigeria'}</span></li>
                <li><Phone size={15} /><span>{settings?.contact_phone || '+234 (0) 123 456 7890'}</span></li>
                <li><Mail size={15} /><span>{settings?.contact_email || 'info@school.edu'}</span></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer__bottom">
            <p>&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
            <div className="lp-footer__legal">
              <button>Privacy Policy</button>
              <button>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── CHATBOT ── */}
      <div className="lp-chatbot">
        {showChatbot && (
          <div className="lp-chatbot__window">
            <div className="lp-chatbot__header">
              <div className="lp-chatbot__header-info">
                <div className="lp-chatbot__avatar"><MessageCircle size={18} /></div>
                <div>
                  <p className="lp-chatbot__name">School Assistant</p>
                  <p className="lp-chatbot__status">● Online</p>
                </div>
              </div>
              <button className="lp-chatbot__close" onClick={() => setShowChatbot(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="lp-chatbot__messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`lp-chatbot__msg ${msg.isBot ? 'lp-chatbot__msg--bot' : 'lp-chatbot__msg--user'}`}>
                  <div className="lp-chatbot__bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="lp-chatbot__form" onSubmit={handleChatSubmit}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="lp-chatbot__input"
              />
              <button type="submit" className="lp-chatbot__send">Send</button>
            </form>
          </div>
        )}

        <button
          className={`lp-chatbot__toggle ${showChatbot ? 'lp-chatbot__toggle--active' : ''}`}
          onClick={() => setShowChatbot(v => !v)}
          aria-label="Open chat"
        >
          {showChatbot ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* ── EVENT MODAL ── */}
      {selectedEvent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            background: 'var(--lp-white)', borderRadius: 'var(--lp-radius-lg)', maxWidth: '600px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)',
              color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
            }}>
              <X size={20} />
            </button>
            
            {selectedEvent.image_url ? (
              <img src={selectedEvent.image_url} alt={selectedEvent.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '200px', background: 'var(--lp-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                <Calendar size={64} />
              </div>
            )}
            
            <div style={{ padding: '30px' }}>
              <div style={{ color: 'var(--lp-blue)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> {formatEventDate(selectedEvent.event_date).full}
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--lp-navy)', margin: '0 0 16px 0', lineHeight: 1.2 }}>{selectedEvent.title}</h2>
              <div style={{ fontSize: '1.05rem', color: 'var(--lp-gray)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedEvent.description}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
