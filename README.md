# 🤖 Buddy — Baba is Here!

> Sri's personal AI companion from Baba. Built with love. Runs everywhere. Free.

---

## ✨ What This App Does

- **Baba's animated avatar** greets Sri every morning and every night
- **Voice + text** — Sri can speak or type to Baba
- **Claude AI brain** — stories, jokes, math, science, music — all kid-safe
- **YouTube videos** auto-loaded in Restricted Mode for every topic
- **Mood check-in** every day — Baba's replies adapt to how Sri feels
- **Stars & streaks** — gamified learning
- **Virtual hug button** — sends love across any distance
- **Message for Baba** — Sri can record notes for you

---

## 🚀 Setup Guide (Do This Once — ~30 Minutes)

### Step 1 — Install Tools (on any computer)

1. Go to **https://nodejs.org** → download and install "LTS" version
2. Go to **https://code.visualstudio.com** → download and install VS Code

### Step 2 — Get Your Free Claude API Key

1. Go to **https://console.anthropic.com**
2. Sign up (free)
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 3 — Set Up the App

1. Open VS Code
2. Open a Terminal (menu: Terminal → New Terminal)
3. Run these commands one by one:

```bash
# Go to the buddy-app folder (wherever you unzipped it)
cd buddy-app

# Install dependencies
npm install

# Copy the example env file
copy .env.example .env
```

4. Open the `.env` file in VS Code
5. Paste your Claude API key after `VITE_ANTHROPIC_KEY=`
6. Save the file

### Step 4 — Run It Locally (Test First)

```bash
npm run dev
```

Open your browser to **http://localhost:5173** — Buddy is running!

### Step 5 — Deploy FREE to Vercel (So Sri Can Use It Anywhere)

1. Go to **https://vercel.com** → sign up free with GitHub
2. Install Vercel CLI:

```bash
npm install -g vercel
```

3. Deploy:

```bash
npm run build
vercel --prod
```

4. Vercel gives you a URL like `https://buddy-yourname.vercel.app`
5. **Add your API key in Vercel:**
   - Go to vercel.com → your project → Settings → Environment Variables
   - Add `VITE_ANTHROPIC_KEY` using your own Anthropic API key
   - Redeploy

6. Share the URL with Sri! He bookmarks it on his laptop.

---

## 📱 How Sri Uses It

1. **Open laptop → open browser → go to the URL**
2. Mood check-in appears first
3. Baba's avatar greets him with a warm message
4. He can tap Quick Actions or type/speak anything
5. Baba (Claude) responds in voice + text
6. Videos auto-load for learning topics

**On Sri's laptop:** He can click the browser menu → "Install as App" → it becomes a desktop icon!

---

## 👨‍👦 How Baba (You) Stays Connected

### Send a hug anytime:

- Open the app on YOUR phone at the same URL
- Go to Settings (⚙️) → PIN: 1234 → you can add custom messages

### Change the PIN:

Settings → unlock with 1234 → scroll to "Change Parent PIN"

### Add your voice (optional — ElevenLabs free tier):

1. Go to **https://elevenlabs.io** → sign up free
2. Go to "Voice Lab" → "Add Voice" → record 1-2 minutes of yourself talking
3. Copy your Voice ID
4. In Vercel settings, add:
   - `VITE_ELEVEN_KEY` = your ElevenLabs API key
   - `VITE_ELEVEN_VOICE` = your Voice ID
5. Redeploy → now Buddy speaks in YOUR real voice 😭💛

---

## 🆓 Cost Breakdown

| Service                | Cost                                 |
| ---------------------- | ------------------------------------ |
| Vercel hosting         | FREE forever                         |
| Claude API             | ~$0.01 per conversation (very cheap) |
| ElevenLabs voice       | FREE tier (10,000 chars/month)       |
| Firebase notifications | FREE tier                            |
| YouTube embeds         | FREE                                 |
| **Total**              | **Basically FREE**                   |

---

## 🛠 Customisation

Edit `src/config.js`:

- Change `DAD_NAME` and `CHILD_NAME`
- Change `CHILD_AGE` for age-appropriate content
- Edit `BABA_PERSONALITY` to add YOUR phrases, jokes, values

---

## 💛 Made with love — from Baba to Sri
