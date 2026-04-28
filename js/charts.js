const COLORS = ['#58a6ff','#f78166','#3fb950','#d2a8ff','#f0883e','#79c0ff','#56d364','#e3b341','#ff7b72','#a5d6ff'];

let charts = {};

function destroy(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

function createChart(canvasId, config) {
  destroy(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  charts[canvasId] = new Chart(ctx, config);
}

export function renderLanguageChart(repos, containerId) {
  const langs = {};
  repos.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
  const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const id = `lang-chart-${containerId}`;
  const container = document.getElementById(containerId);
  container.innerHTML = `<div class="chart-card"><h3>Language Distribution</h3><canvas id="${id}"></canvas></div>`;
  createChart(id, {
    type: 'doughnut',
    data: { labels: sorted.map(e => e[0]), datasets: [{ data: sorted.map(e => e[1]), backgroundColor: COLORS }] },
    options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: '#c9d1d9' } } } }
  });
}

export function renderStarsChart(repos, containerId) {
  const top = repos.filter(r => r.stargazers_count > 0).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
  if (!top.length) return;
  const id = `stars-chart-${containerId}`;
  const container = document.getElementById(containerId);
  container.innerHTML += `<div class="chart-card"><h3>Top Repos by Stars</h3><canvas id="${id}"></canvas></div>`;
  createChart(id, {
    type: 'bar',
    data: { labels: top.map(r => r.name), datasets: [{ label: 'Stars', data: top.map(r => r.stargazers_count), backgroundColor: '#e3b341' }] },
    options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#c9d1d9' }, grid: { display: false } } } }
  });
}

export function renderTimelineChart(repos, containerId) {
  const byMonth = {};
  repos.forEach(r => {
    const d = r.created_at.slice(0, 7);
    byMonth[d] = (byMonth[d] || 0) + 1;
  });
  const sorted = Object.entries(byMonth).sort();
  const id = `timeline-chart-${containerId}`;
  const container = document.getElementById(containerId);
  container.innerHTML += `<div class="chart-card"><h3>Repo Creation Timeline</h3><canvas id="${id}"></canvas></div>`;
  createChart(id, {
    type: 'line',
    data: { labels: sorted.map(e => e[0]), datasets: [{ label: 'Repos Created', data: sorted.map(e => e[1]), borderColor: '#58a6ff', backgroundColor: 'rgba(88,166,255,0.1)', fill: true, tension: 0.3 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b949e', maxTicksLimit: 12 }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' }, beginAtZero: true } } }
  });
}

export function destroyAll() { Object.keys(charts).forEach(destroy); }
