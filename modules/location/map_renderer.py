from typing import List, Dict, Any

class MapRenderer:
    """
    Renders interactive offline-first HTML maps using Leaflet.js and OpenStreetMap tiles.
    """
    @staticmethod
    def render_leaflet_html(points: List[Dict[str, Any]], output_path: str) -> str:
        """
        Creates a standalone, interactive HTML report with Leaflet map containing markers,
        polylines, and popups.
        """
        if not points:
            return ""

        # Default center of map is the average of coordinates
        avg_lat = sum(p['latitude'] for p in points) / len(points)
        avg_lng = sum(p['longitude'] for p in points) / len(points)

        # Generate Markers and polyline arrays
        markers_js = ""
        polyline_coords = []
        
        for i, p in enumerate(points):
            lat, lng = p['latitude'], p['longitude']
            polyline_coords.append(f"[{lat}, {lng}]")
            
            popup_content = f"""
                <div style='font-family: monospace; font-size: 11px;'>
                    <b>📍 Landmark:</b> {p.get('details', 'Extracted Location')}<br/>
                    <b>🕒 Time (UTC):</b> {p['timestamp']}<br/>
                    <b>🌐 Coordinates:</b> {lat:.6f}, {lng:.6f}<br/>
                    <b>📂 Source:</b> {p['source']}<br/>
                    <b>🎯 Accuracy:</b> {p.get('accuracy', 'N/A')} meters<br/>
                    <b>📦 File:</b> {p['file_name']}<br/>
                </div>
            """
            # Escaping quotes
            popup_content = popup_content.replace("\n", "").replace("'", "\\'")
            
            markers_js += f"""
            L.marker([{lat}, {lng}]).addTo(map)
                .bindPopup('{popup_content}');
            """

        polyline_js = f"L.polyline([{','.join(polyline_coords)}], {{color: '#3b82f6', weight: 4}}).addTo(map);"

        html_template = f"""<!DOCTYPE html>
<html>
<head>
    <title>Forensic Case Location Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <style>
        html, body, #map {{
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #09090b;
        }}
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([{avg_lat}, {avg_lng}], 13);
        
        L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }}).addTo(map);

        {markers_js}
        {polyline_js}

        // Auto fit bounds
        const group = new L.featureGroup([
            {", ".join([f"L.marker([{p['latitude']}, {p['longitude']}])" for p in points])}
        ]);
        map.fitBounds(group.getBounds().pad(0.1));
    </script>
</body>
</html>
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_template)
            
        return output_path
