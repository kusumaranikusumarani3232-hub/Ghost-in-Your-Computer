import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Cpu, Info, Sparkles } from 'lucide-react';
import { soundService } from '../utils/soundService';

const SUGGESTIONS = [
  "Why are you in my computer?",
  "Steal a browser cookie",
  "What are you doing to my RAM?",
  "Cast a digital hex",
  "Tell me a ghost joke",
  "ERROR 404: What happened?"
];

export default function GhostChat({
  messages,
  onSendMessage,
  isLoading,
  currentMood,
  aiHealth
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textToSend = inputText.trim();
    if (!textToSend || isLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setInputText('');
    soundService.play('boop');
    onSendMessage(textToSend);

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  };

  const handleSuggestion = (prompt) => {
    if (!prompt || isLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    soundService.play('boop');
    onSendMessage(prompt);

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  };

  const isLive = aiHealth?.live_ai;

  return (
    <div className="ghost-chat-window">
      {/* OS Window Titlebar */}
      <div className="chat-window-titlebar">
        <div className="window-dots">
          <span className="dot dot-close" title="Ghosts cannot be closed" />
          <span className="dot dot-minimize" />
          <span className="dot dot-maximize" />
        </div>
        <div className="window-title">
          <Terminal size={14} className="title-icon" />
          <span>SpookTerminal — Bytegeist Chat v13.0</span>
        </div>
        {/* Mode Indicator Badge */}
        <div
          className={`ai-status-badge ${isLive ? 'badge-live' : 'badge-demo'}`}
          title={isLive ? 'Running on real open-weight Llama 3.1 8B via Backboard' : 'Running in transparent Demo Mode (Simulated AI / Fallback)'}
        >
          <span className="status-ping" />
          <span className="status-text">
            {isLive ? 'LIVE AI (Llama 3.1 8B)' : 'DEMO MODE (Simulated)'}
          </span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="chat-messages-scroll">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <div className="empty-ghost-icon">👻</div>
            <h4>Bytegeist is lurking in the cache...</h4>
            <p>Type a message or select a prompt below to strike up a conversation with your resident ghost!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isGhost = msg.role === 'ghost';
          return (
            <div
              key={index}
              className={`chat-message-row ${isGhost ? 'row-ghost' : 'row-user'}`}
            >
              {isGhost && (
                <div className="message-avatar">
                  <span>👻</span>
                </div>
              )}
              <div className="message-bubble">
                <div className="message-header">
                  <span className="message-author">{isGhost ? 'Bytegeist' : 'You'}</span>
                  <span className="message-time">
                    {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isGhost && msg.mode && (
                    <span className={`msg-mode-tag ${msg.mode === 'live' ? 'tag-live' : 'tag-demo'}`}>
                      {msg.mode === 'live' ? 'Llama 3.1 8B' : 'Demo'}
                    </span>
                  )}
                </div>
                <div className="message-content">{msg.content}</div>
                {msg.ghost_action && (
                  <div className="message-action-tag">*{msg.ghost_action}*</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-message-row row-ghost">
            <div className="message-avatar">
              <span className="icon-spin-slow">🌀</span>
            </div>
            <div className="message-bubble bubble-loading">
              <div className="ghost-typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
              <span className="loading-caption">
                {isLive ? 'Channeling Llama 3.1 8B via Backboard...' : 'Consulting ectoplasmic dialogue engine...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="chat-suggestions-container">
        <div className="suggestions-scroll">
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              className="suggestion-chip"
              onClick={() => handleSuggestion(suggestion)}
              disabled={isLoading}
            >
              <Sparkles size={12} />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="chat-input-bar">
        <input
          type="text"
          className="chat-text-input"
          placeholder={`Talk to Bytegeist (${currentMood} mood)...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputText.trim() || isLoading}
          title="Send message to ghost"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
