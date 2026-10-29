import React from 'react';
import { AlertTriangle, X, Zap, ShieldCheck } from 'lucide-react';

export default function IncidentModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="incident-modal-backdrop" onClick={onClose}>
      <div className="incident-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="incident-modal-titlebar">
          <div className="titlebar-left">
            <AlertTriangle size={16} className="incident-warn-icon" />
            <span>SPECTRAL ALERT: INCIDENT #{event.event_id?.toUpperCase() || 'POLTERGEIST'}</span>
          </div>
          <button className="incident-close-btn" onClick={onClose} title="Dismiss">
            <X size={16} />
          </button>
        </div>

        <div className="incident-modal-body">
          <div className="incident-icon-badge">
            <span>⚡👻</span>
          </div>

          <h3 className="incident-title">{event.title}</h3>
          <p className="incident-description">{event.description}</p>

          <div className="incident-spook-meter">
            <div className="spook-meter-header">
              <span><Zap size={14} /> Hazard Level</span>
              <span className="spook-level-value">{event.spook_level}% Spooky</span>
            </div>
            <div className="spook-meter-track">
              <div
                className="spook-meter-fill"
                style={{ width: `${event.spook_level}%` }}
              />
            </div>
          </div>

          <div className="incident-ghost-quote">
            <span className="quote-mark">“</span>
            <p>{event.ghost_quote}</p>
            <span className="quote-author">— Bytegeist (from inside your silicon circuits)</span>
          </div>

          <div className="incident-actions">
            <button className="btn-incident-ok" onClick={onClose}>
              <ShieldCheck size={16} />
              <span>Acknowledge Harmless Poltergeist Incident</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
