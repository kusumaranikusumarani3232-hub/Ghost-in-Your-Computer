const BACKEND_DIRECT = 'http://127.0.0.1:8001/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`/api${endpoint}`, options);
    if (res.ok) return res;
    // If not OK on proxy, attempt direct port 8001
    try {
      const fallbackRes = await fetch(`${BACKEND_DIRECT}${endpoint}`, options);
      if (fallbackRes.ok) return fallbackRes;
    } catch {
      // Fall through to throw original
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    try {
      const fallbackRes = await fetch(`${BACKEND_DIRECT}${endpoint}`, options);
      if (fallbackRes.ok) return fallbackRes;
    } catch {
      // Fall through
    }
    throw err;
  }
}

export const ghostApi = {
  async getHealth() {
    try {
      const res = await apiFetch('/health');
      return await res.json();
    } catch {
      return {
        status: 'offline',
        live_ai: false,
        model: 'Demo Mode (Client Offline)',
        provider: 'Local Scripted',
        active_sessions: 0,
        version: '1.0.0',
        error: 'Unable to connect to backend at http://127.0.0.1:8001'
      };
    }
  },

  async sendMessage(message, mood, sessionId) {
    try {
      const res = await apiFetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, mood, session_id: sessionId })
      });
      return await res.json();
    } catch (err) {
      // Offline fallback if backend is down
      return {
        reply: "My ghost signals got crossed in the network ether! But fear not, I'm still floating around your browser cache.",
        mood: mood || 'Playful',
        session_id: sessionId || 'offline',
        mode: 'demo',
        model: 'Demo Mode (Network Disconnected)',
        ghost_action: 'phases through a disconnected socket',
        personality_status: 'Haunting in localized sandbox mode',
        traits: { spookiness: 50, sarcasm: 80, mischief: 85, drama: 60, haunt_level: 50 },
        error_note: 'Backend connection to port 8001 failed'
      };
    }
  },

  async changeMood(mood, sessionId) {
    try {
      const res = await apiFetch('/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, session_id: sessionId })
      });
      return await res.json();
    } catch {
      return {
        mood,
        reaction: `Calibrating spectral aura to ${mood} frequencies.`,
        status: `Operating in ${mood} disposition`,
        traits: { spookiness: 60, sarcasm: 75, mischief: 80, drama: 50, haunt_level: 55 }
      };
    }
  },

  async triggerEvent() {
    try {
      const res = await apiFetch('/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch {
      return {
        event_id: 'local_glitch',
        title: 'Local Ectoplasm Spike',
        description: 'Simulated quantum fluctuations detected around your trackpad.',
        spook_level: 50,
        effect_type: 'glitch',
        ghost_quote: 'Network offline, but the haunt goes on!'
      };
    }
  },

  async triggerPossession() {
    try {
      const res = await apiFetch('/possess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch {
      return {
        possession_id: 'neon_cyber',
        title: 'Cyber-Exorcism Glitch',
        intensity: 'Supernatural',
        duration_ms: 4500,
        glitch_theme: 'neon_cyber',
        message: '⚡ BYTEGEIST HAS OVERRIDDEN THE DISPLAY MATRIX ⚡',
        audio_sound: 'cyber_glitch'
      };
    }
  },

  async clearSession(sessionId) {
    try {
      await apiFetch(`/session/${sessionId}`, { method: 'DELETE' });
    } catch {
      // Ignored
    }
  }
};

