const BASE = 'https://api.github.com';

function cacheKey(path) { return `gh_cache_${path}`; }

function getCached(path) {
  try {
    const item = sessionStorage.getItem(cacheKey(path));
    if (!item) return null;
    const { data, ts } = JSON.parse(item);
    if (Date.now() - ts > 5 * 60 * 1000) { sessionStorage.removeItem(cacheKey(path)); return null; }
    return data;
  } catch { return null; }
}

function setCache(path, data) {
  try { sessionStorage.setItem(cacheKey(path), JSON.stringify({ data, ts: Date.now() })); } catch {}
}

async function ghFetch(path) {
  const cached = getCached(path);
  if (cached) return cached;
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error(res.status === 404 ? 'User not found' : res.status === 403 ? 'API rate limit exceeded. Try again later.' : `GitHub API error: ${res.status}`);
  const data = await res.json();
  setCache(path, data);
  return data;
}

export async function fetchUser(username) {
  return ghFetch(`/users/${username}`);
}

export async function fetchRepos(username) {
  let repos = [], page = 1;
  while (true) {
    const batch = await ghFetch(`/users/${username}/repos?per_page=100&page=${page}&sort=updated`);
    repos.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return repos;
}

export async function fetchEvents(username) {
  let events = [], page = 1;
  while (page <= 3) {
    const batch = await ghFetch(`/users/${username}/events/public?per_page=100&page=${page}`);
    events.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return events;
}
