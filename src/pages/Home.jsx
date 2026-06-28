import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import RecordCard from '../components/RecordCard';

const INITIAL_RECORDS = [
  { id: 1, title: "Midnight Reflections", artist: "The Jazz Collective", price: 34.99, cover: "/jazz.png" },
  { id: 2, title: "Vintage Soul", artist: "Mitchie & The Harmony", price: 29.99, cover: "/soul.png" },
  { id: 3, title: "Neon Horizon", artist: "Synth Theory", price: 39.99, cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=800" },
  { id: 4, title: "Roots & Culture", artist: "Island Vibrations", price: 24.99, cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800" },
  { id: 5, title: "Electric Dreams", artist: "Voltage Pulse", price: 32.99, cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800" },
  { id: 6, title: "Starlight Symphony", artist: "Orchestral Manoeuvres", price: 44.99, cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800" },
];

function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (record) => {
    setCart([...cart, record]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <div className="home">
      <Navbar cartCount={cart.length} onCartToggle={() => setIsCartOpen(!isCartOpen)} />
      
      <main>
        <Hero />
        
        <section id="shop" className="container" style={{ padding: '8rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <div>
              <h2 className="fade-in" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Curated <span className="gold-text">Vinyl.</span></h2>
              <p className="fade-in" style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
                Hand-picked records from legendary artists and emerging talents across all genres.
              </p>
            </div>
            <div className="fade-in" style={{ display: 'flex', gap: '1rem' }}>
              <select className="glass" style={{ padding: '0.5rem 1rem', color: '#fff', borderRadius: '8px' }}>
                <option>All Genres</option>
                <option>Jazz</option>
                <option>Soul</option>
                <option>Electronic</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2.5rem'
          }}>
            {INITIAL_RECORDS.map(record => (
              <RecordCard key={record.id} record={record} onAddToCart={addToCart} />
            ))}
          </div>
        </section>

        <section id="about" style={{ padding: '8rem 0', background: 'var(--bg-secondary)' }}>
          <div className="container" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <img 
                src="/hero.png" 
                alt="About Mitchie's" 
                style={{ width: '100%', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Our <span className="gold-text">Story.</span></h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Mitchie's Record Shop began with a simple passion: the pursuit of pure sound. 
                We believe that vinyl isn't just a format; it's an experience. 
                Our team scours the globe to find the most authentic pressings and rarest tracks, 
                ensuring that every record in our shop meets the highest standards of quality.
              </p>
              <button className="glass" style={{ padding: '1rem 2rem', borderRadius: '8px', color: '#fff' }}>Read More</button>
            </div>
          </div>
        </section>
      </main>

      {/* Cart Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isCartOpen ? 0 : '-100%',
        width: '400px',
        height: '100vh',
        background: 'var(--bg-primary)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        zIndex: 2000,
        transition: 'var(--transition)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem' }}>Your <span className="gold-text">Bag</span></h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', color: '#fff', fontSize: '2rem' }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>Your bag is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <img src={item.cover} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.artist}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600' }}>${item.price}</p>
                  <button onClick={() => removeFromCart(index)} style={{ background: 'none', color: '#ff4444', fontSize: '0.7rem' }}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span className="gold-text">${total}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>Checkout Now</button>
          </div>
        )}
      </div>

      <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>&copy; 2026 Mitchie's Record Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
