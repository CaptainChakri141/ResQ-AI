import React, { useState, useRef } from 'react';
import {
  Incident,
  ResponderUnit,
  HazardZone,
  TriageCode,
} from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Truck,
  Anchor,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface CommandMapProps {
  incidents: Incident[];
  units: ResponderUnit[];
  hazardZones: HazardZone[];
  centerGeo: { lat: number; lng: number };
  onSelectIncident: (incident: Incident) => void;
  onDispatchUnit: (incident: Incident) => void;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  incidents,
  units,
  hazardZones,
  centerGeo,
  onSelectIncident,
  onDispatchUnit,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<TriageCode | 'ALL'>('ALL');
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [showUnits, setShowUnits] = useState<boolean>(true);
  const [radarActive, setRadarActive] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map geographic lat/lng coordinates to percentage (0 - 100%) on our tactical grid
  // Using a 0.12 degree lat/lng bounding box around centerGeo
  const latSpan = 0.08;
  const lngSpan = 0.10;

  const getPercentCoords = (lat: number, lng: number) => {
    const minLat = centerGeo.lat - latSpan / 2;
    const maxLat = centerGeo.lat + latSpan / 2;
    const minLng = centerGeo.lng - lngSpan / 2;
    const maxLng = centerGeo.lng + lngSpan / 2;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Invert y because latitude increases upwards
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;

    return {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y)),
    };
  };

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.triage.code === filterSeverity;
  });

  const getTriageColor = (code: TriageCode) => {
    switch (code) {
      case 'RED': return '#ef4444';
      case 'YELLOW': return '#f59e0b';
      case 'GREEN': return '#10b981';
      case 'BLACK': return '#64748b';
    }
  };

  const handleCenterCritical = () => {
    const highest = incidents.reduce((max, inc) => (inc.triage.urgencyScore > (max?.triage.urgencyScore || 0) ? inc : max), incidents[0]);
    if (highest) {
      setSelectedIncidentId(highest.id);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        height: '100%',
        minHeight: '620px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(56, 189, 248, 0.2)',
      }}
      ref={mapContainerRef}
    >
      {/* Map Control Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'rgba(8, 11, 17, 0.85)',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              TACTICAL GIS GRID
            </span>
          </div>

          <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
            SECTOR TELEMETRY ACTIVE
          </span>
        </div>

        {/* Severity Filters & View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
            {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  background: filterSeverity === sev ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: filterSeverity === sev ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            onClick={() => setShowHazardZones(!showHazardZones)}
            title="Toggle Hazard Danger Zones"
          >
            <Layers size={13} />
            <span>Hazards: {showHazardZones ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
            onClick={() => setShowUnits(!showUnits)}
            title="Toggle Responder Units"
          >
            <Truck size={13} />
            <span>Fleet: {showUnits ? 'ON' : 'OFF'}</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            onClick={handleCenterCritical}
            title="Snap to Highest Urgency Incident"
          >
            <Crosshair size={14} style={{ color: '#ef4444' }} />
          </button>

          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px' }}
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px' }}
              onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas Area */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          background: 'radial-gradient(circle at 50% 50%, #0d1424 0%, #080b11 100%)',
          overflow: 'hidden',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Tactical Grid Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Diagonal Sector Range Rings */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <circle cx="50%" cy="50%" r="22%" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="4 6" />
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="rgba(56, 189, 248, 0.06)" strokeDasharray="6 8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(56, 189, 248, 0.06)" strokeDasharray="4 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(56, 189, 248, 0.06)" strokeDasharray="4 4" />

          {/* Render Dispatched Route Vectors */}
          {incidents
            .filter((inc) => inc.status === 'DISPATCHED' && inc.assignedUnit)
            .map((inc) => {
              const assigned = units.find((u) => u.id === inc.assignedUnit?.unitId);
              if (!assigned) return null;
              const pInc = getPercentCoords(inc.location.lat, inc.location.lng);
              const pUnit = getPercentCoords(assigned.location.lat, assigned.location.lng);

              return (
                <g key={`vector-${inc.id}`}>
                  <line
                    x1={`${pUnit.x}%`}
                    y1={`${pUnit.y}%`}
                    x2={`${pInc.x}%`}
                    y2={`${pInc.y}%`}
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    strokeOpacity="0.8"
                  />
                  <circle cx={`${pInc.x}%`} cy={`${pInc.y}%`} r="6" fill="#38bdf8" />
                </g>
              );
            })}
        </svg>

        {/* Hazard Danger Zones */}
        {showHazardZones &&
          hazardZones.map((zone) => {
            const coords = zone.coordinates;
            return (
              <div
                key={zone.id}
                style={{
                  position: 'absolute',
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${zone.radiusKm * 65}px`,
                  height: `${zone.radiusKm * 65}px`,
                  borderRadius: '50%',
                  background:
                    zone.type === 'FLOOD'
                      ? 'radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, rgba(14, 165, 233, 0.05) 70%, transparent 100%)'
                      : zone.type === 'WILDFIRE'
                      ? 'radial-gradient(circle, rgba(239, 68, 68, 0.28) 0%, rgba(245, 158, 11, 0.05) 70%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.04) 70%, transparent 100%)',
                  border: `1.5px dashed ${
                    zone.type === 'FLOOD' ? '#38bdf8' : zone.type === 'WILDFIRE' ? '#f59e0b' : '#a855f7'
                  }`,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    background: 'rgba(8, 11, 17, 0.85)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: zone.type === 'FLOOD' ? '#38bdf8' : '#fbbf24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                  }}
                >
                  {zone.name}
                </div>
              </div>
            );
          })}

        {/* Responder Units */}
        {showUnits &&
          units.map((unit) => {
            const p = getPercentCoords(unit.location.lat, unit.location.lng);
            return (
              <div
                key={unit.id}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                title={`${unit.name} (${unit.status})`}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background:
                      unit.status === 'EN_ROUTE'
                        ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 14px rgba(56, 189, 248, 0.5)',
                    border: '2px solid #ffffff',
                  }}
                >
                  {unit.type === 'SWIFT_WATER_CREW' ? (
                    <Anchor size={16} />
                  ) : (
                    <Truck size={16} />
                  )}
                </div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    background: 'rgba(8, 11, 17, 0.9)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    marginTop: '2px',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {unit.callSign}
                </div>
              </div>
            );
          })}

        {/* Incident Pins */}
        {filteredIncidents.map((incident) => {
          const p = getPercentCoords(incident.location.lat, incident.location.lng);
          const color = getTriageColor(incident.triage.code);
          const isCritical = incident.triage.code === 'RED';
          const isSelected = selectedIncidentId === incident.id;

          return (
            <div
              key={incident.id}
              onClick={() => setSelectedIncidentId(incident.id)}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 15 : isCritical ? 12 : 10,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.15s ease',
              }}
              className={isCritical ? 'pulse-ring-red' : ''}
              id={`marker-${incident.id}`}
            >
              {/* Pin Bubble */}
              <div
                style={{
                  width: isSelected ? '40px' : isCritical ? '36px' : '30px',
                  height: isSelected ? '40px' : isCritical ? '36px' : '30px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 35%, ${color} 0%, rgba(8,11,17,0.95) 100%)`,
                  border: isSelected ? '3px solid #ffffff' : `2px solid ${color}`,
                  boxShadow: `0 0 18px ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                {isCritical ? (
                  <ShieldAlert size={isSelected ? 20 : 18} />
                ) : incident.triage.code === 'YELLOW' ? (
                  <AlertTriangle size={isSelected ? 18 : 16} />
                ) : (
                  <CheckCircle size={isSelected ? 16 : 14} />
                )}
              </div>

              {/* Urgency Pill */}
              <div
                className="font-mono"
                style={{
                  marginTop: '3px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  background: 'rgba(8, 11, 17, 0.95)',
                  color: color,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: `1px solid ${color}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {incident.triage.urgencyScore}
              </div>
            </div>
          );
        })}

        {/* Selected Incident Drawer Popup */}
        {selectedIncident && (
          <div
            className="glass-panel-elevated"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              maxWidth: '520px',
              zIndex: 30,
              padding: '16px',
              border: `1px solid ${getTriageColor(selectedIncident.triage.code)}`,
              boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`badge badge-${selectedIncident.triage.code.toLowerCase()}`}
                  >
                    CODE {selectedIncident.triage.code} • URGENCY {selectedIncident.triage.urgencyScore}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {selectedIncident.id}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                  {selectedIncident.location.address}
                </div>
              </div>

              <button
                onClick={() => setSelectedIncidentId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '10px', lineHeight: 1.4 }}>
              {selectedIncident.triage.injurySummary}
            </p>

            {/* Required Resources Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {selectedIncident.triage.requiredResources.map((res) => (
                <span
                  key={res}
                  style={{
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {res.replace(/_/g, ' ')}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
                onClick={() => onSelectIncident(selectedIncident)}
              >
                <ExternalLink size={14} />
                <span>Inspect Full AI Triage</span>
              </button>

              <button
                className="btn btn-cyan"
                style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
                onClick={() => onDispatchUnit(selectedIncident)}
              >
                <Truck size={14} />
                <span>Auto-Dispatch Unit</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          background: 'rgba(8, 11, 17, 0.85)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: '#94a3b8',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span>Code Red (Immediate)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span>Code Yellow (Urgent)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span>Code Green (Stable)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#38bdf8' }} />
            <span>Mutual-Aid Fleet</span>
          </div>
        </div>

        <div className="font-mono">
          CENTER: {centerGeo.lat.toFixed(4)}°N, {Math.abs(centerGeo.lng).toFixed(4)}°W
        </div>
      </div>
    </div>
  );
};
