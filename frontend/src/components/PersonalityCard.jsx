import React from 'react';
import { Sparkles, Skull, Flame, Zap, Trash2, Radio } from 'lucide-react';
import { soundService } from '../utils/soundService';

export default function PersonalityCard({
  mood,
  statusMessage,
  traits,
  hauntLevel,
  onResetMemory
}) {
  const handleReset = () => {
    soundService.play('glitch');
    onResetMemory();
  };

  const moodBadges = {
    Playful: { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#38bdf8', icon: '🎈' },
    Mischievous: { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#c084fc', icon: '😈' },
    Dramatic: { bg: 'rgba(99, 102, 241, 0.15)', border: '#818cf8', text: '#a5b4fc', icon: '🎭' },
    'Slightly Spooky': { bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399', text: '#4ade80', icon: '👁️' }
  };

  const badge = moodBadges[mood] || moodBadges.Playful;
  const displayHaunt = hauntLevel || traits?.haunt_level || 42;

  return (
    <div className="personality-card-panel">
      <div className="card-header">
        <div className="card-title-group">
          <span className="card-badge-avatar">👻</span>
          <div>
            <h3 className="card-name">Bytegeist</h3>
            <span className="card-subtitle">Digital Resident Poltergeist</span>
          </div>
        </div>
        <div
          className="mood-pill"
          style={{
            backgroundColor: badge.bg,
            borderColor: badge.border,
            color: badge.text
          }}
        >
          <span>{badge.icon}</span> {mood}
        </div>
      </div>

      <div className="status-quote-box">
        <p className="status-quote">"{statusMessage || 'Haunting this computer with enthusiasm'}"</p>
      </div>

      <div className="haunt-level-container">
        <div className="haunt-level-label">
          <span><Zap size={14} className="icon-pulse" /> Haunt Level</span>
          <span className="haunt-value">{displayHaunt}%</span>
        </div>
        <div className="haunt-progress-track">
          <div
            className="haunt-progress-fill"
            style={{
              width: `${displayHaunt}%`,
              background: `linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #f43f5e 100%)`
            }}
          />
        </div>
      </div>

      <div className="traits-grid">
        <div className="trait-box">
          <div className="trait-header">
            <span className="trait-name"><Skull size={13} /> Spookiness</span>
            <span className="trait-val">{traits?.spookiness ?? 45}%</span>
          </div>
          <div className="trait-bar"><div className="trait-bar-fill fill-spook" style={{ width: `${traits?.spookiness ?? 45}%` }} /></div>
        </div>

        <div className="trait-box">
          <div className="trait-header">
            <span className="trait-name"><Sparkles size={13} /> Sarcasm</span>
            <span className="trait-val">{traits?.sarcasm ?? 85}%</span>
          </div>
          <div className="trait-bar"><div className="trait-bar-fill fill-sarcasm" style={{ width: `${traits?.sarcasm ?? 85}%` }} /></div>
        </div>

        <div className="trait-box">
          <div className="trait-header">
            <span className="trait-name"><Flame size={13} /> Mischief</span>
            <span className="trait-val">{traits?.mischief ?? 75}%</span>
          </div>
          <div className="trait-bar"><div className="trait-bar-fill fill-mischief" style={{ width: `${traits?.mischief ?? 75}%` }} /></div>
        </div>

        <div className="trait-box">
          <div className="trait-header">
            <span className="trait-name"><Radio size={13} /> Drama</span>
            <span className="trait-val">{traits?.drama ?? 60}%</span>
          </div>
          <div className="trait-bar"><div className="trait-bar-fill fill-drama" style={{ width: `${traits?.drama ?? 60}%` }} /></div>
        </div>
      </div>

      <div className="card-footer">
        <div className="frequency-display">
          <Radio size={12} className="icon-spin-slow" />
          <span>Aura: {traits?.aura_frequency || '14.82 MHz'}</span>
        </div>

        <button
          className="btn-reset-memory"
          onClick={handleReset}
          title="Reset ghost's memory for this session"
        >
          <Trash2 size={13} />
          <span>Clear Memory</span>
        </button>
      </div>
    </div>
  );
}
