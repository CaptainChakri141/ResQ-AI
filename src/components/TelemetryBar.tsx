import React from 'react';
import {
  Zap,
  Users,
  ShieldAlert,
  Clock,
  Compass,
} from 'lucide-react';
import { Incident, ResponderUnit } from '../types';

interface TelemetryBarProps {
  incidents: Incident[];
  units: ResponderUnit[];
  locationName: string;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ incidents, units, locationName }) => {
  const redCount = incidents.filter((i) => i.triage.code === 'RED' && i.status !== 'RESOLVED').length;
  const yellowCount = incidents.filter((i) => i.triage.code === 'YELLOW' && i.status !== 'RESOLVED').length;
  const totalVictims = incidents
    .filter((i) => i.status !== 'RESOLVED')
    .reduce((sum, i) => sum + (i.victimCount || 1), 0);
  const activeUnits = units.filter((u) => u.status === 'EN_ROUTE' || u.status === 'ON_SCENE').length;

  return (
    <div className="telemetry-bar">
      {/* Location / Sector */}
      <div className="telemetry-item" style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}>
        <Compass size={14} style={{ color: '#38bdf8' }} />
        <span className="telemetry-label">DISASTER GRID:</span>
        <span className="telemetry-value" style={{ color: '#38bdf8' }}>{locationName}</span>
      </div>

      {/* Critical Queue */}
      <div
        className="telemetry-item"
        style={{
          borderColor: redCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
          background: redCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        }}
      >
        <ShieldAlert size={14} style={{ color: redCount > 0 ? '#ef4444' : '#94a3b8' }} />
        <span className="telemetry-label">CODE RED IMMEDIATE:</span>
        <span
          className="telemetry-value font-mono"
          style={{ color: redCount > 0 ? '#f87171' : '#f8fafc', fontWeight: 800 }}
        >
          {redCount} CRITICAL
        </span>
      </div>

      {/* Urgent Yellow Queue */}
      <div className="telemetry-item">
        <span className="telemetry-label">CODE YELLOW URGENT:</span>
        <span className="telemetry-value font-mono" style={{ color: '#fbbf24' }}>
          {yellowCount} QUEUED
        </span>
      </div>

      {/* Lives Impacted */}
      <div className="telemetry-item">
        <Users size={14} style={{ color: '#38bdf8' }} />
        <span className="telemetry-label">SURVIVORS TRACKED:</span>
        <span className="telemetry-value font-mono">{totalVictims} CITIZENS</span>
      </div>

      {/* Responders Deployed */}
      <div className="telemetry-item">
        <Zap size={14} style={{ color: '#10b981' }} />
        <span className="telemetry-label">MUTUAL-AID DEPLOYED:</span>
        <span className="telemetry-value font-mono" style={{ color: '#34d399' }}>
          {activeUnits} / {units.length} UNITS
        </span>
      </div>

      {/* AI Latency */}
      <div className="telemetry-item" style={{ marginLeft: 'auto' }}>
        <Clock size={14} style={{ color: '#a78bfa' }} />
        <span className="telemetry-label">AI TRIAGE LATENCY:</span>
        <span className="telemetry-value font-mono" style={{ color: '#c4b5fd' }}>
          1.82s (99.4% AUTO-SALT)
        </span>
      </div>
    </div>
  );
};
