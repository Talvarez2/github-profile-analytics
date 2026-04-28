const instances = {};

function getOrCreate(id, html) {
  const grid = document.getElementById(id);
  const card = document.createElement('div');
  card.className = 'chart-card';
  card.innerHTML = html;
  grid.appendChild(card);
  return card.querySelector('canvas');
}

function make(key, ctx, config) {
  if (instances[key]) instances[key].destroy();
  instances[key] = new Chart(ctx, config);
}

const COLORS = ['#58a6ff','#f78166','#3fb950','#d2a8ff','#79c0ff','#ffa657','#ff7b72','#7ee787','#d29922','#a5d6ff'];

export function renderCharts(repos, gridId) {
  // Language distribution
  const langs = {};
  repos.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
  const sortedLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sortedLangs.length) {
    const ctx = getOrCreate(gridId, '<h3>Language Distribution</h3><canvas></canvas>');
    make(`lang-${gridId}`, ctx, {
      type: 'doughnut',
      data: { labels: sortedLangs.map(l => l[0]), datasets: [{ data: sortedLangs.map(l => l[1]), backgroundColor: COLORS }] },
      options: { plugins: { legend: { position: 'right', labels: { color: '#c9d1d9', boxWidth: 12 } } } }
    });
  }

  // Stars chart
  const starred = repos.filter(r => r.stargazers_count > 0).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
  if (starred.length) {
    const ctx = getOrCreate(gridId, '<h3>Top Repos by Stars</h3><canvas></canvas>');
    make(`stars-${gridId}`, ctx, {
      type: 'bar',
      data: { labels: starred.map(r => r.name), datasets: [{ data: starred.map(r => r.stargazers_count), backgroundColor: '#58a6ff' }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#c9d1d9' }, grid: { display: false } } } }
    });
  }

  // Repo timeline
  if (repos.length) {
    const byMonth = {};
    repos.forEach(r => { const m = r.created_at.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + 1; });
    const sorted = Object.entries(byMonth).sort();
    let cum = 0;
    const cumData = sorted.map(([m, c]) => ({ x: m, y: cum += c }));
    const card = document.createElement('div');
    card.className = 'chart-card full-width';
    card.innerHTML = '<h3>Repo Creation Timeline</h3><canvas></canvas>';
    document.getElementById(gridId).appendChild(card);
    make(`timeline-${gridId}`, card.querySelector('canvas'), {
      type: 'line',
      data: { datasets: [{ data: cumData, borderColor: '#3fb950', fill: false, tension: 0.3, pointRadius: 2 }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { type: 'category', ticks: { color: '#8b949e', maxTicksLimit: 12 }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } } } }
    });
  }
}
