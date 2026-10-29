import React, { useEffect, useState } from 'react';
import { Skull, Flame, ShieldAlert } from 'lucide-react';

export default function PossessionOverlay({ possession, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(possession?.duration_ms || 4500);

  useEffect(() => {
    if (!possession) return;
    const duration = possession.duration_ms || 4500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onEnd();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [possession, onEnd]);

  if (!possession) return null;

  const progressPercent = Math.max(0, (timeLeft / (possession.duration_ms || 4500)) * 100);

  return (
    <div className={`possession-overlay theme-${possession.glitch_theme || 'neon_cyber'}`}>
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      {/* Floating Glitch Glyphs */}
      <div className="glitch-glyphs-bg">
        <span>01000111 01001000 01001111 01010011 01010100</span>
        <span>§ § § ERR_POLTERGEIST_OVERFLOW § § §</span>
        <span>HAUNTING RAM :: ECTOPLASMIC MEMORY ALLOCATED</span>
        <span>0xDEADBEEF 0xCAFEBABE 0xBOO 0xSPOOK</span>
      </div>

      <div className="possession-banner">
        <div className="possession-header">
          <Skull className="possession-icon icon-glitch" size={32} />
          <h1 className="possession-title">{possession.message}</h1>
          <Flame className="possession-icon icon-glitch" size={32} />
        </div>

        <p className="possession-subtitle">
          Harmless supernatural interface simulation in progress. Your files are safe!
        </p>

        {/* Progress bar */}
        <div className="possession-timer-track">
          <div
            className="possession-timer-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="possession-countdown">
          Releasing control in {((timeLeft) / 1000).toFixed(1)}s...
        </div>

        <button className="btn-exorcise" onClick={onEnd} title="End possession immediately">
          <ShieldAlert size={16} />
          <span>Quick Exorcism (End Now)</span>
        </button>
      </div>
    </div>
  );
}
