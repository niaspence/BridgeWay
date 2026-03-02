'use client'

import { useEffect, useRef } from 'react'
import { typeColors } from '../lib/resources'

export default function Map({ resources, onSelectResource, selectedId, mapCenter }) {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (leafletMap.current) return

    import('leaflet').then(L => {
      L = L.default
      if (leafletMap.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      leafletMap.current = L.map(mapRef.current, {
        center: [35.9200, -79.0550],
        zoom: 13,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap.current)

      resources.forEach(r => {
        const color = typeColors[r.type]
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:28px; height:28px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:${color};
            border:2px solid rgba(255,255,255,0.3);
            box-shadow:0 3px 10px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        })

        const marker = L.marker([r.lat, r.lng], { icon })
          .addTo(leafletMap.current)
          .on('click', () => onSelectResource(r.id))

        markersRef.current[r.id] = marker
      })
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!leafletMap.current || !selectedId) return
    const r = resources.find(x => x.id === selectedId)
    if (r) leafletMap.current.flyTo([r.lat, r.lng], 15)
  }, [selectedId])

  // update markers when resources change
useEffect(() => {
  if (!leafletMap.current) return

  import('leaflet').then(L => {
    L = L.default

    // remove all existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // add new markers
    resources.forEach(r => {
      const color = typeColors[r.type]
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px; height:28px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color};
          border:2px solid rgba(255,255,255,0.3);
          box-shadow:0 3px 10px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })

      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(leafletMap.current)
        .on('click', () => onSelectResource(r.id))

      markersRef.current[r.id] = marker
    })
  })
}, [resources])
  useEffect(() => {
    if (!leafletMap.current || !mapCenter) return
    leafletMap.current.flyTo([mapCenter.lat, mapCenter.lng], 13)
  }, [mapCenter])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}