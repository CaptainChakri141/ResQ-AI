import {
  DisasterScenario,
  Incident,
  ResponderUnit,
  AppSettings,
  ResourceNeed,
} from '../types';
import { getAssetUrl } from '../utils/assetUtils';

const STORAGE_KEYS = {
  SCENARIO_ID: 'resqai_active_scenario_id',
  INCIDENTS: 'resqai_incidents_',
  UNITS: 'resqai_units_',
  SETTINGS: 'resqai_settings',
};

// Initial Pre-seeded Scenarios
export const PRESET_SCENARIOS: DisasterScenario[] = [
  {
    id: 'SCENARIO_HURRICANE_FLOOD',
    name: 'Hurricane Zephyr: Cat-4 Storm Surge & Levee Breach',
    hazardType: 'FLOOD',
    alertLevel: 'CRITICAL_SURGE',
    locationName: 'Gulf Delta Metro & Coastal Lowlands',
    center: { lat: 29.9511, lng: -90.0715 }, // New Orleans Delta coordinates
    description: 'Catastrophic river surge exceeded levee crest by 3.2 feet. Over 40 square miles submerged. Municipal 911 dispatch lines saturated with over 1,400 queued calls. Power grid down across sectors Alpha through Delta.',
    hazardZones: [
      {
        id: 'HZ-1',
        name: 'Bayou Levee Rupture Breach Basin',
        type: 'FLOOD',
        coordinates: { x: 42, y: 38 },
        geoCoords: { lat: 29.965, lng: -90.065 },
        radiusKm: 3.5,
        severity: 'EXTREME',
      },
      {
        id: 'HZ-2',
        name: 'Industrial Canal Surge Inundation',
        type: 'FLOOD',
        coordinates: { x: 68, y: 52 },
        geoCoords: { lat: 29.940, lng: -90.035 },
        radiusKm: 2.8,
        severity: 'HIGH',
      },
      {
        id: 'HZ-3',
        name: 'Substation Gamma Submerged Electrical Danger',
        type: 'HAZMAT',
        coordinates: { x: 28, y: 64 },
        geoCoords: { lat: 29.925, lng: -90.095 },
        radiusKm: 1.5,
        severity: 'EXTREME',
      },
    ],
    initialUnits: [
      {
        id: 'UNIT-SW-01',
        name: 'Swift-Water Zodiac Team Alpha',
        type: 'SWIFT_WATER_CREW',
        callSign: 'WATER-ALPHA',
        location: { lat: 29.970, lng: -90.080, address: 'North Docks Staging Area' },
        status: 'AVAILABLE',
        capabilities: ['SWIFT_WATER_BOAT', 'POTABLE_WATER_RATION', 'HEAVY_EXTRICATION'],
        personnelCount: 4,
        phone: '+1-555-019-2831',
      },
      {
        id: 'UNIT-MED-04',
        name: 'Rescue-Medic 4 (Advanced Life Support)',
        type: 'PARAMEDIC_AMBULANCE',
        callSign: 'MEDIC-4',
        location: { lat: 29.945, lng: -90.075, address: 'Highland Ridge Baptist Church' },
        status: 'AVAILABLE',
        capabilities: ['PARAMEDIC_ADVANCED', 'OXYGEN_CONCENTRATOR', 'INSULIN_COLD_PACK', 'PEDIATRIC_TRAUMA_KIT'],
        personnelCount: 3,
        phone: '+1-555-019-4412',
      },
      {
        id: 'UNIT-CERT-12',
        name: 'CERT High-Clearance 4x4 Squad 12',
        type: 'HEAVY_RESCUE_4X4',
        callSign: 'HIGH-AXLE-12',
        location: { lat: 29.930, lng: -90.060, address: 'Sector Charlie Fire Station 9' },
        status: 'AVAILABLE',
        capabilities: ['HIGH_WATER_4X4', 'HEAVY_EXTRICATION', 'GENERATOR_POWER', 'POTABLE_WATER_RATION'],
        personnelCount: 5,
        phone: '+1-555-019-7734',
      },
      {
        id: 'UNIT-DRONE-01',
        name: 'AeroRecon Tactical Thermal Drone 1',
        type: 'AIR_RECON_DRONE',
        callSign: 'SKY-EYE-1',
        location: { lat: 29.955, lng: -90.070, address: 'Municipal Command Roof Pad' },
        status: 'AVAILABLE',
        capabilities: ['DRONE_AERIAL_SCAN'],
        personnelCount: 2,
        phone: '+1-555-019-9921',
      },
      {
        id: 'UNIT-VOL-03',
        name: 'Community Mutual-Aid Van 3',
        type: 'COMMUNITY_VOLUNTEER',
        callSign: 'MUTUAL-3',
        location: { lat: 29.960, lng: -90.090, address: 'Civic Center Assembly Depot' },
        status: 'AVAILABLE',
        capabilities: ['POTABLE_WATER_RATION', 'SHELTER_EVAC', 'HIGH_WATER_4X4'],
        personnelCount: 4,
        phone: '+1-555-019-1102',
      },
    ],
    initialIncidents: [
      {
        id: 'INC-2026-8812',
        timestamp: '2026-10-14T11:42:00Z',
        reporterName: 'Priya Narang',
        phone: '+1-555-829-1029',
        location: {
          lat: 29.9621,
          lng: -90.0632,
          address: '4218 Bayou Crest Drive, Sector Alpha',
          sector: 'SECTOR-ALPHA',
        },
        emergencyType: 'FLOOD',
        rawDescription: 'Floodwater entered ground floor, now up to 5 feet and rising fast. Trapped on second floor balcony with 76-year-old grandmother who is diabetic and running out of refrigerated insulin. Power is completely out.',
        imageUrl: getAssetUrl('samples/flood.jpg'),
        vulnerabilities: ['ELDERLY', 'DIABETIC_INSULIN', 'TRAPPED'],
        victimCount: 3,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'RED',
          urgencyScore: 92,
          injurySummary: 'Critical imminent flood hazard. Rising water (approx 5.0ft) trapping 3 survivors including insulin-dependent geriatric patient without power.',
          hazardAssessment: {
            floodWaterDepthFeet: 5.0,
            structuralCollapseRisk: 'LOW',
            electricalHazard: true,
            fireRisk: false,
          },
          requiredResources: ['SWIFT_WATER_BOAT', 'INSULIN_COLD_PACK', 'HIGH_WATER_4X4'],
          survivorImmediateInstructions: [
            'Remain on 2nd floor balcony with high-visibility markers.',
            'Keep insulin vial wrapped in dry insulated bag; avoid flood water contact.',
            'Do NOT step down to submerged ground floor due to live electrical current.',
            'Flash phone light in 3 short pulses to guide incoming boat crew.',
          ],
          responderTacticalBrief: 'Deploy Swift-Water boat with insulated insulin cooler pack. Submerged cars on street require shallow draft propeller guard.',
          aiConfidence: 0.98,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T11:42:15Z',
        },
        notes: ['Caller stated water rising approximately 4 inches per 20 minutes.'],
      },
      {
        id: 'INC-2026-8815',
        timestamp: '2026-10-14T11:48:30Z',
        reporterName: 'Carlos Mendez',
        phone: '+1-555-392-8811',
        location: {
          lat: 29.9538,
          lng: -90.0512,
          address: '1104 Canal Basin Warehouse, Sector Bravo',
          sector: 'SECTOR-BRAVO',
        },
        emergencyType: 'FLOOD',
        rawDescription: 'Two electrical technicians stranded on roof of industrial transformer substation. Ground transformer sparked earlier and went dark. Water is 4 feet around the perimeter.',
        imageUrl: getAssetUrl('samples/flood.jpg'),
        vulnerabilities: ['TRAPPED'],
        victimCount: 2,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'YELLOW',
          urgencyScore: 68,
          injurySummary: 'Stable on elevated structural roof. Surrounded by deep water. Electrical explosion risk neutralized by substation trip.',
          hazardAssessment: {
            floodWaterDepthFeet: 4.2,
            structuralCollapseRisk: 'LOW',
            electricalHazard: true,
            fireRisk: false,
          },
          requiredResources: ['SWIFT_WATER_BOAT', 'HIGH_WATER_4X4'],
          survivorImmediateInstructions: [
            'Stay on flat roof away from metal conduit pipes.',
            'Conserve phone battery; do not attempt to swim.',
            'Wave high-vis vests toward canal approach.',
          ],
          responderTacticalBrief: 'Approach via eastern levee canal. Water is non-turbulent but littered with sheet metal debris.',
          aiConfidence: 0.94,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T11:48:42Z',
        },
        notes: ['Substation reported manually disengaged by grid dispatch at 11:30.'],
      },
      {
        id: 'INC-2026-8820',
        timestamp: '2026-10-14T11:53:10Z',
        reporterName: 'Evelyn Wright',
        phone: '+1-555-401-2993',
        location: {
          lat: 29.9392,
          lng: -90.0811,
          address: '782 Magnolia Terrace Apt 1B, Sector Charlie',
          sector: 'SECTOR-CHARLIE',
        },
        emergencyType: 'MEDICAL',
        rawDescription: 'My husband has severe stage-4 COPD and is on continuous oxygen concentrator. Our grid power died 40 minutes ago and his portable backup battery only has 14% remaining (under 25 mins). He is turning pale and gasping.',
        vulnerabilities: ['OXYGEN_DEPENDENT', 'ELDERLY'],
        victimCount: 2,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'RED',
          urgencyScore: 96,
          injurySummary: 'CRITICAL MEDICAL AIRWAY EMERGENCY: Imminent respiratory failure. O2 concentrator battery failure in <25 minutes.',
          hazardAssessment: {
            floodWaterDepthFeet: 1.5,
            structuralCollapseRisk: 'NONE',
            electricalHazard: false,
            fireRisk: false,
          },
          requiredResources: ['OXYGEN_CONCENTRATOR', 'PARAMEDIC_ADVANCED', 'GENERATOR_POWER'],
          survivorImmediateInstructions: [
            'Lower oxygen flow rate to minimum tolerable LPM to stretch remaining battery life.',
            'Keep patient in high Fowler position (seated fully upright, leaning slightly forward).',
            'Loosen tight clothing around neck and chest.',
            'Leave front door unlocked so paramedics can enter immediately upon arrival.',
          ],
          responderTacticalBrief: 'RUSH DISPATCH: Immediate ALS ambulance with spare high-flow O2 tanks and battery backup generator.',
          aiConfidence: 0.99,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T11:53:20Z',
        },
        notes: ['Critical life threat timer active.'],
      },
      {
        id: 'INC-2026-8824',
        timestamp: '2026-10-14T11:58:05Z',
        reporterName: 'Pastor Thomas Reed',
        phone: '+1-555-502-3841',
        location: {
          lat: 29.9210,
          lng: -90.0450,
          address: 'Grace Community Fellowship, Sector Delta',
          sector: 'SECTOR-DELTA',
        },
        emergencyType: 'FLOOD',
        rawDescription: 'We are sheltering 42 displaced neighborhood residents on church gymnasium stage. Building is dry on raised pilings, but municipal tap water is shut off and we have only 6 gallons of drinking water left for 42 people including 8 toddlers.',
        vulnerabilities: ['INFANT_PEDIATRIC'],
        victimCount: 42,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'GREEN',
          urgencyScore: 42,
          injurySummary: 'Mass shelter stable from direct flooding. Water supply deficit projected in 4 hours. No acute trauma reported.',
          hazardAssessment: {
            floodWaterDepthFeet: 2.0,
            structuralCollapseRisk: 'NONE',
            electricalHazard: false,
            fireRisk: false,
          },
          requiredResources: ['POTABLE_WATER_RATION', 'PEDIATRIC_TRAUMA_KIT', 'SHELTER_EVAC'],
          survivorImmediateInstructions: [
            'Ration current drinking water strictly: 4 oz per child every 2 hours.',
            'Keep children elevated away from standing water at gymnasium entrance.',
            'Conserve flashlight batteries.',
          ],
          responderTacticalBrief: 'Mutual-aid supply truck mission. Deliver bulk water pallets (50 gallons) and infant electrolytes.',
          aiConfidence: 0.92,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T11:58:18Z',
        },
        notes: ['Dry access road still navigable via southern boulevard.'],
      },
      {
        id: 'INC-2026-8828',
        timestamp: '2026-10-14T12:05:12Z',
        reporterName: 'Officer Bradley (Unit 24)',
        phone: '+1-555-911-0024',
        location: {
          lat: 29.9675,
          lng: -90.0780,
          address: 'Intersection of Pine & 14th Ave, Sector Alpha',
          sector: 'SECTOR-ALPHA',
        },
        emergencyType: 'HAZMAT',
        rawDescription: 'Live high-voltage 13.8kV power line snapped by uprooted oak tree. Cable is arcing violently in 2 feet of street floodwater. Water is electrified within a 40-foot radius. Two pedestrians trapped on a concrete porch 25 feet away.',
        vulnerabilities: ['TRAPPED'],
        victimCount: 2,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'RED',
          urgencyScore: 88,
          injurySummary: 'SEVERE ELECTROCUTION HAZARD: High-voltage arcing into standing water adjacent to trapped civilians.',
          hazardAssessment: {
            floodWaterDepthFeet: 2.2,
            structuralCollapseRisk: 'LOW',
            electricalHazard: true,
            fireRisk: true,
          },
          requiredResources: ['HIGH_WATER_4X4', 'DRONE_AERIAL_SCAN'],
          survivorImmediateInstructions: [
            'ABSOLUTE WARNING: DO NOT STEP INTO WATER UNDER ANY CONDITION.',
            'If you feel tingling sensation in feet, keep feet close together and bunny-hop backwards away from the water edge.',
            'Do not touch metal railings or downspouts connected to ground.',
          ],
          responderTacticalBrief: 'Utility grid emergency isolate required before rescue approach. Maintain 50ft perimeter distance.',
          aiConfidence: 0.97,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T12:05:25Z',
        },
        notes: ['Energy company dispatch requested priority emergency feeder trip.'],
      },
    ],
  },
  {
    id: 'SCENARIO_EARTHQUAKE',
    name: 'Cascadia Megathrust: Magnitude 7.2 & Structural Rupture',
    hazardType: 'EARTHQUAKE',
    alertLevel: 'CRITICAL_SURGE',
    locationName: 'Metropolitan Valley & Hill District',
    center: { lat: 45.5152, lng: -122.6784 },
    description: 'Major strike-slip rupture along river faultline. Multiple masonry facade collapses, gas pipeline fires, bridge closures, and telecommunication tower failures across central grid.',
    hazardZones: [
      {
        id: 'HZ-EQ-1',
        name: 'Faultline Rubble Corridor & Gas Rupture Zone',
        type: 'STRUCTURAL_COLLAPSE',
        coordinates: { x: 50, y: 45 },
        geoCoords: { lat: 45.520, lng: -122.670 },
        radiusKm: 4.0,
        severity: 'EXTREME',
      },
    ],
    initialUnits: [
      {
        id: 'UNIT-USAR-01',
        name: 'Urban Search & Extrication Taskforce 1',
        type: 'HEAVY_RESCUE_4X4',
        callSign: 'USAR-ONE',
        location: { lat: 45.510, lng: -122.685, address: 'Central Fire Base' },
        status: 'AVAILABLE',
        capabilities: ['HEAVY_EXTRICATION', 'DRONE_AERIAL_SCAN', 'PARAMEDIC_ADVANCED'],
        personnelCount: 6,
        phone: '+1-555-881-2091',
      },
      {
        id: 'UNIT-MED-02',
        name: 'Trauma Paramedic Unit 2',
        type: 'PARAMEDIC_AMBULANCE',
        callSign: 'MEDIC-2',
        location: { lat: 45.525, lng: -122.665, address: 'Eastbank Field Hospital' },
        status: 'AVAILABLE',
        capabilities: ['PARAMEDIC_ADVANCED', 'PEDIATRIC_TRAUMA_KIT'],
        personnelCount: 3,
        phone: '+1-555-881-3092',
      },
    ],
    initialIncidents: [
      {
        id: 'INC-2026-9011',
        timestamp: '2026-10-14T10:15:00Z',
        reporterName: 'Hannah Vance',
        phone: '+1-555-901-4421',
        location: {
          lat: 45.5180,
          lng: -122.6720,
          address: '890 Brick Plaza, Downtown West',
          sector: 'SECTOR-CENTRAL',
        },
        emergencyType: 'STRUCTURAL_COLLAPSE',
        rawDescription: 'Brick building facade collapsed into street. Snapped utility pole with tangled wires. A shopkeeper is pinned under masonry doorway with leg crush injury. Strong smell of natural gas in the alley.',
        imageUrl: getAssetUrl('samples/earthquake.jpg'),
        vulnerabilities: ['TRAPPED', 'CRUSH_INJURY'],
        victimCount: 2,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'RED',
          urgencyScore: 95,
          injurySummary: 'CRITICAL CRUSH INJURY & GAS LEAK: Survivor pinned under masonry debris. Imminent crush compartment syndrome risk and gas ignition danger.',
          hazardAssessment: {
            structuralCollapseRisk: 'CRITICAL',
            electricalHazard: true,
            fireRisk: true,
          },
          requiredResources: ['HEAVY_EXTRICATION', 'PARAMEDIC_ADVANCED', 'DRONE_AERIAL_SCAN'],
          survivorImmediateInstructions: [
            'NO OPEN FLAMES, matches, or electrical switches.',
            'Do NOT attempt to violently yank pinned leg if heavy beam is resting on it.',
            'Cover face with damp cloth to avoid dust inhalation.',
            'Responders with hydraulic extrication spreaders en route.',
          ],
          responderTacticalBrief: 'Hazmat gas shutoff + hydraulic extrication required. Bring tourniquets and hyperkalemia medication for crush release protocol.',
          aiConfidence: 0.96,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T10:15:15Z',
        },
        notes: ['Gas utility notified of leak in alleyway.'],
      },
    ],
  },
  {
    id: 'SCENARIO_WILDFIRE',
    name: 'Sierra Firestorm: Ridge Crest Inversion & Canyon Evac',
    hazardType: 'WILDFIRE',
    alertLevel: 'CRITICAL_SURGE',
    locationName: 'Foothill Ridge & Ponderosa Canyon',
    center: { lat: 38.5816, lng: -121.4944 },
    description: 'Wind-driven crown fire advancing at 18 mph along southwest ridgeline. Heavy particulate smoke inversion reduced visibility to under 150 feet. Roadblock on Main Canyon Pass.',
    hazardZones: [
      {
        id: 'HZ-WF-1',
        name: 'Ridge Fire Perimeter Line',
        type: 'WILDFIRE',
        coordinates: { x: 55, y: 30 },
        geoCoords: { lat: 38.590, lng: -121.485 },
        radiusKm: 5.0,
        severity: 'EXTREME',
      },
    ],
    initialUnits: [
      {
        id: 'UNIT-WILD-01',
        name: 'Wildland Engine Strike Team 4',
        type: 'HEAVY_RESCUE_4X4',
        callSign: 'BRUSH-4',
        location: { lat: 38.575, lng: -121.500, address: 'Canyon Base Camp' },
        status: 'AVAILABLE',
        capabilities: ['HIGH_WATER_4X4', 'SHELTER_EVAC', 'HEAVY_EXTRICATION'],
        personnelCount: 5,
        phone: '+1-555-772-9011',
      },
    ],
    initialIncidents: [
      {
        id: 'INC-2026-9204',
        timestamp: '2026-10-14T10:30:00Z',
        reporterName: 'Marcus Gable',
        phone: '+1-555-662-1109',
        location: {
          lat: 38.5870,
          lng: -121.4900,
          address: '44 Ridgeview Trail, Ponderosa Valley',
          sector: 'SECTOR-RIDGE',
        },
        emergencyType: 'WILDFIRE',
        rawDescription: 'Dense orange smoke has enveloped our ranch. Downed tree blocking the driveway. Trapped with 4 family members including an asthmatic child coughing violently. We can see flame front through the trees 400 yards away.',
        imageUrl: getAssetUrl('samples/wildfire.jpg'),
        vulnerabilities: ['TRAPPED', 'INFANT_PEDIATRIC'],
        victimCount: 4,
        status: 'PENDING_TRIAGE',
        triage: {
          code: 'RED',
          urgencyScore: 93,
          injurySummary: 'IMMINENT WILDFIRE THREAT: Flame front within 400 yards. Egress blocked by fallen timber. Pediatric smoke inhalation acute distress.',
          hazardAssessment: {
            structuralCollapseRisk: 'LOW',
            electricalHazard: false,
            fireRisk: true,
          },
          requiredResources: ['HIGH_WATER_4X4', 'HEAVY_EXTRICATION', 'PEDIATRIC_TRAUMA_KIT'],
          survivorImmediateInstructions: [
            'Breathe through wet cloths or N95 masks; stay low to the floor inside the center room.',
            'Fill bathtubs and sinks with water immediately.',
            'Keep car headlights and hazard lights on.',
            'Chainsaw-equipped brush engine has been dispatched for driveway clearing.',
          ],
          responderTacticalBrief: 'PRIORITY EXTRICATION: Chainsaw clearance of driveway tree required. Transport pediatric oxygen masks for immediate smoke mitigation.',
          aiConfidence: 0.98,
          aiEngineUsed: 'GEMINI_LIVE',
          triagedAt: '2026-10-14T10:30:20Z',
        },
        notes: ['Advised caller to remain inside until engine arrives.'],
      },
    ],
  },
];

export const StorageService = {
  // Scenarios
  getActiveScenarioId(): string {
    return localStorage.getItem(STORAGE_KEYS.SCENARIO_ID) || PRESET_SCENARIOS[0].id;
  },

  setActiveScenarioId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.SCENARIO_ID, id);
  },

  getScenario(id: string): DisasterScenario {
    return PRESET_SCENARIOS.find((s) => s.id === id) || PRESET_SCENARIOS[0];
  },

  // Incidents
  getIncidents(scenarioId: string): Incident[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS + scenarioId);
    if (!raw) {
      const scenario = this.getScenario(scenarioId);
      this.saveIncidents(scenarioId, scenario.initialIncidents);
      return scenario.initialIncidents;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveIncidents(scenarioId: string, incidents: Incident[]): void {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS + scenarioId, JSON.stringify(incidents));
  },

  addIncident(scenarioId: string, incident: Incident): void {
    const list = this.getIncidents(scenarioId);
    list.unshift(incident);
    this.saveIncidents(scenarioId, list);
  },

  updateIncident(scenarioId: string, updated: Incident): void {
    const list = this.getIncidents(scenarioId);
    const idx = list.findIndex((i) => i.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveIncidents(scenarioId, list);
    }
  },

  // Responder Units
  getUnits(scenarioId: string): ResponderUnit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS + scenarioId);
    if (!raw) {
      const scenario = this.getScenario(scenarioId);
      this.saveUnits(scenarioId, scenario.initialUnits);
      return scenario.initialUnits;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveUnits(scenarioId: string, units: ResponderUnit[]): void {
    localStorage.setItem(STORAGE_KEYS.UNITS + scenarioId, JSON.stringify(units));
  },

  updateUnit(scenarioId: string, updated: ResponderUnit): void {
    const list = this.getUnits(scenarioId);
    const idx = list.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveUnits(scenarioId, list);
    }
  },

  // Settings
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaultSettings: AppSettings = {
      geminiApiKey: (import.meta.env.VITE_GEMINI_API_KEY as string) || '',
      geminiModel: (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.5-flash',
      useOfflineDemoMode: false,
      audioAlertsEnabled: true,
      autoRefreshFeed: true,
    };
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Reset to Factory Seed
  resetScenario(scenarioId: string): void {
    const scenario = this.getScenario(scenarioId);
    this.saveIncidents(scenarioId, scenario.initialIncidents);
    this.saveUnits(scenarioId, scenario.initialUnits);
  },

  // Autonomous Mutual-Aid Matchmaker
  findOptimalUnitsForIncident(
    incident: Incident,
    availableUnits: ResponderUnit[]
  ): Array<{
    unit: ResponderUnit;
    matchScore: number; // 0 to 100
    matchedCapabilities: ResourceNeed[];
    missingCapabilities: ResourceNeed[];
    estimatedDistanceKm: number;
    etaMinutes: number;
    recommendationReason: string;
  }> {
    const requiredSet = new Set(incident.triage.requiredResources);

    const scored = availableUnits.map((unit) => {
      // 1. Calculate rough distance using Haversine formula
      const distKm = calculateHaversineDistance(
        incident.location.lat,
        incident.location.lng,
        unit.location.lat,
        unit.location.lng
      );

      // Estimate ETA (assume average 35 km/h in disaster conditions + 3 min staging)
      const etaMinutes = Math.max(3, Math.round((distKm / 35) * 60) + 3);

      // 2. Capability overlap
      const matched = unit.capabilities.filter((c) => requiredSet.has(c));
      const missing = incident.triage.requiredResources.filter((c) => !unit.capabilities.includes(c));

      let capabilityScore = 0;
      if (incident.triage.requiredResources.length > 0) {
        capabilityScore = (matched.length / incident.triage.requiredResources.length) * 60;
      } else {
        capabilityScore = 40;
      }

      // 3. Proximity score (closer = higher score, max 30 points)
      const proximityScore = Math.max(0, 30 - distKm * 3);

      // 4. Availability score (10 points)
      const availabilityScore = unit.status === 'AVAILABLE' ? 10 : 0;

      const totalScore = Math.round(capabilityScore + proximityScore + availabilityScore);

      let reason = '';
      if (matched.length === incident.triage.requiredResources.length) {
        reason = `Perfect equipment match (${matched.join(', ')}). ETA approx ${etaMinutes} mins.`;
      } else if (matched.length > 0) {
        reason = `Partial match (${matched.join(', ')}). Distance: ${distKm.toFixed(1)} km.`;
      } else {
        reason = `Proximity standby unit (${distKm.toFixed(1)} km).`;
      }

      return {
        unit,
        matchScore: Math.min(100, Math.max(5, totalScore)),
        matchedCapabilities: matched,
        missingCapabilities: missing,
        estimatedDistanceKm: Number(distKm.toFixed(1)),
        etaMinutes,
        recommendationReason: reason,
      };
    });

    // Sort by match score descending
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  },
};

// Haversine Distance helper
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
