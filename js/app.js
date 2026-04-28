import { fetchUser, fetchRepos, fetchEvents } from './api.js';
import { renderLanguageChart, renderStarsChart, renderTimelineChart, destroyAll } from './charts.js';
import { renderHeatmap, renderActivityCharts } from './activity.js';

const $ = (s) => document.querySelector(s);
let compareMode = false;

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

function renderRepoCharts(repos, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  renderLanguageChart(repos, containerId);
  renderStarsChart(repos, containerId);
  renderTimelineChart(repos, containerId);
}

function renderActivity(events, container) {
  container.innerHTML = '';
  renderHeatmap(events, container);
  renderActivityCharts(events, container);
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

async function loadUser(username) {
  const [user, repos, events] = await Promise.all([
    fetchUser(username), fetchRepos(username), fetchEvents(username)
  ]);
  return { user, repos, events };
}

async function analyze(username) {
  showLoading(true);
  destroyAll();
  try {
    const data = await loadUser(username);
    showLoading(false);
    $('#dashboard').classList.remove('hidden');
    renderUserCard(data.user, $('#user-card'));
    renderRepoCharts(data.repos, 'repo-charts');
    renderActivity(data.events, $('#activity-section'));
  } catch (e) {
    showError(e.message);
  }
}

async function compare(u1, u2) {
  $('#compare-loading').classList.remove('hidden');
  $('#compare-panels').classList.add('hidden');
  $('#compare-error').classList.add('hidden');
  destroyAll();
  try {
    const [d1, d2] = await Promise.all([loadUser(u1), loadUser(u2)]);
    $('#compare-loading').classList.add('hidden');
    $('#compare-panels').classList.remove('hidden');
    renderUserCard(d1.user, $('#user-card-1'));
    renderRepoCharts(d1.repos, 'repo-charts-1');
    renderActivity(d1.events, $('#activity-section-1'));
    renderUserCard(d2.user, $('#user-card-2'));
    renderRepoCharts(d2.repos, 'repo-charts-2');
    renderActivity(d2.events, $('#activity-section-2'));
  } catch (e) {
    $('#compare-loading').classList.add('hidden');
    $('#compare-error').textContent = e.message;
    $('#compare-error').classList.remove('hidden');
  }
}

$('#toggle-mode').addEventListener('click', () => {
  compareMode = !compareMode;
  $('#toggle-mode').textContent = compareMode ? 'Single Mode' : 'Compare Mode';
  $('#toggle-mode').classList.toggle('active', compareMode);
  $('#single-search').classList.toggle('hidden', compareMode);
  $('#compare-search').classList.toggle('hidden', !compareMode);
  $('#single-view').classList.toggle('hidden', compareMode);
  $('#compare-view').classList.toggle('hidden', !compareMode);
});

$('#search-btn').addEventListener('click', () => {
  const u = $('#username-input').value.trim();
  if (u) analyze(u);
});

$('#username-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#search-btn').click();
});

$('#compare-btn').addEventListener('click', () => {
  const u1 = $('#compare-input-1').value.trim();
  const u2 = $('#compare-input-2').value.trim();
  if (u1 && u2) compare(u1, u2);
});
