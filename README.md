# 🎙️ FreeVoice AI — Free Text to Speech

A modern, beautiful, 100% free Text-to-Speech web application powered by open-source TTS engines and browser Web Speech API.

---

## 📁 Folder Structure

```
freevoice-ai/
├── frontend/
│   └── index.html          ← Complete frontend (HTML + CSS + JS)
├── backend/
│   ├── server.js           ← Node.js + Express backend
│   ├── package.json        ← Backend dependencies
│   └── audio-output/       ← Generated audio files (auto-created)
└── README.md
```

---

## 🚀 Quick Start (Frontend Only — No Install Required)

The frontend works standalone using the **browser's built-in Web Speech API**:

1. Open `frontend/index.html` directly in your browser
2. Type or paste text
3. Select a voice and speed
4. Click **Generate Voice** — audio plays instantly in browser!

> ✅ No backend needed for basic use. The browser TTS fallback works on Chrome, Edge, Firefox, and Safari.

---

## ⚙️ Full Setup (With Backend for MP3 Downloads)

### Prerequisites
- Node.js 18+ → https://nodejs.org
- `espeak-ng` (optional, for server-side audio files)

### Install espeak-ng (Linux/Mac)
```bash
# Ubuntu / Debian
sudo apt-get install espeak-ng

# macOS
brew install espeak-ng

# Windows
# Download from: https://github.com/espeak-ng/espeak-ng/releases
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

The backend runs at: `http://localhost:3001`

### Frontend Setup
Just open `frontend/index.html` in your browser (or serve it):

```bash
# Simple static server (optional)
cd frontend
npx serve .
# Open http://localhost:3000
```

---

## 🌟 Features

| Feature | Status |
|---|---|
| Text to Speech (browser) | ✅ Works instantly |
| Text to Speech (server) | ✅ With espeak-ng installed |
| 8 AI Voices | ✅ |
| 3 Languages (EN, HI, ES) | ✅ |
| Download Audio | ✅ (backend) / Browser only |
| Voice Library + Preview | ✅ |
| Character Counter | ✅ |
| Dark / Light Mode | ✅ |
| Speed Control | ✅ |
| Mobile Responsive | ✅ |
| No Login Required | ✅ |
| 100% Free | ✅ |

---

## 🎤 Available Voices

| ID | Name | Language | Style |
|---|---|---|---|
| aria-female | Aria | English | Warm & Professional |
| james-male | James | English | Deep & Authoritative |
| narrator | Nova | English | Clear Narrator |
| deep-male | Titan | English | Rich & Deep |
| priya-hindi | Priya | Hindi | Hindi Female |
| arjun-hindi | Arjun | Hindi | Hindi Male |
| sofia-spanish | Sofia | Spanish | Spanish Female |
| carlos-spanish | Carlos | Spanish | Spanish Male |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/voices` | List all voices |
| POST | `/api/tts` | Generate speech |
| GET | `/api/download/:id` | Download audio file |

### POST /api/tts
```json
{
  "text": "Hello, world!",
  "voice_id": "aria-female"
}
```

**Response:**
```json
{
  "success": true,
  "audio_url": "/audio/uuid.wav",
  "file_id": "uuid",
  "voice": "Aria"
}
```

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, TailwindCSS CDN
- **Backend:** Node.js, Express.js
- **TTS Engine:** espeak-ng (server) + Web Speech API (browser fallback)
- **Fonts:** Syne + DM Sans (Google Fonts)

---

## 💡 Upgrading to Better TTS (Optional)

For more natural voices, you can replace espeak-ng with:

### Coqui TTS (Python)
```bash
pip install TTS
tts --text "Hello world" --out_path output.wav
```

### Piper TTS (Fast, offline)
```bash
# Download from: https://github.com/rhasspy/piper
echo "Hello world" | piper --model en_US-lessac-medium --output_file out.wav
```

Update `server.js` → `generateWithEspeak()` to call these instead.

---

## 📝 License

MIT — Free to use, modify, and distribute.

---

Made with ❤️ · FreeVoice AI · 100% Free Forever
