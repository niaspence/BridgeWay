'use client'

import { typeColors, typeLabels } from '../lib/resources'

export default function Sidebar({ resources, activeFilters, onFilterToggle, onSelect, selectedId }) {
  return (
    <div style={{
      width: '360px',
      height: '100%',
      background: '#181818',
      borderRight: '1px solid #2e2e2e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        borderBottom: '1px solid #2e2e2e',
      }}>
        {['food', 'shelter', 'clinic', 'job'].map(type => (
          <button
            key={type}
            onClick={() => onFilterToggle(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '100px',
              border: `1px solid ${activeFilters.has(type) ? typeColors[type] : '#2e2e2e'}`,
              background: 'transparent',
              color: activeFilters.has(type) ? typeColors[type] : '#888',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: typeColors[type],
              display: 'inline-block',
            }} />
            {typeLabels[type]}
          </button>
        ))}
      </div>

      <div style={{
        padding: '12px 16px',
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#888',
      }}>
        Showing {resources.length} resources
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 12px' }}>
        {resources.length === 0 ? (
          <p style={{ padding: '24px', color: '#888', fontSize: '0.85rem' }}>
            No resources match your filters.
          </p>
        ) : (
          resources.map(r => (
            <div
              key={r.id}
              onClick={() => onSelect(r.id)}
              style={{
                background: selectedId === r.id ? '#2a2a2a' : '#222',
                border: `1px solid ${selectedId === r.id ? '#555' : '#2e2e2e'}`,
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: '3px',
                background: typeColors[r.type],
              }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f0ece4', marginBottom: '4px' }}>
                {r.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '6px' }}>
                {r.address}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                {r.hours} ·{' '}
                <span style={{ color: r.open ? '#6fcf97' : '#ff6464' }}>
                  {r.open ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}