import { fetchUser, fetchRepos, fetchEvents } from './api.js';

const $ = s => document.querySelector(s);

$('#analyze-btn').addEventListener('click', run);
$('#username').addEventListener('keydown', e => e.key === 'Enter' && run());
$('#compare-mode').addEventListener('change', e => {
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
    fetchUser(username), fetchRepos(username), fetchEvents(username)
  ]);
  return { user, repos, events };
}

function renderUser({ user, repos, events }, container) {
  container.innerHTML = `
    <div class="user-card">
      <img src="${user.avatar_url}" alt="${user.login}" />
      <div class="info">
        <h2>${user.name || user.login}</h2>
        <div class="bio">${user.bio || ''}</div>
        <div class="stats">
          <div class="stat"><span class="num">${user.followers}</span><span class="label">Followers</span></div>
          <div class="stat"><span class="num">${user.following}</span><span class="label">Following</span></div>
          <div class="stat"><span class="num">${user.public_repos}</span><span class="label">Repos</span></div>
        </div>
      </div>
    </div>
    <div class="chart-grid" id="charts-${user.login}"></div>`;

  // Charts and activity will be added in subsequent steps
  import('./charts.js').then(m => m.renderCharts(repos, `charts-${user.login}`)).catch(() => {});
  import('./activity.js').then(m => m.renderActivity(events, `charts-${user.login}`)).catch(() => {});
}
