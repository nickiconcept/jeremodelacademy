import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar, ChevronRight, ChevronLeft, MapPin, Phone, Mail,
  MessageCircle, X, GraduationCap, Award, BookOpen, ShieldCheck,
  ArrowRight, ExternalLink
} from 'lucide-react';
import api from '../utils/api';
import './LandingPage.css';

// ─── Feature Cards Data ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <GraduationCap size={28} />,
    title: 'Academic Excellence',
    desc: 'Rigorous, world-class curriculum designed to prepare every student for higher education and life.',
  },
  {
    icon: <Award size={28} />,
    title: 'Leadership & Character',
    desc: 'We nurture confident, responsible leaders grounded in strong moral and ethical values.',
  },
  {
    icon: <BookOpen size={28} />,
    title: 'Modern Curriculum',
    desc: 'Continuously updated syllabi that blend global best practices with the Nigerian educational standard.',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Safe Environment',
    desc: 'A secure, supportive campus where every child can thrive without fear or distraction.',
  },
];

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [statsVisible, setStatsVisible] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: 'Hello! 👋 How can I help you today?', isBot: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const statsRef = useRef(null);
  const chatEndRef = useRef(null);

  // Stat counters
  const years = useCountUp(25, 1500, statsVisible);
  const students = useCountUp(1200, 1800, statsVisible);
  const teachers = useCountUp(150, 1600, statsVisible);

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

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { text: msg, isBot: false }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { text: `Thank you for your message! An administrator will get back to you shortly. You can also reach us at ${settings?.landing_email || 'info@school.edu'}.`, isBot: true },
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
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__inner">
          <button className="lp-nav__brand" onClick={() => scrollTo('home')}>
            {settings?.landing_logo && (
              <img src={settings.landing_logo} alt="logo" className="lp-nav__logo" />
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
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="lp-hero">
        {/* Geometric background decorations */}
        <div className="lp-hero__decor">
          <div className="lp-hero__circle lp-hero__circle--1" />
          <div className="lp-hero__circle lp-hero__circle--2" />
          <div className="lp-hero__circle lp-hero__circle--3" />
          <div className="lp-hero__line lp-hero__line--1" />
          <div className="lp-hero__line lp-hero__line--2" />
        </div>

        {/* Slider images (right panel) */}
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
          <div className="lp-hero__slider-overlay" />
        </div>

        {/* Content overlay */}
        <div className="lp-hero__content">
          <p className="lp-hero__eyebrow">Welcome to</p>
          <h1 className="lp-hero__title">
            {schoolName.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? 'lp-hero__title--accent' : ''}>{word} </span>
            ))}
          </h1>
          <p className="lp-hero__tagline">{tagline}</p>
          <button className="lp-hero__cta" onClick={onEnterPortal}>
            Access Student Portal <ChevronRight size={20} />
          </button>
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
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-card__icon">{f.icon}</div>
                <h3 className="lp-feature-card__title">{f.title}</h3>
                <p className="lp-feature-card__desc">{f.desc}</p>
              </div>
            ))}
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
              {events.slice(0, 6).map((ev, i) => {
                const { day, month, full } = formatEventDate(ev.event_date);
                return (
                  <article key={ev.id} className="lp-event-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="lp-event-card__img-wrap">
                      {ev.image_url
                        ? <img src={ev.image_url} alt={ev.title} className="lp-event-card__img" />
                        : <div className="lp-event-card__img-placeholder"><Calendar size={36} /></div>
                      }
                      <div className="lp-event-card__badge">
                        <span className="lp-event-card__badge-day">{day}</span>
                        <span className="lp-event-card__badge-month">{month}</span>
                      </div>
                    </div>
                    <div className="lp-event-card__body">
                      <p className="lp-event-card__date"><Calendar size={13} /> {full}</p>
                      <h3 className="lp-event-card__title">{ev.title}</h3>
                      <p className="lp-event-card__desc">{ev.description}</p>
                      <span className="lp-event-card__more">Read More <ExternalLink size={13} /></span>
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
          <div className="lp-about__grid">
            {/* Image side */}
            <div className="lp-about__img-wrap">
              <div className="lp-about__img-frame">
                {settings?.landing_logo
                  ? <img src={settings.landing_logo} alt="About" className="lp-about__img" />
                  : <div className="lp-about__img-placeholder"><GraduationCap size={72} /></div>
                }
              </div>
              <div className="lp-about__badge">
                <Award size={20} />
                <span>Nigerian Educational Excellence</span>
              </div>
            </div>

            {/* Text side */}
            <div className="lp-about__content">
              <h2 className="lp-section-title">About {schoolName}</h2>
              <div className="lp-section-bar lp-section-bar--left" />
              <div className="lp-about__text">
                {aboutContent.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>

              {/* Stats */}
              <div className="lp-stats" ref={statsRef}>
                <div className="lp-stat">
                  <span className="lp-stat__number">{years}+</span>
                  <span className="lp-stat__label">Years of Excellence</span>
                </div>
                <div className="lp-stat__divider" />
                <div className="lp-stat">
                  <span className="lp-stat__number">{students.toLocaleString()}+</span>
                  <span className="lp-stat__label">Dedicated Students</span>
                </div>
                <div className="lp-stat__divider" />
                <div className="lp-stat">
                  <span className="lp-stat__number">{teachers}+</span>
                  <span className="lp-stat__label">Qualified Teachers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__grid">
            {/* Col 1: Brand */}
            <div className="lp-footer__col">
              {settings?.landing_logo && (
                <img src={settings.landing_logo} alt="logo" className="lp-footer__logo" />
              )}
              <p className="lp-footer__tagline">{tagline}</p>
              <div className="lp-footer__socials">
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Facebook">f</a>
                )}
                {settings?.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Twitter">𝕏</a>
                )}
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="lp-footer__social" aria-label="Instagram">in</a>
                )}
              </div>
            </div>

            {/* Col 2: Contact */}
            <div className="lp-footer__col">
              <h4 className="lp-footer__heading">Contact Us</h4>
              <ul className="lp-footer__contact">
                <li><MapPin size={15} /><span>{settings?.landing_address || 'Kaduna State, Nigeria'}</span></li>
                <li><Phone size={15} /><span>{settings?.landing_phone || '+234 (0) 123 456 7890'}</span></li>
                <li><Mail size={15} /><span>{settings?.landing_email || 'info@school.edu'}</span></li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div className="lp-footer__col">
              <h4 className="lp-footer__heading">Quick Links</h4>
              <ul className="lp-footer__links">
                <li><button onClick={() => scrollTo('home')}>Home</button></li>
                <li><button onClick={() => scrollTo('events')}>Events</button></li>
                <li><button onClick={() => scrollTo('about')}>About Us</button></li>
                <li><button onClick={onEnterPortal}>School Portal</button></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer__bottom">
            <p>&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
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

    </div>
  );
}
