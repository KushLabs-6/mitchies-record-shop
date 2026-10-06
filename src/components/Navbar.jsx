import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ cartCount, onCartToggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path) ? 'var(--accent-gold)' : '#fff',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '700' : '500',
    borderBottom: isActive(path) ? '2px solid var(--accent-gold)' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'all 0.2s ease',
  });

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        padding: scrolled ? '0.6rem 2.5rem' : '1rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: scrolled
          ? 'rgba(8, 8, 8, 0.97)'
          : 'rgba(8, 8, 8, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(212,175,55,0.25)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.7)' : 'none',
        transition: 'all 0.35s ease',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Mitchie's Record Shop"
            style={{
              height: scrolled ? '46px' : '54px',
              width: 'auto',
              background: '#000',
              borderRadius: '6px',
              padding: '2px 8px',
              transition: 'height 0.35s ease',
            }}
          />
        </Link>
      </div>

      {/* Nav links */}
      <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/" style={linkStyle('/')} onClick={() => setMobileOpen(false)}>Home</Link>
        <a href="/#shop" style={{ ...linkStyle(''), color: '#fff' }} onClick={() => setMobileOpen(false)}>Shop</a>
        <a href="/#about" style={{ ...linkStyle(''), color: '#fff' }} onClick={() => setMobileOpen(false)}>Our Story</a>
        <Link to="/events" style={linkStyle('/events')} onClick={() => setMobileOpen(false)}>Events</Link>
        <Link to="/feed" style={linkStyle('/feed')} onClick={() => setMobileOpen(false)}>Social Feed</Link>
        <Link
          to="/admin"
          onClick={() => setMobileOpen(false)}
          style={{
            color: '#000',
            textDecoration: 'none',
            background: 'var(--accent-gold)',
            padding: '0.35rem 1rem',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.9rem',
            letterSpacing: '0.03em',
          }}
        >
          Admin
        </Link>
      </div>

      {/* Mobile Right Icons (Cart + Hamburger) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Cart icon */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onCartToggle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--accent-gold)',
              color: '#000',
              fontSize: '0.7rem',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}>
              {cartCount}
            </span>
          )}
        </div>

        {/* Hamburger Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
