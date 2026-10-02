import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import Navbar from '../components/Navbar';

function AdminEvents() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true' && localStorage.getItem('mockAdmin') !== 'true') {
      navigate('/login');
    } else {
      setUser({ email: 'admin' });
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    if (localStorage.getItem('mockAdmin') === 'true') {
      try {
        const local = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
        setEvents(local);
      } catch (e) {
        setEvents([]);
      }
      return;
    }
    try {
      const q = query(collection(db, 'store_events'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetched = [];
      snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
      setEvents(fetched);
    } catch (err) {
      console.warn("Could not fetch events.", err);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageSrc) return setError('Please select an image.');
    setError('');
    setUploading(true);

    if (localStorage.getItem('mockAdmin') === 'true') {
      const localEvents = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
      const newEvent = {
        id: Date.now().toString(),
        title: title || 'Untitled',
        description,
        url: imageSrc,
        createdAt: new Date().toISOString()
      };
      localEvents.unshift(newEvent);
      localStorage.setItem('mitchies_events', JSON.stringify(localEvents));
      setEvents(localEvents);
      resetForm();
      setUploading(false);
      return;
    }

    try {
      const url = await uploadToCloudinary(originalFile, 'events');
      
      await addDoc(collection(db, 'store_events'), {
        title: title || 'Untitled Event',
        description,
        url,
        createdAt: serverTimestamp(),
        uploadedBy: user.email
      });
      
      resetForm();
      fetchEvents();
      setUploading(false);
    } catch (err) {
      console.error(err);
      setError('Error uploading the event.');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageSrc(null);
    setOriginalFile(null);
    setTitle('');
    setDescription('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      if (localStorage.getItem('mockAdmin') === 'true') {
        const localEvents = JSON.parse(localStorage.getItem('mitchies_events') || '[]');
        const updated = localEvents.filter(r => r.id !== id);
        localStorage.setItem('mitchies_events', JSON.stringify(updated));
        setEvents(updated);
      } else {
        try {
          await deleteDoc(doc(db, 'store_events', id));
          fetchEvents();
        } catch (err) {
          console.error(err);
          setError('Failed to delete event.');
        }
      }
    }
  };

  return (
    <div className="admin-events" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={0} onCartToggle={() => {}} />
      <main className="container" style={{ padding: '8rem 0', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem' }}>Store <span className="gold-text">Events Admin</span></h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/admin')} className="glass" style={{ padding: '0.8rem 1.5rem', color: '#fff', borderRadius: '8px' }}>Records Admin</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Post New Event</h3>
            {error && <div style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Event Title</label>
                <input 
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Event Description</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', minHeight: '100px' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Event Image</label>
                <input type="file" accept="image/*" onChange={onFileChange} style={{ color: '#fff' }} />
              </div>
              {imageSrc && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <img src={imageSrc} alt="Preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={uploading} style={{ width: '100%', padding: '1rem' }}>
                {uploading ? 'Posting...' : 'Post Event'}
              </button>
            </form>
          </div>

          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Active Events</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {events.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No events posted yet.</p>
              ) : (
                events.map(event => (
                  <div key={event.id} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={event.url} alt={event.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{event.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{event.description}</p>
                      <button onClick={() => handleDelete(event.id)} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminEvents;
