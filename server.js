const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests, please wait a moment.' }
});
app.use('/api/', limiter);

// Serve static audio files
const audioDir = path.join(__dirname, 'audio-output');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
app.use('/audio', express.static(audioDir));

// Voice configurations
const VOICES = {
  'aria-female': { name: 'Aria', gender: 'female', lang: 'en', description: 'Warm & Professional', pitch: 1.1, rate: 1.0 },
  'james-male': { name: 'James', gender: 'male', lang: 'en', description: 'Deep & Authoritative', pitch: 0.85, rate: 0.95 },
  'narrator': { name: 'Nova', gender: 'female', lang: 'en', description: 'Clear Narrator', pitch: 1.0, rate: 0.9 },
  'deep-male': { name: 'Titan', gender: 'male', lang: 'en', description: 'Rich & Deep', pitch: 0.75, rate: 0.88 },
  'priya-hindi': { name: 'Priya', gender: 'female', lang: 'hi', description: 'Hindi Female', pitch: 1.15, rate: 1.0 },
  'arjun-hindi': { name: 'Arjun', gender: 'male', lang: 'hi', description: 'Hindi Male', pitch: 0.9, rate: 0.95 },
  'sofia-spanish': { name: 'Sofia', gender: 'female', lang: 'es', description: 'Spanish Female', pitch: 1.1, rate: 1.05 },
  'carlos-spanish': { name: 'Carlos', gender: 'male', lang: 'es', description: 'Spanish Male', pitch: 0.88, rate: 0.98 },
};

// Routes
app.get('/api/voices', (req, res) => {
  const voiceList = Object.entries(VOICES).map(([id, v]) => ({
    id,
    name: v.name,
    gender: v.gender,
    language: v.lang,
    description: v.description
  }));
  res.json({ voices: voiceList });
});

// TTS generation using Web Speech API fallback / espeak / festival
app.post('/api/tts', async (req, res) => {
  const { text, voice_id, language } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required.' });
  }
  if (text.length > 5000) {
    return res.status(400).json({ error: 'Text exceeds 5000 character limit.' });
  }

  const voiceConfig = VOICES[voice_id] || VOICES['aria-female'];
  const fileId = uuidv4();
  const outputPath = path.join(audioDir, `${fileId}.wav`);

  try {
    // Try espeak-ng first (most commonly available on Linux)
    const success = await generateWithEspeak(text, voiceConfig, outputPath);
    if (success) {
      const audioUrl = `/audio/${fileId}.wav`;
      // Schedule cleanup after 30 minutes
      setTimeout(() => { try { fs.unlinkSync(outputPath); } catch(e){} }, 30 * 60 * 1000);
      return res.json({ success: true, audio_url: audioUrl, file_id: fileId, voice: voiceConfig.name });
    }
    throw new Error('espeak generation failed');
  } catch (err) {
    console.error('TTS Error:', err.message);
    // Fallback: generate a simple silent WAV with metadata so client can use browser TTS
    return res.json({
      success: true,
      use_browser_tts: true,
      text: text,
      voice_config: { pitch: voiceConfig.pitch, rate: voiceConfig.rate, lang: voiceConfig.lang },
      voice: voiceConfig.name
    });
  }
});

async function generateWithEspeak(text, voiceConfig, outputPath) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    
    // Map language codes to espeak voices
    const langMap = { en: 'en', hi: 'hi', es: 'es' };
    const espeakLang = langMap[voiceConfig.lang] || 'en';
    const genderFlag = voiceConfig.gender === 'female' ? '+f3' : '+m3';
    const pitch = Math.round(voiceConfig.pitch * 50);
    const speed = Math.round(voiceConfig.rate * 150);

    // Escape text for shell
    const escapedText = text.replace(/'/g, "'\\''").substring(0, 5000);
    const cmd = `espeak-ng -v ${espeakLang}${genderFlag} -p ${pitch} -s ${speed} -w "${outputPath}" '${escapedText}' 2>/dev/null`;
    
    exec(cmd, { timeout: 30000 }, (error) => {
      if (error || !fs.existsSync(outputPath)) {
        // Try plain espeak
        const cmd2 = `espeak -v ${espeakLang} -p ${pitch} -s ${speed} -w "${outputPath}" '${escapedText}' 2>/dev/null`;
        exec(cmd2, { timeout: 30000 }, (err2) => {
          resolve(!err2 && fs.existsSync(outputPath));
        });
      } else {
        resolve(true);
      }
    });
  });
}

// Download endpoint
app.get('/api/download/:fileId', (req, res) => {
  const filePath = path.join(audioDir, `${req.params.fileId}.wav`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found or expired.' });
  }
  res.download(filePath, 'freevoice-audio.wav');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FreeVoice AI is running!' });
});

app.listen(PORT, () => {
  console.log(`\n🎙️  FreeVoice AI Backend running on http://localhost:${PORT}`);
  console.log(`📡  API: http://localhost:${PORT}/api/health\n`);
});
