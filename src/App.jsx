import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from './config.js';
import { useClaude }             from './hooks/useClaude.js';
import { useTTS, useSpeechRecognition } from './hooks/useVoice.js';
import { useStorage }            from './hooks/useStorage.js';
import BabaAvatar   from './components/BabaAvatar.jsx';
import MoodSelector from './components/MoodSelector.jsx';
import QuickActions from './components/QuickActions.jsx';
import YouTubeEmbed from './components/YouTubeEmbed.jsx';
import StarsBar     from './components/StarsBar.jsx';
import Settings     from './components/Settings.jsx';

// ── Screen states ─────────────────────────────────────────────────────────────
const SCREEN = { MOOD: 'mood', CHAT: 'chat' };

export default function App() {
  // ── Hooks ──────────────────────────────────────────────────────────────────
  const storage = useStorage();
  const { ask, loading, getGreeting, getJoke, getStory, getMathHelp, getDailyChallenge } = useClaude();
  const { speak, stopSpeaking, speaking } = useTTS();

  // ── State ──────────────────────────────────────────────────────────────────
  const [screen,       setScreen]      = useState(SCREEN.MOOD);
  const [avatarState,  setAvatarState] = useState('idle');
  const [messages,     setMessages]    = useState([]);
  const [inputText,    setInputText]   = useState('');
  const [currentMood,  setCurrentMood] = useState(null);
  const [videoQuery,   setVideoQuery]  = useState(null);
  const [showSettings, setShowSettings]= useState(false);
  const [musicArtsMode, setMusicArtsMode] = useState(null);
  const [profile,      setProfile]     = useState(() => storage.getProfile());
  const [stars,        setStars]       = useState(0);
  const [streak,       setStreak]      = useState(0);
  const [timeCtx,      setTimeCtx]     = useState(null);
  const [hugActive,    setHugActive]   = useState(false);

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  // ── Speech recognition ─────────────────────────────────────────────────────
  const handleVoiceResult = useCallback((transcript) => {
    setInputText(transcript);
    setAvatarState('thinking');
    setTimeout(() => handleSend(transcript), 300);
  }, []); // eslint-disable-line

  const { listening, supported: voiceSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleVoiceResult });

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load persistent data
    const s = storage.getStars();
    const st = storage.recordVisit();
    setStars(s);
    setStreak(st);
    setProfile(storage.getProfile());

    // Time context
    const h = new Date().getHours();
    let tod = 'morning';
    if (h >= 12 && h < 17) tod = 'afternoon';
    else if (h >= 17 && h < 20) tod = 'evening';
    else if (h >= 20) tod = 'night';
    setTimeCtx({ timeOfDay: tod, hour: h });

    // Check if last mood check was today
    const profile = storage.getProfile();
    const lastMoodDate = localStorage.getItem('buddy_lastMoodDate');
    const today = new Date().toDateString();
    if (lastMoodDate === today && profile.lastMood) {
      // Skip mood screen, go straight to chat with greeting
      setCurrentMood(profile.lastMood);
      setScreen(SCREEN.CHAT);
      triggerGreeting(tod);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Avatar sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (listening) setAvatarState('listening');
    else if (loading) setAvatarState('thinking');
    else if (speaking) setAvatarState('talking');
    else setAvatarState('idle');
  }, [listening, loading, speaking]);

  // ── Bedtime check ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeCtx?.timeOfDay === 'night') setAvatarState('night');
  }, [timeCtx]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addMessage = useCallback((from, text, extra = {}) => {
    const msg = { from, text, ts: Date.now(), ...extra };
    setMessages(prev => [...prev, msg]);
    storage.addMessage(msg);
  }, [storage]);

  const handleBabaReply = useCallback((reply) => {
    if (!reply) return;
    const { text, videoQuery: vq, alert } = reply;

    addMessage('baba', text);

    // Auto-speak
    const profile = storage.getProfile();
    if (profile.autoSpeak !== false) {
      speak(text);
    }

    // Video
    if (vq) {
      setTimeout(() => setVideoQuery(vq), 500);
      storage.addTopic(vq);
    }

    // Distress alert
    if (alert === 'sad') {
      // In a real app: send push notification to Baba's phone
      console.warn('[ALERT] Sri seems sad — notify Baba');
    }

    // Award a star for engagement
    if (Math.random() > 0.7) {
      storage.addStar();
      setStars(prev => prev + 1);
      setAvatarState('excited');
      setTimeout(() => setAvatarState('idle'), 2000);
    }
  }, [addMessage, storage, speak]);

  const triggerGreeting = useCallback(async (tod) => {
    setAvatarState('thinking');
    const reply = await getGreeting(tod || timeCtx?.timeOfDay);
    handleBabaReply(reply);
  }, [getGreeting, handleBabaReply, timeCtx]);

  // ── Mood selected ──────────────────────────────────────────────────────────
  const handleMoodSelected = useCallback(async (mood) => {
    storage.logMood(mood.value);
    localStorage.setItem('buddy_lastMoodDate', new Date().toDateString());
    const profile = storage.getProfile();
    storage.saveProfile({ ...profile, lastMood: mood.label });
    setCurrentMood(mood.label);
    setScreen(SCREEN.CHAT);

    // Greeting that accounts for mood
    setAvatarState('thinking');
    const greetPrompt = `Sri just opened the app. His mood is: ${mood.label} (${mood.emoji}). Time of day: ${timeCtx?.timeOfDay}. Give a warm personalised greeting that responds to his mood. Be empathetic if sad/angry, energetic if happy, gentle if tired.`;
    const reply = await ask(greetPrompt, { mood: mood.label });
    handleBabaReply(reply);
  }, [storage, ask, handleBabaReply, timeCtx]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    const msg = (text || inputText).trim();
    if (!msg || loading) return;
    setInputText('');
    stopSpeaking();

    addMessage('sri', msg);

    if (musicArtsMode === 'awaitChoice') {
      const choice = msg.toLowerCase();
      setMusicArtsMode(null);
      setAvatarState('thinking');

      const history = storage.getHistory();
      let prompt = '';

      if (isMusicChoice(choice)) {
        prompt = `Sri says he wants music help. Tell him you know he is interested in learning keyboard and drums, and ask him what he wants Baba to teach today. Keep it friendly and fun for an 8-year-old. If a video would be helpful, include a super relevant recommendation like [VIDEO:youtube.com/watch?v=dQw4w9WgXcQ] (find a real educational YouTube video ID for kids learning keyboard or drums).`;
      } else if (isArtsChoice(choice)) {
        prompt = `Sri says he wants art help. Tell him you know he loves painting and ask him what he wants to learn to draw today. Keep it warm and encouraging for an 8-year-old. If a video would be helpful, include a very relevant recommendation like [VIDEO:youtube.com/watch?v=dQw4w9WgXcQ] (find a real educational YouTube video ID for kids learning to draw or paint).`;
      } else {
        setAvatarState('idle');
        addMessage('baba', "I didn't catch that — do you want help with music or arts?");
        speak("I didn't catch that — do you want help with music or arts?");
        setMusicArtsMode('awaitChoice');
        return;
      }

      const reply = await ask(prompt, { mood: currentMood, history });
      handleBabaReply(reply);
      return;
    }

    setAvatarState('thinking');
    const history = storage.getHistory();
    const reply = await ask(msg, { mood: currentMood, history });
    handleBabaReply(reply);
  }, [inputText, loading, stopSpeaking, addMessage, storage, ask, currentMood, handleBabaReply, musicArtsMode]);

  const isMusicChoice = (text) => /\bmusic\b|keyboard|drums|guitar|piano|sing|song|instrument/.test(text.toLowerCase());
  const isArtsChoice = (text) => /\bart\b|arts|drawing|draw|painting|paint|sketch|picture/.test(text.toLowerCase());

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // ── Quick actions ──────────────────────────────────────────────────────────
  const handleAction = useCallback(async (actionId) => {
    stopSpeaking();
    setAvatarState('thinking');

    let label = '';
    let replyPromise;

    switch (actionId) {
      case 'joke':
        label = '😂 Tell me a joke!';
        replyPromise = getJoke();
        break;
      case 'story':
        label = '📖 Tell me a story!';
        replyPromise = getStory();
        break;
      case 'math':
        label = '🔢 Help me with math!';
        addMessage('sri', label);
        addMessage('baba', "Of course! Tell me the math problem you're working on and I'll help you figure it out step by step! 🔢✨");
        speak("Of course! Tell me the math problem you're working on and I'll help you figure it out step by step!");
        setAvatarState('idle');
        return;
      case 'science':
        label = '🔬 Tell me something amazing about science!';
        replyPromise = ask(`Tell Sri something absolutely mind-blowing about science that an 8-year-old would find incredible. Make it feel like magic! If there's a great visual for this topic, add [VIDEO:youtube.com/watch?v=VIDEO_ID] with a real educational YouTube video ID for kids.`, { mood: currentMood });
        break;
      case 'music':
        label = '🎵 Music & Arts';
        addMessage('sri', label);
        addMessage('baba', 'What would you like Baba to help you with today — music or arts?');
        speak('What would you like Baba to help you with today — music or arts?');
        setAvatarState('idle');
        setMusicArtsMode('awaitChoice');
        return;
      case 'challenge':
        label = '🎯 Give me a daily challenge!';
        replyPromise = getDailyChallenge();
        break;
      case 'hug':
        setHugActive(true);
        setAvatarState('hug');
        addMessage('sri', '🤗 I want a hug!');
        addMessage('baba', `Sri, Baba is sending you the BIGGEST hug right now from far away! 🤗💛 Can you feel it? Close your eyes and imagine Baba hugging you super tight. I love you so so much, my little star! You are never alone. ❤️`);
        speak("Sri, Baba is sending you the BIGGEST hug right now from far away! Can you feel it? Close your eyes and imagine Baba hugging you super tight. I love you so so much, my little star!");
        setTimeout(() => { setHugActive(false); setAvatarState('idle'); }, 4000);
        return;
      case 'message':
        label = '💌 I want to send a message to Baba!';
        addMessage('sri', label);
        addMessage('baba', `That makes Baba SO happy! 💛 Type or speak your message and I'll save it for Baba to read. What do you want to tell Baba today?`);
        speak("That makes Baba SO happy! Type or speak your message and I'll save it for Baba to read. What do you want to tell Baba today?");
        setAvatarState('idle');
        // Next message from Sri will be tagged as a journal/dad-message
        return;
      default:
        return;
    }

    if (label) addMessage('sri', label);
    if (replyPromise) {
      const reply = await replyPromise;
      handleBabaReply(reply);
    }
  }, [stopSpeaking, getJoke, getStory, getDailyChallenge, ask, addMessage, speak, handleBabaReply, currentMood]);

  // ── Window controls (Electron) ─────────────────────────────────────────────
  const handleMinimize = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100dvh', width: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-deep)',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Custom Titlebar */}
      <div style={{
        height: 32,
        background: 'rgba(14,18,48,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        WebkitAppRegion: 'drag', // Make draggable
        position: 'relative',
        zIndex: 1000,
      }}>
        <div style={{ fontSize: 12, color: '#8892b0', fontWeight: 600 }}>
          Buddy - Your Pal is Here! 💛
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleMinimize}
            style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: '#FFD166',
              border: 'none',
              cursor: 'pointer',
              WebkitAppRegion: 'no-drag',
            }}
            title="Minimize"
          />
          <button
            onClick={handleClose}
            style={{
              width: 12, height: 12,
              borderRadius: '50%',
              background: '#FF6B6B',
              border: 'none',
              cursor: 'pointer',
              WebkitAppRegion: 'no-drag',
            }}
            title="Close"
          />
        </div>
      </div>

      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: hugActive
          ? 'radial-gradient(ellipse at 50% 30%, rgba(255,107,107,0.15) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 20%, rgba(17,138,178,0.12) 0%, transparent 70%)',
        transition: 'background 1s',
      }} />

      {/* Stars background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top:  `${Math.random() * 100}%`,
            width: Math.random() > 0.8 ? 2 : 1,
            height: Math.random() > 0.8 ? 2 : 1,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.2 + Math.random() * 0.4,
            animation: `breathe ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
          }} />
        ))}
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <StarsBar
          stars={stars}
          streak={streak}
          mood={currentMood}
          onSettings={() => setShowSettings(true)}
        />
      </div>

      {/* ── MOOD SCREEN ── */}
      {screen === SCREEN.MOOD && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
          <BabaAvatar state="idle" onHug={() => {}} />
          <MoodSelector onSelect={handleMoodSelected} childName={CONFIG.CHILD_NAME} />
        </div>
      )}

      {/* ── CHAT SCREEN ── */}
      {screen === SCREEN.CHAT && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 5 }}>

          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <BabaAvatar
              state={avatarState}
              onHug={() => handleAction('hug')}
              faceImage={profile.avatarFace}
            />
            <div style={{ textAlign: 'center', fontSize: 11, color: '#8892b0', marginTop: -8, marginBottom: 4 }}>
              {avatarState === 'idle' && 'Tap Baba for a hug 💛'}
              {avatarState === 'listening' && '🎙️ Listening...'}
              {avatarState === 'thinking' && '💭 Baba is thinking...'}
              {avatarState === 'talking' && '🗣️ Baba is talking...'}
              {avatarState === 'hug' && '🤗 Sending love!'}
            </div>
          </div>

          {/* Quick actions (shown when no messages yet) */}
          {messages.length <= 2 && (
            <div style={{ flexShrink: 0, marginBottom: 8 }}>
              <QuickActions onAction={handleAction} disabled={loading} />
            </div>
          )}

          {/* Chat messages */}
          <div className="scrollable" style={{ flex: 1, padding: '4px 16px 8px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'sri' ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}>
                {msg.from === 'baba' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #118AB2, #06D6A0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
                  }}>😊</div>
                )}
                <div className={msg.from === 'baba' ? 'bubble-baba' : 'bubble-sri'}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #118AB2, #06D6A0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>😊</div>
                <div className="bubble-baba" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#FFD166',
                        animation: `thinking-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* YouTube video panel */}
          {videoQuery && (
            <div style={{ flexShrink: 0 }}>
              <YouTubeEmbed query={videoQuery} onClose={() => setVideoQuery(null)} />
            </div>
          )}

          {/* Input bar */}
          <div style={{
            flexShrink: 0,
            display: 'flex', gap: 8, padding: '10px 12px',
            background: 'rgba(14,18,48,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(10px)',
          }}>
            {/* More actions toggle */}
            {messages.length > 2 && (
              <button
                onClick={() => setMessages([])}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, width: 42, height: 42, fontSize: 18, color: '#fff', flexShrink: 0,
                }}
                title="New chat"
              >🏠</button>
            )}

            {/* Text input */}
            <input
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Ask Baba anything, ${CONFIG.CHILD_NAME}! 💛`}
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '10px 14px',
                color: '#fff', fontSize: 14,
                fontFamily: 'Nunito, sans-serif',
                outline: 'none',
              }}
            />

            {/* Mic button */}
            {voiceSupported && (
              <button
                onClick={toggleListening}
                disabled={loading}
                title={listening ? 'Stop listening' : 'Start voice input'}
                style={{
                  background: listening
                    ? 'linear-gradient(135deg, #FF6B6B, #ff4444)'
                    : 'linear-gradient(135deg, #06D6A0, #118AB2)',
                  border: 'none', borderRadius: 14,
                  width: 42, height: 42, fontSize: 20, flexShrink: 0,
                  boxShadow: listening ? '0 0 20px rgba(255,107,107,0.5)' : 'none',
                  transition: 'all 0.2s',
                }}
              >{listening ? '⏹' : '🎙️'}</button>
            )}

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputText.trim()}
              style={{
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #FFD166, #FF6B35)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 14,
                width: 42, height: 42, fontSize: 18, flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >➤</button>
          </div>
        </div>
      )}

      {/* Settings overlay */}
      {showSettings && <Settings
        profile={profile}
        onProfileSave={setProfile}
        onClose={() => setShowSettings(false)}
      />}
    </div>
  );
}
