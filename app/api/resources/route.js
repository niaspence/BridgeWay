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
      node["social_facility"="food_pantry"](around:${radius},${lat},${lng});
      node["social_facility"="shelter"](around:${radius},${lat},${lng});
      node["social_facility"="homeless_shelter"](around:${radius},${lat},${lng});
      node["social_facility"="employment_agency"](around:${radius},${lat},${lng});
      node["social_facility"="outreach"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["amenity"="food_bank"](around:${radius},${lat},${lng});
      node["free"="yes"](around:${radius},${lat},${lng});
    );
    out body;
  `

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    const data = await res.json()

    const resources = data.elements
      .map(el => ({
        id: `osm-${el.id}`,
        type: getType(el.tags),
        name: el.tags.name || 'Unnamed Resource',
        address: getAddress(el.tags),
        hours: el.tags.opening_hours || 'Hours not listed',
        phone: el.tags.phone || el.tags['contact:phone'] || 'Phone not listed',
        lat: el.lat,
        lng: el.lon,
        open: true,
        desc: buildDesc(el.tags),
        free: isFreeOrLowCost(el.tags),
      }))
      .filter(r => r.type !== null)
      .filter(r => r.free) // only keep free or low cost resources
      .filter(r => r.name !== 'Unnamed Resource') // remove unnamed entries

    return Response.json({ resources })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch from Overpass' }, { status: 500 })
  }
}

function isFreeOrLowCost(tags) {
  // explicitly marked as free
  if (tags.free === 'yes') return true
  if (tags.fee === 'no') return true
  if (tags.fee === 'donation') return true

  // social facilities are inherently free/low cost
  const freeSocialFacilities = [
    'food_bank', 'food_pantry', 'shelter',
    'homeless_shelter', 'outreach', 'employment_agency'
  ]
  if (freeSocialFacilities.includes(tags.social_facility)) return true

  // community centres are generally free
  if (tags.amenity === 'community_centre') return true
  if (tags.amenity === 'food_bank') return true

  // exclude anything explicitly marked as paid
  if (tags.fee === 'yes') return false
  if (tags.healthcare === 'hospital') return false
  if (tags.healthcare === 'clinic' && tags.operator_type === 'private') return false

  return false
}

function getType(tags) {
  const sf = tags.social_facility
  const amenity = tags.amenity

  if (sf === 'food_bank' || sf === 'food_pantry' || amenity === 'food_bank') return 'food'
  if (sf === 'shelter' || sf === 'homeless_shelter') return 'shelter'
  if (sf === 'employment_agency') return 'job'
  if (amenity === 'clinic' && tags.fee !== 'yes') return 'clinic'
  if (sf === 'outreach' || amenity === 'community_centre') return 'shelter'

  return null
}

function buildDesc(tags) {
  const parts = []
  if (tags.description) parts.push(tags.description)
  if (tags.fee === 'no') parts.push('Free of charge.')
  if (tags.fee === 'donation') parts.push('Donation based.')
  if (tags['contact:website']) parts.push(`Website: ${tags['contact:website']}`)
  return parts.length ? parts.join(' ') : 'Community resource — free or low cost.'
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