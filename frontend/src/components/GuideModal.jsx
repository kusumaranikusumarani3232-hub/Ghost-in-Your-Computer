import React from 'react';
import { Ghost, Sparkles, Cpu, ShieldCheck, X, HeartHandshake, Zap } from 'lucide-react';
import { soundService } from '../utils/soundService';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleStart = () => {
    soundService.play('chime');
    onClose();
  };

  return (
    <div className="guide-modal-backdrop" onClick={onClose}>
      <div className="guide-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="guide-modal-titlebar">
          <div className="titlebar-title">
            <Ghost size={16} />
            <span>Welcome to Ghost in Your Computer 👻 — PhantomOS</span>
          </div>
          <button className="guide-close-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="guide-modal-content">
          <div className="guide-hero">
            <div className="guide-avatar-ring">
              <span className="guide-ghost-emoji">👻</span>
            </div>
            <h2>Meet Bytegeist</h2>
            <p className="guide-tagline">
              Your resident digital poltergeist for the Hacktoberfest 2026 Challenge: <strong>Ghost in the Machine</strong>.
            </p>
          </div>

          <div className="guide-features-grid">
            <div className="guide-feature-card">
              <div className="feature-icon icon-purple"><Cpu size={18} /></div>
              <h4>Open-Weight AI Core</h4>
              <p>Powered by <code>meta-llama/llama-3.1-8b-instruct</code> via Backboard. Transparent live AI with honest fallback demo mode.</p>
            </div>

            <div className="guide-feature-card">
              <div className="feature-icon icon-blue"><Sparkles size={18} /></div>
              <h4>Living Animated Ghost</h4>
              <p>Bytegeist floats, blinks, expresses 4 distinct moods, and reacts whenever you click or poke its ectoplasm!</p>
            </div>

            <div className="guide-feature-card">
              <div className="feature-icon icon-amber"><Zap size={18} /></div>
              <h4>Events & Possession</h4>
              <p>Trigger hilarious digital incidents (RAM leaks, cookie heists) or watch Bytegeist possess your window with CRT glitch effects.</p>
            </div>

            <div className="guide-feature-card">
              <div className="feature-icon icon-green"><ShieldCheck size={18} /></div>
              <h4>100% Safe & Sandboxed</h4>
              <p>All incidents and possessions are purely simulated inside this webpage. Your computer and files are completely untouched.</p>
            </div>
          </div>

          <div className="open-innovation-box">
            <div className="open-header">
              <HeartHandshake size={16} />
              <span>Why Open Innovation Matters</span>
            </div>
            <p>
              Open-weight models like Meta Llama 3.1 8B Instruct ensure developers have genuine agency over intelligence layers: complete auditability of weights, resistance to centralized lock-in, and the option for future self-hosting.
            </p>
          </div>

          <div className="guide-actions">
            <button className="btn-start-haunting" onClick={handleStart}>
              <span>Enter PhantomOS & Meet Bytegeist 👻</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
