const instances = {};

function make(key, ctx, config) {
  if (instances[key]) instances[key].destroy();
  instances[key] = new Chart(ctx, config);
}

export function renderActivity(events, gridId) {
  const grid = document.getElementById(gridId);

  // Heatmap
  const counts = {};
  events.forEach(e => { const d = e.created_at.slice(0, 10); counts[d] = (counts[d] || 0) + 1; });
  const today = new Date();
  const card = document.createElement('div');
  card.className = 'chart-card full-width';
  card.innerHTML = '<h3>Activity (Last 90 Days)</h3><div class="heatmap-container"><div class="heatmap" id="heatmap-' + gridId + '"></div></div>';
  grid.appendChild(card);
  const hm = card.querySelector('.heatmap');
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const c = counts[key] || 0;
    const level = c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 10 ? 3 : 4;
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.dataset.level = level;
    cell.title = `${key}: ${c} events`;
    hm.appendChild(cell);
  }

  // Active days
  const days = [0,0,0,0,0,0,0];
  const hours = new Array(24).fill(0);
  events.forEach(e => { const d = new Date(e.created_at); days[d.getDay()]++; hours[d.getHours()]++; });
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const addChart = (title, type, labels, data, color) => {
    const c = document.createElement('div');
    c.className = 'chart-card';
    c.innerHTML = `<h3>${title}</h3><canvas></canvas>`;
    grid.appendChild(c);
    make(`${title}-${gridId}`, c.querySelector('canvas'), {
      type, data: { labels, datasets: [{ data, backgroundColor: color }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } } } }
    });
  };

  addChart('Active Days', 'bar', dayNames, days, '#58a6ff');
  addChart('Active Hours', 'bar', Array.from({length:24}, (_,i) => `${i}:00`), hours, '#3fb950');

  // Event breakdown
  const types = {};
  events.forEach(e => { const t = e.type.replace('Event',''); types[t] = (types[t] || 0) + 1; });
  const sorted = Object.entries(types).sort((a,b) => b[1] - a[1]);
  if (sorted.length) {
    const COLORS = ['#58a6ff','#f78166','#3fb950','#d2a8ff','#79c0ff','#ffa657','#ff7b72','#7ee787','#d29922','#a5d6ff'];
    const c = document.createElement('div');
    c.className = 'chart-card';
    c.innerHTML = '<h3>Event Breakdown</h3><canvas></canvas>';
    grid.appendChild(c);
    make(`events-${gridId}`, c.querySelector('canvas'), {
      type: 'doughnut',
      data: { labels: sorted.map(s => s[0]), datasets: [{ data: sorted.map(s => s[1]), backgroundColor: COLORS }] },
      options: { plugins: { legend: { position: 'right', labels: { color: '#c9d1d9', boxWidth: 12 } } } }
    });
  }
}
