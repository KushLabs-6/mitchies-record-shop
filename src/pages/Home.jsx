import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import RecordCard from '../components/RecordCard';
import { db, isFirebaseConfigured } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const INITIAL_RECORDS = [
  { id: 1, title: "Exodus", artist: "Bob Marley & The Wailers", price: 34.99, cover: "https://upload.wikimedia.org/wikipedia/en/a/a6/Bob_Marley_and_the_Wailers_-_Exodus.png" },
  { id: 2, title: "Super Ape", artist: "The Upsetters", price: 45.00, cover: "https://upload.wikimedia.org/wikipedia/en/7/7b/The_Upsetters_-_Super_Ape.jpg" },
  { id: 3, title: "Funky Kingston", artist: "Toots & The Maytals", price: 29.99, cover: "https://upload.wikimedia.org/wikipedia/en/9/91/Funky_Kingston.jpg" },
  { id: 4, title: "Marcus Garvey", artist: "Burning Spear", price: 32.99, cover: "https://upload.wikimedia.org/wikipedia/en/1/15/Marcus_garvey_burning_spear_album.jpg" },
  { id: 5, title: "Two Sevens Clash", artist: "Culture", price: 28.50, cover: "https://upload.wikimedia.org/wikipedia/en/1/1c/Two_Sevens_Clash.jpg" },
  { id: 6, title: "Heart of the Congos", artist: "The Congos", price: 39.99, cover: "https://upload.wikimedia.org/wikipedia/en/7/77/Heart_of_the_congos.jpg" },
];

function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [records, setRecords] = useState(INITIAL_RECORDS);

  useEffect(() => {
    const loadRecords = async () => {
      let uploaded = [];
      if (isFirebaseConfigured) {
        try {
          const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            uploaded.push({
              id: doc.id,
              title: data.recordName,
              artist: data.details,
              price: 29.99,
              cover: data.urlFront || data.url,
              coverBack: data.urlBack,
              outOfStock: data.outOfStock
            });
          });
        } catch (err) {
          console.warn("Firestore fetch failed, falling back to localStorage", err);
          uploaded = getLocalRecords();
        }
      } else {
        uploaded = getLocalRecords();
      }
      setRecords([...uploaded, ...INITIAL_RECORDS]);
    };
    loadRecords();
  }, []);

  const getLocalRecords = () => {
    try {
      const local = JSON.parse(localStorage.getItem('mitchies_records') || '[]');
      return local.map(r => ({
        id: r.id,
        title: r.recordName,
        artist: r.details,
        price: r.price || 29.99,
        cover: r.urlFront,
        coverBack: r.urlBack
      }));
    } catch (e) {
      return [];
    }
  };

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
            {records.map(record => (
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          <a href="https://www.instagram.com/mitchiesrecordshop/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instagram</a>
          <a href="https://share.google/tEF7S6WTCgaIMjTyO" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Google Business</a>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>&copy; 2026 Mitchie's Record Shop. All rights reserved.</p>
        
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

export default Home;
