'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { resources } from './lib/resources'
import Sidebar from './components/Sidebar'
import DetailPanel from './components/DetailPanel'
import SearchBar from './components/SearchBar'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [selectedId, setSelectedId] = useState(null)
  const [activeFilters, setActiveFilters] = useState(new Set(['food', 'shelter', 'clinic', 'job']))
  const [mapCenter, setMapCenter] = useState({ lat: 35.9200, lng: -79.0550 })
  const [liveResources, setLiveResources] = useState(null)

  const activeResources = liveResources || resources
  const filtered = activeResources.filter(r => activeFilters.has(r.type))

  function handleFilterToggle(type) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size === 1) return prev
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  async function handleSearch({ lat, lng }) {
    console.log('handleSearch called with:', lat, lng)
    try {
      const res = await fetch(`/api/resources?lat=${lat}&lng=${lng}`)
      const data = await res.json()
      console.log('API response:', data)

      if (data.error) {
        alert(`Error: ${data.error}`)
        return
      }

      setMapCenter({ lat, lng })
      setLiveResources(data.resources || [])
    } catch (err) {
      console.error('Search error:', err)
      alert('Something went wrong. Try again.')
    }
  }

  function handleLocate() {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords
      const res = await fetch(`/api/resources?lat=${latitude}&lng=${longitude}`)
      const data = await res.json()
      setMapCenter({ lat: latitude, lng: longitude })
      setLiveResources(data.resources || [])
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      <header style={{
        height: '60px',
        background: '#181818',
        borderBottom: '1px solid #2e2e2e',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '24px',
      }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#f0ece4' }}>
          BridgeWay
        </div>
        <SearchBar onSearch={handleSearch} onLocate={handleLocate} />
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <Sidebar
          resources={filtered}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />

        <div style={{ flex: 1, position: 'relative' }}>
          <Map
            resources={filtered}
            selectedId={selectedId}
            onSelectResource={setSelectedId}
            mapCenter={mapCenter}
          />
          <DetailPanel
            resource={activeResources.find(r => r.id === selectedId)}
            onClose={() => setSelectedId(null)}
          />
        </div>

      </div>
    </div>
  )
}