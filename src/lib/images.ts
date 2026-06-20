// Curated Unsplash photo IDs for each hotel property type and site sections
// Usage: img src={unsplash(HOTEL_IMAGES.luxury, 1200, 800)}

export function unsplash(id: string, w = 1200, h = 800, q = 80) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=${q}&fit=crop&auto=format`
}

export const SITE_IMAGES = {
  hero:         "photo-1542314831-068cd1dbfeeb", // grand hotel exterior night
  heroAlt:      "photo-1571896349842-33c89424de2d", // hotel pool at dusk
  ctaBg:        "photo-1506059612708-99d6128a4726", // elegant hotel corridor
  architecture: "photo-1582719478250-c89cae4dc85b", // hotel room luxury
}

export const HOTEL_IMAGES: Record<string, string> = {
  luxury:        "photo-1566073771259-6a8506099945", // infinity pool luxury
  boutique:      "photo-1551882547-ff40c63fe2fa", // boutique hotel room
  resort:        "photo-1520250497591-112f2f40a3f4", // resort beach pool
  business:      "photo-1564501049412-61c2a3083791", // modern business hotel
  budget:        "photo-1631049307264-da0ec9d70304", // clean simple hotel
  lifestyle:     "photo-1445019980597-93fa8acb246c", // stylish lifestyle hotel
  extended_stay: "photo-1631049552057-403cdb8f0658", // apartment hotel
  hostel:        "photo-1555854877-bab0e564b8d5", // social hostel common area
  default:       "photo-1542314831-068cd1dbfeeb", // fallback
}

export function hotelImage(propertyType?: string) {
  return HOTEL_IMAGES[propertyType ?? "default"] ?? HOTEL_IMAGES.default
}
