# portfolio

[visit website.](https://apalmeirim.github.io)

### structure

- `style.css`: global styles and typography
- `script.js`: shared script placeholder
- `clock.js`: clock rendering + behavior
- `fonts/`, `images/`, `pdfs/`, `misc/`: asset folders

### deploy

Deployed with GitHub Pages from `main` via GitHub Actions.

### private secret pages (deployed, not in this repo)

This repo can inject secret files at deploy time from a private repo.

1. Create a private repo with this structure:
   - `secret/index.html`
   - `images/secret/<your-video>.mp4`
2. Create a fine-grained Personal Access Token with read access to that private repo.
3. In this public repo, add these Actions secrets:
   - `SECRET_CONTENT_REPO` = `owner/private-repo-name`
   - `SECRET_CONTENT_TOKEN` = PAT from step 2
4. Keep `/secret/` and `/images/secret/` in `.gitignore` in this public repo.
5. Push to `main` (or run the deploy workflow manually).

Notes:
- Secret pages are still accessible by direct URL if someone knows them.
- They are just not stored in this public repository.
