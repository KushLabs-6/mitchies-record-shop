import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ cartCount, onCartToggle }) => {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 3rem)',
      maxWidth: '1200px',
      zIndex: 1000,
      padding: '0.8rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: '800' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          MITCHIE'S <span className="gold-text">RECORDS</span>
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', fontWeight: '500', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <a href="/#shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</a>
        <a href="/#about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Story</a>
        <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none', border: '1px solid var(--accent-gold)', padding: '0.3rem 0.8rem', borderRadius: '4px' }}>Admin</Link>
      </div>

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
            fontWeight: 'bold'
          }}>
            {cartCount}
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
