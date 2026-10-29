import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './components/TopBar';
import SpectralBackground from './components/SpectralBackground';
import LivingGhost from './components/LivingGhost';
import PersonalityCard from './components/PersonalityCard';
import MoodSelector from './components/MoodSelector';
import GhostChat from './components/GhostChat';
import IncidentModal from './components/IncidentModal';
import PossessionOverlay from './components/PossessionOverlay';
import GuideModal from './components/GuideModal';
import HealthModal from './components/HealthModal';
import { ghostApi } from './utils/api';
import { soundService } from './utils/soundService';

export default function App() {
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('ghost_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('ghost_session_id', sid);
    }
    return sid;
  });

  const [currentMood, setCurrentMood] = useState('Playful');
  const [messages, setMessages] = useState([
    {
      role: 'ghost',
      content: "Finally! Someone opened this tab. I've been haunting your browser cache all morning! What are we breaking today?",
      ghost_action: 'phases through the chat border',
      time: 'Just now',
      mode: 'live_ready'
    }
  ]);
  const [speechText, setSpeechText] = useState("Finally! Someone opened this tab. I've been haunting your browser cache all morning!");
  const [actionText, setActionText] = useState("phases through the chat border");
  const [statusMessage, setStatusMessage] = useState("Currently haunting your browser cookies with delight");
  const [hauntLevel, setHauntLevel] = useState(42);
  const [traits, setTraits] = useState({
    spookiness: 35,
    sarcasm: 75,
    mischief: 70,
    drama: 45,
    aura_frequency: '14.20 MHz'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiHealth, setAiHealth] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null);
  const [activePossession, setActivePossession] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const isSendingRef = useRef(false);

  // Check health on load
  useEffect(() => {
    ghostApi.getHealth().then((health) => {
      setAiHealth(health);
    });

    // Check first visit guide
    const hasVisited = localStorage.getItem('has_visited_ghost_os');
    if (!hasVisited) {
      setIsGuideOpen(true);
      localStorage.setItem('has_visited_ghost_os', 'true');
    }
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 800);
  }, []);

  // Handle Send Chat
  const handleSendMessage = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMsg = {
      role: 'user',
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await ghostApi.sendMessage(trimmed, currentMood, sessionId);

      const ghostMsg = {
        role: 'ghost',
        content: res.reply,
        ghost_action: res.ghost_action,
        mode: res.mode,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'ghost' && lastMsg.content === ghostMsg.content) {
          return prev;
        }
        return [...prev, ghostMsg];
      });

      setSpeechText(res.reply);
      setActionText(res.ghost_action);
      if (res.personality_status) setStatusMessage(res.personality_status);
      if (res.traits) {
        setTraits(res.traits);
        if (res.traits.haunt_level) setHauntLevel(res.traits.haunt_level);
      }
      if (res.mode === 'live' && !aiHealth?.live_ai) {
        setAiHealth((prev) => ({ ...prev, live_ai: true, model: res.model || 'meta-llama/llama-3.1-8b-instruct' }));
      } else if (res.mode === 'demo' && aiHealth?.live_ai) {
        setAiHealth((prev) => ({ ...prev, live_ai: false, error: res.error_note }));
      }
      soundService.play('boop');
    } catch (err) {
      console.error('Error contacting Bytegeist:', err);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  // Handle Mood Change
  const handleSelectMood = async (newMood) => {
    setCurrentMood(newMood);
    const res = await ghostApi.changeMood(newMood, sessionId);
    setSpeechText(res.reaction);
    setActionText(`shifts spectral disposition to ${newMood}`);
    setStatusMessage(res.status);
    if (res.traits) {
      setTraits(res.traits);
      if (res.traits.haunt_level) setHauntLevel(res.traits.haunt_level);
    }

    // Add notification in chat stream
    setMessages((prev) => [
      ...prev,
      {
        role: 'ghost',
        content: `*Mood changed to ${newMood}*: "${res.reaction}"`,
        ghost_action: `radiates ${newMood} energy`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: res.mode || 'mood_shift'
      }
    ]);
  };

  // Handle Random Event Trigger
  const handleTriggerEvent = async () => {
    triggerShake();
    const event = await ghostApi.triggerEvent();
    setActiveIncident(event);
    setSpeechText(event.ghost_quote);
    setActionText(`triggered incident: ${event.title}`);
    setHauntLevel((prev) => Math.min(100, prev + 10));

    // Also add to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'ghost',
        content: `🚨 [INCIDENT DETECTED] ${event.title}: "${event.ghost_quote}"`,
        ghost_action: `causes a ${event.effect_type} disturbance`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'event'
      }
    ]);
  };

  // Handle Possession Mode Trigger
  const handleTriggerPossession = async () => {
    triggerShake();
    const possession = await ghostApi.triggerPossession();
    setActivePossession(possession);
    setHauntLevel(99);
    setSpeechText(possession.message);
    setActionText('channels spectral voltage across the entire screen');

    setMessages((prev) => [
      ...prev,
      {
        role: 'ghost',
        content: `⚡ ${possession.message} ⚡`,
        ghost_action: 'takes over the DOM interface',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: 'possession'
      }
    ]);
  };

  // Handle Reset Memory
  const handleResetMemory = async () => {
    await ghostApi.clearSession(sessionId);
    setHauntLevel(25);
    setSpeechText("My memory of this session was banished to the digital void... who are you again?");
    setActionText("blinks in confusion");
    setMessages([
      {
        role: 'ghost',
        content: "Memory wiped! I've forgotten all your previous secrets and tabs. Hello new stranger!",
        ghost_action: 'reboots spectral cache',
        time: 'Just now',
        mode: 'cleared'
      }
    ]);
  };

  return (
    <div className={`phantom-desktop-app ${screenShake ? 'screen-shake' : ''}`}>
      {/* Background with floating particles and glow */}
      <SpectralBackground mood={currentMood} />

      {/* Top Menu Bar */}
      <TopBar
        aiHealth={aiHealth}
        hauntLevel={hauntLevel}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHealthInfo={() => {
          ghostApi.getHealth().then((h) => setAiHealth(h));
          setIsHealthOpen(true);
        }}
      />

      {/* Desktop Workspace */}
      <main className="desktop-workspace">
        <div className="desktop-grid-layout">
          {/* Left Column: Living Ghost & Control Deck */}
          <section className="column-ghost-stage">
            <div className="os-window-card ghost-sanctuary-window">
              <div className="window-card-header">
                <span className="window-title">👻 Ghost Sanctuary</span>
                <span className="window-badge">{currentMood}</span>
              </div>
              <LivingGhost
                mood={currentMood}
                speechText={speechText}
                actionText={actionText}
                hauntLevel={hauntLevel}
              />
            </div>

            <div className="os-window-card poltergeist-controls-window">
              <MoodSelector
                currentMood={currentMood}
                onSelectMood={handleSelectMood}
                onTriggerEvent={handleTriggerEvent}
                onTriggerPossession={handleTriggerPossession}
                isPossessing={!!activePossession}
              />
            </div>
          </section>

          {/* Center Column: Chat Terminal */}
          <section className="column-chat-terminal">
            <GhostChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              currentMood={currentMood}
              aiHealth={aiHealth}
            />
          </section>

          {/* Right Column: Ghost Personality Card & Info */}
          <section className="column-personality">
            <div className="os-window-card">
              <div className="window-card-header">
                <span className="window-title">🧠 Spectral Telemetry</span>
                <span className="window-badge">Real-time</span>
              </div>
              <PersonalityCard
                mood={currentMood}
                statusMessage={statusMessage}
                traits={traits}
                hauntLevel={hauntLevel}
                onResetMemory={handleResetMemory}
              />
            </div>

            {/* Quick Challenge Info Card */}
            <div className="os-window-card challenge-info-card">
              <div className="challenge-card-body">
                <div className="challenge-title">
                  <span>🎃 Hacktoberfest 2026 DEV Week</span>
                </div>
                <p className="challenge-desc">
                  Theme: <strong>Ghost in the Machine</strong><br />
                  Model: <code>meta-llama/llama-3.1-8b-instruct</code><br />
                  Platform: Backboard AI ($5 Free Credit)
                </p>
                <div className="challenge-badges">
                  <span className="challenge-badge">Open-Weight</span>
                  <span className="challenge-badge">Zero Paid Add-ons</span>
                  <span className="challenge-badge">Sandboxed Safety</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Incident Modal */}
      {activeIncident && (
        <IncidentModal
          event={activeIncident}
          onClose={() => setActiveIncident(null)}
        />
      )}

      {/* Possession Mode Fullscreen Overlay */}
      {activePossession && (
        <PossessionOverlay
          possession={activePossession}
          onEnd={() => setActivePossession(null)}
        />
      )}

      {/* Welcome / Guide Walkthrough Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* AI Health & Diagnostics Modal */}
      <HealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        healthData={aiHealth}
      />
    </div>
  );
}
