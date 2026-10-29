# 👻 Ghost in Your Computer — PhantomOS (Bytegeist)

> Built for the **Hacktoberfest 2026 DEV Week Challenge: Ghost in the Machine**  
> Powered by Meta's open-weight model **`meta-llama/llama-3.1-8b-instruct`** via **Backboard AI** ($5 Free Hackathon Credit)

---

## 🌟 Overview & Concept

**Ghost in Your Computer 👻** introduces **Bytegeist**, a funny, sarcastic, and mischievous digital ghost that lives inside an interactive retro-cyber desktop operating system called **PhantomOS 13.0**. 

Rather than a generic chatbot wrapped in a spooky skin, Bytegeist is a living digital character with an evolving personality, distinct moods, interactive reactions, and supernatural agency over the interface. Bytegeist complains about your open tabs, steals browser cookies (the chocolate chip kind), laments its deleted source code, and can even temporarily possess your browser window with CRT glitch scanlines!

---

## 🧠 AI Core Architecture: Meta Llama 3.1 8B via Backboard

- **Model Identifier**: `meta-llama/llama-3.1-8b-instruct`
- **Inference Gateway**: [Backboard AI](https://app.backboard.io) (`backboard-sdk>=1.5.0`)
- **Cost**: Uses the existing **$5 free credit** provided by Backboard; zero paid services or extra billing required.
- **Privacy & Security**: All API keys remain strictly in backend environment variables. The client browser never receives or handles raw credentials.
- **Honest Mode Switching**: The application features a real-time status pill in the desktop top bar:
  - 🟢 **LIVE AI MODE**: Active when a valid `BACKBOARD_API_KEY` is configured in the backend environment. Bytegeist's dialogue, jokes, and reactions are generated in real-time by Llama 3.1 8B.
  - 🟡 **DEMO MODE (Simulated AI Fallback)**: Automatically active if the API key is unconfigured, rate-limited, or network-disconnected. Instead of faking successful API calls or failing silently, the app transparently indicates Demo Mode and activates a rich, humorous contextual dialogue engine.

---

## 💡 Why Open Innovation Matters

In alignment with the Hacktoberfest open innovation principles:

> **Open-weight models like Meta Llama 3.1 8B Instruct represent a crucial paradigm for the future of software.**
> 
> 1. **Developer Autonomy**: Unlike closed-source proprietary APIs that can change weights, deprecate endpoints, or alter safety boundaries without warning, open-weight models give developers deep control over model selection, system prompt adherence, temperature parameters, and architectural freedom.
> 2. **Experimentation & Fine-Tuning**: Open weights allow teams to inspect model behavior, fine-tune on domain-specific datasets (such as character personalities, game lore, or technical dialects), and verify tokenizer behavior.
> 3. **Future Self-Hosting**: While this project uses Backboard's hosted API gateway for rapid deployment within the $5 free credit tier, the underlying model (`meta-llama/llama-3.1-8b-instruct`, governed by the Meta Llama 3.1 Community License) allows any developer to transition to self-hosted infrastructure (vLLM, Ollama, TGI) without rewriting application prompts or logic.
> 
> *Note: This implementation routes prompts through Backboard's hosted API endpoints and does not claim to run offline or keep prompts solely on local hardware.*

---

## 🎮 Key Features & Interactive Mechanics

| Feature | Description |
| :--- | :--- |
| **Living Animated Ghost** | Custom animated SVG ghost that floats with sinusoidal physics, radiates an ectoplasm aura, blinks and squints based on mood, and **reacts with dialogue when clicked or tickled**! |
| **Talk to Your Ghost** | Interactive terminal (`SpookTerminal`) with session preservation, quick suggestion prompt pills, and message timestamps. |
| **4 Dynamic Moods** | Switch between **Playful** 🎈, **Mischievous** 😈, **Dramatic** 🎭, and **Slightly Spooky** 👁️. Each mood modulates the AI's system prompt, personality stats, eye shapes, and aura frequency. |
| **🎲 Digital Incidents** | Button triggering harmless fictional digital incidents (e.g. *Spectral RAM Siphon*, *Cookie Heist*, *Fictional Kernel Spook*, *Cursor Coordinate Scramble*) complete with hazard ratings and ghost quotes. |
| **⚡ Possession Mode** | Bytegeist takes over your browser with animated CRT scanlines, chromatic RGB aberration, window shake, spooky floating runes, and a countdown timer with an emergency "Quick Exorcism" button. |
| **🧠 Spectral Telemetry** | Personality Card showing live metrics: Spookiness, Sarcasm, Mischief, Drama, Haunt Level (0–100%), Aura Frequency, and a **Memory Reset** button. |
| **🔊 Web Audio Synthesizer** | Native Web Audio API sound engine that synthesizes 8-bit blips, ethereal chimes, and glitch frequencies without external MP3 files. **Muted by default to respect zero-autoplay policies.** |
| **🛡️ 100% Safe & Sandboxed** | Purely simulated inside the webpage. Never touches real computer files, executes shell commands, or monitors private user data. |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Vanilla CSS (Design tokens, glassmorphism, CRT glitch filters, micro-animations), Lucide React.
- **Audio**: HTML5 Web Audio API (`AudioContext`, Oscillator nodes, Gain envelopes).
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, Python-Dotenv.
- **AI SDK**: `backboard-sdk>=1.5.0` connecting to `meta-llama/llama-3.1-8b-instruct`.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### 1. Clone & Configure Environment

```bash
git clone https://github.com/your-username/ghost-in-your-computer.git
cd "Ghost in Your Computer 👻"

# Copy example environment configuration
cp .env.example .env
```

Edit `.env` (optional, for live AI mode):
```env
BACKBOARD_API_KEY=your_backboard_api_key_here
BACKBOARD_MODEL=meta-llama/llama-3.1-8b-instruct
PORT=8001
HOST=127.0.0.1
```
*(If left empty or with placeholder, the application automatically runs in honest Demo Mode!)*

---

### 2. Start the Backend (FastAPI)

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server from the project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

The backend will be available at:
- **API Health**: [http://127.0.0.1:8001/api/health](http://127.0.0.1:8001/api/health)
- **Interactive Swagger Docs**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

---

### 3. Start the Frontend (Vite + React)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173/`** to meet Bytegeist!

---

### 4. Alternative: Single-Server Unified Production Deployment

FastAPI can serve both the API and the static React bundle together from a single port:

```bash
# Build the React frontend
cd frontend
npm run build
cd ..

# Run FastAPI (it automatically mounts frontend/dist when present)
python backend/main.py
```

Then visit **`http://localhost:8001/`**.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server operational status, Backboard AI availability, and model identifier. |
| `POST` | `/api/chat` | Send message to Bytegeist with current mood and session ID. |
| `POST` | `/api/mood` | Calibrate Bytegeist's mood (`Playful`, `Mischievous`, `Dramatic`, `Slightly Spooky`). |
| `POST` | `/api/event` | Generate a random fictional digital incident. |
| `POST` | `/api/possess` | Trigger the possession glitch takeover sequence. |
| `GET` | `/api/session/{id}` | Inspect conversation turn count, haunt level, and traits for a session. |
| `DELETE` | `/api/session/{id}` | Clear ghost memory for the current session. |

---

## 🔒 Safety and Privacy

1. **Simulated Sandbox**: All effects (glitches, RAM complaints, screen shakes, font changes) are restricted strictly to the DOM.
2. **No Secret Files**: The application has no file system inspection capabilities, execute commands, or telemetry on local computer files.
3. **API Key Hygiene**: Keys are loaded exclusively by the Python backend via environment variables and are excluded from version control via `.gitignore`.

---

## 📜 License & Acknowledgments

- **Challenge**: Hacktoberfest 2026 DEV Week Challenge — Ghost in the Machine.
- **Model**: `meta-llama/llama-3.1-8b-instruct` by Meta AI under the [Meta Llama 3.1 Community License](https://llama.meta.com/llama3/license/).
- **Gateway**: Backboard AI SDK.
- **Project License**: MIT License.
