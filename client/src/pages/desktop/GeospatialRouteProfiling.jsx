import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@styles/pages/geospatial-profiling.css';
import { Icons } from '@shared';

// Fix for default Leaflet icon paths in React (if needed for default markers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// CALABARZON Congestion Mock Data
// Using circle markers to simulate a heatmap
const HOTSPOT_DATA = [
  // Pansol
  { id: 'h1', zone: 'Pansol', coords: [14.183, 121.196], intensity: 'severe', radius: 30 },
  { id: 'h2', zone: 'Pansol', coords: [14.185, 121.190], intensity: 'light', radius: 45 },
  // Turbina
  { id: 'h3', zone: 'Turbina', coords: [14.195, 121.140], intensity: 'severe', radius: 35 },
  { id: 'h4', zone: 'Turbina', coords: [14.198, 121.145], intensity: 'light', radius: 50 },
  // Los Baños (UPLB Area)
  { id: 'h5', zone: 'Los Baños', coords: [14.165, 121.240], intensity: 'severe', radius: 25 },
  { id: 'h6', zone: 'Los Baños', coords: [14.170, 121.235], intensity: 'light', radius: 40 },
  // Southwoods
  { id: 'h7', zone: 'Southwoods', coords: [14.320, 121.050], intensity: 'light', radius: 60 },
];

const ROUTE_DATA = {
  'NT-001': [
    [14.210, 121.155], // SM Calamba
    [14.230, 121.140],
    [14.250, 121.120],
    [14.280, 121.090],
    [14.300, 121.070],
    [14.320, 121.050], // Southwoods
  ],
  'NT-002': [
    [14.165, 121.240], // Los Baños
    [14.180, 121.220],
    [14.200, 121.180],
    [14.220, 121.160],
  ]
};

// MOCK FLEET DATA (Imported from Telemetry)
const MOCK_FLEET = [
  { id: 'NT-001', plateNumber: 'ABC 1234', driverName: 'Juan Dela Cruz', status: 'Active', speed: 45, fuel: 82, coords: [14.210, 121.155] },
  { id: 'NT-002', plateNumber: 'XYZ 9876', driverName: 'Maria Santos', status: 'Active', speed: 60, fuel: 55, coords: [14.165, 121.240] },
  { id: 'NT-003', plateNumber: 'LMN 4567', driverName: 'Pedro Penduko', status: 'Offline', speed: 0, fuel: 10, coords: [14.270, 121.130] },
  { id: 'NT-004', plateNumber: 'QWE 1122', driverName: 'Andres Bonifacio', status: 'Active', speed: 30, fuel: 90, coords: [14.265, 121.135] },
  { id: 'NT-005', plateNumber: 'RTY 3344', driverName: 'Jose Rizal', status: 'Active', speed: 50, fuel: 45, coords: [14.290, 121.110] },
];

const MOCK_TAXIS = [
  { id: 'All', label: 'All Taxis' },
  ...MOCK_FLEET.map(t => ({ id: t.id, label: `${t.id} - ${t.driverName}` }))
];

const ZONES = ['Pansol', 'Turbina', 'Los Baños', 'Southwoods'];

// MapController for click-to-focus functionality
function MapController({ selectedTaxi }) {
  const map = useMap();
  useEffect(() => {
    if (selectedTaxi && selectedTaxi !== 'All') {
      const taxi = MOCK_FLEET.find(t => t.id === selectedTaxi);
      if (taxi) {
        map.flyTo(taxi.coords, 14, { duration: 1.5 });
      }
    } else {
      map.flyTo([14.22, 121.16], 12, { duration: 1.5 });
    }
  }, [selectedTaxi, map]);
  return null;
}

function GeospatialRouteProfiling({ navPayload }) {
  const [activeZones, setActiveZones] = useState({
    'Pansol': true,
    'Turbina': true,
    'Los Baños': true,
    'Southwoods': true,
  });
  
  const [selectedDate, setSelectedDate] = useState('2026-06-24');
  const [showRoute, setShowRoute] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState('All');

  useEffect(() => {
    if (navPayload && navPayload.focus) {
      setSelectedTaxi(navPayload.focus);
      if (navPayload.focus !== 'All') {
        setShowRoute(true);
      }
    }
  }, [navPayload]);

  const handleZoneToggle = (zone) => {
    setActiveZones(prev => ({
      ...prev,
      [zone]: !prev[zone]
    }));
  };

  const getMarkerColor = (intensity) => {
    return intensity === 'severe' ? 'var(--color-primary-dark)' : 'var(--color-primary-soft)';
  };

  // Custom HTML marker for the map
  const createCustomIcon = (status) => {
    return L.divIcon({
      className: 'custom-taxi-marker',
      html: `<div class="marker-dot ${status.toLowerCase()}"><div class="marker-ping"></div></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  const activeTaxi = MOCK_FLEET.find(t => t.id === selectedTaxi);

  return (
    <div className="geo-container">
      {/* LEFT: Map View */}
      <div className="geo-map-section">
        <MapContainer 
          center={[14.22, 121.16]} 
          zoom={12} 
          className="geo-map"
        >
          <MapController selectedTaxi={selectedTaxi} />
          
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {HOTSPOT_DATA.map(hotspot => {
            if (!activeZones[hotspot.zone]) return null;

            return (
              <CircleMarker
                key={hotspot.id}
                center={hotspot.coords}
                radius={hotspot.radius}
                pathOptions={{
                  fillColor: getMarkerColor(hotspot.intensity),
                  fillOpacity: hotspot.intensity === 'severe' ? 0.7 : 0.4,
                  stroke: false
                }}
              >
                <Popup>
                  <strong>{hotspot.zone} Zone</strong><br/>
                  Congestion: {hotspot.intensity === 'severe' ? 'High' : 'Moderate'}
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Layer 1: Fleet Markers */}
          {MOCK_FLEET.map(vehicle => {
            if (selectedTaxi !== 'All' && vehicle.id !== selectedTaxi) return null;
            return (
              <Marker 
                key={vehicle.id} 
                position={vehicle.coords} 
                icon={createCustomIcon(vehicle.status)}
              >
                <Popup>
                  <strong>{vehicle.plateNumber}</strong><br/>
                  Driver: {vehicle.driverName}<br/>
                  Status: {vehicle.status}<br/>
                  Speed: {vehicle.speed} km/h
                </Popup>
              </Marker>
            );
          })}

          {/* Layer 3: Recommended Route Polylines */}
          {showRoute && selectedTaxi !== 'All' && ROUTE_DATA[selectedTaxi] && (
            <Polyline 
              positions={ROUTE_DATA[selectedTaxi]}
              color="var(--color-primary-dark)"
              weight={4}
              dashArray="10, 10"
              opacity={0.8}
            />
          )}
        </MapContainer>

        {/* Custom Map Legend */}
        <div className="geo-map-legend">
          <div className="geo-legend-title">Congestion Levels</div>
          <div className="geo-legend-item">
            <div className="geo-legend-color" style={{ backgroundColor: 'var(--color-primary-dark)' }}></div>
            Severe Congestion
          </div>
          <div className="geo-legend-item">
            <div className="geo-legend-color" style={{ backgroundColor: 'var(--color-primary-soft)' }}></div>
            Low/Moderate Congestion
          </div>
        </div>
      </div>

      {/* RIGHT: Control Panel */}
      <div className="geo-sidebar">
        <div className="geo-sidebar-header">
          <h3>Profiling Controls</h3>
        </div>

        <div className="geo-sidebar-content">
          
          <div className="geo-control-group">
            <div className="geo-control-label">Fleet Status</div>
            <div className="telemetry-list" style={{ maxHeight: '200px', padding: '0' }}>
              {MOCK_FLEET.map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-card ${selectedTaxi === vehicle.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTaxi(vehicle.id === selectedTaxi ? 'All' : vehicle.id)}
                  style={{ 
                    border: selectedTaxi === vehicle.id ? '2px solid var(--color-primary-dark)' : '1px solid #E0E0E0',
                    padding: '10px'
                  }}
                >
                  <div className="vehicle-icon">
                    <Icons.Truck />
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-plate">{vehicle.id}</div>
                    <div className="vehicle-driver">{vehicle.driverName}</div>
                  </div>
                  <div className="vehicle-metrics">
                    <span className={`badge ${vehicle.status.toLowerCase()}`}>
                      {vehicle.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="geo-control-group">
            <div className="geo-control-label">Historical Date</div>
            <input 
              type="date" 
              className="geo-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="geo-control-group">
            <div className="geo-control-label">Zone Overlay Filters</div>
            <div className="geo-checkbox-list">
              {ZONES.map(zone => (
                <label key={zone} className="geo-checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={activeZones[zone]} 
                    onChange={() => handleZoneToggle(zone)}
                  />
                  {zone} Checkpoint
                </label>
              ))}
            </div>
          </div>

          <div className="geo-control-group">
            <label className="geo-checkbox-item" style={{ fontWeight: 'bold' }}>
              <input 
                type="checkbox" 
                checked={showRoute} 
                onChange={() => setShowRoute(!showRoute)}
              />
              Toggle Recommended Route
            </label>
          </div>         

          <div className="geo-control-group" style={{ marginTop: 'auto', gap: '15px' }}>
            <div className="geo-metric-card">
              <div className="geo-metric-label">Avg Route Variance</div>
              <div className="geo-metric-value">+18%</div>
              <div className="geo-metric-subtext">Estimated time delay for selected zones</div>
            </div>

            {showRoute && selectedTaxi !== 'All' && (
              <div className="geo-metric-card" style={{ borderLeft: '4px solid var(--color-primary-dark)' }}>
                <div className="geo-metric-label" style={{ color: 'var(--color-primary-dark)' }}>Predictive Impact</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>
                  Saves ~12% fuel vs. standard route
                </div>
                <div className="geo-metric-subtext" style={{ color: '#27AE60', fontWeight: 'bold' }}>
                  Estimated Idle Time Reduction: 15 mins
                </div>
              </div>
            )}

            {activeTaxi && (
              <div className="geo-metric-card" style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', borderTop: '2px solid #E0E0E0' }}>
                <div>
                  <div className="geo-metric-label">Current Speed</div>
                  <div className="geo-metric-value" style={{ color: '#333' }}>{activeTaxi.speed} <span style={{fontSize: '12px', color: '#666'}}>km/h</span></div>
                </div>
                <div>
                  <div className="geo-metric-label">Fuel Level</div>
                  <div className="geo-metric-value" style={{ color: '#333' }}>{activeTaxi.fuel}%</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default GeospatialRouteProfiling;
