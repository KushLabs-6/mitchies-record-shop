import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  
  // Upload State
  const [recordName, setRecordName] = useState('');
  const [details, setDetails] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
      const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPhotos = [];
      querySnapshot.forEach((doc) => {
        fetchedPhotos.push({ id: doc.id, ...doc.data() });
      });
      setPhotos(fetchedPhotos);
    } catch (err) {
      console.warn("Could not fetch records. Make sure Firebase rules allow read access.", err);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFile(file);
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageSrc || !croppedAreaPixels) return setError('Please select and crop an image.');
    
    setError('');
    setUploading(true);

    try {
      // Get the cropped image blob
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      // Create a unique filename
      const filename = `${Date.now()}_cropped_${originalFile.name}`;
      const storageRef = ref(storage, `records/${filename}`);
      
      const uploadTask = uploadBytesResumable(storageRef, croppedImageBlob);

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
          
          await addDoc(collection(db, 'records'), {
            url: downloadURL,
            recordName: recordName || 'Untitled Record',
            details: details,
            createdAt: serverTimestamp(),
            uploadedBy: user.email
          });
          
          // Reset form
          setImageSrc(null);
          setOriginalFile(null);
          setRecordName('');
          setDetails('');
          setZoom(1);
          setRotation(0);
          setProgress(0);
          fetchPhotos();
          setUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setError('Error cropping or uploading the image.');
      setUploading(false);
    }
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          
          {/* Upload & Edit Form */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upload New Record</h3>
            
            {error && <div style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Record Name</label>
                <input 
                  type="text" 
                  value={recordName} 
                  onChange={(e) => setRecordName(e.target.value)}
                  placeholder="e.g. Midnight Reflections"
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Artist / Details</label>
                <textarea 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. The Jazz Collective"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: '#fff', minHeight: '80px' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onFileChange}
                  style={{ color: '#fff' }}
                />
              </div>

              {imageSrc && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1} // Square aspect ratio for records
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Zoom</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rotation</label>
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      aria-labelledby="Rotation"
                      onChange={(e) => setRotation(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={uploading || !imageSrc} style={{ width: '100%', padding: '1rem' }}>
                {uploading ? `Uploading... ${progress}%` : 'Crop & Upload Record'}
              </button>
            </form>
          </div>

          {/* Photo Gallery */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Uploaded Records</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {photos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No records uploaded yet.</p>
              ) : (
                photos.map((photo) => (
                  <div key={photo.id} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={photo.url} alt={photo.recordName} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{photo.recordName}</h4>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{photo.details}</p>
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
