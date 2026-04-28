const BASE = 'https://api.github.com';

async function ghFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error(res.status === 404 ? 'User not found' : `GitHub API error: ${res.status}`);
  return res.json();
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
