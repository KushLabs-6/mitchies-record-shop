import React from 'react';
import Navbar from '../components/Navbar';

function Feed() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar cartCount={0} onCartToggle={() => {}} />

      <main
        className="container"
        style={{
          flex: 1,
          paddingTop: '7rem',
          paddingBottom: '4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Instagram <span className="gold-text">Feed</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2.5rem', maxWidth: '500px' }}>
          Follow us{' '}
          <a
            href="https://www.instagram.com/mitchiesrecordshop/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-gold)', fontWeight: '600' }}
          >
            @mitchiesrecordshop
          </a>{' '}
          for the latest arrivals, events, and real vinyl vibes.
        </p>

        {/* Instagram official embed — live, no API key needed */}
        <div style={{
          width: '100%',
          maxWidth: '540px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <iframe
            title="Mitchie's Record Shop Instagram Feed"
            src="https://www.instagram.com/mitchiesrecordshop/embed"
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="yes"
            allowTransparency="true"
            style={{
              display: 'block',
              border: 'none',
              background: '#000',
            }}
          />
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="https://www.instagram.com/mitchiesrecordshop/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(253,29,29,0.3)',
            }}
          >
            📸 Follow on Instagram
          </a>
          <a
            href="https://share.google/tEF7S6WTCgaIMjTyO"
            target="_blank"
            rel="noopener noreferrer"
            className="glass"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            🗺️ Google Business
          </a>
        </div>
      </main>

      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instagram</a>
          <a href="https://share.google/tEF7S6WTCgaIMjTyO" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Google Business</a>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>&copy; 2026 Mitchie's Record Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Feed;
