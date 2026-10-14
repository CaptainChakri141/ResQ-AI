import React, { useState } from 'react';
import {
  Incident,
  EmergencyType,
} from '../types';
import {
  HeartHandshake,
  ShieldAlert,
  X,
  Droplets,
  Flame,
  Activity,
  Volume2,
  CheckCircle,
  Copy,
} from 'lucide-react';

interface SurvivorAdvisorModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const SurvivorAdvisorModal: React.FC<SurvivorAdvisorModalProps> = ({
  incident,
  onClose,
}) => {
  if (!incident) return null;

  const [largeFont, setLargeFont] = useState(false);
  const [copied, setCopied] = useState(false);

  const emergencyType = incident.emergencyType;

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case 'FLOOD': return <Droplets size={24} style={{ color: '#38bdf8' }} />;
      case 'WILDFIRE': return <Flame size={24} style={{ color: '#f59e0b' }} />;
      default: return <Activity size={24} style={{ color: '#ef4444' }} />;
    }
  };

  const copyGuidance = () => {
    const text = incident.triage.survivorImmediateInstructions.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '740px',
          background: '#0c111d',
          border: '1px solid rgba(56, 189, 248, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getEmergencyIcon(emergencyType)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                Survivor Emergency Protocol (Offline Ready)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Context-Tailored Survival Directives • Verified Disaster Medicine Standards
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              onClick={() => setLargeFont(!largeFont)}
              title="Toggle Large Font for readability in crisis"
            >
              {largeFont ? 'Standard Font' : 'Large Font (Crisis Mode)'}
            </button>

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
        <div className="modal-body" style={{ fontSize: largeFont ? '1.05rem' : '0.85rem' }}>
          {/* Situation Context Banner */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldAlert size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f87171' }}>
                Rescue Unit Queued for {incident.location.address}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>
                Status: {incident.assignedUnit ? `Dispatched (${incident.assignedUnit.unitName})` : 'Triage Verified in Queue'}
              </div>
            </div>
          </div>

          {/* AI-Generated Tailored Instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem' }}>
              IMMEDIATE SURVIVOR ACTIONS:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incident.triage.survivorImmediateInstructions.map((instruction, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#38bdf8',
                      color: '#080b11',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ color: '#f8fafc', lineHeight: 1.5 }}>
                    {instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Universal Crisis Guidelines */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(14, 19, 31, 0.7)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.82rem' }}>
              UNIVERSAL SURVIVAL RULES:
            </div>
            <ul style={{ paddingLeft: '20px', color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.6 }}>
              <li><strong>Battery Conservation:</strong> Switch phone to Ultra Power Saving mode. Use text messages rather than voice calls to preserve signal.</li>
              <li><strong>Acoustic Signaling:</strong> If trapped under debris or cut off, make 3 distinct rhythmic sounds (taps, whistles, horn) every 5 minutes. First responders listen for patterns.</li>
              <li><strong>Water Sterilization:</strong> If municipal water is interrupted, boil water rolling for 1 full minute or use 8 drops of unscented household bleach per gallon.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={copyGuidance}>
            {copied ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{copied ? 'Copied Instructions' : 'Copy Directives'}</span>
          </button>

          <button className="btn btn-cyan" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
