import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory and project root are always in sys.path
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent
for p in [str(backend_dir), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Explicitly load .env from the project root first, then backend dir and cwd
load_dotenv(root_dir / ".env", override=True)
load_dotenv(backend_dir / ".env", override=True)
load_dotenv(Path.cwd() / ".env", override=True)

BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY", "").strip()
BACKBOARD_MODEL = os.getenv("BACKBOARD_MODEL", "meta-llama/llama-3.1-8b-instruct").strip()
BACKBOARD_PROVIDER = os.getenv("BACKBOARD_PROVIDER", "openrouter").strip()
PORT = int(os.getenv("PORT", "8001"))
HOST = os.getenv("HOST", "127.0.0.1")

def is_key_configured() -> bool:
    """Returns True if a non-placeholder BACKBOARD_API_KEY is present in environment."""
    return bool(BACKBOARD_API_KEY and not BACKBOARD_API_KEY.startswith("your_") and len(BACKBOARD_API_KEY) > 8)

