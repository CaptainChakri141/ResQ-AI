import React from 'react';
import {
  AlertTriangle,
  Radio,
  Sliders,
  Sparkles,
  Map,
  ListFilter,
  Truck,
  Flame,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { DisasterScenario, AppSettings } from '../types';
import { PRESET_SCENARIOS } from '../services/storageService';

interface NavbarProps {
  activeTab: 'map' | 'feed' | 'dispatch' | 'simulation';
  setActiveTab: (tab: 'map' | 'feed' | 'dispatch' | 'simulation') => void;
  activeScenario: DisasterScenario;
  onSelectScenario: (scenarioId: string) => void;
  settings: AppSettings;
  onOpenSOSModal: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  criticalIncidentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeScenario,
  onSelectScenario,
  settings,
  onOpenSOSModal,
  onOpenSettings,
  onOpenAbout,
  criticalIncidentCount,
}) => {
  const isLiveAI = Boolean(settings.geminiApiKey && settings.geminiApiKey.length > 5 && !settings.useOfflineDemoMode);

  return (
    <header className="navbar">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-logo-badge pulse-ring-red">
          <AlertTriangle size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            <span>ResQAI</span>
            <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
              PROMPTWARS 2026
            </span>
          </div>
          <div className="brand-subtitle">
            Autonomous Crisis Triage & Mutual-Aid Grid
          </div>
        </div>
      </div>

      {/* Scenario Selector & Navigation Tabs */}
      <div className="nav-center-actions">
        {/* Scenario Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px', paddingRight: '8px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <Flame size={15} style={{ color: '#f59e0b' }} />
          <select
            className="form-select"
            style={{
              padding: '4px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#f8fafc',
              cursor: 'pointer',
              maxWidth: '220px',
            }}
            value={activeScenario.id}
            onChange={(e) => onSelectScenario(e.target.value)}
          >
            {PRESET_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id} style={{ background: '#0e131f', color: '#fff' }}>
                {s.name.split(':')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <button
          className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
          id="nav-tab-map"
        >
          <Map size={15} />
          <span>Tactical Map</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
          id="nav-tab-feed"
        >
          <ListFilter size={15} />
          <span>Triage Queue</span>
          {criticalIncidentCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                marginLeft: '2px',
              }}
            >
              {criticalIncidentCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispatch')}
          id="nav-tab-dispatch"
        >
          <Truck size={15} />
          <span>Mutual-Aid Dispatch</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
          id="nav-tab-sim"
        >
          <Activity size={15} />
          <span>Surge Studio</span>
        </button>
      </div>

      {/* Right Controls & Primary SOS CTA */}
      <div className="nav-right-actions">
        {/* AI Status Badge */}
        <div
          onClick={onOpenSettings}
          title="Click to configure Gemini API Key"
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            background: isLiveAI ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${isLiveAI ? 'rgba(56, 189, 248, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: isLiveAI ? '#38bdf8' : '#34d399',
          }}
        >
          {isLiveAI ? <Sparkles size={13} /> : <Radio size={13} />}
          <span>{isLiveAI ? 'Gemini 2.5 Live' : 'Clinical HAZMAT AI Engine'}</span>
        </div>

        {/* SOS Action Button */}
        <button
          className="btn btn-primary-sos"
          onClick={onOpenSOSModal}
          id="btn-report-sos"
          style={{ padding: '8px 18px' }}
        >
          <Radio size={16} />
          <span>REPORT SOS</span>
        </button>

        {/* Settings button */}
        <button
          className="btn-icon-only"
          onClick={onOpenSettings}
          title="System & AI Settings"
          aria-label="Settings"
          id="btn-settings"
        >
          <Sliders size={18} />
        </button>

        {/* About Problem button */}
        <button
          className="btn-icon-only"
          onClick={onOpenAbout}
          title="Problem & Solution Overview"
          aria-label="About Problem"
          id="btn-about"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
