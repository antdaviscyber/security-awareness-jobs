# Security Awareness & Human Risk Jobs Digest

A weekly automated digest of specialist security awareness and human risk 
management job postings, published via GitHub Pages for the security 
awareness practitioner community.

**Live digest:** https://antdaviscyber.github.io/security-awareness-jobs

---

## What it does

Every Monday at 7am UTC, a GitHub Actions workflow runs automatically. It 
queries the Adzuna jobs API across 11 countries using specialist search 
terms, filters the results against an allowlist and blocklist to remove 
irrelevant roles, then generates a clean HTML page and publishes it to 
GitHub Pages.

No manual intervention needed once set up.

---

## Countries covered

UK, US, Australia, Germany, Austria, Netherlands, Belgium, France, Poland, 
Singapore, Canada

---

## Tech stack

- **GitHub Actions** — scheduling and automation
- **Node.js** — digest generation script
- **Adzuna API** — job data source
- **GitHub Pages** — hosting (served from /docs)

---

## Debugging

### Workflow isn't running
Check Actions → Generate Jobs Digest is listed. If not, the workflow file 
is in the wrong location. It must be at exactly:
`.github/workflows/weekly-digest.yml`

### Workflow runs but fails
Go to Actions → click the failed run → expand each step to read the logs.

Common causes:
- **Permission denied / 403** — Go to Settings → Actions → General → 
  Workflow permissions → set to Read and write
- **API error / no results** — Check your secrets are set correctly under 
  Settings → Secrets and variables → Actions. Keys needed: 
  `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`
- **Exit code 1** — Usually a JavaScript error in generate-digest.js. 
  The log will show the exact line

### Digest runs but shows irrelevant roles
The filtering logic lives in two arrays near the top of `generate-digest.js`:
- `TITLE_ALLOWLIST` — a role must match at least one term here to appear
- `TITLE_BLOCKLIST` — a role matching any term here gets rejected

Add or remove terms from either array to tighten or loosen the filter. 
Commit the change and re-run the workflow manually to test.

### Digest runs but shows no roles
The niche is small — some weeks will genuinely be quiet. The window is 
currently set to 14 days (`max_days_old=14` in the fetch URL). You can 
widen this further if needed. You can also add keywords to the `KEYWORDS` 
array in `generate-digest.js` to broaden the search.

### Page not updating after workflow runs
GitHub Pages can take 2-3 minutes to reflect new commits. Hard refresh 
the page (Cmd+Shift+R on Mac) before assuming something is broken.

---

## Updating search keywords

Open `generate-digest.js` and find the `KEYWORDS` array near the top. 
Add any phrase-level search terms you want Adzuna to query. Each keyword 
runs across all 11 countries so keep the list focused — broad terms will 
pull in noise.

---

## Running manually

Go to Actions → Generate Jobs Digest → Run workflow. Useful for testing 
after making changes to the script.

---

## Setup (if rebuilding from scratch)

1. Register at https://developer.adzuna.com for a free API key
2. Add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` to Settings → Secrets and 
   variables → Actions
3. Enable GitHub Pages: Settings → Pages → Branch: main → Folder: /docs
4. Run the workflow manually once to confirm everything works
