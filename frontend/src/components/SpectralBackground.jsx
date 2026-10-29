import React, { useMemo } from 'react';

export default function SpectralBackground({ mood = 'Playful' }) {
  // Generate random stable particles
  const particles = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.45 + 0.15
    }));
  }, []);

  const moodAura = {
    Playful: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)',
    Mischievous: 'radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.12) 0%, transparent 60%)',
    Dramatic: 'radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
    'Slightly Spooky': 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.09) 0%, transparent 65%)'
  };

  return (
    <div className="spectral-canvas-bg" aria-hidden="true">
      <div className="spectral-cyber-grid" />
      <div
        className="spectral-ambient-glow"
        style={{ background: moodAura[mood] || moodAura.Playful }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="spectral-mote"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
}
