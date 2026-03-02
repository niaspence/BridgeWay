'use client'

import { typeColors, typeLabels } from '../lib/resources'

export default function DetailPanel({ resource, onClose }) {
  if (!resource) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      right: '24px',
      width: '320px',
      background: '#181818',
      border: '1px solid #2e2e2e',
      borderRadius: '16px',
      padding: '20px',
      zIndex: 500,
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '14px', right: '14px',
          background: '#222',
          border: '1px solid #2e2e2e',
          borderRadius: '50%',
          width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: '#888',
          fontSize: '1.1rem',
        }}
      >×</button>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: typeColors[resource.type], marginBottom: '8px' }}>
        {typeLabels[resource.type]}
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f0ece4', lineHeight: 1.2, marginBottom: '14px' }}>
        {resource.name}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '8px' }}>📍 {resource.address}</div>
      <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '8px' }}>
        🕐 {resource.hours} ·{' '}
        <span style={{ color: resource.open ? '#6fcf97' : '#ff6464' }}>
          {resource.open ? 'Open' : 'Closed'}
        </span>
      </div>
      <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '8px' }}>📞 {resource.phone}</div>
      <div style={{ fontSize: '0.82rem', color: '#aaa', lineHeight: 1.6, paddingTop: '12px', marginTop: '4px', marginBottom: '16px', borderTop: '1px solid #2e2e2e' }}>
        {resource.desc}
      </div>
      
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}`}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', padding: '11px',
          borderRadius: '10px',
          background: '#f4a24a',
          color: '#000', fontWeight: 700, fontSize: '0.85rem',
          textDecoration: 'none',
        }}
      >
        Get Directions →
      </a>
    </div>
  )
}