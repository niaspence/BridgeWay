'use client'

import { useState } from 'react'

export default function SearchBar({ onSearch, onLocate }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()

      if (!data.length) {
        alert('City not found. Try a different search.')
        setLoading(false)
        return
      }

      const { lat, lon, display_name } = data[0]
      onSearch({ lat: parseFloat(lat), lng: parseFloat(lon), name: display_name })
    } catch (err) {
      alert('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search any city..."
          style={{
            background: '#222',
            border: '1px solid #2e2e2e',
            borderRadius: '8px',
            padding: '8px 14px',
            color: '#f0ece4',
            fontSize: '0.875rem',
            outline: 'none',
            width: '220px',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#f4a24a',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      <button
        onClick={onLocate}
        style={{
          background: 'transparent',
          border: '1px solid #2e2e2e',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#888',
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        Near Me
      </button>
    </div>
  )
}