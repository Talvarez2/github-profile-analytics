# GitHub Profile Analytics

A client-side dashboard for visualizing GitHub user profiles, repository statistics, and activity patterns. Built with vanilla JavaScript, HTML/CSS, and Chart.js.

![Screenshot placeholder](screenshot.png)

## Features

- **User Card** — Avatar, bio, follower/following/repo counts
- **Language Distribution** — Doughnut chart of languages across all repos
- **Stars Chart** — Top repositories ranked by stars
- **Repo Timeline** — Line chart of repository creation over time
- **Activity Heatmap** — GitHub-style contribution grid (last 90 days)
- **Active Days/Hours** — Bar charts showing when a user is most active
- **Event Breakdown** — Doughnut chart of event types (Push, PR, Issue, etc.)
- **Compare Mode** — Side-by-side analytics for two users
- **Caching** — sessionStorage cache (5 min TTL) to reduce API calls

## Usage

1. Open `index.html` in a browser (or serve with any static file server)
2. Enter a GitHub username and click **Analyze**
3. Toggle **Compare Mode** to compare two users side by side

No build step, no dependencies to install. Chart.js is loaded from CDN.

## Tech Stack

- Vanilla JavaScript (ES modules)
- HTML5 / CSS3 (GitHub-inspired dark theme)
- [Chart.js 4](https://www.chartjs.org/) via CDN
- GitHub REST API (public, no auth required)

## API Rate Limits

The GitHub public API allows 60 requests/hour per IP. The app caches responses in sessionStorage for 5 minutes to minimize requests. For higher limits, you'd need to add a personal access token (not implemented).

## Project Structure

```
├── index.html          # Main page
├── css/style.css       # Dark theme styles
├── js/
│   ├── api.js          # GitHub API fetch wrapper with caching
│   ├── app.js          # Main controller and UI logic
│   ├── charts.js       # Chart.js repo visualizations
│   └── activity.js     # Activity heatmap and event charts
└── README.md
```

## License

MIT
