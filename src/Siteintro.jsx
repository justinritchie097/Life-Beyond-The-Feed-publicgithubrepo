import React, { useState } from 'react';
import './AntiSocialForumHome.css';

const Siteintro = ({ session }) => {
  // Interactive calculator to make the science personal
  const [dailyHours, setDailyHours] = useState(3);
  const daysReclaimedPerYear = Math.round((dailyHours * 365) / 24);
  const booksEquivalent = Math.round((dailyHours * 365) / 6); // Avg ~6 hrs per book

  return (
    <div className="forum-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🧠 Social Media Detox Forum</span>
          <h1 className="hero-title">
            Break the Dopamine Loop. Reclaim Your Mind.
          </h1>
          <p className="hero-description">
            Social media algorithms are engineered to hijack your attention,
            fragment your focus, and erode your mental health. Our forum is a
            safe space to share experiences, strategies, and support for those
            seeking to reduce screen time and restore cognitive balance.
          </p>

          {/* Interactive Impact Calculator inside your existing hero-actions div */}
          <div
            className="hero-actions"
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <label
              htmlFor="screen-slider"
              style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '0.5rem',
              }}
            >
              Your Daily Social Media Average:{' '}
              <span style={{ textDecoration: 'underline' }}>
                {dailyHours} {dailyHours === 1 ? 'hour' : 'hours'}/day
              </span>
            </label>
            <input
              id="screen-slider"
              type="range"
              min="1"
              max="8"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              style={{
                width: '100%',
                maxWidth: '320px',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            />
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Stepping back gives you{' '}
              <strong>{daysReclaimedPerYear} full waking days</strong> back
              every year—enough time to read{' '}
              <strong>~{booksEquivalent} books</strong>, learn an instrument, or
              deeply reconnect offline.
            </p>
          </div>
        </div>
      </section>

      {/* Science-Backed Stats Strip */}
      <section
        className="science-stats-section"
        style={{
          padding: '1.5rem 0',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          marginBottom: '2rem',
        }}
      >
        <div className="principles-grid" style={{ textAlign: 'center' }}>
          <div className="stat-item">
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
              23 Minutes
            </h2>
            <p className="card-text" style={{ margin: 0 }}>
              Average time required to regain deep cognitive focus after a
              single notification interruption <em>(UC Irvine Research)</em>.
            </p>
          </div>

          <div className="stat-item">
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
              1 Week Off
            </h2>
            <p className="card-text" style={{ margin: 0 }}>
              Taking just a 7-day break from social media significantly reduces
              symptoms of anxiety and depression{' '}
              <em>(Cyberpsychology, Behavior & Social Networking)</em>.
            </p>
          </div>

          <div className="stat-item">
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem' }}>
              30+ Mins Sleep
            </h2>
            <p className="card-text" style={{ margin: 0 }}>
              Eliminating evening doomscrolling stops blue-light melatonin
              suppression and restores REM sleep architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="principles-section">
        <div className="principles-grid">
          <div className="principle-card">
            <h3 className="card-title">
              Join a Community of Like-Minded Individuals
            </h3>
            <p className="card-text">
              Connect with others who are on a similar journey towards a
              healthier relationship with social media.
            </p>
          </div>

          <div className="principle-card">
            <h3 className="card-title">
              Find out why people are deciding to stay off of addictive social
              media feeds
            </h3>
            <p className="card-text">
              Learn ways to reclaim your attention and reduce screen time in a
              safe, distraction-free environment.
            </p>
          </div>

          <div className="principle-card">
            <h3 className="card-title">Evidence-Based Strategies</h3>
            <p className="card-text">
              Explore evidence-based strategies to restore focus, improve mental
              clarity, and regain control over your digital habits.
            </p>
          </div>
        </div>
      </section>

      {/* Main Forum Feed Section */}
      <main className="main-content"></main>
      {/* Left Column: Discussion List */}
      <div className="feed-column">
        <div className="feed-header"></div>
      </div>
    </div>
  );
};

export default Siteintro;
