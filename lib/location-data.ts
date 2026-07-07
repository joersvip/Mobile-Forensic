import { LocationPoint, LocationStats } from '../types/location';

// Simulation coordinates templates
export const SIMULATION_LOCATIONS: LocationPoint[] = [
  {
    id: 'loc_1',
    timestamp: '2026-07-06T10:15:30Z',
    latitude: -6.1754,
    longitude: 106.8272,
    accuracy: 5.0,
    source: 'EXIF Metadata',
    details: 'National Monument (Monas), Central Jakarta - Extracted from JPEG metadata tag (EXIF GPS)',
    file_name: 'evidence_photo_monas.jpg',
    sha256: '9e3a7b6a8c8d8f9a90b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f1',
    extraction_time: '2026-07-06T20:41:40Z'
  },
  {
    id: 'loc_2',
    timestamp: '2026-07-06T12:05:12Z',
    latitude: -6.1931,
    longitude: 106.8218,
    accuracy: 15.0,
    source: 'SMS Database',
    details: 'Bundaran HI, Central Jakarta - Extracted from cell tower cell ID attachments in mmssms.db',
    file_name: 'mmssms.db',
    sha256: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5f4e3d2c1b0a9f8e7d',
    extraction_time: '2026-07-06T20:41:55Z'
  },
  {
    id: 'loc_3',
    timestamp: '2026-07-06T14:32:00Z',
    latitude: -6.2446,
    longitude: 106.8024,
    accuracy: 8.0,
    source: 'WhatsApp Database',
    details: 'Blok M Square, South Jakarta - Extracted from shared location payload in msgstore.db',
    file_name: 'msgstore.db',
    sha256: '5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c',
    extraction_time: '2026-07-06T20:42:10Z'
  },
  {
    id: 'loc_4',
    timestamp: '2026-07-06T16:45:00Z',
    latitude: -6.2183,
    longitude: 106.8022,
    accuracy: 45.0,
    source: 'Cell Tower Cache',
    details: 'Gelora Bung Karno (GBK) Stadium, Central Jakarta - Extracted from system Wi-Fi/Cell positioning log',
    file_name: 'cache_wifi_gps.bin',
    sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    extraction_time: '2026-07-06T20:42:25Z'
  },
  {
    id: 'loc_5',
    timestamp: '2026-07-06T19:22:15Z',
    latitude: -6.1256,
    longitude: 106.6559,
    accuracy: 12.0,
    source: 'Google Maps Timeline',
    details: 'Soekarno-Hatta International Airport Terminal 3, Tangerang - Extracted from maps location history cache',
    file_name: 'gservices.db',
    sha256: '34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    extraction_time: '2026-07-06T20:42:40Z'
  }
];

export const MOCK_LOCATIONS: LocationPoint[] = [];

// Populate dynamic if simulation is active
if (typeof window !== 'undefined') {
  try {
    const isSimActive = localStorage.getItem('forensic_sim_mode') === 'active';
    if (isSimActive) {
      MOCK_LOCATIONS.push(...SIMULATION_LOCATIONS);
    }
  } catch (e) {
    console.error("Gagal melakukan inisialisasi koordinat", e);
  }
}

export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computeLocationStats(points: LocationPoint[]): LocationStats {
  if (points.length === 0) {
    return {
      totalPoints: 0,
      dateRange: 'N/A',
      estimatedDistanceKm: 0,
      sourceBreakdown: {}
    };
  }

  // Distance computation
  let distance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distance += getHaversineDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
  }

  // Source breakdown
  const sourceBreakdown: Record<string, number> = {};
  points.forEach(p => {
    sourceBreakdown[p.source] = (sourceBreakdown[p.source] || 0) + 1;
  });

  // Date range
  const sorted = [...points].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const minDate = new Date(sorted[0].timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const maxDate = new Date(sorted[sorted.length - 1].timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    totalPoints: points.length,
    dateRange: minDate === maxDate ? minDate : `${minDate} - ${maxDate}`,
    estimatedDistanceKm: parseFloat(distance.toFixed(2)),
    sourceBreakdown
  };
}
