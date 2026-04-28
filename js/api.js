const BASE = 'https://api.github.com';

export async function fetchUser(username) {
  return cachedFetch(`${BASE}/users/${username}`);
}

export async function fetchRepos(username) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await cachedFetch(`${BASE}/users/${username}/repos?per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

export async function fetchEvents(username) {
  const events = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await cachedFetch(`${BASE}/users/${username}/events/public?per_page=100&page=${page}`);
    events.push(...batch);
    if (batch.length < 100) break;
  }
  return events;
}

async function cachedFetch(url) {
  const key = `gh:${url}`;
  const cached = sessionStorage.getItem(key);
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < 5 * 60 * 1000) return data;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
  return data;
}
