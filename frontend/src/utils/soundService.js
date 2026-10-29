// Synthesized audio engine using native Web Audio API
// No external mp3 files required, 0% broken links, 100% zero-autoplay compliant

let audioCtx = null;
let isMuted = true; // Default to muted to respect user preference

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundService = {
  isMuted() {
    return isMuted;
  },

  setMuted(muted) {
    isMuted = muted;
    if (!muted) {
      getAudioContext();
    }
  },

  toggleMute() {
    this.setMuted(!isMuted);
    return isMuted;
  },

  play(soundType) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (soundType) {
        case 'boop': {
          // Playful digital blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'chime':
        case 'spectral_chime': {
          // Ethereal ghostly chime with subtle vibrato
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
          osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.5);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
          break;
        }

        case 'giggle': {
          // Ghost playful chuckle (3 rapid micro notes)
          [0, 0.08, 0.16].forEach((offset, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + idx * 150, now + offset);
            gain.gain.setValueAtTime(0.1, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.07);
          });
          break;
        }

        case 'glitch':
        case 'cyber_glitch': {
          // Digital cyber glitch sound using modulated square wave
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.setValueAtTime(480, now + 0.05);
          osc.frequency.setValueAtTime(220, now + 0.12);
          osc.frequency.setValueAtTime(80, now + 0.2);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'eerie_drone': {
          // Deep mysterious supernatural frequency
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, now); // A2
          osc.frequency.linearRampToValueAtTime(95, now + 0.8);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
          break;
        }

        default:
          break;
      }
    } catch {
      // Audio playback fails gracefully if blocked by browser policy
    }
  }
};
