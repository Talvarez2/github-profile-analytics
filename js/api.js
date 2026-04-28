const BASE = 'https://api.github.com';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function fetchUser(username) {
  return fetchJSON(`${BASE}/users/${username}`);
}

export async function fetchRepos(username) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await fetchJSON(`${BASE}/users/${username}/repos?per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

export async function fetchEvents(username) {
  const events = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await fetchJSON(`${BASE}/users/${username}/events/public?per_page=100&page=${page}`);
    events.push(...batch);
    if (batch.length < 100) break;
  }
  return events;
}
