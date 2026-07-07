'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Calendar, Database, Search, ArrowDownToLine, 
  Clock, ShieldCheck, Route, FileJson, FileSpreadsheet, 
  FileText, Activity, Layers, RefreshCw
} from 'lucide-react';
import { LocationPoint } from '../types/location';
import { MOCK_LOCATIONS, computeLocationStats } from '../lib/location-data';

export default function LocationHistoryTab() {
  const [isMounted, setIsMounted] = useState(false);
  const [locations, setLocations] = useState<LocationPoint[]>(MOCK_LOCATIONS);
  
  // Filters State
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'morning', 'afternoon', 'evening'
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Map Refs
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Load Leaflet dynamically on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    // Dynamically load leaflet on client side only
    import('leaflet').then((L) => {
      LRef.current = L;
      
      // Initialize Leaflet map
      if (!mapRef.current) {
        const mapElement = document.getElementById('leaflet-forensic-map');
        if (mapElement) {
          // Monas, Jakarta center coordinates default
          const map = L.map('leaflet-forensic-map', {
            zoomControl: true,
            attributionControl: false
          }).setView([-6.1754, 106.8272], 12);

          // Dark-themed tiles from CartoDB or standard OSM
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          mapRef.current = map;
          markersGroupRef.current = L.featureGroup().addTo(map);
        }
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Filter logic
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // Source matching
      if (selectedSource !== 'all' && loc.source !== selectedSource) {
        return false;
      }
      // Search matching
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchText = `${loc.details} ${loc.file_name} ${loc.source}`.toLowerCase();
        if (!matchText.includes(query)) {
          return false;
        }
      }
      // Date/Time filter matching
      if (dateFilter !== 'all') {
        const hour = new Date(loc.timestamp).getUTCHours();
        if (dateFilter === 'morning' && (hour < 5 || hour >= 12)) return false;
        if (dateFilter === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (dateFilter === 'evening' && (hour < 17 && hour >= 5)) return false;
      }
      return true;
    });
  }, [locations, selectedSource, searchQuery, dateFilter]);

  // Compute Stats
  const stats = useMemo(() => {
    return computeLocationStats(filteredLocations);
  }, [filteredLocations]);

  // Map Update Logic (Runs when filtered locations or Leaflet loads)
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;

    if (!L || !map || !markersGroup) return;

    // Clear existing markers & polyline
    markersGroup.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (filteredLocations.length === 0) return;

    const latLngs: [number, number][] = [];

    // Custom marker icon creation with pure CSS pulse and design accents
    const createCustomIcon = (source: string, isSelected: boolean) => {
      let colorClass = 'bg-blue-500';
      if (source === 'EXIF Metadata') colorClass = 'bg-amber-500';
      if (source === 'WhatsApp Database') colorClass = 'bg-emerald-500';
      if (source === 'SMS Database') colorClass = 'bg-purple-500';
      if (source === 'Cell Tower Cache') colorClass = 'bg-rose-500';
      if (source === 'Google Maps Timeline') colorClass = 'bg-sky-500';

      const ringClass = isSelected ? 'ring-4 ring-white animate-pulse' : 'ring-2 ring-zinc-950';

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="w-4 h-4 rounded-full ${colorClass} ${ringClass} border border-zinc-900 shadow-lg flex items-center justify-center">
                 <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
               </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
    };

    // Plot markers
    filteredLocations.forEach(loc => {
      latLngs.push([loc.latitude, loc.longitude]);

      const isSelected = selectedPointId === loc.id;
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: createCustomIcon(loc.source, isSelected)
      });

      // Bind dynamic popup
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11px; color: #e4e4e7; background-color: #09090b; padding: 6px; border-radius: 6px; width: 220px;">
          <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px; color: #3b82f6;">📍 ${loc.source}</div>
          <div style="margin-bottom: 6px; line-height: 1.3;">${loc.details}</div>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 6px 0;" />
          <table style="width: 100%; font-family: monospace; font-size: 10px;">
            <tr><td style="color: #71717a; width: 70px;">Latitude:</td><td style="text-align: right;">${loc.latitude.toFixed(6)}</td></tr>
            <tr><td style="color: #71717a;">Longitude:</td><td style="text-align: right;">${loc.longitude.toFixed(6)}</td></tr>
            <tr><td style="color: #71717a;">Time UTC:</td><td style="text-align: right;">${new Date(loc.timestamp).toISOString().replace('T', ' ').substr(0, 19)}</td></tr>
            <tr><td style="color: #71717a;">Accuracy:</td><td style="text-align: right;">±${loc.accuracy} m</td></tr>
            <tr><td style="color: #71717a; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">File:</td><td style="text-align: right; color: #3b82f6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${loc.file_name}</td></tr>
          </table>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'dark-leaflet-popup'
      });

      marker.on('click', () => {
        setSelectedPointId(loc.id);
      });

      markersGroup.addLayer(marker);
    });

    // Draw routing line connecting points in order
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
    }

    // Adjust zoom boundary to fit points
    if (latLngs.length > 0) {
      map.fitBounds(markersGroup.getBounds().pad(0.15));
    }

  }, [filteredLocations, selectedPointId]);

  // Center Map to selected point
  const handleFocusPoint = (loc: LocationPoint) => {
    setSelectedPointId(loc.id);
    const map = mapRef.current;
    if (map) {
      map.setView([loc.latitude, loc.longitude], 15, { animate: true, duration: 1 });
    }
  };

  // Simulated Exports
  const handleExport = (format: 'geojson' | 'csv' | 'xlsx' | 'kml') => {
    let content = '';
    let fileName = `forensic_location_history_case.${format}`;

    if (format === 'geojson') {
      content = JSON.stringify({
        type: "FeatureCollection",
        metadata: {
          case_id: "CASE-POL-2026-07A",
          exported_at: new Date().toISOString(),
          total_points: filteredLocations.length
        },
        features: filteredLocations.map(l => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [l.longitude, l.latitude]
          },
          properties: {
            timestamp: l.timestamp,
            accuracy_meters: l.accuracy,
            source_artifact: l.source,
            context: l.details,
            integrity_sha256: l.sha256
          }
        }))
      }, null, 2);
    } else if (format === 'csv') {
      const headers = 'sequence_id,timestamp_utc,latitude,longitude,accuracy_meters,source,file_name,details,sha256_hash\n';
      const rows = filteredLocations.map((l, index) => 
        `"${index + 1}","${l.timestamp}","${l.latitude}","${l.longitude}","${l.accuracy}","${l.source}","${l.file_name}","${l.details.replace(/"/g, '""')}","${l.sha256}"`
      ).join('\n');
      content = headers + rows;
    } else if (format === 'kml') {
      content = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Forensic GPS Location History Report</name>
    <description>Generated on ${new Date().toISOString()}</description>
    ${filteredLocations.map(l => `
    <Placemark>
      <name>${l.source}</name>
      <description><![CDATA[Time: ${l.timestamp}<br/>File: ${l.file_name}<br/>Details: ${l.details}]]></description>
      <Point>
        <coordinates>${l.longitude},${l.latitude},0</coordinates>
      </Point>
    </Placemark>`).join('')}
  </Document>
</kml>`;
    } else {
      // XLSX standing in as a text spreadsheet outline
      content = `MOBILE FORENSIC HISTORY SPREADSHEET\n` + 
                `Exported: ${new Date().toISOString()}\n` +
                `Total Track Points: ${filteredLocations.length}\n\n` +
                filteredLocations.map((l, idx) => `[Row ${idx+1}] TS: ${l.timestamp} | Lat: ${l.latitude} | Lng: ${l.longitude} | Src: ${l.source} | File: ${l.file_name}`).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedPoint = useMemo(() => {
    return locations.find(l => l.id === selectedPointId) || null;
  }, [locations, selectedPointId]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
              LOCATION HISTORY ANALYZER
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
                COORDINATE SEQUENCE
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Konsolidasi, kronologi, dan analisis rute spasial dari metadata EXIF gambar dan log database artefak tersimpan.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleExport('geojson')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" /> GeoJSON
          </button>
          <button 
            onClick={() => handleExport('csv')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>
          <button 
            onClick={() => handleExport('kml')} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" /> KML
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Titik Lokasi</span>
            <div className="text-xl font-mono font-bold text-zinc-100 mt-1">{stats.totalPoints} GPS Hits</div>
          </div>
          <MapPin className="w-8 h-8 text-blue-500/20" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Jarak Tempuh</span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">± {stats.estimatedDistanceKm} km</div>
          </div>
          <Route className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Rentang Waktu Kasus</span>
            <div className="text-xs font-mono font-semibold text-zinc-200 mt-1.5 truncate max-w-[200px]" title={stats.dateRange}>
              {stats.dateRange}
            </div>
          </div>
          <Calendar className="w-8 h-8 text-zinc-500/20" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sumber Integritas</span>
            <div className="text-xs font-mono font-semibold text-zinc-200 mt-1.5">
              {Object.keys(stats.sourceBreakdown).length} Tipe Sumber Data
            </div>
          </div>
          <Database className="w-8 h-8 text-purple-500/20" />
        </div>
      </div>

      {/* Main Grid: Filters, Map and Timeline list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left column: Controls & Interactive Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Filters Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Filter by Source */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Sumber Artefak</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-2 outline-none font-semibold focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Sumber</option>
                <option value="EXIF Metadata">EXIF Metadata Foto</option>
                <option value="WhatsApp Database">WhatsApp Database (msgstore.db)</option>
                <option value="SMS Database">SMS Database (mmssms.db)</option>
                <option value="Cell Tower Cache">Cell Tower Cache Logs</option>
                <option value="Google Maps Timeline">Google Maps Timeline Cache</option>
              </select>
            </div>

            {/* Filter by Time Period */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold">Periode Waktu (UTC)</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg p-2 outline-none font-semibold focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Sepanjang Hari (24 Jam)</option>
                <option value="morning">Pagi (05:00 - 12:00 UTC)</option>
                <option value="afternoon">Siang (12:00 - 17:00 UTC)</option>
                <option value="evening">Malam (17:00 - 05:00 UTC)</option>
              </select>
            </div>

            {/* Search Landmark */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase font-bold font-sans">Kata Kunci Lokasi / Berkas</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Cari 'Monas', 'Airport', 'mmssms'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg pl-8 pr-2.5 py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 shadow-lg flex-1 min-h-[420px] flex flex-col justify-between">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1 text-blue-400 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> OFFLINE OPENSTREETMAP RENDER
              </span>
              <span>Coordinates: -6.17540, 106.82720 (Center)</span>
            </div>
            
            <div className="relative flex-1 w-full rounded-lg overflow-hidden min-h-[380px]">
              <div id="leaflet-forensic-map" className="absolute inset-0 w-full h-full z-10" />
              
              {/* Leaflet Custom Style Override inside JSX */}
              <style jsx global>{`
                .leaflet-container {
                  background: #09090b !important;
                }
                .leaflet-bar {
                  border: 1px solid #27272a !important;
                  box-shadow: none !important;
                }
                .leaflet-bar a {
                  background-color: #09090b !important;
                  color: #e4e4e7 !important;
                  border-bottom: 1px solid #27272a !important;
                }
                .leaflet-bar a:hover {
                  background-color: #18181b !important;
                  color: #3b82f6 !important;
                }
                .leaflet-popup-content-wrapper {
                  background-color: #09090b !important;
                  color: #e4e4e7 !important;
                  border: 1px solid #27272a !important;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
                  border-radius: 8px !important;
                }
                .leaflet-popup-tip {
                  background-color: #09090b !important;
                  border: 1px solid #27272a !important;
                }
                .leaflet-popup-close-button {
                  color: #71717a !important;
                }
              `}</style>
            </div>
          </div>
        </div>

        {/* Right column: Timeline & Custody Card */}
        <div className="space-y-6 flex flex-col">
          
          {/* Chronological Timeline List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                TIMELINE KRONOLOGIS LOKASI ({filteredLocations.length})
              </h3>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredLocations.map((loc, index) => {
                  const isSelected = selectedPointId === loc.id;
                  let colorClass = 'border-l-2 border-blue-500';
                  if (loc.source === 'EXIF Metadata') colorClass = 'border-l-2 border-amber-500';
                  if (loc.source === 'WhatsApp Database') colorClass = 'border-l-2 border-emerald-500';
                  if (loc.source === 'SMS Database') colorClass = 'border-l-2 border-purple-500';

                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleFocusPoint(loc)}
                      className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600/10 border border-blue-500/40 shadow-inner' 
                          : 'bg-zinc-950 hover:bg-zinc-850 border border-zinc-850/60'
                      } ${colorClass}`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                        <span className="text-zinc-500 font-bold uppercase">POINT #{index + 1}</span>
                        <span className="text-blue-400 font-medium">
                          {new Date(loc.timestamp).toUTCString().substr(17, 8)} UTC
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-200 truncate">{loc.source}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-normal">
                        {loc.details}
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-2 pt-1 border-t border-zinc-900">
                        <span>Lat/Lng: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                        <span>± {loc.accuracy} m</span>
                      </div>
                    </div>
                  );
                })}

                {filteredLocations.length === 0 && (
                  <div className="py-12 text-center text-zinc-600 italic text-xs">
                    Tidak ada riwayat lokasi yang cocok dengan filter.
                  </div>
                )}
              </div>
            </div>

            {/* Total integrity summary */}
            <div className="text-[10px] text-zinc-500 italic mt-6 leading-normal font-sans border-t border-zinc-800 pt-4">
              🛡️ <strong>Rantai Penjagaan (Custody):</strong> Seluruh koordinat diekstrak menggunakan pembacaan bit-to-bit biner beralgoritma verifikasi integritas penuh.
            </div>
          </div>

          {/* Active Landmark & Custody Validation details */}
          {selectedPoint ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                INTEGRITAS SUMBER ARTEFAK
              </h3>

              <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-3 font-mono text-[10px] space-y-2">
                <div>
                  <span className="text-zinc-500 block uppercase font-bold mb-0.5">Nama Berkas Sumber</span>
                  <span className="text-blue-400 font-bold break-all select-all">{selectedPoint.file_name}</span>
                </div>
                <div className="border-t border-zinc-900 pt-2">
                  <span className="text-zinc-500 block uppercase font-bold mb-0.5">SHA-256 Checksum</span>
                  <span className="text-zinc-300 font-bold break-all select-all">{selectedPoint.sha256}</span>
                </div>
                <div className="border-t border-zinc-900 pt-2 flex justify-between">
                  <div>
                    <span className="text-zinc-500 block uppercase font-bold mb-0.5">Waktu Ekstraksi</span>
                    <span className="text-zinc-300 font-bold">{new Date(selectedPoint.extraction_time).toUTCString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-5 text-center text-xs text-zinc-600 font-mono">
              Silakan pilih salah satu titik lokasi atau baris rute untuk melihat metadata pembuktian forensik digital.
            </div>
          )}

        </div>

      </div>

      {/* Complete Historical Database Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800 pb-3">
          <Database className="w-4 h-4 text-purple-400" />
          TABEL ARTEFAK DETEKSI LOKASI ({filteredLocations.length} entri ditemukan)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-500 font-mono uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">No</th>
                <th className="py-3 px-4 font-bold">Waktu Kronologi (UTC)</th>
                <th className="py-3 px-4 font-bold">Koordinat (Lat, Lng)</th>
                <th className="py-3 px-4 font-bold">Tipe Sumber</th>
                <th className="py-3 px-4 font-bold">Akurasi</th>
                <th className="py-3 px-4 font-bold">Deskripsi Artefak Context</th>
                <th className="py-3 px-4 font-bold">Berkas Target</th>
                <th className="py-3 px-4 font-bold text-center">Fokus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60 font-sans">
              {filteredLocations.map((loc, idx) => (
                <tr 
                  key={loc.id} 
                  className={`hover:bg-zinc-950/80 transition-colors ${
                    selectedPointId === loc.id ? 'bg-blue-600/5' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-zinc-500">#{idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">
                    {new Date(loc.timestamp).toUTCString().replace('GMT', 'UTC')}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-300 font-bold">
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                      loc.source === 'EXIF Metadata' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      loc.source === 'WhatsApp Database' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      loc.source === 'SMS Database' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      loc.source === 'Cell Tower Cache' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {loc.source}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-400">± {loc.accuracy} m</td>
                  <td className="py-3 px-4 text-zinc-400 truncate max-w-[240px]" title={loc.details}>
                    {loc.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-400 truncate max-w-[120px]" title={loc.file_name}>
                    {loc.file_name}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleFocusPoint(loc)}
                      className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 hover:text-blue-300 border border-zinc-700 rounded text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Peta
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLocations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-600 italic">
                    Tidak ada baris data lokasi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
