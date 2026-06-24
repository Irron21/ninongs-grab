import React, { useState } from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from '@shared';
import '@styles/pages/rnn-forecasting.css';

const FORECAST_DATA = {
  'All': [
    { time: '00:00', fuelBaseline: 100, fuelPredicted: 120 },
    { time: '06:00', fuelBaseline: 150, fuelPredicted: 180 },
    { time: '12:00', fuelBaseline: 180, fuelPredicted: 200 },
    { time: '17:00', fuelBaseline: 300, fuelPredicted: 450 },
    { time: '22:00', fuelBaseline: 150, fuelPredicted: 160 },
  ],
  'NT-001': [
    { time: '00:00', fuelBaseline: 10, fuelPredicted: 12 },
    { time: '06:00', fuelBaseline: 15, fuelPredicted: 18 },
    { time: '12:00', fuelBaseline: 18, fuelPredicted: 20 },
    { time: '17:00', fuelBaseline: 30, fuelPredicted: 45 },
    { time: '22:00', fuelBaseline: 15, fuelPredicted: 16 },
  ],
  'NT-002': [
    { time: '00:00', fuelBaseline: 12, fuelPredicted: 10 },
    { time: '06:00', fuelBaseline: 14, fuelPredicted: 14 },
    { time: '12:00', fuelBaseline: 16, fuelPredicted: 18 },
    { time: '17:00', fuelBaseline: 25, fuelPredicted: 26 },
    { time: '22:00', fuelBaseline: 12, fuelPredicted: 12 },
  ]
};

const MOCK_FLEET = [
  { id: 'NT-001', driverName: 'Juan Dela Cruz', status: 'Active' },
  { id: 'NT-002', driverName: 'Maria Santos', status: 'Active' },
  { id: 'NT-003', driverName: 'Pedro Penduko', status: 'Offline' }
];

const VEHICLE_DETAILS = {
  'All': { health: 'Varied', route: 'All Sectors', score: '78%' },
  'NT-001': { health: 'Needs Tune-up', route: 'Calamba-Southwoods', score: '65%' },
  'NT-002': { health: 'Optimal', route: 'Los Baños-Pansol', score: '92%' },
  'NT-003': { health: 'Offline', route: 'Unassigned', score: 'N/A' }
};

const TELEMETRY_DATA = {
  'NT-001': { rpm: '2,800', throttle: '45%', maf: '6.2 g/s', fuelFlow: '1.2 L/h' },
  'NT-002': { rpm: '1,500', throttle: '15%', maf: '3.1 g/s', fuelFlow: '0.6 L/h' },
  'NT-003': { rpm: '0', throttle: '0%', maf: '0.0 g/s', fuelFlow: '0.0 L/h' }
};

const AI_SUGGESTIONS = {
  'All': [
    { id: 1, location: 'Pansol Area', priority: 'high', message: 'High Idle Detected: Severe traffic predicted at 17:00. Suggest rerouting to avoid a 15-min idling window.' },
    { id: 2, location: 'Fleet-wide', priority: 'medium', message: 'Predicted Fuel Spike: Next shift predicted to consume 12% more fuel due to projected congestion. Suggest driver ECO-Driving mode.' },
  ],
  'NT-001': [
    { id: 1, location: 'Calamba-Southwoods', priority: 'high', message: 'NT-001 is predicted to consume 45L. Reroute via Bypass Road to save ~3.5L.' },
    { id: 2, location: 'Engine Diagnostics', priority: 'medium', message: 'Telemetry indicates poor fuel efficiency. Schedule tune-up.' }
  ],
  'NT-002': [
    { id: 1, location: 'Los Baños-Pansol', priority: 'low', message: 'Fuel consumption is stable. No proactive routing intervention is required.' }
  ],
  'NT-003': []
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rnn-custom-tooltip">
        <div className="rnn-tooltip-time">Time: {label}</div>
        <div className="rnn-tooltip-metric" style={{ color: 'var(--color-primary-dark)' }}>
          <strong>Predicted:</strong> &nbsp;{payload[1].value} Liters
        </div>
        <div className="rnn-tooltip-metric" style={{ color: '#888' }}>
          <strong>Baseline:</strong> &nbsp;{payload[0].value} Liters
        </div>
      </div>
    );
  }
  return null;
};

function RNNForecasting({ onNavigate }) {
  const [selectedTaxi, setSelectedTaxi] = useState('All');
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'details'

  const currentData = FORECAST_DATA[selectedTaxi] || FORECAST_DATA['All'];
  const currentSuggestions = AI_SUGGESTIONS[selectedTaxi] || [];
  const currentDetails = VEHICLE_DETAILS[selectedTaxi] || VEHICLE_DETAILS['All'];
  const currentTelemetry = TELEMETRY_DATA[selectedTaxi] || null;

  return (
    <div className="rnn-container">
      {/* Top: Predictive AreaChart */}
      <div className="rnn-top-section">
        <div className="rnn-chart-card">
          <div className="rnn-chart-header">
            <h3>{selectedTaxi === 'All' ? 'Fleet-wide Fuel Consumption Forecast (24h)' : `${selectedTaxi} Fuel Consumption Forecast`}</h3>
            <div className="rnn-chart-subtitle">
              Powered by RNN Predictive Engine. Solid line indicates predicted fuel consumption (Liters); dashed gray indicates historical baseline.
            </div>
          </div>
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary-pale)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-primary-pale)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} dx={-10} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Baseline (Dashed) */}
              <Line 
                type="monotone" 
                dataKey="fuelBaseline" 
                stroke="#9E9E9E" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
              />
              
              {/* Predicted (Solid Area) */}
              <Area 
                type="monotone" 
                dataKey="fuelPredicted" 
                stroke="var(--color-primary-dark)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sidebar: Unit Status & Diagnostics */}
      <div className="rnn-sidebar">
        
        {/* Tabs */}
        <div className="rnn-tabs">
          <button 
            className={`rnn-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Unit Status
          </button>
          <button 
            className={`rnn-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Diagnostic Details
          </button>
        </div>

        {/* Section 1: Unit Status */}
        {activeTab === 'list' && (
          <div className="rnn-sidebar-section">
            <div className="telemetry-list" style={{ maxHeight: '100%' }}>
              <div 
                className={`vehicle-card ${selectedTaxi === 'All' ? 'selected' : ''}`}
                onClick={() => { setSelectedTaxi('All'); setActiveTab('details'); }}
              >
                <div className="vehicle-icon" style={{ background: 'var(--color-primary-pale)' }}>
                  <Icons.List />
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-plate">Fleet-wide</div>
                  <div className="vehicle-driver">Aggregate View</div>
                </div>
              </div>
              
              {MOCK_FLEET.map(vehicle => (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-card ${selectedTaxi === vehicle.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedTaxi(vehicle.id); setActiveTab('details'); }}
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
        )}

        {/* Section 2: Diagnostic Details */}
        {activeTab === 'details' && (
        <div className="rnn-sidebar-section">
          <div className="rnn-sidebar-header">
            <h4>Diagnostic Details</h4>
          </div>
          
          <div className="diagnostic-grid" style={{ marginBottom: '15px' }}>
            <div className="diagnostic-metric-card">
              <div className="diagnostic-metric-label">Engine Health</div>
              <div className="diagnostic-metric-value" style={{ color: currentDetails.health === 'Optimal' ? '#27AE60' : (currentDetails.health === 'Varied' ? '#333' : '#E65100') }}>
                {currentDetails.health}
              </div>
            </div>
            <div className="diagnostic-metric-card">
              <div className="diagnostic-metric-label">Efficiency</div>
              <div className="diagnostic-metric-value" style={{ color: 'var(--color-primary-dark)' }}>{currentDetails.score}</div>
            </div>
          </div>

          {currentTelemetry && (
            <div className="diagnostic-grid">
              <div className="diagnostic-metric-card">
                <div className="diagnostic-metric-label">RPM</div>
                <div className="diagnostic-metric-value">{currentTelemetry.rpm}</div>
              </div>
              <div className="diagnostic-metric-card">
                <div className="diagnostic-metric-label">Throttle</div>
                <div className="diagnostic-metric-value">{currentTelemetry.throttle}</div>
              </div>
              <div className="diagnostic-metric-card">
                <div className="diagnostic-metric-label">MAF</div>
                <div className="diagnostic-metric-value">{currentTelemetry.maf}</div>
              </div>
              <div className="diagnostic-metric-card">
                <div className="diagnostic-metric-label">Fuel Flow</div>
                <div className="diagnostic-metric-value">{currentTelemetry.fuelFlow}</div>
              </div>
            </div>
          )}
          
          {!currentTelemetry && (
            <div style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '20px' }}>
              Select a specific unit to view live engine diagnostics.
            </div>
          )}
        </div>
        )}

      </div>
    </div>

      {/* Bottom: Actionable Insights */}
      <div className="rnn-suggestions-section">
        <div className="rnn-suggestions-header">Fuel Optimization Suggestions</div>
        <div className="rnn-suggestions-grid">
          {currentSuggestions.map(suggestion => (
            <div key={suggestion.id} className="rnn-suggestion-card">
              <div className="rnn-suggestion-top">
                <div className="rnn-location-tag">{suggestion.location}</div>
                <div className={`rnn-priority-badge ${suggestion.priority}`}>
                  {suggestion.priority} Priority
                </div>
              </div>
                <div className="rnn-suggestion-body">
                  {suggestion.message}
                </div>
                {selectedTaxi !== 'All' && onNavigate && (
                  <button 
                    onClick={() => onNavigate('geospatial', { focus: selectedTaxi })}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      background: 'var(--color-primary-medium)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      alignSelf: 'flex-start'
                    }}
                  >
                    View on Map
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}

export default RNNForecasting;
