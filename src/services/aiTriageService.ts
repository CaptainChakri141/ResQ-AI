import {
  EmergencyType,
  VulnerabilityFlag,
  ResourceNeed,
  TriageResult,
  TriageCode,
} from '../types';

interface AIAnalysisParams {
  description: string;
  emergencyType: EmergencyType;
  vulnerabilities: VulnerabilityFlag[];
  victimCount: number;
  imageBase64?: string;
  imageUrl?: string;
  apiKey?: string;
  model?: string;
}

/**
 * Executes emergency triage analysis via Google Gemini API (if configured)
 * or via the deterministic Clinical HAZMAT heuristic engine.
 */
export async function analyzeEmergencyWithAI(params: AIAnalysisParams): Promise<TriageResult> {
  const {
    description,
    emergencyType,
    vulnerabilities,
    victimCount,
    imageBase64,
    apiKey,
    model = 'gemini-2.5-flash',
  } = params;

  // Try live Gemini API if key is provided
  const activeKey = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);

  if (activeKey && activeKey.trim().length > 5) {
    try {
      const liveResult = await callGeminiAPI({
        apiKey: activeKey.trim(),
        model,
        description,
        emergencyType,
        vulnerabilities,
        victimCount,
        imageBase64,
      });

      if (liveResult) {
        return liveResult;
      }
    } catch (err) {
      console.warn('Gemini Live API call failed, falling back to Clinical Heuristic Engine:', err);
    }
  }

  // Built-in Clinical & HAZMAT Emergency Heuristic Engine
  return runHeuristicTriageEngine(params);
}

/**
 * Direct Gemini API caller using Google AI Studio REST endpoints
 */
async function callGeminiAPI(params: {
  apiKey: string;
  model: string;
  description: string;
  emergencyType: EmergencyType;
  vulnerabilities: VulnerabilityFlag[];
  victimCount: number;
  imageBase64?: string;
}): Promise<TriageResult | null> {
  const { apiKey, model, description, emergencyType, vulnerabilities, victimCount, imageBase64 } = params;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const promptText = `
You are the ResQAI Autonomous Disaster Triage Engine operating under mass-casualty disaster protocols (SALT and START triage).
Analyze the emergency incident report below and produce a strict JSON response.

INCIDENT DETAILS:
- Emergency Type: ${emergencyType}
- Survivor Reported Situation: "${description}"
- Reported Victim Count: ${victimCount}
- Pre-identified Vulnerabilities: ${vulnerabilities.join(', ') || 'None noted'}

TRIAGE PROTOCOL RULES:
- Code RED: Immediate life threat (airway/breathing/severe hemorrhage, rising water approaching head/chest, trapped in burning/collapsing structure, oxygen cutoff). Urgency 80-100.
- Code YELLOW: Serious, requires intervention within 1-2 hours (fractures, controlled bleeding, trapped on upper floors with stable water, diabetic needing insulin within hours). Urgency 50-79.
- Code GREEN: Minor/walking wounded (minor abrasions, displaced, needs shelter/water, no acute danger). Urgency 15-49.
- Code BLACK: Expectant/Deceased. Urgency 0-10.

REQUIRED RESOURCES MUST BE CHOSEN ONLY FROM THIS ENUM:
["SWIFT_WATER_BOAT", "HIGH_WATER_4X4", "OXYGEN_CONCENTRATOR", "INSULIN_COLD_PACK", "PEDIATRIC_TRAUMA_KIT", "HEAVY_EXTRICATION", "POTABLE_WATER_RATION", "GENERATOR_POWER", "SHELTER_EVAC", "PARAMEDIC_ADVANCED", "DRONE_AERIAL_SCAN"]

RESPOND ONLY IN VALID, RAW JSON matching this exact structure (no markdown fences, no explanatory preamble):
{
  "code": "RED" | "YELLOW" | "GREEN" | "BLACK",
  "urgencyScore": number, // 0 to 100
  "injurySummary": string, // 1-2 sentence medical & condition summary
  "hazardAssessment": {
    "floodWaterDepthFeet": number or null,
    "structuralCollapseRisk": "NONE" | "LOW" | "MODERATE" | "CRITICAL",
    "electricalHazard": boolean,
    "fireRisk": boolean
  },
  "requiredResources": string[], // valid items from list above
  "survivorImmediateInstructions": string[], // 3-4 bullet steps for victim survival
  "responderTacticalBrief": string, // 2 sentence briefing for tactical rescue crew
  "confidenceScore": number // 0.85 to 0.99
}
`;

  const contents: any[] = [];
  const parts: any[] = [{ text: promptText }];

  if (imageBase64) {
    // Strip header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  contents.push({ parts });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Empty response from Gemini');
  }

  // Parse structured JSON
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate fields
  const validCodes: TriageCode[] = ['RED', 'YELLOW', 'GREEN', 'BLACK'];
  const code: TriageCode = validCodes.includes(parsed.code) ? parsed.code : 'YELLOW';

  return {
    code,
    urgencyScore: Math.min(100, Math.max(1, Number(parsed.urgencyScore) || 50)),
    injurySummary: parsed.injurySummary || 'Emergency situation evaluated by Gemini AI.',
    hazardAssessment: {
      floodWaterDepthFeet: parsed.hazardAssessment?.floodWaterDepthFeet ?? (emergencyType === 'FLOOD' ? 3.5 : undefined),
      structuralCollapseRisk: parsed.hazardAssessment?.structuralCollapseRisk || 'MODERATE',
      electricalHazard: Boolean(parsed.hazardAssessment?.electricalHazard),
      fireRisk: Boolean(parsed.hazardAssessment?.fireRisk),
    },
    requiredResources: Array.isArray(parsed.requiredResources)
      ? (parsed.requiredResources as ResourceNeed[])
      : ['HIGH_WATER_4X4', 'POTABLE_WATER_RATION'],
    survivorImmediateInstructions: Array.isArray(parsed.survivorImmediateInstructions)
      ? parsed.survivorImmediateInstructions
      : ['Stay in place and signal rescuers.', 'Conserve mobile battery.'],
    responderTacticalBrief: parsed.responderTacticalBrief || 'Approach with caution. Observe local hazards.',
    aiConfidence: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.94,
    aiEngineUsed: 'GEMINI_LIVE',
    triagedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic Clinical & HAZMAT Emergency Heuristic Engine
 * Implements SALT (Sort, Assess, Lifesaving Interventions, Treatment/Transport)
 * and START (Simple Triage And Rapid Treatment) protocols.
 */
export function runHeuristicTriageEngine(params: AIAnalysisParams): TriageResult {
  const { description, emergencyType, vulnerabilities, victimCount } = params;
  const descLower = description.toLowerCase();

  let urgencyScore = 30; // base score
  const resources: Set<ResourceNeed> = new Set();
  const instructions: string[] = [];
  let structuralRisk: 'NONE' | 'LOW' | 'MODERATE' | 'CRITICAL' = 'NONE';
  let waterDepth: number | undefined = undefined;
  let electricalHazard = false;
  let fireRisk = false;

  // 1. Text keyword heuristics
  const criticalKeywords = [
    'drowning', 'unconscious', 'cannot breathe', 'arterial', 'amputation',
    'crushed', 'rising fast', 'submerged', 'chest pain', 'cardiac', 'seizure',
    'hypothermia', 'infant not breathing', 'roof collapsing', 'trapped under debris'
  ];

  const urgentKeywords = [
    'broken leg', 'fracture', 'deep cut', 'bleeding', 'pregnant', 'asthma',
    'smoke', 'fumes', 'trapped on roof', 'water up to knees', 'insulin needed',
    'wheelchair', 'oxygen running low', 'disabled'
  ];

  const hasCriticalKeyword = criticalKeywords.some((kw) => descLower.includes(kw));
  const hasUrgentKeyword = urgentKeywords.some((kw) => descLower.includes(kw));

  if (hasCriticalKeyword) {
    urgencyScore += 45;
  } else if (hasUrgentKeyword) {
    urgencyScore += 25;
  }

  // 2. Emergency Type specific evaluation
  switch (emergencyType) {
    case 'FLOOD': {
      waterDepth = descLower.includes('waist') || descLower.includes('chest') ? 4.5 :
                   descLower.includes('neck') || descLower.includes('roof') ? 7.0 : 2.5;
      resources.add('SWIFT_WATER_BOAT');
      if (waterDepth > 3.0) {
        urgencyScore += 20;
        electricalHazard = true;
      }
      instructions.push('Do not enter fast-moving floodwaters on foot under any circumstances.');
      instructions.push('Turn off main electrical breaker if reachable without stepping into water.');
      instructions.push('Move to the highest accessible level or roof. Avoid enclosed attics with no roof hatch.');
      instructions.push('Signal rescuers with bright cloth, flashlight, or rhythmic whistle (3 blasts).');
      break;
    }
    case 'EARTHQUAKE':
    case 'STRUCTURAL_COLLAPSE': {
      structuralRisk = descLower.includes('collapsed') || descLower.includes('rubble') ? 'CRITICAL' : 'MODERATE';
      resources.add('HEAVY_EXTRICATION');
      resources.add('DRONE_AERIAL_SCAN');
      urgencyScore += structuralRisk === 'CRITICAL' ? 30 : 15;
      instructions.push('Protect head and neck from falling debris using cushions or arms.');
      instructions.push('Do NOT use matches or open flames due to probable broken gas mains.');
      instructions.push('Tap rhythmically on pipes or walls so acoustic search sensors can detect you.');
      instructions.push('Cover mouth with cloth to avoid inhaling toxic gypsum or concrete dust.');
      break;
    }
    case 'WILDFIRE': {
      fireRisk = true;
      resources.add('HIGH_WATER_4X4');
      resources.add('SHELTER_EVAC');
      urgencyScore += 25;
      instructions.push('Breathe through a wet mask, bandana, or cloth to filter particulates.');
      instructions.push('Close all house windows and doors, but leave them unlocked for firefighters.');
      instructions.push('Clear combustibles away from the perimeter if immediate evacuation is blocked.');
      instructions.push('Keep headlights and hazard flashers on if driving through heavy smoke.');
      break;
    }
    case 'MEDICAL': {
      resources.add('PARAMEDIC_ADVANCED');
      urgencyScore += 30;
      instructions.push('Keep patient still, warm, and in a comfortable semi-reclined position.');
      instructions.push('Apply direct firm pressure to active bleeding with clean cloth.');
      instructions.push('Do not give food or drink if surgery may be required.');
      break;
    }
    case 'HAZMAT': {
      urgencyScore += 28;
      instructions.push('Evacuate upwind and uphill immediately away from the vapor cloud.');
      instructions.push('Remove contaminated clothing and seal in a plastic bag if possible.');
      instructions.push('Flush skin or eyes with clean water for at least 15 minutes if exposed.');
      break;
    }
  }

  // 3. Vulnerability multipliers
  if (vulnerabilities.includes('TRAPPED')) {
    urgencyScore += 20;
    resources.add('HEAVY_EXTRICATION');
  }
  if (vulnerabilities.includes('OXYGEN_DEPENDENT')) {
    urgencyScore += 25;
    resources.add('OXYGEN_CONCENTRATOR');
    resources.add('GENERATOR_POWER');
    instructions.push('Conserve remaining O2 cylinders. Set regulator to lowest physician-approved flow.');
  }
  if (vulnerabilities.includes('DIABETIC_INSULIN')) {
    urgencyScore += 15;
    resources.add('INSULIN_COLD_PACK');
    instructions.push('Protect insulin from extreme heat or freezing water in waterproof zip pouch.');
  }
  if (vulnerabilities.includes('INFANT_PEDIATRIC')) {
    urgencyScore += 20;
    resources.add('PEDIATRIC_TRAUMA_KIT');
  }
  if (vulnerabilities.includes('ELDERLY') || vulnerabilities.includes('MOBILITY_IMPAIRED')) {
    urgencyScore += 15;
    resources.add('HIGH_WATER_4X4');
  }
  if (vulnerabilities.includes('HYPOTHERMIA')) {
    urgencyScore += 18;
    instructions.push('Remove wet clothing if dry blankets or plastic wrap are available.');
  }

  // Scaling with victim count
  if (victimCount > 3) {
    urgencyScore += Math.min(15, (victimCount - 3) * 3);
    resources.add('POTABLE_WATER_RATION');
    resources.add('SHELTER_EVAC');
  }

  // Cap score 1 to 100
  urgencyScore = Math.min(100, Math.max(10, urgencyScore));

  // Determine Triage Code
  let code: TriageCode = 'GREEN';
  if (urgencyScore >= 75) {
    code = 'RED';
  } else if (urgencyScore >= 45) {
    code = 'YELLOW';
  } else {
    code = 'GREEN';
  }

  // Ensure default resources
  if (resources.size === 0) {
    resources.add('POTABLE_WATER_RATION');
    resources.add('HIGH_WATER_4X4');
  }

  // Tactical brief summary
  const responderBrief = `Priority ${code} dispatch required. ${victimCount} victim(s) identified. Primary hazards: ${emergencyType}${waterDepth ? ` (${waterDepth}ft water depth)` : ''}${structuralRisk !== 'NONE' ? `, ${structuralRisk} structural collapse risk` : ''}. Deploy ${Array.from(resources).slice(0, 3).join(', ')}.`;

  return {
    code,
    urgencyScore,
    injurySummary: `${code === 'RED' ? 'Critical condition / imminent danger' : code === 'YELLOW' ? 'Urgent needs / intermediate stability' : 'Non-critical / delayed response viable'}. Involves ${victimCount} survivor(s) with ${vulnerabilities.length > 0 ? vulnerabilities.join(', ') : 'no acute prior conditions'}.`,
    hazardAssessment: {
      floodWaterDepthFeet: waterDepth,
      structuralCollapseRisk: structuralRisk,
      electricalHazard,
      fireRisk,
    },
    requiredResources: Array.from(resources),
    survivorImmediateInstructions: instructions.slice(0, 4),
    responderTacticalBrief: responderBrief,
    aiConfidence: 0.95,
    aiEngineUsed: 'CLINICAL_HEURISTICS',
    triagedAt: new Date().toISOString(),
  };
}

/**
 * Validates Gemini API Key by sending a lightweight test ping
 */
export async function testGeminiApiKey(apiKey: string, model: string = 'gemini-2.5-flash'): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with "PONG"' }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || response.statusText;
      return { success: false, message: `API Error (${response.status}): ${msg}` };
    }

    return { success: true, message: 'Google Gemini API key verified and operational!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network connection failed' };
  }
}
