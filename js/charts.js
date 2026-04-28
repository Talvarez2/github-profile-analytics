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
  const canvas = card.querySelector('canvas');
  if (chartInstances[id]) chartInstances[id].destroy();
  return canvas;
}

export function renderLanguageChart(repos, container, id) {
  const langs = {};
  repos.forEach((r) => r.language && (langs[r.language] = (langs[r.language] || 0) + 1));
  const sorted = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const canvas = getOrCreate(container, id, 'Language Distribution');
  chartInstances[id] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: sorted.map((e) => e[0]),
      datasets: [{ data: sorted.map((e) => e[1]), backgroundColor: palette(sorted.length) }],
    },
    options: { plugins: { legend: { position: 'right', labels: { color: '#c9d1d9' } } } },
  });
}

export function renderStarsChart(repos, container, id) {
  const top = repos.filter((r) => r.stargazers_count > 0).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10);
  const canvas = getOrCreate(container, id, 'Top Repos by Stars');
  chartInstances[id] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: top.map((r) => r.name),
      datasets: [{ label: 'Stars', data: top.map((r) => r.stargazers_count), backgroundColor: '#58a6ff' }],
    },
    options: { indexAxis: 'y', scales: axisOpts(), plugins: { legend: { display: false } } },
  });
}

export function renderTimelineChart(repos, container, id) {
  const byMonth = {};
  repos.forEach((r) => {
    const m = r.created_at.slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  });
  const keys = Object.keys(byMonth).sort();
  let cum = 0;
  const data = keys.map((k) => ({ x: k, y: (cum += byMonth[k]) }));
  const canvas = getOrCreate(container, id, 'Repo Creation Timeline');
  chartInstances[id] = new Chart(canvas, {
    type: 'line',
    data: { datasets: [{ label: 'Total Repos', data, borderColor: '#58a6ff', fill: false }] },
    options: { scales: { x: { type: 'category', ticks: { color: '#8b949e' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } } }, plugins: { legend: { display: false } } },
  });
}

function axisOpts() {
  return { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } } };
}

function palette(n) {
  const base = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff', '#56d364', '#e3b341', '#ff7b72', '#d2a8ff'];
  return Array.from({ length: n }, (_, i) => base[i % base.length]);
}
