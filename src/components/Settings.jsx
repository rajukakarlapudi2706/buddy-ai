import { useState, useEffect } from 'react';
import { useStorage } from '../hooks/useStorage.js';

const LOCK_PIN = '1234'; // default PIN — parent should change this

export default function Settings({ onClose, profile: initialProfile, onProfileSave }) {
  const { getProfile, saveProfile } = useStorage();
  const [pin, setPin]         = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [profile, setProfile]   = useState(initialProfile || getProfile());
  const [saved, setSaved]       = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    setProfile(initialProfile || getProfile());
  }, [initialProfile, getProfile]);

  const tryUnlock = () => {
    const storedPin = localStorage.getItem('buddy_parentPin') || LOCK_PIN;
    if (pin === storedPin) { setUnlocked(true); setPinError(false); }
    else { setPinError(true); setPin(''); }
  };

  const handleFaceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile(prev => ({ ...prev, avatarFace: reader.result }));
    reader.readAsDataURL(file);
  };

  const clearFace = () => setProfile(prev => ({ ...prev, avatarFace: null }));

  const handleSave = () => {
    saveProfile(profile);
    if (onProfileSave) onProfileSave(profile);
    // Save API key to localStorage for config.js to read
    localStorage.setItem('buddy_apiKey', profile.apiKey || '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Field = ({ label, value, onChange, type = 'text', hint }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: '#8892b0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: '#141838', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13,
          fontFamily: 'Nunito, sans-serif', outline: 'none',
        }}
      />
      {hint && <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'slide-up 0.3s ease',
    }}>
      <div style={{
        background: '#0e1230', borderRadius: '20px 20px 0 0',
        width: '100%', maxHeight: '90vh',
        overflow: 'auto', padding: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: 'none',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FFD166' }}>⚙️ Settings</div>
            <div style={{ fontSize: 11, color: '#8892b0' }}>Parent access only</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none',
            borderRadius: 10, padding: '6px 14px', color: '#fff', fontSize: 13, fontWeight: 700,
          }}>✕ Close</button>
        </div>

        {!unlocked ? (
          /* PIN lock screen */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Parent Lock</div>
            <div style={{ fontSize: 12, color: '#8892b0', marginBottom: 24 }}>Enter your 4-digit PIN<br />(default: 1234)</div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="● ● ● ●"
              style={{
                textAlign: 'center', letterSpacing: 8,
                width: 160, background: '#141838',
                border: `2px solid ${pinError ? '#FF6B6B' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 12, padding: '14px 20px',
                color: '#fff', fontSize: 20, fontFamily: 'Nunito, sans-serif',
                outline: 'none', display: 'block', margin: '0 auto 12px',
              }}
              onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            />
            {pinError && <div style={{ fontSize: 12, color: '#FF6B6B', marginBottom: 10 }}>Wrong PIN. Try again.</div>}
            <button onClick={tryUnlock} style={{
              background: 'linear-gradient(135deg, #FFD166, #FF6B35)',
              border: 'none', borderRadius: 12, padding: '12px 32px',
              color: '#0a0e1a', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
            }}>Unlock</button>
          </div>
        ) : (
          /* Settings form */
          <div>
            <Field label="Child's Name" value={profile.sriName} onChange={v => setProfile({...profile, sriName: v})} />
            <Field label="Dad's Name (what child calls you)" value={profile.babaName} onChange={v => setProfile({...profile, babaName: v})} />
            <Field label="Child's Age" value={profile.age} onChange={v => setProfile({...profile, age: v})} type="number" />

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#06D6A0', marginBottom: 12 }}>🔑 API Keys</div>
              <Field
                label="Claude (Anthropic) API Key"
                value={profile.apiKey}
                onChange={v => setProfile({...profile, apiKey: v})}
                type="password"
                hint="Get free key at console.anthropic.com"
              />
              <Field
                label="ElevenLabs API Key (optional)"
                value={profile.elevenKey}
                onChange={v => setProfile({...profile, elevenKey: v})}
                type="password"
                hint="For Baba's voice clone — elevenlabs.io (free tier available)"
              />
              <Field
                label="ElevenLabs Voice ID (optional)"
                value={profile.elevenVoice}
                onChange={v => setProfile({...profile, elevenVoice: v})}
                hint="Your cloned voice ID from ElevenLabs dashboard"
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#c77dff', marginBottom: 12 }}>🎨 Avatar</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: '#8892b0', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Upload Dad's face photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaceUpload}
                  style={{ width: '100%', color: '#fff', background: '#141838', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px' }}
                />
                <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>
                  This image is stored locally in your browser and is not uploaded anywhere.
                </div>
              </div>
              {profile.avatarFace && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <img
                    src={profile.avatarFace}
                    alt="Avatar preview"
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                  <button
                    type="button"
                    onClick={clearFace}
                    style={{
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)',
                      borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 13,
                    }}
                  >
                    Remove photo
                  </button>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#c77dff', marginBottom: 12 }}>🎨 Preferences</div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: '#8892b0', fontWeight: 700, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Auto-speak replies
                  <div
                    onClick={() => setProfile({...profile, autoSpeak: !profile.autoSpeak})}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                      background: profile.autoSpeak ? '#06D6A0' : '#333',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2, left: profile.autoSpeak ? 22 : 2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                    }} />
                  </div>
                </label>
              </div>

              <Field
                label="Change Parent PIN"
                value={profile.newPin}
                onChange={v => setProfile({...profile, newPin: v})}
                type="password"
                hint="Enter new 4-digit PIN (leave blank to keep current)"
              />
            </div>

            <button onClick={handleSave} style={{
              width: '100%', marginTop: 8,
              background: saved ? '#06D6A0' : 'linear-gradient(135deg, #FFD166, #FF6B35)',
              border: 'none', borderRadius: 14, padding: '14px',
              color: '#0a0e1a', fontWeight: 900, fontSize: 15, fontFamily: 'Nunito, sans-serif',
              transition: 'background 0.3s',
            }}>
              {saved ? '✓ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
