import React from 'react';
import Navbar from '../components/Navbar';

function Feed() {
  return (
    <div className="feed-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* We need to pass 0 to cartCount since we aren't managing cart here, or lift state up later if needed */}
      <Navbar cartCount={0} onCartToggle={() => {}} />
      
      <main className="container" style={{ flex: 1, padding: '8rem 0 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
          Our <span className="gold-text">Instagram</span> Feed
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '3rem', maxWidth: '600px' }}>
          Follow us <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)' }}>@mitchiesrecordshop</a> for the latest arrivals, events, and behind-the-scenes!
        </p>
        
        {/* Mock Instagram Feed Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '1000px'
        }}>
          {[
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1528645605625-e57580b09337?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1460036521480-c116d44a2c91?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1482282375196-a1172a15c3ce?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
          ].map((src, index) => (
            <div key={index} style={{
              position: 'relative',
              paddingTop: '100%',
              overflow: 'hidden',
              borderRadius: '8px',
              backgroundColor: '#111'
            }}>
              <img 
                src={src} 
                alt={`Instagram post ${index + 1}`} 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '3rem' }}>
          <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" className="glass" style={{ padding: '1rem 2rem', borderRadius: '8px', color: '#fff', textDecoration: 'none', display: 'inline-block' }}>
            View on Instagram
          </a>
        </div>
      </main>

      <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instagram</a>
          <a href="https://share.google/tEF7S6WTCgaIMjTyO" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Google Business</a>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>&copy; 2026 Mitchie's Record Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Feed;
