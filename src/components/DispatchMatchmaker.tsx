import React from 'react';
import {
  Incident,
  ResponderUnit,
} from '../types';
import { StorageService } from '../services/storageService';
import {
  Truck,
  Anchor,
  ShieldAlert,
  Clock,
  Compass,
  CheckCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface DispatchMatchmakerProps {
  incidents: Incident[];
  units: ResponderUnit[];
  onDispatchUnit: (incident: Incident, unit: ResponderUnit) => void;
  onSelectIncident: (incident: Incident) => void;
  onResetUnitsStatus: () => void;
}

export const DispatchMatchmaker: React.FC<DispatchMatchmakerProps> = ({
  incidents,
  units,
  onDispatchUnit,
  onSelectIncident,
  onResetUnitsStatus,
}) => {
  // Pending incidents needing dispatch
  const pendingIncidents = incidents
    .filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISPATCHED')
    .sort((a, b) => b.triage.urgencyScore - a.triage.urgencyScore);

  const dispatchedIncidents = incidents.filter((i) => i.status === 'DISPATCHED');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px 24px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(14, 19, 31, 0.9) 0%, rgba(56, 189, 248, 0.08) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={22} style={{ color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Autonomous Mutual-Aid Dispatch Console
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Algorithmic resource-to-casualty matching based on proximity, specialized equipment, and clinical triage urgency.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onResetUnitsStatus}
          style={{ fontSize: '0.78rem' }}
          title="Reset all units to Available status"
        >
          <RefreshCw size={14} />
          <span>Reset Fleet Status</span>
        </button>
      </div>

      {/* Grid: Left = Active Response Fleet (50%), Right = Recommended Autonomous Matches (50%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Response Fleet */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>ACTIVE RESPONSE FLEET</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                {units.length} UNITS
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {units.map((unit) => {
              const isEnRoute = unit.status === 'EN_ROUTE';
              const assignedInc = incidents.find((i) => i.id === unit.currentIncidentId);

              return (
                <div
                  key={unit.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isEnRoute ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          background: isEnRoute ? '#38bdf8' : '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#080b11',
                        }}
                      >
                        {unit.type === 'SWIFT_WATER_CREW' ? <Anchor size={14} /> : <Truck size={14} />}
                      </div>

                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                        {unit.name}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        ({unit.callSign})
                      </span>
                    </div>

                    <span
                      className={`badge ${isEnRoute ? 'badge-cyan' : 'badge-green'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Compass size={12} />
                    <span>Base: {unit.location.address} • {unit.personnelCount} Personnel</span>
                  </div>

                  {/* Capabilities tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {unit.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="font-mono"
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          color: '#7dd3fc',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontSize: '0.65rem',
                        }}
                      >
                        {cap.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  {isEnRoute && assignedInc && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontSize: '0.72rem',
                        color: '#e0f2fe',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Mission: Dispatched to <strong>{assignedInc.location.address}</strong></span>
                      <span className="font-mono" style={{ fontWeight: 800, color: '#38bdf8' }}>
                        ETA ~{assignedInc.assignedUnit?.etaMinutes || 8}m
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Mission Pairing Recommendations */}
        <div className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>RECOMMENDED AUTONOMOUS PAIRINGS</span>
              <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
                {pendingIncidents.length} UNASSIGNED
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingIncidents.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle size={32} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700 }}>All active casualties dispatched or resolved!</div>
                <div style={{ fontSize: '0.78rem' }}>Check Tactical Map or Surge Studio to simulate new events.</div>
              </div>
            ) : (
              pendingIncidents.map((incident) => {
                const matches = StorageService.findOptimalUnitsForIncident(incident, units);
                const bestMatch = matches[0];

                return (
                  <div
                    key={incident.id}
                    style={{
                      background: 'rgba(14, 19, 31, 0.8)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: `1px solid ${incident.triage.code === 'RED' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge badge-${incident.triage.code.toLowerCase()}`}>
                          {incident.triage.code === 'RED' ? <ShieldAlert size={12} /> : null}
                          CODE {incident.triage.code}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                          {incident.location.address}
                        </span>
                      </div>

                      <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: incident.triage.code === 'RED' ? '#ef4444' : '#f59e0b' }}>
                        {incident.triage.urgencyScore} ACUITY
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {incident.triage.injurySummary}
                    </div>

                    {/* Best Recommended Unit Match Card */}
                    {bestMatch && (
                      <div
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Zap size={14} style={{ color: '#38bdf8' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                              Recommended: {bestMatch.unit.name}
                            </span>
                            <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>
                              {bestMatch.matchScore}% FIT
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            {bestMatch.recommendationReason}
                          </div>
                        </div>

                        <button
                          className="btn btn-cyan"
                          style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                          onClick={() => onDispatchUnit(incident, bestMatch.unit)}
                        >
                          <Truck size={14} />
                          <span>Dispatch Now</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
