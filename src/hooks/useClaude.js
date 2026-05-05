import { useState, useCallback } from 'react';
import { CONFIG, buildSystemPrompt } from '../config.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export function useClaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const ask = useCallback(async (userMessage, { mood = '', history = [] } = {}) => {
    setLoading(true);
    setError(null);

    // Build messages array with history (last 10 turns)
    const recentHistory = history.slice(-10).map(m => ({
      role: m.from === 'sri' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type':            'application/json',
          'x-api-key':               CONFIG.ANTHROPIC_KEY,
          'anthropic-version':       '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 600,
          system:     buildSystemPrompt(mood),
          messages:   [...recentHistory, { role: 'user', content: userMessage }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'API error');
      }

      const data  = await res.json();
      const reply = data.content[0]?.text || "Hmm, Baba is thinking... try again!";

      // Parse special tags
      const videoMatch = reply.match(/\[VIDEO:([^\]]+)\]/);
      const alertMatch = reply.match(/\[ALERT:([^\]]+)\]/);
      const cleanReply = reply
        .replace(/\[VIDEO:[^\]]+\]/g, '')
        .replace(/\[ALERT:[^\]]+\]/g, '')
        .trim();

      return {
        text:       cleanReply,
        videoQuery: videoMatch ? videoMatch[1].trim() : null,
        alert:      alertMatch ? alertMatch[1].trim() : null,
      };

    } catch (e) {
      setError(e.message);
      return {
        text: "Oops! Baba's connection had a hiccup. Try again in a moment! 💛",
        videoQuery: null,
        alert: null,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Special prompts
  const getGreeting = useCallback(async (timeOfDay) => {
    const prompts = {
      morning: `Sri just opened the app in the morning. Give him a warm good-morning greeting, ask how he slept, and suggest something fun to do today. Keep it short and cheerful.`,
      afternoon: `Sri is using the app in the afternoon. Greet him warmly and ask what he'd like to do — learn something, play a game, or hear a story.`,
      evening: `It's evening. Greet Sri warmly, ask about his day, and gently remind him dinner time is coming. Be cozy and warm.`,
      night: `It's bedtime. Give Sri a warm and loving goodnight message from Baba. Tell him you love him, you're thinking of him, and he should sleep well. Short and heartfelt.`,
    };
    return ask(prompts[timeOfDay] || prompts.afternoon);
  }, [ask]);

  const getJoke = useCallback(() =>
    ask(`Tell Sri a hilarious, age-appropriate joke for an 8-year-old. Build up slowly then give the punchline with energy!`),
  [ask]);

  const getStory = useCallback((theme = '') =>
    ask(`Tell Sri a short exciting story${theme ? ` about ${theme}` : ''}. Make Sri the hero of the story! Keep it 6–8 sentences, vivid and fun.`),
  [ask]);

  const getMathHelp = useCallback((problem) =>
    ask(`Sri needs help with this math: "${problem}". Explain step by step, use emojis, keep it fun. Don't just give the answer — guide him to figure it out!`),
  [ask]);

  const getDailyChallenge = useCallback(() =>
    ask(`Give Sri a fun daily challenge for an 8-year-old — could be a riddle, a science question, a creative task, or a math puzzle. Make it exciting and rewarding!`),
  [ask]);

  return { ask, loading, error, getGreeting, getJoke, getStory, getMathHelp, getDailyChallenge };
}
