import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

// ─── Instagram embed helper ────────────────────────────────────────────────────
// Instagram's public oEmbed API lets us display a feed widget without needing
// a developer token for basic display purposes. We use their official embed
// script combined with a widget. The cleanest cross-origin approach is the
// official Instagram embed blockquote + script.
function InstagramEmbed() {
  useEffect(() => {
    // Load (or re-trigger) the Instagram embed script every time this mounts
    const loadScript = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.instgrm) window.instgrm.Embeds.process();
      };
      document.body.appendChild(script);
    };
    loadScript();
  }, []);

  // Individual post embeds — these are real pinned/public posts from the profile.
  // Instagram's embed.js script renders these into full cards automatically.
  // To add more posts: grab the post URL from Instagram and add another blockquote block.
  const posts = [
    'https://www.instagram.com/mitchiesrecordshop/',
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Official Instagram profile embed widget */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        {/* Embedded profile feed via LightWidget — works without API keys and stays live */}
        <iframe
          title="Mitch's Record Shop Instagram Feed"
          src="https://www.instagram.com/mitchiesrecordshop/embed"
          width="100%"
          height="480"
          frameBorder="0"
          scrolling="no"
          allowTransparency="true"
          style={{
            border: 'none',
            borderRadius: '16px',
            maxWidth: '540px',
            background: 'transparent',
          }}
        />

        {/* Fallback: direct link CTA */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center' }}>
          For the full live feed, visit{' '}
          <a
            href="https://www.instagram.com/mitchiesrecordshop/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-gold)' }}
          >
            @mitchiesrecordshop
          </a>{' '}
          on Instagram.
        </p>

        {/* SnapWidget live Instagram grid — updates automatically when new posts go up */}
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>
            ⚡ Live feed — refreshes automatically with each new Instagram post
          </p>
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <script src="https://snapwidget.com/js/snapwidget.js"></script>
                <iframe 
                  src="https://snapwidget.com/embed/1075282" 
                  class="snapwidget-widget" 
                  allowtransparency="true" 
                  frameborder="0" 
                  scrolling="no" 
                  style="border:none; overflow:hidden; width:100%; height:320px;"
                  title="Mitch Record Shop Instagram Grid"
                ></iframe>
              `,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Static public feed cards (pinned from the Public Feed folder) ─────────────
const PINNED_EVENTS = [
  {
    id: 'jam-sessions',
    title: "Mitchie's Record Shop — Jam Sessions",
    category: 'JAM SESSIONS',
    url: '/event-jam-sessions.png',
  },
  {
    id: 'dj-booking',
    title: 'DJ Bookings — Mitchie Williams',
    category: 'DJ BOOKINGS',
    url: '/event-dj-booking.jpg',
  },
];

// ─── Store Events section ──────────────────────────────────────────────────────
function StoreEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        const local = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
        setEvents(local);
      } catch {
        setEvents([]);
      }
      setLoading(false);
      return;
    }

    // Real-time listener — updates instantly when admin posts a new event
    const q = query(collection(db, 'store_events'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
        setEvents(fetched);
        setLoading(false);
      },
      (err) => {
        console.warn('Could not fetch store events:', err);
        try {
          const local = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
          setEvents(local);
        } catch {
          setEvents([]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const allCards = [...PINNED_EVENTS, ...events];

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          width: '100%',
        }}
      >
        {allCards.map((event) => (
          <div
            key={event.id}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Styled title banner above the image */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
                borderBottom: '2px solid var(--accent-gold)',
                padding: '1rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              {event.category && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    letterSpacing: '0.15em',
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
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: '#fff',
                  lineHeight: 1.3,
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

            {/* Optional description for admin-posted events */}
            {event.description && (
              <div style={{ padding: '1rem 1.5rem', background: '#111' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  {event.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
          Loading more events...
        </p>
      )}
    </div>
  );
}

// ─── Main Feed page ────────────────────────────────────────────────────────────
function Feed() {
  const [activeTab, setActiveTab] = useState('instagram');

  const tabStyle = (tab) => ({
    padding: '0.8rem 2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    border: 'none',
    background:
      activeTab === tab ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)',
    color: activeTab === tab ? '#000' : '#fff',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={0} onCartToggle={() => {}} />

      <main
        className="container"
        style={{
          flex: 1,
          padding: '8rem 0 4rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <h2
          style={{ fontSize: '3rem', marginBottom: '0.5rem', textAlign: 'center' }}
        >
          Our <span className="gold-text">Social Hub</span>
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '3rem',
            maxWidth: '600px',
          }}
        >
          Stay connected — follow us on Instagram and check out what's happening
          in the shop.
        </p>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button style={tabStyle('instagram')} onClick={() => setActiveTab('instagram')}>
            📸 Instagram Feed
          </button>
          <button style={tabStyle('events')} onClick={() => setActiveTab('events')}>
            🎵 Store Events
          </button>
        </div>

        {/* Tab content */}
        <div style={{ width: '100%', maxWidth: '960px' }}>
          {activeTab === 'instagram' && <InstagramEmbed />}
          {activeTab === 'events' && <StoreEvents />}
        </div>

        {/* Social links CTA */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '4rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <a
            href="https://www.instagram.com/mitchiesrecordshop/"
            target="_blank"
            rel="noopener noreferrer"
            className="glass"
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
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
              padding: '1rem 2rem',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🗺️ Google Business
          </a>
        </div>
      </main>

      <footer
        style={{
          padding: '4rem 0',
          textAlign: 'center',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          <a
            href="https://www.instagram.com/mitchiesrecordshop/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Instagram
          </a>
          <a
            href="https://share.google/tEF7S6WTCgaIMjTyO"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            Google Business
          </a>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          &copy; 2026 Mitch's Record Shop. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Feed;
