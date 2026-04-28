# AGENTS.md

## Project Overview

GitHub Profile Analytics — a client-side SPA that visualizes GitHub user data using the public REST API and Chart.js.

## Architecture

- **No build system** — vanilla JS with ES modules, loaded directly in the browser
- **No backend** — all API calls go directly to `api.github.com` from the client
- **Chart.js 4** loaded from CDN (`cdn.jsdelivr.net`)

## Key Files

| File | Purpose |
|------|---------|
| `js/api.js` | GitHub API wrapper with sessionStorage caching (5 min TTL) |
| `js/app.js` | Main controller — handles search, compare mode, orchestrates rendering |
| `js/charts.js` | Chart.js wrappers for language, stars, and timeline charts |
| `js/activity.js` | Activity heatmap and event analysis charts |
| `css/style.css` | GitHub-inspired dark theme, responsive layout |
| `index.html` | Entry point, loads Chart.js CDN and app module |

## Conventions

- All JS uses ES module syntax (`import`/`export`)
- Chart instances are tracked and destroyed before re-creation to prevent memory leaks
- DOM queries use `document.querySelector` via a `$` shorthand
- CSS uses GitHub's color palette (`#0d1117`, `#161b22`, `#30363d`, etc.)
- No framework, no transpilation, no bundler

## API Constraints

- GitHub public API: 60 req/hour per IP (unauthenticated)
- Events API returns max 300 events (10 pages × 30, or 3 pages × 100)
- Repos are paginated at 100/page
