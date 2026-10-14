# ResQAI — System Architecture & Technical Design

## 1. High-Level Architecture Overview

ResQAI is architected as a high-reliability, low-latency, disaster-resilient client-side and edge application capable of operating in degraded network conditions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ResQAI Client Application                       │
│                                                                        │
│  ┌───────────────────────┐   ┌───────────────────────────────────────┐  │
│  │   Citizen SOS Portal  │   │     Incident Command GIS Center       │  │
│  │  - Multimodal Upload  │   │  - Tactical Geo-Map (Leaflet/Canvas)  │  │
│  │  - Voice / SOS Intake │   │  - Live Incident Feed & Triage Filter │  │
│  │  - Survivor Guidance  │   │  - Autonomous Dispatch Matchmaker     │  │
│  └───────────┬───────────┘   └───────────────────▲───────────────────┘  │
│              │                                   │                      │
│              ▼                                   │                      │
│  ┌───────────────────────────────────────────────┴───────────────────┐  │
│  │               Central ResQAI State & Storage Engine               │  │
│  │     (IndexedDB / LocalStorage / Reactive Context & Events)        │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │                                  │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              Gemini Multimodal AI & Triage Pipeline               │  │
│  │                                                                   │  │
│  │   ┌───────────────────────────┐   ┌───────────────────────────┐   │  │
│  │   │  Gemini Flash 2.0 / Pro   │   │ Emergency Medical & HAZMAT│   │  │
│  │   │  Live API (Vision + NLP)  │   │ Heuristic Fallback Engine │   │  │
│  │   └─────────────┬─────────────┘   └─────────────┬─────────────┘   │  │
│  │                 └──────────────┬────────────────┘                 │  │
│  │                                ▼                                  │  │
│  │             Structured JSON Response Validator & Sanitizer        │  │
│  └───────────────────────────────────┬───────────────────────────────┘  │
│                                      │                                  │
│                                      ▼                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │             Autonomous Dispatch & Resource Matcher                │  │
│  │    (Proximity Scoring, Asset Capability, Multi-Criteria Triage)   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Hierarchy

- **`App.tsx`**: Top-level router and layout shell with global status alerts, navigation tabs (Command Map, Incident Feed, SOS Intake, Dispatch Missions, Simulation Studio, System Settings), and real-time telemetry ticker.
- **`components/`**:
  - **`Navbar.tsx`**: Status indicator (Network Status, Live Gemini API vs Offline Mode, Emergency Alert Level, Disaster Scenario Switcher).
  - **`CommandMap.tsx`**: Tactical GIS geospatial map visualization with dynamic pin clustering, hazard radius zones (flood/fire/collapse), unit location vectors, and click-to-inspect drawers.
  - **`IncidentFeed.tsx`**: Real-time sorting and filtering by Triage Code (Red, Yellow, Green, Black), status (Pending, Assigned, In Transit, Resolved), and search query.
  - **`SOSModal.tsx` / `RapidIntake.tsx`**: Multimodal submission modal with drag-and-drop image damage analyzer, simulated voice speech-to-text, medical vulnerability toggles, and instant AI triage score preview.
  - **`TriageDetailModal.tsx`**: Deep-dive triage inspector showing computer vision damage metrics (water depth, structural collapse score, electrical risk), extracted equipment needs, and AI reasoning chain.
  - **`DispatchMatchmaker.tsx`**: Autonomous matching engine ranking closest volunteer/first-responder teams to critical incidents with distance, ETA, equipment fit, and mission dispatch action.
  - **`SurvivorAdvisorModal.tsx`**: Tailored emergency safety protocol view for victims (step-by-step CPR, flood isolation, smoke mitigation, clean water methods).
  - **`SimulationStudio.tsx`**: Emergency scenario launcher to instantly stress-test the triage engine with 15+ concurrent mass-casualty incidents across distinct catastrophe profiles.
  - **`SettingsModal.tsx`**: Allows users to enter their Google Gemini API Key directly, choose Gemini model (`gemini-2.5-flash`, `gemini-1.5-flash`, etc.), toggle demo mode, or reset dataset.

---

## 3. AI Triage Pipeline Specification

### Model Prompting Architecture
The system uses structured few-shot multimodal prompting designed for zero hallucination in emergency triage:

```typescript
interface TriageAIResponse {
  triageCode: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  urgencyScore: number; // 0 - 100
  injurySummary: string;
  hazardAssessment: {
    floodWaterDepthFeet?: number;
    structuralCollapseRisk: 'NONE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    electricalHazard: boolean;
    fireRisk: boolean;
  };
  requiredResources: string[]; // e.g. ["SWIFT_WATER_BOAT", "OXYGEN_CONCENTRATOR"]
  survivorImmediateInstructions: string[];
  responderTacticalBrief: string;
  confidenceScore: number; // 0.0 - 1.0
}
```

### Fallback Deterministic Engine
In the absence of an active Gemini API key or upon network failure during a hurricane/storm, ResQAI triggers a specialized clinical heuristic analyzer that evaluates:
1. Keyword regex scanning for life threats (e.g., "drowning", "unconscious", "arterial bleed", "infant", "crushed", "rising water", "insulin", "chest pain").
2. Photographic metadata and contextual image classifier simulation.
3. Geo-spatial vulnerability mapping (proximity to river banks, fault lines, or fire perimeters).

---

## 4. Security & Privacy Guarantees

1. **No Frontend Secret Leaks:** No hardcoded API keys exist in the repository or bundle. The user can optionally input their Gemini API Key via secure browser LocalStorage or environment variables (`VITE_GEMINI_API_KEY`).
2. **Victim Anonymity:** Public-facing dashboard masks exact citizen phone numbers and replaces personal names with anonymized tactical IDs (e.g. `SURVIVOR-7049`) unless authorized dispatch credentials are authenticated.
3. **Audit Trail:** Every triage adjustment made by human dispatchers is logged with timestamps to preserve medical-legal compliance.
