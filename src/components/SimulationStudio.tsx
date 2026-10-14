import React from 'react';
import {
  DisasterScenario,
  Incident,
} from '../types';
import { PRESET_SCENARIOS } from '../services/storageService';
import {
  Activity,
  Flame,
  Droplets,
  AlertOctagon,
  RefreshCw,
  Zap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface SimulationStudioProps {
  activeScenario: DisasterScenario;
  onSelectScenario: (scenarioId: string) => void;
  onInjectSurge: (type: 'flood_breach' | 'oxygen_crisis' | 'aftershock') => void;
  onResetScenario: () => void;
  incidents: Incident[];
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({
  activeScenario,
  onSelectScenario,
  onInjectSurge,
  onResetScenario,
  incidents,
}) => {
  const criticalCount = incidents.filter((i) => i.triage.code === 'RED').length;
  const dispatchedCount = incidents.filter((i) => i.status === 'DISPATCHED').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '24px',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(90deg, rgba(14, 19, 31, 0.95) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} style={{ color: '#c084fc' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
              Disaster Surge & Stress-Testing Studio
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '4px' }}>
            Validate real-time AI triage throughput, multi-casualty ranking, and resource allocation under simulated catastrophic surge.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onResetScenario}
          style={{ fontSize: '0.8rem' }}
          id="btn-reset-scenario"
        >
          <RefreshCw size={14} />
          <span>Reset to Clean Baseline</span>
        </button>
      </div>

      {/* 3 Catastrophe Scenario Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
          SELECT DISASTER PROFILE:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {PRESET_SCENARIOS.map((scenario) => {
            const isCurrent = scenario.id === activeScenario.id;

            return (
              <div
                key={scenario.id}
                onClick={() => onSelectScenario(scenario.id)}
                className="glass-panel"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isCurrent ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'rgba(56, 189, 248, 0.08)' : 'rgba(14, 19, 31, 0.7)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {scenario.hazardType === 'FLOOD' ? (
                      <Droplets size={18} style={{ color: '#38bdf8' }} />
                    ) : scenario.hazardType === 'WILDFIRE' ? (
                      <Flame size={18} style={{ color: '#f59e0b' }} />
                    ) : (
                      <AlertOctagon size={18} style={{ color: '#ef4444' }} />
                    )}
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#fff' }}>
                      {scenario.hazardType}
                    </span>
                  </div>

                  <span className={`badge ${isCurrent ? 'badge-cyan' : 'badge-black'}`}>
                    {isCurrent ? 'ACTIVE' : 'LOAD'}
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                  {scenario.name}
                </div>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                  {scenario.description}
                </p>

                <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                  Base Location: {scenario.locationName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Surge Stress Tests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} style={{ color: '#f59e0b' }} />
          <span>INJECT CONCURRENT SURGE EVENTS:</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Surge 1: Flood Breach */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
                🌊 Secondary Levee Breach
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                Simulates catastrophic levee failure at Canal Mile 4. Adds 3 immediate Code Red swift-water casualties.
              </div>
            </div>

            <button
              className="btn btn-cyan"
              style={{ fontSize: '0.78rem', padding: '8px' }}
              onClick={() => onInjectSurge('flood_breach')}
              id="btn-surge-flood"
            >
              <Zap size={14} />
              <span>Inject Levee Breach Surge (+3 Red)</span>
            </button>
          </div>

          {/* Surge 2: Oxygen Crisis */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f87171' }}>
                🫁 Grid Blackout & Oxygen Failures
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                Simulates multi-block substation trip cutting power to at-home ventilator and COPD patients.
              </div>
            </div>

            <button
              className="btn btn-primary-sos"
              style={{ fontSize: '0.78rem', padding: '8px' }}
              onClick={() => onInjectSurge('oxygen_crisis')}
              id="btn-surge-o2"
            >
              <Zap size={14} />
              <span>Inject Oxygen Crisis (+2 Red)</span>
            </button>
          </div>

          {/* Surge 3: Seismic Aftershock */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>
                🏚️ Magnitude 6.4 Aftershock
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                Simulates secondary tremor causing facade collapses and gas main fractures.
              </div>
            </div>

            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px', borderColor: '#f59e0b', color: '#fbbf24' }}
              onClick={() => onInjectSurge('aftershock')}
              id="btn-surge-aftershock"
            >
              <Zap size={14} />
              <span>Inject Aftershock (+3 Incidents)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Stress Performance Metrics */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          background: 'rgba(8, 11, 17, 0.8)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>SYSTEM INTEGRITY</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
            100% OPERATIONAL
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>TOTAL INCIDENTS TRACKED</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
            {incidents.length} RECORDS
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CODE RED QUEUE</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>
            {criticalCount} CRITICAL
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ACTIVE DISPATCH MISSIONS</div>
          <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
            {dispatchedCount} DEPLOYED
          </div>
        </div>
      </div>
    </div>
  );
};
