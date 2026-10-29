import React from 'react';
import { Sparkles, Flame, Eye, Film, Dices, Ghost } from 'lucide-react';
import { soundService } from '../utils/soundService';

const MOODS = [
  { id: 'Playful', label: 'Playful', icon: Sparkles, emoji: '🎈', desc: 'Bouncy, witty, crack jokes' },
  { id: 'Mischievous', label: 'Mischievous', icon: Flame, emoji: '😈', desc: 'Cheeky digital pranks' },
  { id: 'Dramatic', label: 'Dramatic', icon: Film, emoji: '🎭', desc: 'Victorian gothic sorrow' },
  { id: 'Slightly Spooky', label: 'Slightly Spooky', icon: Eye, emoji: '👁️', desc: 'Cold drafts & eerie whispers' }
];

export default function MoodSelector({
  currentMood,
  onSelectMood,
  onTriggerEvent,
  onTriggerPossession,
  isPossessing
}) {
  const handleMoodClick = (moodId) => {
    soundService.play('boop');
    onSelectMood(moodId);
  };

  const handleEventClick = () => {
    soundService.play('chime');
    onTriggerEvent();
  };

  const handlePossessClick = () => {
    soundService.play('cyber_glitch');
    onTriggerPossession();
  };

  return (
    <div className="poltergeist-deck">
      <div className="deck-section-title">
        <span>GHOST DISPOSITION & SPELLS</span>
      </div>

      {/* Mood Selector Buttons */}
      <div className="mood-buttons-grid">
        {MOODS.map((m) => {
          const isActive = currentMood === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              className={`mood-button ${isActive ? 'active' : ''} mood-${m.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleMoodClick(m.id)}
            >
              <div className="mood-btn-header">
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </div>
              <span className="mood-desc">{m.desc}</span>
              {isActive && <div className="active-dot" />}
            </button>
          );
        })}
      </div>

      {/* Action Spells (Event and Possession) */}
      <div className="spells-actions-grid">
        <button
          className="spell-btn event-btn"
          onClick={handleEventClick}
          title="Trigger a random fictional digital incident"
        >
          <Dices className="spell-icon spin-on-hover" size={18} />
          <div className="spell-text">
            <span className="spell-title">Digital Incident</span>
            <span className="spell-sub">Harmless cyber-glitch</span>
          </div>
        </button>

        <button
          className={`spell-btn possession-btn ${isPossessing ? 'is-active' : ''}`}
          onClick={handlePossessClick}
          disabled={isPossessing}
          title="Let Bytegeist possess your browser window for a moment"
        >
          <Ghost className="spell-icon pulse-on-hover" size={18} />
          <div className="spell-text">
            <span className="spell-title">{isPossessing ? 'Possessing...' : 'Possess Window'}</span>
            <span className="spell-sub">Temporary visual glitch</span>
          </div>
        </button>
      </div>
    </div>
  );
}
