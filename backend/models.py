from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message to the ghost")
    mood: Optional[str] = Field("Playful", description="Current mood: Playful, Mischievous, Dramatic, Slightly Spooky")
    session_id: Optional[str] = Field(None, description="Client session identifier")

class ChatResponse(BaseModel):
    reply: str
    mood: str
    session_id: str
    mode: str  # "live" or "demo"
    model: str
    ghost_action: Optional[str] = None  # e.g. "floats upside down", "glitches screen", "snickers"
    personality_status: str
    traits: Dict[str, Any]
    error_note: Optional[str] = None

class MoodChangeRequest(BaseModel):
    mood: str = Field(..., description="Playful, Mischievous, Dramatic, Slightly Spooky")
    session_id: Optional[str] = None

class MoodChangeResponse(BaseModel):
    mood: str
    reaction: str
    status: str
    traits: Dict[str, Any]

class GhostEventResponse(BaseModel):
    event_id: str
    title: str
    description: str
    spook_level: int
    effect_type: str  # "shake", "glitch", "popup", "invert", "ghost_rain"
    ghost_quote: str

class PossessionResponse(BaseModel):
    possession_id: str
    title: str
    intensity: str
    duration_ms: int
    glitch_theme: str  # "neon_cyber", "inverted_abyss", "spectral_matrix", "bloody_terminal"
    message: str
    audio_sound: str  # sound cue name for frontend Web Audio synthesizer

class HealthResponse(BaseModel):
    status: str
    live_ai: bool
    model: str
    provider: str
    active_sessions: int
    version: str
    error: Optional[str] = None

