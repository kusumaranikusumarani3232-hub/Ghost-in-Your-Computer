import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, HelpCircle, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { soundService } from '../utils/soundService';

export default function TopBar({
  aiHealth,
  hauntLevel,
  onOpenGuide,
  onOpenHealthInfo
}) {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundService.play('boop');
    }
  };

  const isLive = aiHealth?.live_ai;

  return (
    <header className="os-topbar">
      <div className="topbar-left">
        <div className="os-brand" onClick={onOpenGuide} title="Click to view Ghost Guide">
          <span className="os-brand-icon">👻</span>
          <span className="os-brand-title">PhantomOS</span>
          <span className="os-brand-version">v13.0</span>
        </div>

        <nav className="os-menu-nav">
          <button className="menu-nav-item" onClick={onOpenGuide}>About</button>
          <span className="menu-nav-sep">/</span>
          <span className="menu-nav-label">Challenge: Ghost in the Machine</span>
        </nav>
      </div>

      <div className="topbar-center">
        {/* Live AI vs Demo Mode status pill */}
        <div
          className={`topbar-ai-pill ${isLive ? 'pill-live' : 'pill-demo'}`}
          onClick={onOpenHealthInfo}
          title={isLive ? 'Connected to meta-llama/llama-3.1-8b-instruct via Backboard' : 'Operating in honest Demo Mode (Click for details)'}
        >
          <span className="pulsing-led" />
          <span className="pill-text">
            {isLive ? 'LIVE AI: Llama 3.1 8B' : 'DEMO MODE: Simulated AI'}
          </span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Haunt Meter Pill */}
        <div className="topbar-haunt-pill" title="Current session haunt intensity">
          <Zap size={14} className="icon-pulse" />
          <span>{hauntLevel || 42}%</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          className={`topbar-audio-btn ${isMuted ? 'muted' : 'active'}`}
          onClick={handleToggleSound}
          title={isMuted ? 'Sound is MUTED (Click to enable subtle web-audio FX)' : 'Sound is ACTIVE (Click to mute)'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span className="audio-label">{isMuted ? 'Muted' : 'Sound ON'}</span>
        </button>

        {/* Guide / Info Button */}
        <button
          className="topbar-icon-btn"
          onClick={onOpenGuide}
          title="Ghost in Your Computer Guide"
        >
          <HelpCircle size={16} />
        </button>

        {/* Clock */}
        <div className="topbar-clock">
          <span>{timeStr || '03:00 AM'}</span>
        </div>
      </div>
    </header>
  );
}
