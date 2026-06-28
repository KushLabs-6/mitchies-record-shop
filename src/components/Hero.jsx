import React from 'react';

const Hero = () => {
  return (
    <section style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/hero.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '0 1rem'
    }}>
      <div className="fade-in" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '1rem', lineHeight: '1.1' }}>
          Classic Sound, <br />
          <span className="gold-text">Modern Soul.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          Curating the finest vinyl collection for the discerning listener. 
          Discover rare gems and timeless classics at Mitchie's.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary" style={{ fontSize: '1.1rem' }}>Browse Records</button>
          <button className="glass" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', color: '#fff' }}>New Arrivals</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
