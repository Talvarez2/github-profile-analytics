import { fetchUser, fetchRepos, fetchEvents } from './api.js';
import { renderLanguageChart, renderStarsChart, renderTimelineChart, destroyAll } from './charts.js';

const $ = (s) => document.querySelector(s);

function renderUserCard(user, container) {
  container.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}">
    <div class="info">
      <h2>${user.name || user.login}</h2>
      <p>${user.bio || ''}</p>
      <div class="stats">
        <div class="stat"><strong>${user.public_repos}</strong><span>Repos</span></div>
        <div class="stat"><strong>${user.followers}</strong><span>Followers</span></div>
        <div class="stat"><strong>${user.following}</strong><span>Following</span></div>
      </div>
    </div>`;
}

function renderRepoCharts(repos) {
  const container = $('#repo-charts');
  container.innerHTML = '';
  container.id = 'repo-charts';
  renderLanguageChart(repos, 'repo-charts');
  renderStarsChart(repos, 'repo-charts');
  renderTimelineChart(repos, 'repo-charts');
}

function showLoading(on) {
  $('#loading').classList.toggle('hidden', !on);
  $('#dashboard').classList.toggle('hidden', on);
  $('#error').classList.add('hidden');
}

function showError(msg) {
  $('#error').textContent = msg;
  $('#error').classList.remove('hidden');
  $('#dashboard').classList.add('hidden');
  $('#loading').classList.add('hidden');
}

async function analyze(username) {
  showLoading(true);
  destroyAll();
  try {
    const [user, repos, events] = await Promise.all([
      fetchUser(username), fetchRepos(username), fetchEvents(username)
    ]);
    showLoading(false);
    $('#dashboard').classList.remove('hidden');
    renderUserCard(user, $('#user-card'));
    renderRepoCharts(repos);
    return { user, repos, events };
  } catch (e) {
    showError(e.message);
    return null;
  }
}

$('#search-btn').addEventListener('click', () => {
  const username = $('#username-input').value.trim();
  if (username) analyze(username);
});

$('#username-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#search-btn').click();
});

export { analyze, renderUserCard };
