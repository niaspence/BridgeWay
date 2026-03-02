export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || 10000

  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng required' }, { status: 400 })
  }

  const query = `
    [out:json][timeout:25];
    (
      node["social_facility"="food_bank"](around:${radius},${lat},${lng});
      node["social_facility"="shelter"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["social_facility"="employment_agency"](around:${radius},${lat},${lng});
      node["amenity"="social_facility"](around:${radius},${lat},${lng});
    );
    out body;
  `

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    const data = await res.json()

    const resources = data.elements.map((el, i) => ({
      id: `osm-${el.id}`,
      type: getType(el.tags),
      name: el.tags.name || 'Unnamed Resource',
      address: getAddress(el.tags),
      hours: el.tags.opening_hours || 'Hours not listed',
      phone: el.tags.phone || el.tags['contact:phone'] || 'Phone not listed',
      lat: el.lat,
      lng: el.lon,
      open: true,
      desc: el.tags.description || el.tags['social_facility'] || 'Community resource',
    }))

    return Response.json({ resources })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch from Overpass' }, { status: 500 })
  }
}

function getType(tags) {
  if (tags.social_facility === 'food_bank') return 'food'
  if (tags.social_facility === 'shelter') return 'shelter'
  if (tags.social_facility === 'employment_agency') return 'job'
  if (tags.amenity === 'clinic') return 'clinic'
  return 'food'
}

function getAddress(tags) {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:state'],
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Address not listed'
}
