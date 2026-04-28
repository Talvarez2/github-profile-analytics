import { fetchUser, fetchRepos, fetchEvents } from './api.js';
import { renderLanguageChart, renderStarsChart, renderTimelineChart } from './charts.js';

const $ = (s) => document.querySelector(s);

$('#analyze-btn').addEventListener('click', run);
$('#username').addEventListener('keydown', (e) => e.key === 'Enter' && run());
$('#compare-mode').addEventListener('change', (e) => {
  $('#username2').classList.toggle('hidden', !e.target.checked);
});

async function run() {
  const u1 = $('#username').value.trim();
  if (!u1) return;
  const compare = $('#compare-mode').checked;
  const u2 = compare ? $('#username2').value.trim() : null;
  const dash = $('#dashboard');

  dash.innerHTML = '<div class="loading">Loading…</div>';

  try {
    if (compare && u2) {
      const [d1, d2] = await Promise.all([loadUser(u1), loadUser(u2)]);
      dash.innerHTML = '<div class="compare-container"><div class="user-section" id="user1"></div><div class="user-section" id="user2"></div></div>';
      renderUser(d1, $('#user1'));
      renderUser(d2, $('#user2'));
    } else {
      const data = await loadUser(u1);
      dash.innerHTML = '<div class="user-section" id="user1"></div>';
      renderUser(data, $('#user1'));
    }
  } catch (err) {
    dash.innerHTML = `<div class="error">${err.message}</div>`;
  }
}

async function loadUser(username) {
  const [user, repos, events] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
    fetchEvents(username),
  ]);
  return { user, repos, events };
}

function renderUser({ user, repos, events }, container) {
  container.innerHTML = `
    <div class="card user-card">
      <img src="${user.avatar_url}" alt="${user.login}" />
      <div>
        <h2>${user.name || user.login}</h2>
        <p class="bio">${user.bio || ''}</p>
        <div class="stats">
          <span><strong>${user.public_repos}</strong> repos</span>
          <span><strong>${user.followers}</strong> followers</span>
          <span><strong>${user.following}</strong> following</span>
        </div>
      </div>
    </div>
    <div class="chart-grid" id="charts-${user.login}"></div>`;
  const grid = container.querySelector(`#charts-${user.login}`);
  renderLanguageChart(repos, grid, `lang-${user.login}`);
  renderStarsChart(repos, grid, `stars-${user.login}`);
  renderTimelineChart(repos, grid, `timeline-${user.login}`);
}

export { loadUser, renderUser };
