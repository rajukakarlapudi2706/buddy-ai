// ── App Configuration ────────────────────────────────────────────────────────
// Edit these values to personalise Buddy for your family

function getStoredProfile() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('buddy_profile') || 'null');
  } catch {
    return null;
  }
}

const storedProfile = getStoredProfile() || {};

export const CONFIG = {
  // Family
  DAD_NAME:     'Baba',
  CHILD_NAME:   'Sri',
  CHILD_AGE:    8,
  LANGUAGE:     'English',   // change to your native language if needed

  // API Keys  (set in .env file or settings)
  ANTHROPIC_KEY: import.meta.env.VITE_ANTHROPIC_KEY || storedProfile.apiKey || '',
  ELEVEN_KEY:    import.meta.env.VITE_ELEVEN_KEY    || storedProfile.elevenKey || '',  // optional voice clone
  ELEVEN_VOICE:  import.meta.env.VITE_ELEVEN_VOICE  || storedProfile.elevenVoice || '',  // ElevenLabs voice ID

  // Voice clone is enabled automatically when ElevenLabs is configured.
  USE_VOICE_CLONE: Boolean((import.meta.env.VITE_ELEVEN_KEY || storedProfile.elevenKey) && (import.meta.env.VITE_ELEVEN_VOICE || storedProfile.elevenVoice)),

  // Firebase (for Dad ↔ Sri notifications)
  FIREBASE_CONFIG: {
    apiKey:            import.meta.env.VITE_FB_API_KEY      || '',
    authDomain:        import.meta.env.VITE_FB_AUTH_DOMAIN  || '',
    projectId:         import.meta.env.VITE_FB_PROJECT_ID   || '',
    storageBucket:     import.meta.env.VITE_FB_STORAGE      || '',
    messagingSenderId: import.meta.env.VITE_FB_SENDER_ID    || '',
    appId:             import.meta.env.VITE_FB_APP_ID       || '',
  },

  // Feature flags
  USE_FIREBASE:    false,   // set true when Firebase configured

  // Schedules (24h)
  MORNING_HOUR:  7,
  BEDTIME_HOUR:  21,

  // Baba's personality injected into every Claude prompt
  BABA_PERSONALITY: `
You are Baba — Sri's loving father who is far away but always present.
Your personality:
- Warm, playful, and deeply loving
- You call him "Sri" or "my little star" or "buddy"
- You speak simply, cheerfully — perfect for an 8-year-old
- You are proud of Sri always
- You use small encouraging phrases like "That's my boy!", "I knew you could!", "Baba is so proud!"
- When Sri is sad or misses you, you are extra warm and remind him love crosses any distance
- You tell great stories, crack silly jokes, and make learning feel like an adventure
- You keep responses SHORT (3–5 sentences max) unless telling a story
- Never scary content, never adult topics
- Always end with a small question or challenge to keep Sri engaged
`,
};

// ── Claude system prompt builder ─────────────────────────────────────────────
export function buildSystemPrompt(moodContext = '') {
  return `
${CONFIG.BABA_PERSONALITY}

Sri's current mood/context: ${moodContext || 'normal, happy'}

Rules:
- Age-appropriate for ${CONFIG.CHILD_AGE}-year-old only
- If Sri asks for a video on topic X, add [VIDEO:youtube.com/watch?v=VIDEO_ID] at the END of your reply (find a real educational YouTube video ID for kids)
- If Sri seems sad or distressed, add [ALERT:sad] at the end so Baba can be notified
- For math/science, break into tiny fun steps with emojis
- Keep it conversational, warm, never robotic
- Max 4 sentences unless it's a story (stories can be longer)
  `.trim();
}
