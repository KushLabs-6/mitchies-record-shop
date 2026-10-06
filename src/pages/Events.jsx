import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Pinned events from the Public Feed folder — always shown first
const PINNED_EVENTS = [
  {
    id: 'jam-sessions',
    title: "Mitchie's Record Shop — Jam Sessions",
    category: 'JAM SESSIONS',
    url: '/event-jam-sessions.png',
    description: 'Live jam sessions at the shop. Real music. Real vibes. Your vinyl store.',
  },
  {
    id: 'dj-booking',
    title: 'DJ Bookings — Mitchie Williams',
    category: 'DJ BOOKINGS',
    url: '/event-dj-booking.jpg',
    description: 'Vinyl Only & Regular DJ Sets. Roots, Rock, Reggae, Dancehall & more. Book now: +1 (876) 235-6884',
  },
];

function EventCard({ event }) {
  return (
    <div
      style={{
        borderRadius: '18px',
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(212,175,55,0.15)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(212,175,55,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.7)'; }}
    >
      {/* Title banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #181818 0%, #000 100%)',
          borderBottom: '2px solid var(--accent-gold)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}
      >
        {event.category && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              letterSpacing: '0.18em',
              color: 'var(--accent-gold)',
              textTransform: 'uppercase',
            }}
          >
            {event.category}
          </span>
        )}
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#fff',
            lineHeight: 1.35,
          }}
        >
          {event.title}
        </h3>
      </div>

      {/* Image */}
      {event.url && (
        <img
          src={event.url}
          alt={event.title}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Description */}
      {event.description && (
        <div style={{ padding: '1rem 1.5rem', background: '#0a0a0a', flex: 1 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}

function Events() {
  const [adminEvents, setAdminEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        const local = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
        setAdminEvents(local);
      } catch {
        setAdminEvents([]);
      }
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'store_events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
        setAdminEvents(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not load store events:', err);
        try {
          const local = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
          setAdminEvents(local);
        } catch {
          setAdminEvents([]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const allEvents = [...PINNED_EVENTS, ...adminEvents];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar cartCount={0} onCartToggle={() => {}} />

      <main
        className="container"
        style={{
          flex: 1,
          paddingTop: '7rem',
          paddingBottom: '4rem',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
            Store <span className="gold-text">Events</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', fontSize: '1.05rem' }}>
            What's happening at Mitchie's — live sessions, DJ bookings, pop-ups, and more.
          </p>
        </div>

        {/* Events grid */}
        <div
          className="grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          {allEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {loading && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '3rem' }}>
            Loading more events...
          </p>
        )}

        {!loading && adminEvents.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>
            Admin can post additional events from the{' '}
            <a href="/admin/events" style={{ color: 'var(--accent-gold)' }}>Events Admin panel</a>.
          </p>
        )}
      </main>

      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
        <div className="footer-container" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instagram</a>
          <a href="https://share.google/tEF7S6WTCgaIMjTyO" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Google Business</a>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>&copy; 2026 Mitchie's Record Shop. All rights reserved.</p>

        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website Created By</p>
          <a href="https://itsjusmarketing.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <div style={{ 
              color: '#fff', 
              fontSize: '1.2rem', 
              fontWeight: '800', 
              letterSpacing: '1px', 
              fontFamily: 'monospace',
              border: '2px solid #fff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'var(--transition)' 
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              ITS JUS MARKETING
            </div>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Events;
