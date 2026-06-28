import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [albumName, setAlbumName] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        fetchPhotos();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchPhotos = async () => {
    try {
      // Create 'photos' collection if it doesn't exist
      const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPhotos = [];
      querySnapshot.forEach((doc) => {
        fetchedPhotos.push({ id: doc.id, ...doc.data() });
      });
      setPhotos(fetchedPhotos);
    } catch (err) {
      console.warn("Could not fetch photos. Make sure Firebase rules allow read access.", err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select an image file first.');
    
    setError('');
    setUploading(true);

    // Create a unique filename
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `albums/${albumName || 'general'}/${filename}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => {
        console.error(err);
        setError('Failed to upload image.');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        try {
          await addDoc(collection(db, 'photos'), {
            url: downloadURL,
            album: albumName || 'general',
            caption: caption,
            createdAt: serverTimestamp(),
            uploadedBy: user.email
          });
          
          setFile(null);
          setAlbumName('');
          setCaption('');
          setProgress(0);
          fetchPhotos();
        } catch (err) {
          console.error("Error adding document: ", err);
          setError('Failed to save photo info to database.');
        } finally {
          setUploading(false);
        }
      }
    );
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={0} onCartToggle={() => {}} />
      
      <main className="container" style={{ padding: '4rem 0', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem' }}>Admin <span className="gold-text">Portal</span></h2>
          <button onClick={handleLogout} className="glass" style={{ padding: '0.8rem 1.5rem', color: '#fff', borderRadius: '8px' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
          
          {/* Upload Form */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upload Photo</h3>
            
            {error && <div style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Album Name</label>
                <input 
                  type="text" 
                  value={albumName} 
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g. In-Store Events"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Caption / Details</label>
                <textarea 
                  value={caption} 
                  onChange={(e) => setCaption(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', minHeight: '100px' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  style={{ color: '#fff' }}
                />
              </div>

              <button type="submit" className="btn-primary" disabled={uploading} style={{ width: '100%', padding: '1rem' }}>
                {uploading ? `Uploading... ${progress}%` : 'Upload to Album'}
              </button>
            </form>
          </div>

          {/* Photo Gallery */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Manage Albums</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {photos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No photos uploaded yet.</p>
              ) : (
                photos.map((photo) => (
                  <div key={photo.id} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={photo.url} alt={photo.caption} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                    <div style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'rgba(255,225,0,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {photo.album}
                      </span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{photo.caption}</p>
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

export default AdminDashboard;
