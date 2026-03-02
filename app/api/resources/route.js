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
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["amenity"="food_bank"](around:${radius},${lat},${lng});
    );
    out body;
  `

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })

    const data = await res.json()

    // filter out anything we can't properly categorize
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
        desc: el.tags.description || el.tags['social_facility'] || el.tags['amenity'] || 'Community resource',
      }))
      .filter(r => r.type !== null) // remove anything we couldn't categorize

    return Response.json({ resources })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch from Overpass' }, { status: 500 })
  }
}

function getType(tags) {
  const sf = tags.social_facility
  const amenity = tags.amenity

  if (sf === 'food_bank' || sf === 'food_pantry' || amenity === 'food_bank') return 'food'
  if (sf === 'shelter' || sf === 'homeless_shelter') return 'shelter'
  if (sf === 'employment_agency') return 'job'
  if (amenity === 'clinic') return 'clinic'
  if (sf === 'outreach' || amenity === 'community_centre') return 'shelter'

  // return null for anything we can't categorize — these get filtered out
  return null
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