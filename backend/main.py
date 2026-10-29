import os
import random
import sys
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure backend directory and project root are always in sys.path
_backend_dir = Path(__file__).resolve().parent
_root_dir = _backend_dir.parent
for _p in [str(_backend_dir), str(_root_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.config import BACKBOARD_MODEL, PORT, HOST, is_key_configured
    from backend.models import (
        ChatRequest,
        ChatResponse,
        MoodChangeRequest,
        MoodChangeResponse,
        GhostEventResponse,
        PossessionResponse,
        HealthResponse,
    )
    from backend.ghost_ai import (
        generate_ghost_reply,
        get_or_create_session,
        get_personality_traits,
        STATUS_BY_MOOD,
        SESSION_STORE,
        get_random_event,
        trigger_possession,
        verify_live_ai,
        is_live_ai_active,
    )
except ImportError:
    try:
        from .config import BACKBOARD_MODEL, PORT, HOST, is_key_configured
        from .models import (
            ChatRequest,
            ChatResponse,
            MoodChangeRequest,
            MoodChangeResponse,
            GhostEventResponse,
            PossessionResponse,
            HealthResponse,
        )
        from .ghost_ai import (
            generate_ghost_reply,
            get_or_create_session,
            get_personality_traits,
            STATUS_BY_MOOD,
            SESSION_STORE,
            get_random_event,
            trigger_possession,
            verify_live_ai,
            is_live_ai_active,
        )
    except ImportError:
        from config import BACKBOARD_MODEL, PORT, HOST, is_key_configured
        from models import (
            ChatRequest,
            ChatResponse,
            MoodChangeRequest,
            MoodChangeResponse,
            GhostEventResponse,
            PossessionResponse,
            HealthResponse,
        )
        from ghost_ai import (
            generate_ghost_reply,
            get_or_create_session,
            get_personality_traits,
            STATUS_BY_MOOD,
            SESSION_STORE,
            get_random_event,
            trigger_possession,
            verify_live_ai,
            is_live_ai_active,
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify Live AI upon startup if key is configured
    if is_key_configured():
        asyncio.create_task(verify_live_ai())
    yield

app = FastAPI(
    title="Ghost in Your Computer - Bytegeist API",
    description="Backend API powering the digital poltergeist Bytegeist via Backboard Llama-3.1-8b-instruct",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    is_live, err_note = is_live_ai_active()
    # If key is present but verification hasn't completed yet, perform check
    if not is_live and is_key_configured() and err_note is None:
        is_live, err_note = await verify_live_ai(timeout=6.0)

    return HealthResponse(
        status="haunted_and_operational",
        live_ai=is_live,
        model=BACKBOARD_MODEL if is_live else "Demo Mode (Scripted Fallback)",
        provider="Backboard AI" if is_live else "Offline Engine",
        active_sessions=len(SESSION_STORE),
        version="1.0.0",
        error=err_note
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ghost(req: ChatRequest):
    sid, session = get_or_create_session(req.session_id)
    mood = req.mood or session.get("mood", "Playful")

    reply, mode, model_name, ghost_action, error_note = await generate_ghost_reply(
        user_message=req.message,
        mood=mood,
        session_id=sid
    )

    traits = get_personality_traits(mood, session["haunt_level"])
    status_msg = STATUS_BY_MOOD.get(mood, "Haunting this computer with enthusiasm")

    return ChatResponse(
        reply=reply,
        mood=mood,
        session_id=sid,
        mode=mode,
        model=model_name,
        ghost_action=ghost_action,
        personality_status=status_msg,
        traits=traits,
        error_note=error_note
    )

@app.post("/api/mood", response_model=MoodChangeResponse)
async def change_ghost_mood(req: MoodChangeRequest):
    sid, session = get_or_create_session(req.session_id)
    mood = req.mood

    if mood not in STATUS_BY_MOOD:
        mood = "Playful"

    session["mood"] = mood
    session["haunt_level"] = min(100, session["haunt_level"] + random.randint(3, 8))

    reactions = {
        "Playful": "Woohoo! Let's play digital hide-and-seek behind your pinned tabs!",
        "Mischievous": "Hehehe... activating chaos mode! Better keep an eye on your mouse cursor.",
        "Dramatic": "Alas! The tragic curtain rises upon another solemn act of silicon torment!",
        "Slightly Spooky": "The shadows lengthen across your desktop. The veil grows thin..."
    }

    traits = get_personality_traits(mood, session["haunt_level"])
    return MoodChangeResponse(
        mood=mood,
        reaction=reactions.get(mood, "Mood calibrated to eerie frequencies."),
        status=STATUS_BY_MOOD.get(mood, "Observing you silently"),
        traits=traits
    )

@app.post("/api/event", response_model=GhostEventResponse)
async def trigger_digital_incident():
    event = get_random_event()
    return GhostEventResponse(
        event_id=event["id"],
        title=event["title"],
        description=event["description"],
        spook_level=event["spook_level"],
        effect_type=event["effect_type"],
        ghost_quote=event["quote"]
    )

@app.post("/api/possess", response_model=PossessionResponse)
async def activate_possession():
    possession = trigger_possession()
    return PossessionResponse(
        possession_id=possession["id"],
        title=possession["title"],
        intensity=possession["intensity"],
        duration_ms=possession["duration_ms"],
        glitch_theme=possession["glitch_theme"],
        message=possession["message"],
        audio_sound=possession["audio_sound"]
    )

@app.get("/api/session/{session_id}")
async def get_session_info(session_id: str):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Ghost has no memory of this session")
    sess = SESSION_STORE[session_id]
    return {
        "session_id": session_id,
        "mood": sess.get("mood"),
        "turn_count": sess.get("turn_count"),
        "haunt_level": sess.get("haunt_level"),
        "message_count": len(sess.get("messages", [])),
        "traits": get_personality_traits(sess.get("mood", "Playful"), sess.get("haunt_level", 42)),
        "thread_persisted": bool(sess.get("thread_id"))
    }

@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    if session_id in SESSION_STORE:
        del SESSION_STORE[session_id]
    return {"status": "cleared", "message": "Ghost memory for this session banished to the ethereal recycle bin."}

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't catch /api
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    app_target = "backend.main:app" if __package__ else "main:app"
    uvicorn.run(app_target, host=HOST, port=PORT, reload=True)

