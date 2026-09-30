import React from 'react';
import { ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import './LandingPage.css';

export default function ComingSoonPage({ title, schoolName, schoolLogo, onBack }) {
  return (
    <main className="lp-coming-soon" aria-labelledby="coming-soon-title">
      <div className="lp-coming-soon__glow lp-coming-soon__glow--one" aria-hidden="true" />
      <div className="lp-coming-soon__glow lp-coming-soon__glow--two" aria-hidden="true" />

      <header className="lp-coming-soon__header">
        <div className="lp-coming-soon__brand">
          {schoolLogo ? (
            <img src={schoolLogo} alt="" className="lp-coming-soon__logo" />
          ) : (
            <span className="lp-coming-soon__logo-fallback"><GraduationCap size={24} /></span>
          )}
          <span>{schoolName}</span>
        </div>
        <button type="button" className="lp-coming-soon__back" onClick={onBack}>
          <ArrowLeft size={17} /> Back to website
        </button>
      </header>

      <section className="lp-coming-soon__content">
        <div className="lp-coming-soon__icon"><Sparkles size={30} /></div>
        <p className="lp-coming-soon__eyebrow">{title}</p>
        <h1 id="coming-soon-title">Coming Soon</h1>
        <p className="lp-coming-soon__description">
          We’re preparing this page for you. Please check back soon for updates from {schoolName}.
        </p>
        <button type="button" className="lp-coming-soon__primary" onClick={onBack}>
          <ArrowLeft size={17} /> Return to the school website
        </button>
      </section>

      <footer className="lp-coming-soon__footer">
        {schoolName} <span aria-hidden="true">·</span> Inspiring Excellence, Cultivating Leaders
      </footer>
    </main>
  );
}
