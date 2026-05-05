import { useState } from 'react';

const MOODS = [
  { emoji: '😄', label: 'Happy',    value: 'happy',   color: '#FFD166' },
  { emoji: '😊', label: 'Good',     value: 'good',    color: '#06D6A0' },
  { emoji: '😐', label: 'Okay',     value: 'okay',    color: '#118AB2' },
  { emoji: '😢', label: 'Sad',      value: 'sad',     color: '#8888cc' },
  { emoji: '😡', label: 'Angry',    value: 'angry',   color: '#FF6B6B' },
  { emoji: '😴', label: 'Tired',    value: 'tired',   color: '#aaa' },
];

export default function MoodSelector({ onSelect, childName = 'Sri' }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (mood) => {
    setSelected(mood.value);
    setTimeout(() => onSelect(mood), 400);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px', gap: 20,
      animation: 'slide-up 0.4s ease',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#FFD166', fontFamily: "'Baloo 2', cursive" }}>
          Hey {childName}! 👋
        </div>
        <div style={{ fontSize: 14, color: '#8892b0', marginTop: 4 }}>
          How are you feeling right now?
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, width: '100%', maxWidth: 320,
      }}>
        {MOODS.map(mood => (
          <button
            key={mood.value}
            onClick={() => handleSelect(mood)}
            style={{
              background: selected === mood.value
                ? `${mood.color}33`
                : 'rgba(255,255,255,0.04)',
              border: `2px solid ${selected === mood.value ? mood.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16,
              padding: '14px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
              transform: selected === mood.value ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <span style={{ fontSize: 32 }}>{mood.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: selected === mood.value ? mood.color : '#8892b0' }}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
