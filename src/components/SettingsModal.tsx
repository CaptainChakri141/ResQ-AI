import React, { useState } from 'react';
import { AppSettings } from '../types';
import { testGeminiApiKey } from '../services/aiTriageService';
import {
  Sliders,
  Sparkles,
  Key,
  Radio,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData,
}) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.geminiModel || 'gemini-2.5-flash');
  const [offlineMode, setOfflineMode] = useState(settings.useOfflineDemoMode);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setTestingKey(true);
    setTestResult(null);

    const res = await testGeminiApiKey(apiKey.trim(), model);
    setTestingKey(false);
    setTestResult(res);
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      geminiModel: model,
      useOfflineDemoMode: offlineMode,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                ResQAI System & AI Settings
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Configure Google AI Studio Gemini API and Offline Resilience Engine
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
        <div className="modal-body">
          {/* Gemini API Key */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} style={{ color: '#38bdf8' }} />
                <span>Google AI Studio Gemini API Key</span>
              </label>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'none' }}
              >
                Get Free Gemini API Key ↗
              </a>
            </div>

            <input
              type="password"
              placeholder="AIzaSy..."
              className="form-input"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              id="input-gemini-key"
            />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Stored strictly in your local browser storage. Never sent to any 3rd-party servers.
            </span>
          </div>

          {/* Model Selector & Test Button */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Gemini Model</label>
              <select
                className="form-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Low Latency & Vision)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (High Throughput)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Clinical Reasoning)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleTestKey}
              disabled={testingKey}
              style={{ padding: '10px 14px', fontSize: '0.8rem' }}
            >
              {testingKey ? (
                <>
                  <RefreshCw size={14} className="radar-spinner" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} style={{ color: '#38bdf8' }} />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
                color: testResult.success ? '#34d399' : '#f87171',
              }}
            >
              {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Offline Demo Mode Toggle */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                Built-in Clinical HAZMAT Heuristic Engine
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                Guarantees 100% operation without internet or Gemini credentials using SALT/START protocols.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '4px 12px',
                fontSize: '0.74rem',
                background: offlineMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: offlineMode ? '#34d399' : '#94a3b8',
                borderColor: offlineMode ? '#10b981' : 'rgba(255,255,255,0.1)',
              }}
              onClick={() => setOfflineMode(!offlineMode)}
            >
              {offlineMode ? 'FORCED ON' : 'AUTO-FAILOVER'}
            </button>
          </div>

          {/* Reset All Data */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                Reset Workspace Data
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Restores original pre-seeded disaster incidents and response fleet.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => {
                if (window.confirm('Reset all disaster incidents and fleet data to factory state?')) {
                  onResetAllData();
                  onClose();
                }
              }}
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-cyan" onClick={handleSave} id="btn-save-settings">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
