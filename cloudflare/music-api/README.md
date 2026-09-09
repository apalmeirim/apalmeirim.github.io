# music-api

Cloudflare Worker that reads two Notion databases (this week's song rotation and a playlist board) and serves them as plain JSON for `src/archive/music/`. Not part of the GitHub Pages deploy — this is deployed to Cloudflare separately.

## 1. Notion setup

1. Go to https://www.notion.so/my-integrations, create a new **internal integration**, copy its secret token.
2. Create a database called **Weekly Rotation** with these properties:
   - `Title` (title)
   - `Artist` (text)
   - `Cover` (text) — a plain image URL, not a Notion file upload (uploaded Notion files expire after ~1 hour)
   - `Apple Music` (URL)
   - `Spotify` (URL)
   - `Date` (date) — the day this pick is "for"
   - Add one new row per day. Old rows are just left there — the API only reads the current Mon–Sun week.
3. Create a second database called **Playlists** with:
   - `Title` (title)
   - `URL` (URL)
   - `Cover` (text, optional)
4. On each database, open the `...` menu → **Connections** → connect your integration.
5. Copy each database's ID from its URL: `notion.so/xxxxxxxx?v=...` — the ID is the 32-character part right after your workspace name.

## 2. Deploy the Worker

```
npm install -g wrangler
cd cloudflare/music-api
wrangler login
wrangler secret put NOTION_TOKEN   # paste the integration token from step 1
```

Edit `wrangler.toml` and fill in `NOTION_WEEK_DB_ID` and `NOTION_PLAYLISTS_DB_ID` with the two database IDs from step 5, and set `ALLOWED_ORIGIN` to your site's origin if it differs from `https://apalmeirim.github.io`.

```
wrangler deploy
```

Wrangler prints the deployed URL (`https://music-api.<your-subdomain>.workers.dev`). Paste that into `MUSIC_API_URL` in `src/archive/music/index.html`.
