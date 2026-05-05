import { useEffect, useState } from 'react';

// Avatar states: idle | listening | thinking | talking | excited | hug | night
export default function BabaAvatar({ state = 'idle', onHug, faceImage }) {
  const [particles, setParticles] = useState([]);

  // Generate star particles on excited / hug
  useEffect(() => {
    if (state === 'excited' || state === 'hug') {
      const pts = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: Math.random() * 120 - 60,
        y: -(Math.random() * 80 + 20),
        emoji: ['⭐', '✨', '💛', '🌟', '💫'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.5,
      }));
      setParticles(pts);
      const t = setTimeout(() => setParticles([]), 1500);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Colors / expressions per state
  const stateConfig = {
    idle:      { ring: '#118AB2', glow: 'rgba(17,138,178,0.3)',  emoji: '😊', anim: 'float 3s ease-in-out infinite' },
    listening: { ring: '#06D6A0', glow: 'rgba(6,214,160,0.4)',   emoji: '👂', anim: 'breathe 1s ease-in-out infinite' },
    thinking:  { ring: '#FFD166', glow: 'rgba(255,209,102,0.4)', emoji: '🤔', anim: 'breathe 1.5s ease-in-out infinite' },
    talking:   { ring: '#FF6B6B', glow: 'rgba(255,107,107,0.4)', emoji: '🗣️', anim: 'breathe 0.6s ease-in-out infinite' },
    excited:   { ring: '#FFD166', glow: 'rgba(255,209,102,0.6)', emoji: '🥳', anim: 'breathe 0.4s ease-in-out infinite' },
    hug:       { ring: '#FF6B6B', glow: 'rgba(255,107,107,0.6)', emoji: '🤗', anim: 'breathe 0.8s ease-in-out infinite' },
    night:     { ring: '#8888cc', glow: 'rgba(136,136,204,0.3)', emoji: '😴', anim: 'float 4s ease-in-out infinite' },
  };

  const cfg = stateConfig[state] || stateConfig.idle;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>

      {/* Outer glow ring — pulses */}
      <div style={{
        position: 'absolute',
        width: 160, height: 160,
        borderRadius: '50%',
        border: `2px solid ${cfg.ring}`,
        opacity: 0.5,
        animation: 'pulse-ring 2s ease-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Middle ring */}
      <div style={{
        position: 'absolute',
        width: 140, height: 140,
        borderRadius: '50%',
        border: `2px solid ${cfg.ring}`,
        opacity: 0.3,
        animation: 'pulse-ring 2s ease-out infinite 0.5s',
        pointerEvents: 'none',
      }} />

      {/* Orbit ring (listening state) */}
      {state === 'listening' && (
        <div style={{
          position: 'absolute', width: 150, height: 150,
          borderRadius: '50%',
          border: '2px dashed #06D6A0',
          opacity: 0.6,
          animation: 'spin-slow 3s linear infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Main avatar circle — clickable for hug */}
      <div
        onClick={onHug}
        style={{
          position: 'relative',
          width: 120, height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${cfg.ring}33, #0e1230)`,
          border: `3px solid ${cfg.ring}`,
          boxShadow: `0 0 30px ${cfg.glow}, inset 0 0 20px rgba(0,0,0,0.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 2,
          transition: 'box-shadow 0.3s',
          overflow: 'hidden',
        }}
      >
        {/* Face image or emoji fallback */}
        {faceImage ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
            <img
              src={faceImage}
              alt="Baba face"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.95) saturate(1.1)', transform: 'scale(1.04)' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 40% 38%, rgba(255,255,255,0.15), transparent 45%)',
              pointerEvents: 'none',
            }} />
            {state === 'talking' && (
              <div style={{
                position: 'absolute', left: '50%', bottom: 18,
                transform: 'translateX(-50%)',
                width: 36, height: 14,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.75)',
                opacity: 0.85,
                animation: 'mouth-talk 0.4s ease-in-out infinite alternate',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        ) : (
          <span style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
            {cfg.emoji}
          </span>
        )}

        {/* Name badge */}
        <div style={{
          position: 'absolute', bottom: -12,
          background: cfg.ring,
          borderRadius: 20, padding: '2px 10px',
          fontSize: 11, fontWeight: 800, color: '#0a0e1a',
          letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}>Baba</div>
      </div>

      {/* Thinking dots */}
      {state === 'thinking' && (
        <div style={{
          position: 'absolute', top: 16, right: 20,
          display: 'flex', gap: 5,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#FFD166',
              animation: `thinking-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Voice waveform (talking / listening) */}
      {(state === 'talking' || state === 'listening') && (
        <div style={{
          position: 'absolute', bottom: 8,
          display: 'flex', gap: 3, alignItems: 'center',
        }}>
          {[0.4, 0.7, 1, 0.7, 0.4, 0.9, 0.5].map((h, i) => (
            <div key={i} style={{
              width: 4, borderRadius: 2,
              background: state === 'talking' ? '#FF6B6B' : '#06D6A0',
              height: 20 * h,
              animation: `wave-bar ${0.4 + i * 0.05}s ease-in-out ${i * 0.06}s infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* Particle burst */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(${p.x}px, ${p.y}px)`,
          fontSize: 18,
          animation: `stars-drift 1.2s ease-out ${p.delay}s forwards`,
          pointerEvents: 'none',
          zIndex: 10,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}
