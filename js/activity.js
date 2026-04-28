export function renderHeatmap(events, container) {
  const counts = {};
  events.forEach(e => {
    const d = e.created_at.slice(0, 10);
    counts[d] = (counts[d] || 0) + 1;
  });

  const today = new Date();
  const days = 91;
  const cells = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = counts[key] || 0;
    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
    cells.push(`<div class="heatmap-cell" data-level="${level}" title="${key}: ${count} events"></div>`);
  }

  container.innerHTML = `
    <div class="heatmap-container">
      <h3>Activity (Last 90 Days)</h3>
      <div class="heatmap">${cells.join('')}</div>
    </div>`;
}

export function renderActivityCharts(events, container) {
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayCounts = new Array(7).fill(0);
  const hourCounts = new Array(24).fill(0);
  const typeCounts = {};

  events.forEach(e => {
    const d = new Date(e.created_at);
    dayCounts[d.getDay()]++;
    hourCounts[d.getHours()]++;
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  const typesSorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const dayId = `day-chart-${container.id}`;
  const hourId = `hour-chart-${container.id}`;
  const typeId = `type-chart-${container.id}`;

  container.innerHTML += `
    <div class="chart-grid">
      <div class="chart-card"><h3>Most Active Days</h3><canvas id="${dayId}"></canvas></div>
      <div class="chart-card"><h3>Activity by Hour</h3><canvas id="${hourId}"></canvas></div>
      <div class="chart-card"><h3>Event Types</h3><canvas id="${typeId}"></canvas></div>
    </div>`;

  const barOpts = (color) => ({
    type: 'bar',
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }, y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' }, beginAtZero: true } } },
    data: { datasets: [{ backgroundColor: color }] }
  });

  const dayChart = barOpts('#3fb950');
  dayChart.data.labels = dayNames;
  dayChart.data.datasets[0].data = dayCounts;
  new Chart(document.getElementById(dayId), dayChart);

  const hourChart = barOpts('#58a6ff');
  hourChart.data.labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  hourChart.data.datasets[0].data = hourCounts;
  new Chart(document.getElementById(hourId), hourChart);

  new Chart(document.getElementById(typeId), {
    type: 'doughnut',
    data: { labels: typesSorted.map(e => e[0].replace('Event', '')), datasets: [{ data: typesSorted.map(e => e[1]), backgroundColor: ['#58a6ff','#f78166','#3fb950','#d2a8ff','#f0883e','#79c0ff','#56d364','#e3b341'] }] },
    options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: '#c9d1d9' } } } }
  });
}
