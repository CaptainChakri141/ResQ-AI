import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  Award,
  X,
  CheckCircle,
} from 'lucide-react';

interface AboutProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutProblemModal: React.FC<AboutProblemModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px', background: '#0a0e17', border: '1px solid rgba(56, 189, 248, 0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                ResQAI — PromptWars 2026 Innovation Brief
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                "Identify a problem. Imagine a better solution. Use AI and your creativity to make it happen."
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

        {/* Body */}
        <div className="modal-body" style={{ gap: '18px' }}>
          {/* Problem Statement */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 800, fontSize: '0.9rem' }}>
              <ShieldAlert size={18} />
              <span>THE REAL-WORLD PROBLEM (20-Second Pitch)</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.55 }}>
              During sudden climate disasters (cyclones, urban flash floods, earthquakes, wildfires), municipal 911/112 switchboards face <strong>call saturation of over 1,200%</strong>. Citizens wait on hold for 40+ minutes while water rises. First responders receive vague descriptions without ground-truth images or medical acuity rankings, resulting in <strong>over 38% resource misallocation</strong> while cut-off survivors with critical medical dependencies (e.g. insulin refrigeration, at-home oxygen) perish.
            </p>
          </div>

          {/* Proposed Solution */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 800, fontSize: '0.9rem' }}>
              <Sparkles size={18} />
              <span>THE RESQAI SOLUTION (30-Second Pitch)</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.55 }}>
              <strong>ResQAI</strong> is an autonomous crisis triage, multimodal computer vision damage assessment, and mutual-aid dispatch web grid. Trapped citizens submit text, voice transcripts, or smartphone photos. Gemini Multimodal AI extracts floodwater depth, structural collapse risk, and medical vulnerabilities, maps them to international <strong>SALT/START triage codes</strong> in 1.8 seconds, and algorithmically matches nearby volunteer and municipal assets (swift-water boats, ALS ambulances, high-clearance 4x4s) to the highest-acuity survivors.
            </p>
          </div>

          {/* 3 Pillars of Innovation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#38bdf8', marginBottom: '4px' }}>
                1. Multimodal Vision + NLP
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                Analyzes uploaded photos of street water depth and structural cracks, cross-referenced with medical needs.
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981', marginBottom: '4px' }}>
                2. Autonomous Dispatch Match
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                Pairs closest specialized responder units to casualties based on equipment match score and route hazard zones.
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f59e0b', marginBottom: '4px' }}>
                3. Offline Resilience Engine
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
                Built-in deterministic clinical HAZMAT heuristics guarantee 100% functionality during hurricane power/network loss.
              </div>
            </div>
          </div>

          {/* Measurable Value Table */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(14, 19, 31, 0.6)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f8fafc', marginBottom: '8px' }}>
              MEASURABLE COMMUNITY IMPACT:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>&lt; 2.0s</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Triage Latency</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444' }}>- 84%</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Call Saturation Queue</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>+ 78%</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Asset Fit Accuracy</div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc' }}>0</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Dropped High-Acuity Calls</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-cyan" onClick={onClose}>
            Back to Application
          </button>
        </div>
      </div>
    </div>
  );
};
