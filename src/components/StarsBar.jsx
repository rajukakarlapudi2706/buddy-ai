import { CONFIG } from '../config.js';

export default function StarsBar({ stars = 0, streak = 0, mood = null, onSettings }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Left: child info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD166, #FF6B6B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🧒</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {CONFIG.CHILD_NAME}
          </div>
          {mood && (
            <div style={{ fontSize: 10, color: '#8892b0' }}>
              Feeling {mood} today
            </div>
          )}
        </div>
      </div>

      {/* Center: stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#FFD166' }}>⭐ {stars}</div>
          <div style={{ fontSize: 8, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Stars</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#06D6A0' }}>🔥 {streak}</div>
          <div style={{ fontSize: 8, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 0.5 }}>Days</div>
        </div>
      </div>

      {/* Right: settings */}
      <button
        onClick={onSettings}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, width: 34, height: 34,
          fontSize: 16, color: '#fff',
        }}
      >⚙️</button>
    </div>
  );
}
