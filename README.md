# Outlaw Arcade

A GitHub Pages site that lists a growing catalog of browser games, lets a small circle of family/friends "check in" with a callsign, and keeps a shared score history across every game — no server to maintain, no logins, no cost.

## Stack

- **GitHub Pages** — static hosting for the portal + every game
- **Cloudflare Workers** (free tier, no credit card) — the only "backend"
- **Cloudflare Workers KV** — the score database
- **Windsurf** — where this gets built and iterated on

## Architecture

The site is fully static GitHub Pages. Cloudflare Workers provides the server-side piece — it's the only thing that touches the KV store, so the site itself never needs credentials of any kind.

**Security Note:** The Worker URL is public, so treat it as *unlisted, not secret* — suitable for a family leaderboard but not for public launches with sensitive data. The Worker includes basic shape validation and per-IP rate limiting to stop accidental floods and casual poking.

## Setup Instructions

### 1. Repo Structure

```
outlaw-arcade/
├── index.html                  # the portal
├── games.json                  # single source of truth for the game shelf
├── /games
│   └── /relay-station-9
│       ├── index.html          # game implementation
│       └── arcade-client.js    # API helpers
├── /shared
│   └── arcade-client.js        # shared API helpers
├── /worker
│   └── index.js                 # Cloudflare Worker source
└── README.md
```

### 2. Cloudflare Worker Setup

1. **Create Cloudflare account:** Go to dash.cloudflare.com → sign up free (email + password, no card)
2. **Create Worker:** Workers & Pages → Create → **Create Worker** → name it `outlaw-arcade-scores` → Deploy
3. **Add Worker code:** Click **Edit code**, delete everything, paste the contents of `worker/index.js`, **Save and Deploy**
4. **Create KV binding:** Go to Worker's **Settings → Bindings** → **Add binding** → *KV Namespace*
   - Create a new namespace (call it `ARCADE_SCORES`)
   - Set the **variable name** to `SCORES` exactly (the code refers to it as `env.SCORES`)
5. **Copy the Worker URL** — shown at the top of the Worker dashboard, like `https://outlaw-arcade-scores.<your-subdomain>.workers.dev`

### 3. Test the Worker

Before connecting the site, test the Worker in a browser:
- Visit `<your-worker-url>?action=leaderboard`
- You should see `[]` (empty array)
- This confirms the Worker and KV binding both work

### 4. Configure the Site

1. Update `shared/arcade-client.js` to set `API_ENDPOINT` to your Cloudflare Worker URL
2. Update each game's `arcade-client.js` with the same endpoint (or reference the shared copy)
3. Update `index.html` to set `API_ENDPOINT` for the portal's leaderboard fetching

### 5. GitHub Pages Setup

1. Push this repo to GitHub
2. Go to repo Settings → Pages
3. Set source to `main` branch, root folder
4. Your site will be available at `https://<username>.github.io/outlaw-arcade/`

## Adding a New Game

1. Create new folder `/games/<slug>/`
2. Add `index.html` with your game implementation
3. Include `arcade-client.js` (copy from shared or reference it)
4. Call `getOperator()` to get the current player
5. Call `submitScore()` when the game completes
6. Add entry to `games.json`:
   ```json
   {
     "slug": "your-game-slug",
     "title": "Your Game Title",
     "tagline": "Short description",
     "path": "games/your-game-slug/index.html",
     "accent": "linear-gradient(90deg,#FFB627,#D64933)",
     "metricLabel": "Score Label",
     "sortDirection": "asc",
     "metricType": "seconds"
   }
   ```
7. Set `sortDirection` to `"asc"` if lower values win, `"desc"` if higher values win
8. Set `metricType` to `"seconds"` for time-based games (auto-formats as MM:SS), or any other value for raw numbers

## Score Data Contract

Every game POSTs the same shape:

```json
{
  "game": "relay-station-9",
  "operator": "haylie",
  "metric": "seconds",
  "value": 507,
  "outcome": "completed",
  "meta": { "hintsUsed": 1, "integrityLeft": 4 },
  "timestamp": "2026-08-01T20:31:00Z"
}
```

- `value`: The score (seconds, points, moves — whatever makes sense for the game)
- `outcome`: `"completed"` for finished games, `"in_progress"` for partial credit
- `meta`: Free-form object for game-specific data (stored in KV but not shown on leaderboard)

## Porting Relay Station 9

Relay Station 9 was built for Claude.ai artifacts. To port it to GitHub Pages:

1. Replace `window.storage` calls with `localStorage` (synchronous, no `.catch()` chains)
2. Read `?operator=` from URL via `getOperator()` and skip in-game callsign screen if provided
3. Call `submitScore()` at game completion and optionally when quitting partway

## Testing

1. Test the Cloudflare Worker in a browser before wiring the site (visit `?action=leaderboard`)
2. Test the portal locally (can use `python -m http.server` or similar)
3. Deploy to GitHub Pages and test end-to-end: check in → play → finish → see score on board