import { useState, useRef, useCallback, useEffect } from 'react';

// ── Text-to-Speech ────────────────────────────────────────────────────────────
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  // Pick best available voice — prefer warm/friendly ones
  const getVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();

    // Prefer Indian English voices first, then friendly voices.
    const indianVoice = voices.find(v =>
      v.lang?.startsWith('en-IN') ||
      /india|indian|aarti|prachi|priya|heera|arya|rishi/i.test(v.name)
    );
    if (indianVoice) return indianVoice;

    const preferred = [
      'Microsoft Priya',
      'Microsoft Heera',
      'Google India English',
      'Google UK English Male',
      'Microsoft David',
      'Daniel',
      'Alex',
      'Google US English',
    ];
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return voices.find(v => v.lang?.startsWith('en')) || voices[0];
  }, []);

  // ElevenLabs voice clone (used if configured)
  const speakElevenLabs = useCallback(async (text, elevenKey, elevenVoice) => {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}`, {
        method: 'POST',
        headers: {
          'xi-api-key':    elevenKey,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setSpeaking(true);
      audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch (err) {
      console.warn('ElevenLabs failed, using browser TTS:', err);
      speakBrowser(text); // fallback
    }
  }, []);

  // Browser built-in TTS
  const speakBrowser = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice  = getVoice();
    utter.rate   = 0.92;
    utter.pitch  = 1.05;
    utter.volume = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [getVoice]);

  const speak = useCallback((text) => {
    if (!text) return;
    try {
      const profile = JSON.parse(localStorage.getItem('buddy_profile') || '{}');
      const elevenKey = profile.elevenKey || '';
      const elevenVoice = profile.elevenVoice || '';
      if (elevenKey && elevenVoice) {
        speakElevenLabs(text, elevenKey, elevenVoice);
      } else {
        speakBrowser(text);
      }
    } catch {
      speakBrowser(text);
    }
  }, [speakElevenLabs, speakBrowser]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // Load voices async (Chrome requires this)
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  return { speak, stopSpeaking, speaking };
}

// ── Speech Recognition ────────────────────────────────────────────────────────
export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const [listening, setListening]   = useState(false);
  const [supported, setSupported]   = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const r = new SR();
      r.continuous      = false;
      r.interimResults  = false;
      r.lang            = 'en-US';
      r.maxAlternatives = 1;

      r.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onResult?.(transcript);
      };
      r.onend = () => {
        setListening(false);
        onEnd?.();
      };
      r.onerror = (e) => {
        console.warn('Speech error:', e.error);
        setListening(false);
      };
      recognitionRef.current = r;
    }
  }, [onResult, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {}
  }, [listening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, startListening, stopListening };
}
