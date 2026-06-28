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

  // Front Cover Cropper State
  const [imageSrcFront, setImageSrcFront] = useState(null);
  const [originalFileFront, setOriginalFileFront] = useState(null);
  const [cropFront, setCropFront] = useState({ x: 0, y: 0 });
  const [zoomFront, setZoomFront] = useState(1);
  const [rotationFront, setRotationFront] = useState(0);
  const [croppedAreaPixelsFront, setCroppedAreaPixelsFront] = useState(null);

  // Back Cover Cropper State
  const [imageSrcBack, setImageSrcBack] = useState(null);
  const [originalFileBack, setOriginalFileBack] = useState(null);
  const [cropBack, setCropBack] = useState({ x: 0, y: 0 });
  const [zoomBack, setZoomBack] = useState(1);
  const [rotationBack, setRotationBack] = useState(0);
  const [croppedAreaPixelsBack, setCroppedAreaPixelsBack] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('mockAdmin') === 'true') {
      setUser({ email: 'admin@mitchies.com' });
      fetchPhotos();
      setLoading(false);
      return;
    }

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
    if (localStorage.getItem('mockAdmin') === 'true') {
      try {
        const local = JSON.parse(localStorage.getItem('mitchies_records') || '[]');
        setPhotos(local);
      } catch (e) {
        setPhotos([]);
      }
      return;
    }

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

  const onFileChangeFront = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFileFront(file);
      let imageDataUrl = await readFile(file);
      setImageSrcFront(imageDataUrl);
    }
  };

  const onFileChangeBack = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFileBack(file);
      let imageDataUrl = await readFile(file);
      setImageSrcBack(imageDataUrl);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageSrcFront || !croppedAreaPixelsFront || !imageSrcBack || !croppedAreaPixelsBack) {
      return setError('Please select and crop both Front and Back cover images.');
    }
    
    setError('');
    setUploading(true);

    if (localStorage.getItem('mockAdmin') === 'true') {
      try {
        const croppedFrontBlob = await getCroppedImg(imageSrcFront, croppedAreaPixelsFront, rotationFront);
        const croppedBackBlob = await getCroppedImg(imageSrcBack, croppedAreaPixelsBack, rotationBack);
        
        const blobToBase64 = (blob) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        };

        const base64Front = await blobToBase64(croppedFrontBlob);
        const base64Back = await blobToBase64(croppedBackBlob);

        const localRecords = JSON.parse(localStorage.getItem('mitchies_records') || '[]');
        const newRecord = {
          id: Date.now().toString(),
          recordName: recordName || 'Untitled',
          details: details,
          urlFront: base64Front,
          urlBack: base64Back,
          createdAt: new Date().toISOString()
        };
        localRecords.unshift(newRecord);
        localStorage.setItem('mitchies_records', JSON.stringify(localRecords));
        
        setPhotos(localRecords);
        resetForm();
        setUploading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to crop or save mock images.');
        setUploading(false);
      }
      return;
    }

    try {
      // 1. Process Front Cover
      const croppedFrontBlob = await getCroppedImg(imageSrcFront, croppedAreaPixelsFront, rotationFront);
      const frontFilename = `${Date.now()}_front_${originalFileFront.name}`;
      const frontRef = ref(storage, `records/${frontFilename}`);
      
      // 2. Process Back Cover
      const croppedBackBlob = await getCroppedImg(imageSrcBack, croppedAreaPixelsBack, rotationBack);
      const backFilename = `${Date.now()}_back_${originalFileBack.name}`;
      const backRef = ref(storage, `records/${backFilename}`);

      // We won't show complex progress bars for both, just wait for them
      setProgress(10);
      await uploadBytesResumable(frontRef, croppedFrontBlob);
      setProgress(50);
      await uploadBytesResumable(backRef, croppedBackBlob);
      setProgress(90);

      const urlFront = await getDownloadURL(frontRef);
      const urlBack = await getDownloadURL(backRef);
      
      await addDoc(collection(db, 'records'), {
        urlFront: urlFront,
        urlBack: urlBack,
        recordName: recordName || 'Untitled Record',
        details: details,
        createdAt: serverTimestamp(),
        uploadedBy: user.email
      });
      
      resetForm();
      fetchPhotos();
      setUploading(false);
    } catch (err) {
      console.error(err);
      setError('Error cropping or uploading the images.');
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageSrcFront(null);
    setOriginalFileFront(null);
    setZoomFront(1);
    setRotationFront(0);
    
    setImageSrcBack(null);
    setOriginalFileBack(null);
    setZoomBack(1);
    setRotationBack(0);
    
    setRecordName('');
    setDetails('');
    setProgress(0);
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
            
            {error && <div style={{ color: '#ff4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}
            
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

              {/* Front Cover Input */}
              <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>1. Select Front Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onFileChangeFront}
                  style={{ color: '#fff' }}
                />
              </div>

              {imageSrcFront && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <Cropper
                      image={imageSrcFront}
                      crop={cropFront}
                      zoom={zoomFront}
                      rotation={rotationFront}
                      aspect={1}
                      onCropChange={setCropFront}
                      onCropComplete={(_, pixels) => setCroppedAreaPixelsFront(pixels)}
                      onZoomChange={setZoomFront}
                      onRotationChange={setRotationFront}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Zoom (Front)</label>
                    <input type="range" value={zoomFront} min={1} max={3} step={0.1} onChange={(e) => setZoomFront(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rotation (Front)</label>
                    <input type="range" value={rotationFront} min={0} max={360} step={1} onChange={(e) => setRotationFront(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Back Cover Input */}
              <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>2. Select Back Cover Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={onFileChangeBack}
                  style={{ color: '#fff' }}
                />
              </div>

              {imageSrcBack && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <Cropper
                      image={imageSrcBack}
                      crop={cropBack}
                      zoom={zoomBack}
                      rotation={rotationBack}
                      aspect={1}
                      onCropChange={setCropBack}
                      onCropComplete={(_, pixels) => setCroppedAreaPixelsBack(pixels)}
                      onZoomChange={setZoomBack}
                      onRotationChange={setRotationBack}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Zoom (Back)</label>
                    <input type="range" value={zoomBack} min={1} max={3} step={0.1} onChange={(e) => setZoomBack(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Rotation (Back)</label>
                    <input type="range" value={rotationBack} min={0} max={360} step={1} onChange={(e) => setRotationBack(e.target.value)} style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={uploading || !imageSrcFront || !imageSrcBack} style={{ width: '100%', padding: '1rem' }}>
                {uploading ? `Processing...` : 'Crop & Upload Record'}
              </button>
            </form>
          </div>

          {/* Photo Gallery */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Uploaded Records</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {photos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No records uploaded yet.</p>
              ) : (
                photos.map((photo) => (
                  <div key={photo.id} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{photo.recordName}</h4>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Front</p>
                        {/* Fallback to original url format if old records exist without urlFront/urlBack */}
                        <img src={photo.urlFront || photo.url} alt="Front Cover" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Back</p>
                        {photo.urlBack ? (
                          <img src={photo.urlBack} alt="Back Cover" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '100%', aspectRatio: '1', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>No Back</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{photo.details}</p>
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
