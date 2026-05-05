import { useState, useEffect } from 'react';

// Searches YouTube and embeds search results
export default function YouTubeEmbed({ query, onClose }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  if (!query) return null;

  // Try to extract YouTube video ID from query
  const videoIdMatch = query.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const safeQuery = encodeURIComponent(query + ' for kids');
  const targetUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=0`
    : null;
  const webSearchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${safeQuery}`;

  useEffect(() => {
    setFailed(false);
    setEmbedUrl(targetUrl);
  }, [targetUrl]);

  const handleError = () => {
    setFailed(true);
  };

  return (
    <div style={{
      background: '#0a0a1a',
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden',
      animation: 'slide-up 0.35s ease',
      border: '1px solid rgba(255,255,255,0.08)',
      borderBottom: 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(255,0,0,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>▶️</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>Baba found a video for you!</div>
            <div style={{ fontSize: 10, color: '#8892b0' }}>{videoId ? 'YouTube video' : 'YouTube search'}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: 8, padding: '4px 10px',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}
        >✕ Close</button>
      </div>

      {/* Video embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        {failed || !embedUrl ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, color: '#fff', background: '#0a0a1a', textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Video not available</div>
              <div style={{ fontSize: 12, color: '#8892b0', marginBottom: 12 }}>
                Baba suggested a video, but it's not ready to show here. Tap the link below to watch it on YouTube!
              </div>
              <a
                href={webSearchUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#FFD166', textDecoration: 'underline' }}
              >Watch on YouTube</a>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen; clipboard-write"
            allowFullScreen={true}
            title={`Learn about ${query}`}
            onError={handleError}
          />
        )}
      </div>

      <div style={{ padding: '8px 14px', fontSize: 10, color: '#555', textAlign: 'center' }}>
        Searching for: "{query} for kids"
      </div>
    </div>
  );
}
