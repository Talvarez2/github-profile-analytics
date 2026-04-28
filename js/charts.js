const chartInstances = {};

function getOrCreate(container, id, title) {
  let card = container.querySelector(`#${id}`);
  if (!card) {
    card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.innerHTML = `<h3>${title}</h3><canvas></canvas>`;
    container.appendChild(card);
  }
  return card.querySelector('canvas');
}

function render(canvas, config) {
  const key = canvas.id || canvas.closest('.card').id;
  if (chartInstances[key]) chartInstances[key].destroy();
  chartInstances[key] = new Chart(canvas, config);
}

const COLORS = ['#58a6ff','#3fb950','#d29922','#f85149','#bc8cff','#79c0ff','#56d364','#e3b341','#ff7b72','#d2a8ff'];

export function renderLanguageChart(container, repos) {
  const langs = {};
  repos.forEach((r) => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
  const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const canvas = getOrCreate(container, `lang-${container.id}`, 'Language Distribution');
  render(canvas, {
    type: 'doughnut',
    data: { labels: sorted.map((s) => s[0]), datasets: [{ data: sorted.map((s) => s[1]), backgroundColor: COLORS }] },
    options: { plugins: { legend: { position: 'right', labels: { color: '#c9d1d9' } } } },
  });
}

export function renderStarsChart(container, repos) {
  const top = repos.filter((r) => r.stargazers_count > 0).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
  if (!top.length) return;
  const canvas = getOrCreate(container, `stars-${container.id}`, 'Top Repos by Stars');
  render(canvas, {
    type: 'bar',
    data: { labels: top.map((r) => r.name), datasets: [{ label: 'Stars', data: top.map((r) => r.stargazers_count), backgroundColor: '#58a6ff' }] },
    options: { indexAxis: 'y', scales: { x: { ticks: { color: '#8b949e' } }, y: { ticks: { color: '#c9d1d9' } } }, plugins: { legend: { display: false } } },
  });
}

export function renderTimelineChart(container, repos) {
  const byMonth = {};
  repos.forEach((r) => {
    const m = r.created_at.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  });
  const sorted = Object.keys(byMonth).sort();
  let cumulative = 0;
  const data = sorted.map((m) => { cumulative += byMonth[m]; return cumulative; });
  const canvas = getOrCreate(container, `timeline-${container.id}`, 'Repo Creation Timeline');
  render(canvas, {
    type: 'line',
    data: { labels: sorted, datasets: [{ label: 'Total Repos', data, borderColor: '#3fb950', fill: false, tension: 0.3 }] },
    options: { scales: { x: { ticks: { color: '#8b949e', maxTicksLimit: 12 } }, y: { ticks: { color: '#8b949e' } } }, plugins: { legend: { display: false } } },
  });
}
