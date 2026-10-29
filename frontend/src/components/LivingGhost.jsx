import React, { useState } from 'react';
import { soundService } from '../utils/soundService';

const POKE_QUOTES = [
  "Hey! That tickles my byte-stream!",
  "Are you poking a phantom with a cursor?",
  "Ectoplasm does not respond to physical pressure!",
  "Careful, mortal! My pixels are static-charged.",
  "Stop clicking me, I'm trying to look mysterious!",
  "Boop! Now your cursor has phantom residue."
];

export default function LivingGhost({ mood = 'Playful', speechText, actionText, hauntLevel = 45 }) {
  const [isWobbling, setIsWobbling] = useState(false);
  const [pokeBubble, setPokeBubble] = useState(null);

  const handleGhostClick = () => {
    setIsWobbling(true);
    soundService.play('giggle');
    const quote = POKE_QUOTES[Math.floor(Math.random() * POKE_QUOTES.length)];
    setPokeBubble(quote);

    setTimeout(() => setIsWobbling(false), 800);
    setTimeout(() => setPokeBubble(null), 3500);
  };

  // Color schemes based on mood
  const moodColors = {
    Playful: {
      bodyGradientStart: '#a855f7',
      bodyGradientEnd: '#38bdf8',
      aura: 'rgba(56, 189, 248, 0.35)',
      eyeColor: '#38bdf8',
      blush: 'rgba(244, 114, 182, 0.5)'
    },
    Mischievous: {
      bodyGradientStart: '#c084fc',
      bodyGradientEnd: '#9333ea',
      aura: 'rgba(168, 85, 247, 0.45)',
      eyeColor: '#f43f5e',
      blush: 'transparent'
    },
    Dramatic: {
      bodyGradientStart: '#6366f1',
      bodyGradientEnd: '#4338ca',
      aura: 'rgba(99, 102, 241, 0.4)',
      eyeColor: '#a5b4fc',
      blush: 'transparent'
    },
    'Slightly Spooky': {
      bodyGradientStart: '#34d399',
      bodyGradientEnd: '#059669',
      aura: 'rgba(52, 211, 153, 0.45)',
      eyeColor: '#10b981',
      blush: 'transparent'
    }
  };

  const currentTheme = moodColors[mood] || moodColors.Playful;
  const displayText = pokeBubble || speechText;

  return (
    <div className="ghost-sanctuary">
      {/* Speech Bubble */}
      {displayText && (
        <div className="ghost-speech-bubble" style={{ borderColor: currentTheme.eyeColor }}>
          <div className="bubble-text">{displayText}</div>
          {actionText && !pokeBubble && (
            <div className="bubble-action">*{actionText}*</div>
          )}
          <div className="bubble-pointer" style={{ borderTopColor: currentTheme.eyeColor }}></div>
        </div>
      )}

      {/* Interactive Ghost SVG */}
      <div
        className={`ghost-character-wrapper ${isWobbling ? 'ghost-wobble' : 'ghost-float'}`}
        onClick={handleGhostClick}
        title="Click to interact with Bytegeist!"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleGhostClick()}
      >
        {/* Glow Aura */}
        <div
          className="ghost-aura-glow"
          style={{
            boxShadow: `0 0 60px 20px ${currentTheme.aura}`,
            transform: `scale(${1 + hauntLevel * 0.003})`
          }}
        />

        <svg
          viewBox="0 0 200 240"
          className="ghost-svg"
          style={{ filter: `drop-shadow(0 10px 25px ${currentTheme.aura})` }}
        >
          <defs>
            <linearGradient id={`ghostGrad-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor={currentTheme.bodyGradientStart} stopOpacity="0.85" />
              <stop offset="100%" stopColor={currentTheme.bodyGradientEnd} stopOpacity="0.75" />
            </linearGradient>

            <filter id="ghostBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ghost Tail / Ectoplasm Body */}
          <path
            d="M 100 25
               C 50 25, 30 75, 30 130
               C 30 180, 20 215, 45 205
               C 65 195, 75 220, 100 205
               C 125 190, 140 220, 160 205
               C 180 190, 170 180, 170 130
               C 170 75, 150 25, 100 25 Z"
            fill={`url(#ghostGrad-${mood})`}
            filter="url(#ghostBlur)"
            className="ghost-body-path"
          />

          {/* Floating Ghost Arms */}
          {mood === 'Mischievous' ? (
            // Hands rubbed together mischievously
            <>
              <path
                d="M 40 120 C 60 135, 80 140, 95 135"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 160 120 C 140 135, 120 140, 105 135"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
            </>
          ) : mood === 'Dramatic' ? (
            // Dramatic theatrical pose
            <>
              <path
                d="M 35 130 C 20 100, 45 80, 60 90"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 165 130 C 180 100, 155 80, 140 90"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
            </>
          ) : (
            // Playful/Spooky floating open hands
            <>
              <path
                d="M 35 125 C 15 130, 20 145, 40 142"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 165 125 C 185 130, 180 145, 160 142"
                fill="none"
                stroke="#ffffff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.8"
              />
            </>
          )}

          {/* Blush for Playful mood */}
          {currentTheme.blush !== 'transparent' && (
            <>
              <ellipse cx="62" cy="115" rx="10" ry="5" fill={currentTheme.blush} />
              <ellipse cx="138" cy="115" rx="10" ry="5" fill={currentTheme.blush} />
            </>
          )}

          {/* Eyes depending on mood */}
          {mood === 'Mischievous' ? (
            // Slanted cunning eyes with glint
            <>
              <path
                d="M 60 85 Q 75 92 88 88"
                stroke={currentTheme.eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="75" cy="95" r="7" fill={currentTheme.eyeColor} />
              <circle cx="77" cy="93" r="2.5" fill="#ffffff" />

              <path
                d="M 140 85 Q 125 92 112 88"
                stroke={currentTheme.eyeColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="125" cy="95" r="7" fill={currentTheme.eyeColor} />
              <circle cx="123" cy="93" r="2.5" fill="#ffffff" />
            </>
          ) : mood === 'Dramatic' ? (
            // Melodramatic arched eyes with tear glint
            <>
              <ellipse cx="74" cy="92" rx="8" ry="12" fill={currentTheme.eyeColor} />
              <ellipse cx="126" cy="92" rx="8" ry="12" fill={currentTheme.eyeColor} />
              <circle cx="72" cy="88" r="3" fill="#ffffff" />
              <circle cx="124" cy="88" r="3" fill="#ffffff" />
              <path
                d="M 74 105 Q 72 120 70 126"
                stroke="#a5b4fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="2 3"
                opacity="0.8"
              />
            </>
          ) : mood === 'Slightly Spooky' ? (
            // Glowing eerie circular eyes
            <>
              <circle cx="72" cy="92" r="11" fill="#032516" stroke={currentTheme.eyeColor} strokeWidth="3" />
              <circle cx="72" cy="92" r="5" fill={currentTheme.eyeColor} className="spooky-pupil" />
              <circle cx="128" cy="92" r="11" fill="#032516" stroke={currentTheme.eyeColor} strokeWidth="3" />
              <circle cx="128" cy="92" r="5" fill={currentTheme.eyeColor} className="spooky-pupil" />
            </>
          ) : (
            // Playful big happy anime-style ghost eyes
            <>
              <ellipse cx="72" cy="92" rx="9" ry="13" fill="#0f172a" />
              <circle cx="70" cy="88" r="4" fill="#ffffff" />
              <circle cx="75" cy="96" r="2" fill={currentTheme.eyeColor} />

              <ellipse cx="128" cy="92" rx="9" ry="13" fill="#0f172a" />
              <circle cx="126" cy="88" r="4" fill="#ffffff" />
              <circle cx="131" cy="96" r="2" fill={currentTheme.eyeColor} />
            </>
          )}

          {/* Mouth */}
          {mood === 'Mischievous' ? (
            <path
              d="M 88 118 Q 100 130 115 116"
              fill="none"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : mood === 'Dramatic' ? (
            <ellipse cx="100" cy="118" rx="6" ry="8" fill="#0f172a" />
          ) : mood === 'Slightly Spooky' ? (
            <path
              d="M 90 120 Q 95 112 100 120 Q 105 128 110 120"
              fill="none"
              stroke="#032516"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 88 114 Q 100 128 112 114"
              fill="none"
              stroke="#0f172a"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Click hint badge */}
        <div className="ghost-click-hint">
          <span>Click to tickle Bytegeist 👻</span>
        </div>
      </div>
    </div>
  );
}
