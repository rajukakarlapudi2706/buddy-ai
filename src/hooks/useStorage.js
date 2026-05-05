import { useState, useCallback } from 'react';

const PREFIX = 'buddy_';

function ls(key, fallback = null) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
}

export function useStorage() {
  // Chat history
  const getHistory = useCallback(() => ls('history', []), []);
  const addMessage = useCallback((msg) => {
    const h = ls('history', []);
    h.push({ ...msg, ts: Date.now() });
    if (h.length > 200) h.splice(0, h.length - 200); // keep last 200
    lsSet('history', h);
  }, []);
  const clearHistory = useCallback(() => lsSet('history', []), []);

  // Mood log
  const getMoodLog = useCallback(() => ls('moodLog', []), []);
  const logMood = useCallback((mood) => {
    const log = ls('moodLog', []);
    log.push({ mood, ts: Date.now() });
    if (log.length > 50) log.splice(0, log.length - 50);
    lsSet('moodLog', log);
  }, []);

  // Stars / achievements
  const getStars = useCallback(() => ls('stars', 0), []);
  const addStar  = useCallback(() => { lsSet('stars', ls('stars', 0) + 1); }, []);

  // Streak
  const getStreak = useCallback(() => {
    const last = ls('lastVisit', null);
    const streak = ls('streak', 0);
    const today = new Date().toDateString();
    if (!last) return 0;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === today) return streak;
    if (last === yesterday) return streak; // will increment on visit
    return 0; // streak broken
  }, []);

  const recordVisit = useCallback(() => {
    const last  = ls('lastVisit', null);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let streak = ls('streak', 0);
    if (last === today) return streak;
    if (last === yesterday) streak += 1;
    else streak = 1;
    lsSet('streak', streak);
    lsSet('lastVisit', today);
    return streak;
  }, []);

  // Topics explored
  const getTopics = useCallback(() => ls('topics', []), []);
  const addTopic  = useCallback((topic) => {
    const topics = ls('topics', []);
    if (!topics.includes(topic)) {
      topics.push(topic);
      lsSet('topics', topics);
    }
  }, []);

  // Journal entries
  const getJournal = useCallback(() => ls('journal', []), []);
  const addJournalEntry = useCallback((text) => {
    const j = ls('journal', []);
    j.unshift({ text, ts: Date.now() });
    if (j.length > 30) j.pop();
    lsSet('journal', j);
  }, []);

  // Dad messages (pre-recorded)
  const getDadMessages = useCallback(() => ls('dadMessages', []), []);
  const saveDadMessage = useCallback((msg) => {
    const msgs = ls('dadMessages', []);
    msgs.unshift({ ...msg, ts: Date.now(), read: false });
    lsSet('dadMessages', msgs);
  }, []);
  const markDadMessageRead = useCallback((ts) => {
    const msgs = ls('dadMessages', []);
    const updated = msgs.map(m => m.ts === ts ? { ...m, read: true } : m);
    lsSet('dadMessages', updated);
  }, []);

  // Profile / settings
  const getProfile = useCallback(() => ls('profile', {
    babaName: 'Baba',
    sriName: 'Sri',
    age: 8,
    apiKey: '',
    avatarEmoji: '👨‍💼',
    avatarFace: null,
    theme: 'space',
    autoSpeak: true,
    lastMood: null,
  }), []);
  const saveProfile = useCallback((p) => lsSet('profile', p), []);

  return {
    getHistory, addMessage, clearHistory,
    getMoodLog, logMood,
    getStars, addStar,
    getStreak, recordVisit,
    getTopics, addTopic,
    getJournal, addJournalEntry,
    getDadMessages, saveDadMessage, markDadMessageRead,
    getProfile, saveProfile,
  };
}
