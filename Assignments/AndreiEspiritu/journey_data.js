// Procrastination dataset: what I did instead of working
// Each entry represents a session of procrastination and context

const JOURNEY_SESSIONS = [
  { id: 1, date: '2025-09-01', activity: 'YouTube', minutes: 98, interruptions: 5, tabsOpened: 14, mood: 'bored' },
  { id: 2, date: '2025-09-02', activity: 'Comics/Manga', minutes: 33, interruptions: 9, tabsOpened: 3, mood: 'stressed' },
  { id: 3, date: '2025-09-03', activity: 'Gaming', minutes: 188, interruptions: 2, tabsOpened: 1, mood: 'relieved' },
  { id: 4, date: '2025-09-04', activity: 'Cleaning/Organizing', minutes: 35, interruptions: 4, tabsOpened: 0, mood: 'productive' },
  { id: 5, date: '2025-09-05', activity: 'Bothering My Cat', minutes: 20, interruptions: 6, tabsOpened: 22, mood: 'curious' },
  { id: 6, date: '2025-09-06', activity: 'Messaging friends', minutes: 45, interruptions: 7, tabsOpened: 5, mood: 'social' },
  { id: 7, date: '2025-09-07', activity: 'Napping', minutes: 110, interruptions: 1, tabsOpened: 0, mood: 'tired' },
  { id: 8, date: '2025-09-08', activity: 'Listening to Music', minutes: 54, interruptions: 3, tabsOpened: 11, mood: 'curious' },
  { id: 9, date: '2025-09-09', activity: 'Discord lurking', minutes: 34, interruptions: 8, tabsOpened: 18, mood: 'anxious' },
  { id: 10, date: '2025-09-10', activity: 'Snacking + mindless scrolling', minutes: 62, interruptions: 5, tabsOpened: 4, mood: 'bored' }
];

// Keep the same API shape the pages expect. We aggregate by label `area` for charting,
// but map it from `activity` so we do not need to rename elsewhere.
function summarizeByArea(metric) {
  const totals = {};
  for (const s of JOURNEY_SESSIONS) {
    const key = s.activity;
    totals[key] = (totals[key] || 0) + (s[metric] || 0);
  }
  return Object.entries(totals)
    .map(([activity, value]) => ({ area: activity, value }))
    .sort((a, b) => b.value - a.value);
}

function overallStats() {
  const totalMinutes = JOURNEY_SESSIONS.reduce((a, s) => a + s.minutes, 0);
  const totalInterruptions = JOURNEY_SESSIONS.reduce((a, s) => a + s.interruptions, 0);
  const totalTabs = JOURNEY_SESSIONS.reduce((a, s) => a + s.tabsOpened, 0);
  const topActivity = summarizeByArea('minutes')[0]?.area || 'Unknown';
  const calmish = new Set(['productive','relieved']);
  const calmSessions = JOURNEY_SESSIONS.filter(s => calmish.has(s.mood));
  const calmAvgMinutes = calmSessions.length ? calmSessions.reduce((a, s) => a + s.minutes, 0) / calmSessions.length : 0;
  const otherSessions = JOURNEY_SESSIONS.filter(s => !calmish.has(s.mood));
  const otherAvgMinutes = otherSessions.length ? otherSessions.reduce((a, s) => a + s.minutes, 0) / otherSessions.length : 0;
  return { totalMinutes, totalInterruptions, totalTabs, topActivity, calmAvgMinutes, otherAvgMinutes };
}

window.JOURNEY_SESSIONS = JOURNEY_SESSIONS;
window.summarizeByArea = summarizeByArea;
window.overallStats = overallStats;


