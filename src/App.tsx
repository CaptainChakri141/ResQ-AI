import React, { useState, useEffect } from 'react';
import {
  DisasterScenario,
  Incident,
  ResponderUnit,
  AppSettings,
} from './types';
import { StorageService, PRESET_SCENARIOS } from './services/storageService';
import { getAssetUrl } from './utils/assetUtils';
import { Navbar } from './components/Navbar';
import { TelemetryBar } from './components/TelemetryBar';
import { CommandMap } from './components/CommandMap';
import { IncidentFeed } from './components/IncidentFeed';
import { RapidSOSModal } from './components/RapidSOSModal';
import { TriageDetailModal } from './components/TriageDetailModal';
import { DispatchMatchmaker } from './components/DispatchMatchmaker';
import { SurvivorAdvisorModal } from './components/SurvivorAdvisorModal';
import { SimulationStudio } from './components/SimulationStudio';
import { SettingsModal } from './components/SettingsModal';
import { AboutProblemModal } from './components/AboutProblemModal';

// Web Audio synthesizer for emergency alert chimes
function playAlertChime(type: 'critical' | 'dispatch' | 'resolve') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'critical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'dispatch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export function App() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() =>
    StorageService.getActiveScenarioId()
  );
  const activeScenario = StorageService.getScenario(activeScenarioId);

  const [incidents, setIncidents] = useState<Incident[]>(() =>
    StorageService.getIncidents(activeScenarioId)
  );

  const [units, setUnits] = useState<ResponderUnit[]>(() =>
    StorageService.getUnits(activeScenarioId)
  );

  const [settings, setSettings] = useState<AppSettings>(() =>
    StorageService.getSettings()
  );

  const [activeTab, setActiveTab] = useState<'map' | 'feed' | 'dispatch' | 'simulation'>('map');

  // Modals
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [inspectingIncident, setInspectingIncident] = useState<Incident | null>(null);
  const [survivorGuideIncident, setSurvivorGuideIncident] = useState<Incident | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Scenario switch
  const handleSelectScenario = (id: string) => {
    StorageService.setActiveScenarioId(id);
    setActiveScenarioId(id);
    const newIncidents = StorageService.getIncidents(id);
    const newUnits = StorageService.getUnits(id);
    setIncidents(newIncidents);
    setUnits(newUnits);
    showToast(`Switched scenario to: ${StorageService.getScenario(id).name.split(':')[0]}`);
  };

  // Add Incident from Rapid SOS Modal
  const handleAddIncident = (newIncident: Incident) => {
    StorageService.addIncident(activeScenarioId, newIncident);
    setIncidents((prev) => [newIncident, ...prev]);
    if (settings.audioAlertsEnabled && newIncident.triage.code === 'RED') {
      playAlertChime('critical');
    }
    showToast(`🚨 Priority ${newIncident.triage.code} SOS Broadcast Received: ${newIncident.location.address}`);
  };

  // Dispatch a Unit to an Incident
  const handleDispatchUnit = (incident: Incident, unit: ResponderUnit) => {
    const eta = Math.floor(6 + Math.random() * 8);

    const updatedIncident: Incident = {
      ...incident,
      status: 'DISPATCHED',
      assignedUnit: {
        unitId: unit.id,
        unitName: unit.name,
        unitType: unit.type,
        dispatchedAt: new Date().toISOString(),
        etaMinutes: eta,
      },
      notes: [
        ...incident.notes,
        `Unit ${unit.name} (${unit.callSign}) dispatched at ${new Date().toLocaleTimeString()} (ETA ~${eta}m)`,
      ],
    };

    const updatedUnit: ResponderUnit = {
      ...unit,
      status: 'EN_ROUTE',
      currentIncidentId: incident.id,
    };

    StorageService.updateIncident(activeScenarioId, updatedIncident);
    StorageService.updateUnit(activeScenarioId, updatedUnit);

    setIncidents((prev) => prev.map((i) => (i.id === incident.id ? updatedIncident : i)));
    setUnits((prev) => prev.map((u) => (u.id === unit.id ? updatedUnit : u)));

    if (settings.audioAlertsEnabled) {
      playAlertChime('dispatch');
    }

    showToast(`🚒 Dispatched ${unit.name} to ${incident.location.address} (ETA ~${eta}m)`);
  };

  // Toggle Resolve
  const handleToggleResolve = (incident: Incident) => {
    const isNowResolved = incident.status !== 'RESOLVED';
    const updated: Incident = {
      ...incident,
      status: isNowResolved ? 'RESOLVED' : 'PENDING_TRIAGE',
      notes: [
        ...incident.notes,
        isNowResolved
          ? `Marked RESCUED/RESOLVED at ${new Date().toLocaleTimeString()}`
          : `Re-opened incident at ${new Date().toLocaleTimeString()}`,
      ],
    };

    // Free up assigned unit if resolved
    if (isNowResolved && incident.assignedUnit) {
      const assigned = units.find((u) => u.id === incident.assignedUnit?.unitId);
      if (assigned) {
        const freedUnit: ResponderUnit = {
          ...assigned,
          status: 'AVAILABLE',
          currentIncidentId: undefined,
        };
        StorageService.updateUnit(activeScenarioId, freedUnit);
        setUnits((prev) => prev.map((u) => (u.id === freedUnit.id ? freedUnit : u)));
      }
    }

    StorageService.updateIncident(activeScenarioId, updated);
    setIncidents((prev) => prev.map((i) => (i.id === incident.id ? updated : i)));

    if (settings.audioAlertsEnabled && isNowResolved) {
      playAlertChime('resolve');
    }

    showToast(isNowResolved ? `✅ Rescued/Resolved: ${incident.id}` : `Re-opened: ${incident.id}`);
  };

  // Reset Units
  const handleResetUnitsStatus = () => {
    const fresh = units.map((u) => ({
      ...u,
      status: 'AVAILABLE' as const,
      currentIncidentId: undefined,
    }));
    StorageService.saveUnits(activeScenarioId, fresh);
    setUnits(fresh);
    showToast('Fleet units reset to AVAILABLE');
  };

  // Inject Surge Event
  const handleInjectSurge = (type: 'flood_breach' | 'oxygen_crisis' | 'aftershock') => {
    const timestamp = new Date().toISOString();
    let newIncs: Incident[] = [];

    if (type === 'flood_breach') {
      newIncs = [
        {
          id: `INC-SURGE-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp,
          reporterName: 'Levee Monitor Drone Station 4',
          phone: '+1-555-019-9944',
          location: {
            lat: activeScenario.center.lat + 0.015,
            lng: activeScenario.center.lng + 0.012,
            address: '840 Riverbank Basin, Mile 4 Levee Rupture',
            sector: 'SECTOR-ALPHA',
          },
          emergencyType: 'FLOOD',
          rawDescription: 'CRITICAL SECONDARY BREACH: Water surging 6 feet across residential block. Family of 4 stranded on car roof in fast current.',
          imageUrl: getAssetUrl('samples/flood.jpg'),
          vulnerabilities: ['TRAPPED', 'INFANT_PEDIATRIC'],
          victimCount: 4,
          status: 'PENDING_TRIAGE',
          triage: {
            code: 'RED',
            urgencyScore: 99,
            injurySummary: 'IMMINENT DROWNING DANGER: Vehicle roof submerged in fast-moving current. 4 casualties including toddler.',
            hazardAssessment: {
              floodWaterDepthFeet: 6.2,
              structuralCollapseRisk: 'LOW',
              electricalHazard: false,
              fireRisk: false,
            },
            requiredResources: ['SWIFT_WATER_BOAT', 'PEDIATRIC_TRAUMA_KIT', 'DRONE_AERIAL_SCAN'],
            survivorImmediateInstructions: [
              'Do NOT attempt to swim in rapid current.',
              'Secure child tightly to highest point of roof rack.',
              'Zodiac rescue boat dispatched with high-velocity tether.',
            ],
            responderTacticalBrief: 'RAPID WATER RESCUE: High turbulence current. Approach from upstream eddy with throw bags ready.',
            aiConfidence: 0.99,
            aiEngineUsed: 'GEMINI_LIVE',
            triagedAt: timestamp,
          },
          notes: ['Surge incident triggered via Simulation Studio.'],
        },
        {
          id: `INC-SURGE-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp,
          reporterName: 'David Cho',
          phone: '+1-555-832-1100',
          location: {
            lat: activeScenario.center.lat - 0.018,
            lng: activeScenario.center.lng + 0.022,
            address: '109 Delta Marsh Road, Sector Bravo',
            sector: 'SECTOR-BRAVO',
          },
          emergencyType: 'FLOOD',
          rawDescription: 'Water flowing into living room through broken storm door. 80-year-old bedridden grandfather unable to climb stairs.',
          imageUrl: getAssetUrl('samples/flood.jpg'),
          vulnerabilities: ['ELDERLY', 'MOBILITY_IMPAIRED', 'TRAPPED'],
          victimCount: 2,
          status: 'PENDING_TRIAGE',
          triage: {
            code: 'RED',
            urgencyScore: 94,
            injurySummary: 'NON-AMBULATORY SURVIVOR IMMINENT DANGER: Bedridden patient trapped on ground level with rising water.',
            hazardAssessment: {
              floodWaterDepthFeet: 3.8,
              structuralCollapseRisk: 'NONE',
              electricalHazard: true,
              fireRisk: false,
            },
            requiredResources: ['SWIFT_WATER_BOAT', 'PARAMEDIC_ADVANCED', 'HIGH_WATER_4X4'],
            survivorImmediateInstructions: [
              'Place mattresses on top of raised furniture if feasible.',
              'Disconnect wall lamps and electronics above water level.',
              'Paramedics with backboard stretcher dispatched.',
            ],
            responderTacticalBrief: 'Stretcher extrication through front window required. Water depth approx 3.8ft.',
            aiConfidence: 0.97,
            aiEngineUsed: 'GEMINI_LIVE',
            triagedAt: timestamp,
          },
          notes: ['Bedridden patient requires spinal precautions.'],
        },
      ];
    } else if (type === 'oxygen_crisis') {
      newIncs = [
        {
          id: `INC-SURGE-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp,
          reporterName: 'St. Jude Home Care Nurse',
          phone: '+1-555-400-3321',
          location: {
            lat: activeScenario.center.lat + 0.005,
            lng: activeScenario.center.lng - 0.015,
            address: '320 Cypress Avenue, Sector Charlie',
            sector: 'SECTOR-CHARLIE',
          },
          emergencyType: 'MEDICAL',
          rawDescription: 'Grid blackout caused ventilator failure for 14-year-old quadriplegic patient. Manual bag-valve ventilation currently being performed, nurse alone and exhausting.',
          vulnerabilities: ['OXYGEN_DEPENDENT', 'INFANT_PEDIATRIC'],
          victimCount: 2,
          status: 'PENDING_TRIAGE',
          triage: {
            code: 'RED',
            urgencyScore: 98,
            injurySummary: 'RESPIRATORY ARREST IMMINENT: Mechanical ventilator offline. Single rescuer manual bagging.',
            hazardAssessment: {
              structuralCollapseRisk: 'NONE',
              electricalHazard: false,
              fireRisk: false,
            },
            requiredResources: ['PARAMEDIC_ADVANCED', 'GENERATOR_POWER', 'OXYGEN_CONCENTRATOR'],
            survivorImmediateInstructions: [
              'Maintain 1 breath every 5 seconds with gentle chest rise.',
              'Ensure airtight seal on tracheostomy connector.',
              'Paramedic ambulance with backup portable ventilator en route.',
            ],
            responderTacticalBrief: 'CRITICAL CODE RED: Transport mobile ventilator and power generator immediately.',
            aiConfidence: 0.99,
            aiEngineUsed: 'GEMINI_LIVE',
            triagedAt: timestamp,
          },
          notes: ['ALS priority 1 override.'],
        },
      ];
    } else {
      newIncs = [
        {
          id: `INC-SURGE-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp,
          reporterName: 'Metro Transit Dispatch',
          phone: '+1-555-900-1122',
          location: {
            lat: activeScenario.center.lat - 0.010,
            lng: activeScenario.center.lng - 0.008,
            address: 'Broadway & 5th Overpass, Downtown',
            sector: 'SECTOR-CENTRAL',
          },
          emergencyType: 'STRUCTURAL_COLLAPSE',
          rawDescription: 'Seismic aftershock collapsed concrete highway barrier onto city bus. 6 passengers trapped inside with shattered glass.',
          imageUrl: getAssetUrl('samples/earthquake.jpg'),
          vulnerabilities: ['TRAPPED', 'CRUSH_INJURY'],
          victimCount: 6,
          status: 'PENDING_TRIAGE',
          triage: {
            code: 'RED',
            urgencyScore: 91,
            injurySummary: 'MASS TRANSIT MULTI-CASUALTY: Heavy concrete barrier crushing bus roof. Multiple lacerations and limb entrapments.',
            hazardAssessment: {
              structuralCollapseRisk: 'CRITICAL',
              electricalHazard: true,
              fireRisk: false,
            },
            requiredResources: ['HEAVY_EXTRICATION', 'PARAMEDIC_ADVANCED', 'SHELTER_EVAC'],
            survivorImmediateInstructions: [
              'Do not shift passenger weight toward the crushed left side of bus.',
              'Apply pressure bandages to bleeding wounds with clean clothing.',
              'Heavy rescue cranes and extrication saws deployed.',
            ],
            responderTacticalBrief: 'Heavy hydraulic spreaders and air lifting bags required to stabilize bus chassis.',
            aiConfidence: 0.98,
            aiEngineUsed: 'GEMINI_LIVE',
            triagedAt: timestamp,
          },
          notes: ['Transit operations halted.'],
        },
      ];
    }

    const merged = [...newIncs, ...incidents];
    StorageService.saveIncidents(activeScenarioId, merged);
    setIncidents(merged);

    if (settings.audioAlertsEnabled) {
      playAlertChime('critical');
    }

    showToast(`⚡ Surge Event Injected: ${newIncs.length} critical casualties added to triage queue!`);
  };

  // Reset Scenario
  const handleResetScenario = () => {
    StorageService.resetScenario(activeScenarioId);
    setIncidents(StorageService.getIncidents(activeScenarioId));
    setUnits(StorageService.getUnits(activeScenarioId));
    showToast(`Reset ${activeScenario.name.split(':')[0]} to initial state.`);
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings saved successfully.');
  };

  const criticalCount = incidents.filter((i) => i.triage.code === 'RED' && i.status !== 'RESOLVED').length;

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        settings={settings}
        onOpenSOSModal={() => setIsSOSModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        criticalIncidentCount={criticalCount}
      />

      {/* Telemetry Bar */}
      <TelemetryBar
        incidents={incidents}
        units={units}
        locationName={activeScenario.locationName}
      />

      {/* Main View Body */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === 'map' && (
          <div className="dashboard-grid">
            {/* Left: GIS Map */}
            <CommandMap
              incidents={incidents}
              units={units}
              hazardZones={activeScenario.hazardZones}
              centerGeo={activeScenario.center}
              onSelectIncident={(inc) => setInspectingIncident(inc)}
              onDispatchUnit={(inc) => {
                const matches = StorageService.findOptimalUnitsForIncident(inc, units);
                if (matches[0]) {
                  handleDispatchUnit(inc, matches[0].unit);
                } else {
                  setInspectingIncident(inc);
                }
              }}
            />

            {/* Right: Operational Priority Feed */}
            <IncidentFeed
              incidents={incidents}
              onSelectIncident={(inc) => setInspectingIncident(inc)}
              onDispatchIncident={(inc) => {
                const matches = StorageService.findOptimalUnitsForIncident(inc, units);
                if (matches[0]) {
                  handleDispatchUnit(inc, matches[0].unit);
                } else {
                  setInspectingIncident(inc);
                }
              }}
              onOpenSurvivorGuide={(inc) => setSurvivorGuideIncident(inc)}
              onToggleResolve={handleToggleResolve}
            />
          </div>
        )}

        {activeTab === 'feed' && (
          <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column' }}>
            <IncidentFeed
              incidents={incidents}
              onSelectIncident={(inc) => setInspectingIncident(inc)}
              onDispatchIncident={(inc) => {
                const matches = StorageService.findOptimalUnitsForIncident(inc, units);
                if (matches[0]) {
                  handleDispatchUnit(inc, matches[0].unit);
                } else {
                  setInspectingIncident(inc);
                }
              }}
              onOpenSurvivorGuide={(inc) => setSurvivorGuideIncident(inc)}
              onToggleResolve={handleToggleResolve}
            />
          </div>
        )}

        {activeTab === 'dispatch' && (
          <DispatchMatchmaker
            incidents={incidents}
            units={units}
            onDispatchUnit={handleDispatchUnit}
            onSelectIncident={(inc) => setInspectingIncident(inc)}
            onResetUnitsStatus={handleResetUnitsStatus}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationStudio
            activeScenario={activeScenario}
            onSelectScenario={handleSelectScenario}
            onInjectSurge={handleInjectSurge}
            onResetScenario={handleResetScenario}
            incidents={incidents}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(8, 11, 17, 0.95)',
            border: '1px solid #38bdf8',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.8), 0 0 20px rgba(56, 189, 248, 0.3)',
            zIndex: 1000,
            fontSize: '0.85rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Modals */}
      <RapidSOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        onSubmitIncident={handleAddIncident}
        settings={settings}
        centerGeo={activeScenario.center}
      />

      <TriageDetailModal
        incident={inspectingIncident}
        units={units}
        onClose={() => setInspectingIncident(null)}
        onDispatchUnit={handleDispatchUnit}
        onOpenSurvivorGuide={(inc) => {
          setInspectingIncident(null);
          setSurvivorGuideIncident(inc);
        }}
      />

      <SurvivorAdvisorModal
        incident={survivorGuideIncident}
        onClose={() => setSurvivorGuideIncident(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetAllData={handleResetScenario}
      />

      <AboutProblemModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

export default App;
