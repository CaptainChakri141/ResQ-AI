import React, { useState } from 'react';
import {
  Incident,
  TriageCode,
} from '../types';
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Truck,
  HeartHandshake,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  Check,
} from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onDispatchIncident: (incident: Incident) => void;
  onOpenSurvivorGuide: (incident: Incident) => void;
  onToggleResolve: (incident: Incident) => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  onSelectIncident,
  onDispatchIncident,
  onOpenSurvivorGuide,
  onToggleResolve,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<TriageCode | 'ALL' | 'DISPATCHED' | 'RESOLVED'>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCY' | 'NEWEST' | 'VICTIMS'>('URGENCY');

  // Filter & Search Logic
  const filtered = incidents.filter((inc) => {
    // Severity or Status filter
    if (severityFilter === 'RED' && inc.triage.code !== 'RED') return false;
    if (severityFilter === 'YELLOW' && inc.triage.code !== 'YELLOW') return false;
    if (severityFilter === 'GREEN' && inc.triage.code !== 'GREEN') return false;
    if (severityFilter === 'DISPATCHED' && inc.status !== 'DISPATCHED') return false;
    if (severityFilter === 'RESOLVED' && inc.status !== 'RESOLVED') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = inc.id.toLowerCase().includes(q);
      const matchAddress = inc.location.address.toLowerCase().includes(q);
      const matchDesc = inc.rawDescription.toLowerCase().includes(q);
      const matchReporter = inc.reporterName.toLowerCase().includes(q);
      const matchResources = inc.triage.requiredResources.some((r) => r.toLowerCase().includes(q));
      if (!matchId && !matchAddress && !matchDesc && !matchReporter && !matchResources) {
        return false;
      }
    }

    return true;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (sortBy === 'URGENCY') {
      return b.triage.urgencyScore - a.triage.urgencyScore;
    }
    if (sortBy === 'VICTIMS') {
      return b.victimCount - a.victimCount;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const getTriageColor = (code: TriageCode) => {
    switch (code) {
      case 'RED': return '#ef4444';
      case 'YELLOW': return '#f59e0b';
      case 'GREEN': return '#10b981';
      case 'BLACK': return '#64748b';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden',
      }}
    >
      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(8, 11, 17, 0.75)',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by address, ID, symptoms, resources..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '34px', width: '100%', fontSize: '0.82rem' }}
              id="search-incidents-input"
            />
          </div>

          {/* Sort Selector */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ fontSize: '0.78rem', padding: '8px 12px' }}
          >
            <option value="URGENCY">Urgency (Highest First)</option>
            <option value="NEWEST">Newest First</option>
            <option value="VICTIMS">Most Victims First</option>
          </select>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: '4px' }}>FILTER:</span>
          {(
            [
              { id: 'ALL', label: `ALL (${incidents.length})` },
              { id: 'RED', label: `CODE RED (${incidents.filter((i) => i.triage.code === 'RED').length})` },
              { id: 'YELLOW', label: `YELLOW (${incidents.filter((i) => i.triage.code === 'YELLOW').length})` },
              { id: 'GREEN', label: `GREEN (${incidents.filter((i) => i.triage.code === 'GREEN').length})` },
              { id: 'DISPATCHED', label: `DISPATCHED (${incidents.filter((i) => i.status === 'DISPATCHED').length})` },
              { id: 'RESOLVED', label: `RESOLVED (${incidents.filter((i) => i.status === 'RESOLVED').length})` },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSeverityFilter(filter.id as any)}
              style={{
                background: severityFilter === filter.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: severityFilter === filter.id ? '#38bdf8' : '#94a3b8',
                border: severityFilter === filter.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                padding: '3px 10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Cards List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Filter size={32} style={{ opacity: 0.4 }} />
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No matching incidents found</div>
            <div style={{ fontSize: '0.8rem' }}>Adjust your filter or search criteria to view records.</div>
          </div>
        ) : (
          filtered.map((inc) => {
            const triageColor = getTriageColor(inc.triage.code);
            const isResolved = inc.status === 'RESOLVED';
            const isDispatched = inc.status === 'DISPATCHED';

            return (
              <div
                key={inc.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  borderLeft: `4px solid ${triageColor}`,
                  opacity: isResolved ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                id={`incident-card-${inc.id}`}
              >
                {/* Header: ID, Badge, Score, Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className={`badge badge-${inc.triage.code.toLowerCase()}`}
                    >
                      {inc.triage.code === 'RED' ? <ShieldAlert size={12} /> : <AlertTriangle size={12} />}
                      CODE {inc.triage.code}
                    </span>

                    <span className="font-mono" style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                      {inc.id}
                    </span>

                    {isDispatched && (
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        <Truck size={10} />
                        DISPATCHED ({inc.assignedUnit?.unitName})
                      </span>
                    )}

                    {isResolved && (
                      <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                        <Check size={10} />
                        RESCUED / RESOLVED
                      </span>
                    )}
                  </div>

                  {/* Urgency Score Meter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: triageColor }}>
                        {inc.triage.urgencyScore}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                        ACUITY
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontSize: '0.88rem', fontWeight: 700 }}>
                  <MapPin size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span>{inc.location.address}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>({inc.location.sector})</span>
                </div>

                {/* AI Summary / Situation */}
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                  {inc.triage.injurySummary}
                </p>

                {/* Visual Hazard & Vulnerability Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  {inc.triage.hazardAssessment.floodWaterDepthFeet && (
                    <span
                      style={{
                        background: 'rgba(14, 165, 233, 0.15)',
                        color: '#38bdf8',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      🌊 Water: {inc.triage.hazardAssessment.floodWaterDepthFeet}ft
                    </span>
                  )}

                  {inc.triage.hazardAssessment.electricalHazard && (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}
                    >
                      ⚡ Electrical Arc Hazard
                    </span>
                  )}

                  {inc.vulnerabilities.map((v) => (
                    <span
                      key={v}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                      }}
                    >
                      {v.replace(/_/g, ' ')}
                    </span>
                  ))}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', color: '#94a3b8', fontSize: '0.72rem' }}>
                    <Users size={12} />
                    <span>{inc.victimCount} Survivors</span>
                  </div>
                </div>

                {/* Required Resources Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {inc.triage.requiredResources.map((res) => (
                    <span
                      key={res}
                      className="font-mono"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                      }}
                    >
                      {res}
                    </span>
                  ))}
                </div>

                {/* Footer Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.7rem' }}>
                    <Clock size={12} />
                    <span>Reported {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onOpenSurvivorGuide(inc)}
                      title="Open Survivor Life-Safety Protocol"
                    >
                      <HeartHandshake size={13} style={{ color: '#38bdf8' }} />
                      <span>Survivor Guide</span>
                    </button>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectIncident(inc)}
                    >
                      <ExternalLink size={13} />
                      <span>AI Triage</span>
                    </button>

                    {!isResolved && (
                      <button
                        className="btn btn-cyan"
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        onClick={() => onDispatchIncident(inc)}
                      >
                        <Truck size={13} />
                        <span>Dispatch</span>
                      </button>
                    )}

                    <button
                      className="btn-icon-only"
                      style={{
                        padding: '4px 8px',
                        color: isResolved ? '#10b981' : '#94a3b8',
                        background: isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      }}
                      onClick={() => onToggleResolve(inc)}
                      title={isResolved ? 'Mark as Unresolved' : 'Mark as Rescued/Resolved'}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
