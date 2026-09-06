// Persistence for the Retro Arcade. IndexedDB is the store of record;
// localStorage mirrors it so the first paint has data synchronously.

const DB = 'retro-arcade', STORE = 'kv', KEY = 'state', LS = 'retroArcadeState';

export const LOWER_IS_BETTER = { memory: true };

export function defaults() {
  return {
    version: 1,
    plays: {}, bests: {}, xp: 0,
    streak: { count: 0, lastDay: null, weekOf: null, week: [false, false, false, false, false, false, false] },
    challenge: { day: null, progress: 0, goal: 3 },
    achievements: [],
    activity: [],
    ttt: { scoreX: 0, scoreO: 0 },
    settings: { theme: 'light', sound: true, keys: true, mode: 'hard' }
  };
}

function open() {
  return new Promise((res, rej) => {
    if (!self.indexedDB) return rej(new Error('no idb'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function merge(base, saved) {
  const out = Object.assign({}, base, saved || {});
  out.plays = Object.assign({}, base.plays, (saved && saved.plays) || {});
  out.bests = Object.assign({}, base.bests, (saved && saved.bests) || {});
  out.streak = Object.assign({}, base.streak, (saved && saved.streak) || {});
  out.challenge = Object.assign({}, base.challenge, (saved && saved.challenge) || {});
  out.settings = Object.assign({}, base.settings, (saved && saved.settings) || {});
  out.ttt = Object.assign({}, base.ttt, (saved && saved.ttt) || {});
  out.activity = (saved && saved.activity) || base.activity;
  out.achievements = (saved && saved.achievements) || base.achievements;
  return out;
}

export function loadSync() {
  try { return merge(defaults(), JSON.parse(localStorage.getItem(LS) || 'null')); }
  catch (e) { return defaults(); }
}

export async function load() {
  try {
    const db = await open();
    const saved = await new Promise((res, rej) => {
      const t = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      t.onsuccess = () => res(t.result); t.onerror = () => rej(t.error);
    });
    if (saved) return merge(defaults(), saved);
  } catch (e) { /* fall through to localStorage */ }
  return loadSync();
}

let queued = null, timer = 0;
export function save(state) {
  queued = state;
  try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { /* quota */ }
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const snap = queued;
    try {
      const db = await open();
      db.transaction(STORE, 'readwrite').objectStore(STORE).put(snap, KEY);
    } catch (e) { /* localStorage mirror already holds it */ }
  }, 250);
}

export async function reset() {
  try { localStorage.removeItem(LS); } catch (e) {}
  try { const db = await open(); db.transaction(STORE, 'readwrite').objectStore(STORE).delete(KEY); } catch (e) {}
  return defaults();
}

export function todayKey() {
  return dayKey(new Date());
}

function dayKey(d) {
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

// Monday of the week `d` falls in, used to clear the week strip on a new week.
function weekKey(d) {
  const m = new Date(d);
  m.setDate(m.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(m);
}

// Records one finished game and returns the next state plus what changed.
export function recordPlay(state, gameId, score, outcome) {
  const next = merge(defaults(), state);
  next.plays[gameId] = (next.plays[gameId] || 0) + 1;

  const prev = next.bests[gameId];
  const better = prev === undefined || (LOWER_IS_BETTER[gameId] ? score < prev : score > prev);
  if (better && typeof score === 'number') next.bests[gameId] = score;

  next.xp += Math.max(10, Math.round((typeof score === 'number' ? score : 0) / 4) + (outcome === 'win' ? 40 : 0));

  const now = new Date();
  const day = dayKey(now);
  if (next.streak.lastDay !== day) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    // only a play yesterday continues the streak; any gap starts a new one
    next.streak.count = next.streak.lastDay === dayKey(yesterday) ? next.streak.count + 1 : 1;
    next.streak.lastDay = day;
    const thisWeek = weekKey(now);
    next.streak.week = next.streak.weekOf === thisWeek
      ? next.streak.week.slice()
      : [false, false, false, false, false, false, false];
    next.streak.weekOf = thisWeek;
    next.streak.week[(now.getDay() + 6) % 7] = true;
  }

  next.activity = [{ gameId, score, outcome: outcome || 'played', at: Date.now() }].concat(next.activity).slice(0, 12);
  return { state: next, newBest: better && prev !== undefined };
}

export function bumpChallenge(state, ok) {
  const next = merge(defaults(), state);
  const day = todayKey();
  if (next.challenge.day !== day) next.challenge = { day, progress: 0, goal: 3 };
  if (ok) next.challenge.progress = Math.min(next.challenge.goal, next.challenge.progress + 1);
  else next.challenge.progress = 0;
  return next;
}
