import React, { useState } from 'react';
import {
  EmergencyType,
  VulnerabilityFlag,
  Incident,
  TriageResult,
  AppSettings,
} from '../types';
import { analyzeEmergencyWithAI } from '../services/aiTriageService';
import { getAssetUrl } from '../utils/assetUtils';
import {
  Radio,
  Camera,
  Mic,
  MapPin,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  X,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface RapidSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (newIncident: Incident) => void;
  settings: AppSettings;
  centerGeo: { lat: number; lng: number };
}

export const RapidSOSModal: React.FC<RapidSOSModalProps> = ({
  isOpen,
  onClose,
  onSubmitIncident,
  settings,
  centerGeo,
}) => {
  if (!isOpen) return null;

  const [reporterName, setReporterName] = useState('Sarah Jenkins');
  const [phone, setPhone] = useState('+1-555-839-2041');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('FLOOD');
  const [description, setDescription] = useState(
    'Water has breached the front porch and is entering our hallway. Trapped on the second floor with my 82-year-old mother who requires refrigerated insulin. Power cut out 20 minutes ago.'
  );
  const [address, setAddress] = useState('512 Riverview Terrace, Sector Alpha');
  const [sector, setSector] = useState('SECTOR-ALPHA');
  const [victimCount, setVictimCount] = useState(2);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<VulnerabilityFlag[]>([
    'ELDERLY',
    'DIABETIC_INSULIN',
    'TRAPPED',
  ]);
  const [selectedImage, setSelectedImage] = useState<string>(() => getAssetUrl('samples/flood.jpg'));
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triagePreview, setTriagePreview] = useState<TriageResult | null>(null);

  // Vulnerability options
  const vulnerabilityOptions: { id: VulnerabilityFlag; label: string }[] = [
    { id: 'ELDERLY', label: 'Elderly (70+)' },
    { id: 'INFANT_PEDIATRIC', label: 'Infant / Pediatric' },
    { id: 'DIABETIC_INSULIN', label: 'Diabetic / Insulin' },
    { id: 'OXYGEN_DEPENDENT', label: 'Oxygen Dependent' },
    { id: 'MOBILITY_IMPAIRED', label: 'Wheelchair / Bedridden' },
    { id: 'TRAPPED', label: 'Trapped / Submerged' },
    { id: 'CRUSH_INJURY', label: 'Crush Trauma' },
    { id: 'HYPOTHERMIA', label: 'Hypothermia / Freezing' },
  ];

  const toggleVulnerability = (flag: VulnerabilityFlag) => {
    setSelectedVulnerabilities((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  // Quick preset loader
  const loadPreset = (preset: 'flood' | 'earthquake' | 'wildfire') => {
    if (preset === 'flood') {
      setEmergencyType('FLOOD');
      setDescription(
        'Water has reached 4.5 feet in our street and is rising through the floorboards. Trapped on second floor with elderly insulin-dependent patient. Need boat rescue before nightfall.'
      );
      setSelectedImage(getAssetUrl('samples/flood.jpg'));
      setSelectedVulnerabilities(['ELDERLY', 'DIABETIC_INSULIN', 'TRAPPED']);
      setVictimCount(3);
      setAddress('344 Bayou Bend Lane, Sector Alpha');
    } else if (preset === 'earthquake') {
      setEmergencyType('STRUCTURAL_COLLAPSE');
      setDescription(
        'Masonry facade sheared off building. Two people trapped under heavy ceiling timbers in shop foyer. We smell strong sulfur/natural gas in the street.'
      );
      setSelectedImage(getAssetUrl('samples/earthquake.jpg'));
      setSelectedVulnerabilities(['TRAPPED', 'CRUSH_INJURY']);
      setVictimCount(2);
      setAddress('710 Metro Plaza Blvd, Sector Central');
    } else if (preset === 'wildfire') {
      setEmergencyType('WILDFIRE');
      setDescription(
        'Dense smoke and falling embers surrounding residential cul-de-sac. Downed fir tree blocking sole exit road. Trapped with 4 people including asthmatic child coughing heavily.'
      );
      setSelectedImage(getAssetUrl('samples/wildfire.jpg'));
      setSelectedVulnerabilities(['TRAPPED', 'INFANT_PEDIATRIC']);
      setVictimCount(4);
      setAddress('18 Canyon Pine Ridge, Sector Foothill');
    }
    setTriagePreview(null);
  };

  // Voice recording simulation
  const handleVoiceSimulate = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const simulatedAudio = `Voice Audio Transcribed: "Help us please, water is up to our waists downstairs, my elderly mom can't walk and we don't have power for her medicine. We're on the balcony at ${address}!"`;
      setVoiceTranscript(simulatedAudio);
      setDescription((prev) => `${prev}\n\n[Transcribed Voice Note]: "${simulatedAudio}"`);
    }, 2400);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setTriagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Triage Engine
  const handleRunAITriage = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);

    try {
      const result = await analyzeEmergencyWithAI({
        description,
        emergencyType,
        vulnerabilities: selectedVulnerabilities,
        victimCount,
        imageBase64: selectedImage.startsWith('data:') ? selectedImage : undefined,
        imageUrl: selectedImage.startsWith('/') ? selectedImage : undefined,
        apiKey: settings.geminiApiKey,
        model: settings.geminiModel,
      });
      setTriagePreview(result);
    } catch (err) {
      console.error('AI Triage failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Incident
  const handleSubmit = async () => {
    let finalTriage = triagePreview;
    if (!finalTriage) {
      setIsAnalyzing(true);
      finalTriage = await analyzeEmergencyWithAI({
        description,
        emergencyType,
        vulnerabilities: selectedVulnerabilities,
        victimCount,
        imageBase64: selectedImage.startsWith('data:') ? selectedImage : undefined,
        imageUrl: selectedImage.startsWith('/') ? selectedImage : undefined,
        apiKey: settings.geminiApiKey,
        model: settings.geminiModel,
      });
      setIsAnalyzing(false);
    }

    // Jitter coordinates slightly around center for realistic map placement
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.06;

    const newIncident: Incident = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      reporterName,
      phone,
      location: {
        lat: Number((centerGeo.lat + latOffset).toFixed(4)),
        lng: Number((centerGeo.lng + lngOffset).toFixed(4)),
        address,
        sector,
      },
      emergencyType,
      rawDescription: description,
      imageUrl: selectedImage,
      audioTranscript: voiceTranscript || undefined,
      vulnerabilities: selectedVulnerabilities,
      victimCount,
      triage: finalTriage,
      status: 'PENDING_TRIAGE',
      notes: [`SOS logged via Rapid Citizen Intake at ${new Date().toLocaleTimeString()}`],
    };

    onSubmitIncident(newIncident);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Radio size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                Rapid Multimodal SOS Intake
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                SALT/START Clinical Protocol • Instant Multimodal Damage Analysis
              </div>
            </div>
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

        {/* Modal Body */}
        <div className="modal-body">
          {/* Quick Demo Presets Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '8px',
            }}
          >
            <Sparkles size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8' }}>
              DEMO PRESETS:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '3px 9px', fontSize: '0.72rem' }}
                onClick={() => loadPreset('flood')}
              >
                🌊 Flash Flood Balcony
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '3px 9px', fontSize: '0.72rem' }}
                onClick={() => loadPreset('earthquake')}
              >
                🏚️ Earthquake Collapse
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '3px 9px', fontSize: '0.72rem' }}
                onClick={() => loadPreset('wildfire')}
              >
                🔥 Wildfire Ridge Trap
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Reporter Name</label>
              <input
                type="text"
                className="form-input"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Phone / Satellite ID</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Emergency Hazard Type</label>
              <select
                className="form-select"
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value as any)}
              >
                <option value="FLOOD">🌊 Urban Flash Flood / Surge</option>
                <option value="STRUCTURAL_COLLAPSE">🏚️ Structural Collapse</option>
                <option value="EARTHQUAKE">🌋 Earthquake Faultline</option>
                <option value="WILDFIRE">🔥 Approaching Wildfire</option>
                <option value="MEDICAL">🚑 Acute Medical Emergency</option>
                <option value="HAZMAT">☣️ HAZMAT / Gas / Electrical Arcing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Victim Count Trapped / At Risk</label>
              <input
                type="number"
                min="1"
                max="50"
                className="form-input"
                value={victimCount}
                onChange={(e) => setVictimCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          {/* Address & Sector */}
          <div className="form-group">
            <label className="form-label">Location Address / Grid Coordinates</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0 12px' }}
                onClick={() => setAddress(`${centerGeo.lat.toFixed(4)}°N, ${Math.abs(centerGeo.lng).toFixed(4)}°W (GPS Locked)`)}
              >
                <MapPin size={14} style={{ color: '#38bdf8' }} />
                <span>GPS Lock</span>
              </button>
            </div>
          </div>

          {/* Description & Voice SOS */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Situation Description / Immediate Hazards</label>
              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  borderColor: isRecordingVoice ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  color: isRecordingVoice ? '#f87171' : '#94a3b8',
                }}
                onClick={handleVoiceSimulate}
                disabled={isRecordingVoice}
              >
                <Mic size={13} style={{ color: isRecordingVoice ? '#ef4444' : '#38bdf8' }} />
                <span>{isRecordingVoice ? 'Transcribing Voice SOS...' : 'Simulate Voice SOS'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe current water height, injuries, structure damage, or trapped individuals..."
            />
          </div>

          {/* Vulnerability Checklist */}
          <div className="form-group">
            <label className="form-label">Vulnerabilities & Critical Dependencies</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px' }}>
              {vulnerabilityOptions.map((opt) => {
                const isChecked = selectedVulnerabilities.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleVulnerability(opt.id)}
                    style={{
                      background: isChecked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isChecked ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isChecked ? '#fbbf24' : '#94a3b8',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{isChecked ? '☑' : '☐'}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Damage Upload & Visual Inspector */}
          <div className="form-group">
            <label className="form-label">Visual Damage Evidence (Camera / Photo Upload)</label>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Image Preview Card */}
              {selectedImage && (
                <div
                  style={{
                    position: 'relative',
                    width: '180px',
                    height: '110px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Disaster Scene"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '4px 6px',
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700 }}>
                      VISION ANALYZER READY
                    </span>
                  </div>
                </div>
              )}

              {/* Upload & Sample Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label
                    className="btn btn-secondary"
                    style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    <Upload size={14} />
                    <span>Upload Device Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                    onClick={() => setSelectedImage(getAssetUrl('samples/flood.jpg'))}
                  >
                    Flood Sample
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                    onClick={() => setSelectedImage(getAssetUrl('samples/earthquake.jpg'))}
                  >
                    Quake Sample
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Gemini Vision analyzes water depth, structural fissures, and fire proximity from imagery.
                </span>
              </div>
            </div>
          </div>

          {/* Live AI Pre-Check Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '10px',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38bdf8',
                fontWeight: 700,
              }}
              onClick={handleRunAITriage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={16} className="radar-spinner" />
                  <span>Evaluating Clinical Triage via Gemini / SALT Protocol...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>PRE-EVALUATE AI TRIAGE SCORE & RESOURCE REQUIREMENTS</span>
                </>
              )}
            </button>
          </div>

          {/* AI Pre-Check Results Card */}
          {triagePreview && (
            <div
              className="glass-panel-elevated"
              style={{
                padding: '14px',
                border: `1px solid ${
                  triagePreview.code === 'RED'
                    ? '#ef4444'
                    : triagePreview.code === 'YELLOW'
                    ? '#f59e0b'
                    : '#10b981'
                }`,
                background: 'rgba(14, 19, 31, 0.95)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`badge badge-${triagePreview.code.toLowerCase()}`}
                  >
                    {triagePreview.code === 'RED' ? <ShieldAlert size={12} /> : <AlertTriangle size={12} />}
                    CODE {triagePreview.code} • URGENCY {triagePreview.urgencyScore}/100
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
                    Engine: {triagePreview.aiEngineUsed} (Confidence {(triagePreview.aiConfidence * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#f8fafc', marginBottom: '8px' }}>
                {triagePreview.injurySummary}
              </div>

              {/* Inferred Resources */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginRight: '4px' }}>DEDUCED ASSETS:</span>
                {triagePreview.requiredResources.map((res) => (
                  <span
                    key={res}
                    className="font-mono"
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                    }}
                  >
                    {res}
                  </span>
                ))}
              </div>

              {/* Survival Instructions Preview */}
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                <strong>Immediate Survival Directive:</strong> {triagePreview.survivorImmediateInstructions[0]}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary-sos"
            onClick={handleSubmit}
            disabled={isAnalyzing}
            id="btn-submit-sos-confirm"
          >
            <Radio size={16} />
            <span>CONFIRM & TRANSMIT TO DISPATCH GRID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
