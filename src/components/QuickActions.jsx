const ACTIONS = [
  { id: 'joke',      emoji: '😂', label: 'Tell a Joke',    color: '#FFD166', bg: 'rgba(255,209,102,0.12)' },
  { id: 'story',     emoji: '📖', label: 'Story Time',     color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  { id: 'math',      emoji: '🔢', label: 'Math Help',      color: '#06D6A0', bg: 'rgba(6,214,160,0.12)'   },
  { id: 'science',   emoji: '🔬', label: 'Science',        color: '#118AB2', bg: 'rgba(17,138,178,0.12)'  },
  { id: 'music',     emoji: '🎵', label: 'Music & Arts',   color: '#c77dff', bg: 'rgba(199,125,255,0.12)' },
  { id: 'challenge', emoji: '🎯', label: 'Daily Quest',    color: '#ff9a3c', bg: 'rgba(255,154,60,0.12)'  },
  { id: 'hug',       emoji: '🤗', label: 'Virtual Hug',    color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  { id: 'message',   emoji: '💌', label: 'Msg for Baba',   color: '#FFD166', bg: 'rgba(255,209,102,0.12)' },
];

export default function QuickActions({ onAction, disabled }) {
  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{
        fontSize: 11, color: '#8892b0', fontWeight: 700,
        letterSpacing: 1, textTransform: 'uppercase',
        marginBottom: 10, paddingLeft: 2,
      }}>What do you want to do? ✨</div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {ACTIONS.map(a => (
          <button
            key={a.id}
            onClick={() => !disabled && onAction(a.id)}
            disabled={disabled}
            style={{
              background: a.bg,
              border: `1px solid ${a.color}33`,
              borderRadius: 14,
              padding: '12px 4px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              opacity: disabled ? 0.5 : 1,
              transition: 'all 0.18s',
            }}
          >
            <span style={{ fontSize: 24 }}>{a.emoji}</span>
            <span style={{
              fontSize: 9.5, fontWeight: 800,
              color: a.color, textAlign: 'center',
              lineHeight: 1.2,
            }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
