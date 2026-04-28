const chartInstances = {};

export function renderHeatmap(events, container) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = '<h3>Activity Heatmap (last 90 days)</h3><div class="heatmap-grid" id="heatmap"></div>';
  container.appendChild(card);

  const counts = {};
  const now = Date.now(), cutoff = now - 90 * 86400000;
  events.forEach((e) => {
    const d = new Date(e.created_at);
    if (d.getTime() >= cutoff) {
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  const max = Math.max(1, ...Object.values(counts));
  const grid = card.querySelector('#heatmap');
  const start = new Date(cutoff);
  start.setDate(start.getDate() - start.getDay());

  for (let week = 0; week < 14; week++) {
    const col = document.createElement('div');
    col.className = 'heatmap-col';
    for (let day = 0; day < 7; day++) {
      const d = new Date(start);
      d.setDate(d.getDate() + week * 7 + day);
      const key = d.toISOString().slice(0, 10);
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.title = `${key}: ${counts[key] || 0} events`;
      const intensity = (counts[key] || 0) / max;
      if (intensity > 0) cell.style.background = `rgba(57,211,83,${0.2 + intensity * 0.8})`;
      col.appendChild(cell);
    }
    grid.appendChild(col);
  }
}

export function renderActiveDays(events, container, id) {
  const days = Array(7).fill(0);
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  events.forEach((e) => days[new Date(e.created_at).getDay()]++);
  const canvas = makeCard(container, id, 'Active Days');
  chartInstances[id] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Events', data: days, backgroundColor: '#3fb950' }] },
    options: { scales: axisOpts(), plugins: { legend: { display: false } } },
  });
}

export function renderActiveHours(events, container, id) {
  const hours = Array(24).fill(0);
  events.forEach((e) => hours[new Date(e.created_at).getHours()]++);
  const canvas = makeCard(container, id, 'Active Hours');
  chartInstances[id] = new Chart(canvas, {
    type: 'bar',
    data: { labels: hours.map((_, i) => `${i}:00`), datasets: [{ label: 'Events', data: hours, backgroundColor: '#d29922' }] },
    options: { scales: axisOpts(), plugins: { legend: { display: false } } },
  });
}

export function renderEventBreakdown(events, container, id) {
  const types = {};
  events.forEach((e) => {
    const t = e.type.replace('Event', '');
    types[t] = (types[t] || 0) + 1;
  });
  const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const canvas = makeCard(container, id, 'Event Breakdown');
  const palette = ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#79c0ff', '#56d364', '#e3b341'];
  chartInstances[id] = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: sorted.map((e) => e[0]), datasets: [{ data: sorted.map((e) => e[1]), backgroundColor: palette }] },
    options: { plugins: { legend: { position: 'right', labels: { color: '#c9d1d9' } } } },
  });
}

function makeCard(container, id, title) {
  let card = container.querySelector(`#${id}`);
  if (!card) {
    card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.innerHTML = `<h3>${title}</h3><canvas></canvas>`;
    container.appendChild(card);
  }
  if (chartInstances[id]) chartInstances[id].destroy();
  return card.querySelector('canvas');
}

function axisOpts() {
  return { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } } };
}
