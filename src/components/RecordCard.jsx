import React from 'react';

const RecordCard = ({ record, onAddToCart }) => {
  return (
    <div className="glass fade-in" style={{
      padding: '1.5rem',
      transition: 'var(--transition)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <img 
          src={record.cover} 
          alt={record.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }}
          className="record-img"
        />
      </div>
      
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{record.title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{record.artist}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="gold-text" style={{ fontWeight: '800', fontSize: '1.1rem' }}>${record.price}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(record);
          }}
          className="btn-primary" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default RecordCard;
