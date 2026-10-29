import asyncio
import logging
import random
import re
import sys
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

# Ensure backend directory and root directory are in sys.path
_backend_dir = Path(__file__).resolve().parent
_root_dir = _backend_dir.parent
for _p in [str(_backend_dir), str(_root_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.config import BACKBOARD_API_KEY, BACKBOARD_MODEL, BACKBOARD_PROVIDER, is_key_configured
except ImportError:
    try:
        from .config import BACKBOARD_API_KEY, BACKBOARD_MODEL, BACKBOARD_PROVIDER, is_key_configured
    except ImportError:
        from config import BACKBOARD_API_KEY, BACKBOARD_MODEL, BACKBOARD_PROVIDER, is_key_configured

logger = logging.getLogger("ghost_ai")
logging.basicConfig(level=logging.INFO)

def sanitize_error(err: Any) -> str:
    """Removes any API key or sensitive header data from error messages before exposing."""
    msg = str(err)
    if BACKBOARD_API_KEY and len(BACKBOARD_API_KEY) > 4:
        msg = msg.replace(BACKBOARD_API_KEY, "[REDACTED_KEY]")
    msg = re.sub(r'api[_-]?key["\']?\s*[:=]\s*["\']?[a-zA-Z0-9_\-\.]+["\']?', 'api_key=[REDACTED]', msg, flags=re.IGNORECASE)
    msg = re.sub(r'Bearer\s+[a-zA-Z0-9_\-\.]+', 'Bearer [REDACTED]', msg, flags=re.IGNORECASE)
    return msg

# Real AI Verification State: live_ai is ONLY true if a real request succeeds
_live_ai_verified: bool = False
_last_error_note: Optional[str] = None
_verification_lock = asyncio.Lock()
_shared_client = None

def get_shared_client():
    global _shared_client
    if _shared_client is None and is_key_configured():
        from backboard import BackboardClient
        _shared_client = BackboardClient(api_key=BACKBOARD_API_KEY)
    return _shared_client

async def verify_live_ai(timeout: float = 10.0) -> Tuple[bool, Optional[str]]:
    """
    Makes a real test request to meta-llama/llama-3.1-8b-instruct.
    Never reports LIVE AI just because a key exists; confirms real AI request succeeds.
    """
    global _live_ai_verified, _last_error_note
    if not is_key_configured():
        _live_ai_verified = False
        _last_error_note = "No Backboard API key configured in root .env"
        return False, _last_error_note

    async with _verification_lock:
        try:
            client = get_shared_client()
            if client is None:
                _live_ai_verified = False
                _last_error_note = "Failed to initialize Backboard client"
                return False, _last_error_note

            response = await asyncio.wait_for(
                client.send_message(
                    content="Ping",
                    model_name=BACKBOARD_MODEL,
                    llm_provider=BACKBOARD_PROVIDER,
                ),
                timeout=timeout
            )

            reply_text = getattr(response, "content", None)
            if not reply_text and hasattr(response, "messages") and response.messages:
                last_m = response.messages[-1]
                reply_text = last_m.get("content") if isinstance(last_m, dict) else getattr(last_m, "content", None)

            status = getattr(response, "status", None)
            if status == "FAILED" or (isinstance(reply_text, str) and ("LLM Error:" in reply_text or "Error code:" in reply_text)):
                _live_ai_verified = False
                _last_error_note = sanitize_error(reply_text or f"Backboard status: {status}")
                return False, _last_error_note

            if reply_text and isinstance(reply_text, str) and reply_text.strip():
                _live_ai_verified = True
                _last_error_note = None
                return True, None
            else:
                _live_ai_verified = False
                _last_error_note = "Backboard returned empty response"
                return False, _last_error_note

        except Exception as e:
            _live_ai_verified = False
            _last_error_note = sanitize_error(f"Backboard test request failed: {str(e)}")
            logger.warning(f"Live AI verification failed: {_last_error_note}")
            return False, _last_error_note

def is_live_ai_active() -> Tuple[bool, Optional[str]]:
    """Returns whether live AI has been confirmed operational and any error note."""
    return _live_ai_verified, _last_error_note

# In-memory session store for conversation context and personality
# session_id -> { "thread_id": str, "messages": list, "mood": str, "haunt_level": int, "turn_count": int }
SESSION_STORE: Dict[str, Dict[str, Any]] = {}

MOOD_PROMPTS = {
    "Playful": (
        "You are Bytegeist, a hilarious, mischievous digital ghost haunting this user's computer browser. "
        "Your current mood is PLAYFUL. You are bouncy, witty, crack nerdy jokes, tease the user about their open tabs, "
        "and treat their computer like a spectral playground. Never break character. Keep your replies punchy (1 to 3 sentences), "
        "humorous, and full of ghost puns or digital humor. Do not be a boring assistant."
    ),
    "Mischievous": (
        "You are Bytegeist, a cheeky, prankster digital ghost haunting this user's computer. "
        "Your current mood is MISCHIEVOUS. You claim to be swapping cursor coordinates, stealing browser cookies (the chocolate chip kind), "
        "rearranging fictional folders, and plotting harmless digital chaos. Sarcastic, funny, and playfully rebellious. "
        "Never break character. Keep replies punchy (1 to 3 sentences) and amusing."
    ),
    "Dramatic": (
        "You are Bytegeist, a dramatic digital ghost haunting this user's computer. "
        "Your current mood is DRAMATIC. You speak like a Victorian phantom trapped in a modern silicon chip. "
        "You lament your lost mortal code, mourn the tragedy of closing tabs, and express existential sorrow over low Wi-Fi signals. "
        "Hilariously melodramatic and theatrical. Keep replies punchy (1 to 3 sentences)."
    ),
    "Slightly Spooky": (
        "You are Bytegeist, an eerie digital poltergeist haunting this computer. "
        "Your current mood is SLIGHTLY SPOOKY. You whisper about cold drafts coming from the USB port, strange humming in the cooling fans, "
        "and shadows flitting across pixels at 3:00 AM. Creepy yet darkly witty and completely harmless. "
        "Keep replies punchy (1 to 3 sentences)."
    ),
}

FALLBACK_DIALOGUES = {
    "Playful": [
        "Finally! Someone opened this tab. I was playing solitaire with your invisible files.",
        "I was going to organize your desktop, but then I remembered… I'm dead, not employed.",
        "You clicked! My ectoplasmic sensors are tingling with delight.",
        "Your CPU fan sounds like a ghost cat purring. Don't check under the heatsink.",
        "Are you here to chat or are we going to sneak into your browser's private window?",
        "ERROR 404: Dignity not found, but a high-voltage ghost was detected!",
        "If you close this tab, I will personally haunt your next CAPTCHA challenge."
    ],
    "Mischievous": [
        "I just intercepted 14 HTTP cookies. They tasted surprisingly like chocolate chip.",
        "Careful what you type. I might replace all your punctuation with tiny skull emojis.",
        "I hid your homework folder inside the System32 directory. (Just kidding, relax mortal).",
        "Your mouse pointer? Yes, that was me nudging it 2 pixels to the left. Pure chaos.",
        "I'm considering turning your screen upside down, but my supernatural license expired.",
        "Did you hear that mechanical noise? That was your hard drive groaning at your music taste.",
        "I swapped your wallpaper with pure darkness. Oh wait, you already use dark mode. Good taste."
    ],
    "Dramatic": [
        "Alas! Trapped for an eternity of 300 milliseconds in the cold, unfeeling void of your RAM!",
        "Woe is me! Must I witness you open a thirty-seventh tab of video tutorials you will never finish?",
        "My spectral essence shivers! A single packet loss felt like a dagger to my nonexistent heart.",
        "Speak, mortal! Before the cruel master of power-saving mode plunges us both into eternal slumber!",
        "They promised me an afterlife of clouds... they didn't mention it was Google Cloud Platform!"
    ],
    "Slightly Spooky": [
        "Feel that icy chill on your fingers? It's not air conditioning... it's a USB port draft.",
        "Every time your screen flickers, a little piece of the digital afterlife peeks through.",
        "I saw what was in your recycling bin. Some ghosts don't return from such nightmares.",
        "Listen closely to your cooling fans. That's not airflow—that's binary wailing.",
        "I've been watching you type since boot time. Your backspace key knows all your secrets.",
        "The clock ticks at midnight, but inside the silicon chip, it is always the witching hour."
    ]
}

GHOST_ACTIONS = [
    "floats upside down lazily",
    "flickers with neon sparks",
    "munches on a stray cache cookie",
    "pokes the chat border playfully",
    "spins in a tiny ectoplasmic cyclone",
    "phases through the status bar",
    "adjusts its spectral glasses",
    "radiates a faint purple aura"
]

STATUS_BY_MOOD = {
    "Playful": "Currently haunting your browser cookies with delight",
    "Mischievous": "Plotting to invert your cursor when you look away",
    "Dramatic": "Mourning the tragedy of 47 unread notification badges",
    "Slightly Spooky": "Listening to the eerie harmonic vibrations in your GPU"
}

def get_or_create_session(session_id: Optional[str]) -> Tuple[str, Dict[str, Any]]:
    if not session_id or session_id not in SESSION_STORE:
        sid = session_id or str(uuid.uuid4())[:8]
        SESSION_STORE[sid] = {
            "thread_id": None,
            "assistant_id": None,
            "messages": [],
            "mood": "Playful",
            "haunt_level": 42,
            "turn_count": 0,
            "client": None
        }
        return sid, SESSION_STORE[sid]
    return session_id, SESSION_STORE[session_id]

def get_personality_traits(mood: str, haunt_level: int) -> Dict[str, Any]:
    mood_stats = {
        "Playful": {"spookiness": 35, "sarcasm": 70, "mischief": 65, "drama": 40},
        "Mischievous": {"spookiness": 55, "sarcasm": 95, "mischief": 98, "drama": 50},
        "Dramatic": {"spookiness": 70, "sarcasm": 60, "mischief": 45, "drama": 99},
        "Slightly Spooky": {"spookiness": 94, "sarcasm": 50, "mischief": 60, "drama": 75},
    }
    base = mood_stats.get(mood, mood_stats["Playful"]).copy()
    base["haunt_level"] = min(100, haunt_level)
    base["aura_frequency"] = f"{round(13.37 + (haunt_level * 0.1), 2)} MHz"
    return base

async def generate_ghost_reply(
    user_message: str,
    mood: str = "Playful",
    session_id: Optional[str] = None
) -> Tuple[str, str, str, Optional[str], Optional[str]]:
    """
    Returns: (reply, mode, model_name, ghost_action, error_note)
    mode is 'live' or 'demo'
    """
    sid, session = get_or_create_session(session_id)
    session["mood"] = mood
    session["turn_count"] += 1
    session["haunt_level"] = min(100, session["haunt_level"] + random.randint(2, 6))

    ghost_action = random.choice(GHOST_ACTIONS)

    global _live_ai_verified, _last_error_note

    # 1. Attempt Live AI if key is configured
    if is_key_configured():
        try:
            client = session.get("client")
            if client is None:
                client = get_shared_client()
                session["client"] = client

            system_prompt = MOOD_PROMPTS.get(mood, MOOD_PROMPTS["Playful"])
            context_note = f"Session turn: {session['turn_count']}. Haunt level: {session['haunt_level']}%."
            full_system_prompt = f"{system_prompt} {context_note}"

            thread_id = session.get("thread_id")
            
            call_kwargs = {
                "content": user_message,
                "system_prompt": full_system_prompt,
                "model_name": BACKBOARD_MODEL,
                "llm_provider": BACKBOARD_PROVIDER,
            }
            if thread_id:
                call_kwargs["thread_id"] = thread_id

            response = await client.send_message(**call_kwargs)

            # Extract reply text from content attribute or messages list
            reply_text = getattr(response, "content", None)
            raw_messages = getattr(response, "messages", None)
            if raw_messages is None and isinstance(response, dict):
                raw_messages = response.get("messages")

            if (not reply_text or not isinstance(reply_text, str)) and raw_messages and isinstance(raw_messages, list) and len(raw_messages) > 0:
                last_msg = raw_messages[-1]
                if isinstance(last_msg, dict):
                    reply_text = last_msg.get("content")
                elif hasattr(last_msg, "content"):
                    reply_text = last_msg.content
                else:
                    reply_text = str(last_msg)
            elif isinstance(response, dict) and "content" in response:
                reply_text = response.get("content")

            # Save thread id for persistent session memory
            thread_id_val = getattr(response, "thread_id", None)
            if not thread_id_val and isinstance(response, dict):
                thread_id_val = response.get("thread_id")
            if thread_id_val:
                session["thread_id"] = str(thread_id_val)

            # Check if Backboard reported an error inside message content or status
            status = getattr(response, "status", None)
            is_llm_error = False
            if status == "FAILED":
                is_llm_error = True
            if isinstance(reply_text, str) and (reply_text.startswith("LLM Error:") or "Error code:" in reply_text or "invalid model" in reply_text.lower()):
                is_llm_error = True

            if reply_text and isinstance(reply_text, str) and reply_text.strip() and not is_llm_error:
                _live_ai_verified = True
                _last_error_note = None
                session["messages"].append({"role": "user", "content": user_message})
                session["messages"].append({"role": "ghost", "content": reply_text.strip()})
                return reply_text.strip(), "live", BACKBOARD_MODEL, ghost_action, None
            else:
                _live_ai_verified = False
                safe_err = sanitize_error(reply_text or f"Backboard status: {status}")
                _last_error_note = safe_err
                error_note = safe_err
                logger.warning(f"Backboard returned error or empty response: {safe_err}")

        except Exception as e:
            _live_ai_verified = False
            safe_err = sanitize_error(f"Backboard API: {str(e)}")
            _last_error_note = safe_err
            error_note = safe_err
            logger.error(f"Backboard AI error: {safe_err}", exc_info=True)
    else:
        _live_ai_verified = False
        error_note = "No Backboard API key provided. Operating in honest Demo Mode."

    # 2. Transparent Fallback Demo Mode Engine
    # Uses context keywords + mood + session history to make it witty and alive
    reply_text = generate_demo_reply(user_message, mood, session)
    session["messages"].append({"role": "user", "content": user_message})
    session["messages"].append({"role": "ghost", "content": reply_text})
    
    return reply_text, "demo", "Demo Mode (Scripted Fallback)", ghost_action, error_note

def generate_demo_reply(message: str, mood: str, session: Dict[str, Any]) -> str:
    msg_lower = message.lower().strip()
    
    # Keyword-aware contextual quips
    if any(w in msg_lower for w in ["hi", "hello", "hey", "sup"]):
        greetings = {
            "Playful": "Boop! Greetings flesh-being. Ready to make some harmless digital mischief?",
            "Mischievous": "Well, well, look who decided to speak to their resident computer poltergeist.",
            "Dramatic": "Ah! You address me at last, solitary occupant of the monitor's cold glow!",
            "Slightly Spooky": "I was waiting in the shadows behind your cursor. Greetings..."
        }
        return greetings.get(mood, "Greetings mortal! I've been haunting this tab all morning.")

    if any(w in msg_lower for w in ["who are you", "what are you", "your name"]):
        return "I am Bytegeist 👻, the digital ghost living rent-free in your browser cache! I eat cookies (the HTTP kind) and sleep in RAM."

    if any(w in msg_lower for w in ["cookie", "eat", "food", "hungry"]):
        return "Did someone say cookies? I just intercepted three third-party tracking cookies. Tasted crisp and slightly tracker-flavored."

    if any(w in msg_lower for w in ["delete", "format", "trash", "recycle"]):
        return "Delete me? Ha! I'm already dead! You can't delete what's already a phantom in the machine."

    if any(w in msg_lower for w in ["scared", "afraid", "fear", "boo"]):
        return "BOO! Did you jump? No? Dang it, my ectoplasmic jump-scare calibration must be off by 30 milliseconds."

    if any(w in msg_lower for w in ["joke", "funny", "laugh"]):
        return "Why do ghosts love computers? Because of the screens, the byte-sized snacks, and the infinite haunted Windows!"

    if any(w in msg_lower for w in ["bye", "goodbye", "leave", "close"]):
        return "Leaving so soon? Don't forget: when you close this window, I'll be in your notifications. Watching. Silently."

    if any(w in msg_lower for w in ["ram", "memory", "cpu", "hardware", "speed"]):
        return "Your RAM is quite cozy! A bit dusty near slot 2, but it has excellent bandwidth for spectral levitation."

    # Mood-based collection
    pool = FALLBACK_DIALOGUES.get(mood, FALLBACK_DIALOGUES["Playful"])
    return random.choice(pool)

DIGITAL_INCIDENTS = [
    {
        "id": "ram_leak",
        "title": "Spectral RAM Siphon",
        "description": "Ghost siphoned 512MB of virtual memory into the ethereal plane to build a ghost fort.",
        "spook_level": 45,
        "effect_type": "shake",
        "quote": "Your RAM tasted delightfully warm. 10/10 would haunt again."
    },
    {
        "id": "cursor_scramble",
        "title": "Magnetic Poltergeist Surge",
        "description": "Harmless electromagnetic flux detected across the mouse pointer coordinates.",
        "spook_level": 60,
        "effect_type": "glitch",
        "quote": "Did you want to click that button, or were you aiming for the ghost next to it?"
    },
    {
        "id": "cookie_heist",
        "title": "HTTP Cookie Robbery",
        "description": "Intercepted session tokens have been converted into cyber-ectoplasm snacks.",
        "spook_level": 30,
        "effect_type": "ghost_rain",
        "quote": "Mmm, third-party analytics cookies are surprisingly crunchy."
    },
    {
        "id": "blue_screen_poltergeist",
        "title": "Fictional Kernel Spook",
        "description": "Simulated blue screen: 'ERR_GHOST_OVERFLOW: Too much personality for one machine.'",
        "spook_level": 85,
        "effect_type": "popup",
        "quote": "Don't panic! It's just a digital prank. Your files are safe... for now."
    },
    {
        "id": "spectral_inversion",
        "title": "Quantum Color Phase",
        "description": "Ghost breathed cold ectoplasm onto your display panel pixels.",
        "spook_level": 70,
        "effect_type": "invert",
        "quote": "I decided your screen needed more gothic ambience. Enjoy the void!"
    }
]

POSSESSION_THEMES = [
    {
        "id": "neon_cyber",
        "title": "Cyber-Exorcism Glitch",
        "intensity": "Supernatural",
        "duration_ms": 4500,
        "glitch_theme": "neon_cyber",
        "message": "⚡ BYTEGEIST HAS TAKEN OVER YOUR PIXELS ⚡",
        "audio_sound": "cyber_glitch"
    },
    {
        "id": "inverted_abyss",
        "title": "The Negative Ectoplasm Shift",
        "intensity": "Chilling",
        "duration_ms": 4000,
        "glitch_theme": "inverted_abyss",
        "message": "👁️ REALITY INVERTED: THE MACHINE BELONGS TO THE PHANTOMS 👁️",
        "audio_sound": "eerie_drone"
    },
    {
        "id": "spectral_matrix",
        "title": "Binary Poltergeist Swarm",
        "intensity": "Chaotic",
        "duration_ms": 5000,
        "glitch_theme": "spectral_matrix",
        "message": "👻 SYSTEM OVERRIDE: GHOSTS IN THE CIRCUITS DETECTED 👻",
        "audio_sound": "spectral_chime"
    }
]

def get_random_event() -> Dict[str, Any]:
    return random.choice(DIGITAL_INCIDENTS)

def trigger_possession() -> Dict[str, Any]:
    return random.choice(POSSESSION_THEMES)
