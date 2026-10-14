import React, { useState } from 'react';
import {
  Incident,
  ResponderUnit,
} from '../types';
import { StorageService } from '../services/storageService';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Truck,
  HeartHandshake,
  Send,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface TriageDetailModalProps {
  incident: Incident | null;
  units: ResponderUnit[];
  onClose: () => void;
  onDispatchUnit: (incident: Incident, unit: ResponderUnit) => void;
  onOpenSurvivorGuide: (incident: Incident) => void;
}

export const TriageDetailModal: React.FC<TriageDetailModalProps> = ({
  incident,
  units,
  onClose,
  onDispatchUnit,
  onOpenSurvivorGuide,
}) => {
  if (!incident) return null;

  const [smsSent, setSmsSent] = useState(false);

  // Compute best matching units
  const matches = StorageService.findOptimalUnitsForIncident(incident, units);

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3500);
  };

  const getTriageColor = (code: string) => {
    switch (code) {
      case 'RED': return '#ef4444';
      case 'YELLOW': return '#f59e0b';
      case 'GREEN': return '#10b981';
      default: return '#64748b';
    }
  };

  const color = getTriageColor(incident.triage.code);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className={`badge badge-${incident.triage.code.toLowerCase()}`}
              style={{ fontSize: '0.85rem', padding: '4px 12px' }}
            >
              {incident.triage.code === 'RED' ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
              CODE {incident.triage.code} • ACUITY {incident.triage.urgencyScore}/100
            </span>

            <span className="font-mono" style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 700 }}>
              {incident.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={13} />
              <span>{incident.triage.aiEngineUsed} ({(incident.triage.aiConfidence * 100).toFixed(0)}% Confidence)</span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Top Info Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '16px',
              background: 'rgba(14, 19, 31, 0.6)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                INCIDENT LOCATION & SECTOR
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginTop: '2px' }}>
                {incident.location.address}
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '3px' }}>
                Sector: {incident.location.sector} • GPS: {incident.location.lat.toFixed(4)}°N, {Math.abs(incident.location.lng).toFixed(4)}°W
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                REPORTED BY
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                {incident.reporterName} ({incident.phone})
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                {incident.victimCount} Citizen(s) in Distress
              </div>
            </div>
          </div>

          {/* Visual Damage Photo & HAZMAT Sensors */}
          {incident.imageUrl && (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>
              <div
                style={{
                  position: 'relative',
                  height: '170px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <img
                  src={incident.imageUrl}
                  alt="Incident Damage Photo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(8, 11, 17, 0.85)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  CV DAMAGE INSPECTOR
                </div>
              </div>

              {/* Computer Vision Sensor Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                  AUTOMATED SENSOR & HAZARD ASSESSMENT
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>FLOODWATER DEPTH</div>
                    <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8' }}>
                      {incident.triage.hazardAssessment.floodWaterDepthFeet
                        ? `${incident.triage.hazardAssessment.floodWaterDepthFeet} FT`
                        : 'NO FLOODING'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>STRUCTURAL COLLAPSE</div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color:
                          incident.triage.hazardAssessment.structuralCollapseRisk === 'CRITICAL'
                            ? '#ef4444'
                            : '#f59e0b',
                      }}
                    >
                      {incident.triage.hazardAssessment.structuralCollapseRisk} RISK
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ELECTRICAL ARCING</div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: incident.triage.hazardAssessment.electricalHazard ? '#ef4444' : '#10b981',
                      }}
                    >
                      {incident.triage.hazardAssessment.electricalHazard ? '⚡ ACTIVE THREAT' : 'SECURE'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>FIRE PERIMETER</div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: incident.triage.hazardAssessment.fireRisk ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {incident.triage.hazardAssessment.fireRisk ? '🔥 SPREAD RISK' : 'NONE'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clinical & Situation Breakdown */}
          <div className="form-group">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
              SALT / START CLINICAL TRIAGE SYNTHESIS
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {incident.triage.injurySummary}
            </div>
          </div>

          {/* Tactical Responder Briefing */}
          <div className="form-group">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
              TACTICAL FIRST RESPONDER OPERATIONAL BRIEF
            </div>
            <div
              className="font-mono"
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#e0f2fe',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {incident.triage.responderTacticalBrief}
            </div>
          </div>

          {/* Survivor Immediate Directives & Broadcast Action */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399' }}>
                SURVIVOR IMMEDIATE LIFE-SAFETY DIRECTIVES
              </div>

              <button
                className="btn btn-secondary"
                style={{ padding: '3px 10px', fontSize: '0.72rem' }}
                onClick={handleSendSMS}
              >
                {smsSent ? (
                  <>
                    <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981' }}>SMS Transmitted to Survivor</span>
                  </>
                ) : (
                  <>
                    <Send size={13} style={{ color: '#38bdf8' }} />
                    <span>Transmit SMS Advice</span>
                  </>
                )}
              </button>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {incident.triage.survivorImmediateInstructions.map((instruction, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#34d399', fontWeight: 800 }}>•</span>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Autonomous Unit Dispatch Recommendation */}
          <div className="form-group">
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
              AUTONOMOUS MUTUAL-AID DISPATCH MATCHES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matches.slice(0, 3).map(({ unit, matchScore, etaMinutes, recommendationReason, matchedCapabilities }) => {
                const isAlreadyAssigned = incident.assignedUnit?.unitId === unit.id;

                return (
                  <div
                    key={unit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: isAlreadyAssigned
                        ? '1px solid #38bdf8'
                        : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                          {unit.name}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          ({unit.callSign})
                        </span>
                        <span
                          className="badge badge-cyan"
                          style={{ fontSize: '0.65rem' }}
                        >
                          {matchScore}% MATCH
                        </span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                        {recommendationReason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                          ~{etaMinutes}m ETA
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          {unit.status}
                        </div>
                      </div>

                      <button
                        className="btn btn-cyan"
                        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                        onClick={() => {
                          onDispatchUnit(incident, unit);
                          onClose();
                        }}
                      >
                        <Truck size={14} />
                        <span>{isAlreadyAssigned ? 'Re-Dispatch' : 'Dispatch Unit'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => onOpenSurvivorGuide(incident)}
          >
            <HeartHandshake size={15} style={{ color: '#38bdf8' }} />
            <span>Interactive Survivor Survival Protocol</span>
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
