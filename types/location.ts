export interface LocationPoint {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'EXIF Metadata' | 'SMS Database' | 'WhatsApp Database' | 'Cell Tower Cache' | 'Google Maps Timeline';
  details: string;
  file_name: string;
  sha256: string;
  extraction_time: string;
}

export interface LocationStats {
  totalPoints: number;
  dateRange: string;
  estimatedDistanceKm: number;
  sourceBreakdown: Record<string, number>;
}
