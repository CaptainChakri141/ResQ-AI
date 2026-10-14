export type TriageCode = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

export type IncidentStatus = 
  | 'PENDING_TRIAGE'
  | 'TRIAGED'
  | 'DISPATCHED'
  | 'ON_SCENE'
  | 'RESOLVED';

export type EmergencyType = 
  | 'FLOOD' 
  | 'EARTHQUAKE' 
  | 'WILDFIRE' 
  | 'MEDICAL' 
  | 'STRUCTURAL_COLLAPSE' 
  | 'HAZMAT';

export type VulnerabilityFlag = 
  | 'ELDERLY'
  | 'INFANT_PEDIATRIC'
  | 'DIABETIC_INSULIN'
  | 'OXYGEN_DEPENDENT'
  | 'MOBILITY_IMPAIRED'
  | 'TRAPPED'
  | 'CRUSH_INJURY'
  | 'HYPOTHERMIA';

export type ResourceNeed = 
  | 'SWIFT_WATER_BOAT'
  | 'HIGH_WATER_4X4'
  | 'OXYGEN_CONCENTRATOR'
  | 'INSULIN_COLD_PACK'
  | 'PEDIATRIC_TRAUMA_KIT'
  | 'HEAVY_EXTRICATION'
  | 'POTABLE_WATER_RATION'
  | 'GENERATOR_POWER'
  | 'SHELTER_EVAC'
  | 'PARAMEDIC_ADVANCED'
  | 'DRONE_AERIAL_SCAN';

export interface HazardAssessment {
  floodWaterDepthFeet?: number;
  structuralCollapseRisk: 'NONE' | 'LOW' | 'MODERATE' | 'CRITICAL';
  electricalHazard: boolean;
  fireRisk: boolean;
}

export interface TriageResult {
  code: TriageCode;
  urgencyScore: number; // 0 to 100
  injurySummary: string;
  hazardAssessment: HazardAssessment;
  requiredResources: ResourceNeed[];
  survivorImmediateInstructions: string[];
  responderTacticalBrief: string;
  aiConfidence: number; // 0.0 to 1.0
  aiEngineUsed: 'GEMINI_LIVE' | 'CLINICAL_HEURISTICS';
  triagedAt: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  reporterName: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  emergencyType: EmergencyType;
  rawDescription: string;
  imageUrl?: string;
  imageFileName?: string;
  audioTranscript?: string;
  vulnerabilities: VulnerabilityFlag[];
  victimCount: number;
  triage: TriageResult;
  status: IncidentStatus;
  assignedUnit?: {
    unitId: string;
    unitName: string;
    unitType: string;
    dispatchedAt: string;
    etaMinutes: number;
  };
  notes: string[];
}

export type ResponderType = 
  | 'SWIFT_WATER_CREW'
  | 'PARAMEDIC_AMBULANCE'
  | 'HEAVY_RESCUE_4X4'
  | 'COMMUNITY_VOLUNTEER'
  | 'AIR_RECON_DRONE';

export interface ResponderUnit {
  id: string;
  name: string;
  type: ResponderType;
  callSign: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'RESTOCKING';
  capabilities: ResourceNeed[];
  personnelCount: number;
  currentIncidentId?: string;
  phone: string;
}

export interface HazardZone {
  id: string;
  name: string;
  type: EmergencyType;
  coordinates: { x: number; y: number }; // normalized 0-100 for visual GIS map
  geoCoords: { lat: number; lng: number };
  radiusKm: number;
  severity: 'EXTREME' | 'HIGH' | 'MODERATE';
}

export interface DisasterScenario {
  id: string;
  name: string;
  hazardType: EmergencyType;
  alertLevel: 'CRITICAL_SURGE' | 'ELEVATED' | 'CONTAINED';
  locationName: string;
  center: { lat: number; lng: number };
  description: string;
  hazardZones: HazardZone[];
  initialIncidents: Incident[];
  initialUnits: ResponderUnit[];
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  useOfflineDemoMode: boolean;
  audioAlertsEnabled: boolean;
  autoRefreshFeed: boolean;
}
