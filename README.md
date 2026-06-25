# Security Awareness Jobs Digest

A weekly automated jobs digest for the security awareness and human risk management community. Pulls live roles from Adzuna across 11 countries, generates a clean HTML page, and publishes via GitHub Pages.

**Live digest:** https://YOUR-USERNAME.github.io/YOUR-REPO-NAME

---

## Setup (one-time, takes about 10 minutes)

### 1. Get your Adzuna API key
- Go to https://developer.adzuna.com
- Register for a free account
- Copy your `app_id` and `app_key`

### 2. Add your API keys to GitHub Secrets
- In your repo, go to **Settings → Secrets and variables → Actions**
- Click **New repository secret**
- Add `ADZUNA_APP_ID` with your app_id value
- Add `ADZUNA_APP_KEY` with your app_key value

### 3. Enable GitHub Pages
- Go to **Settings → Pages**
- Under **Source**, select **Deploy from a branch**
- Set branch to `main` and folder to `/docs`
- Click Save
- Your digest will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME`

### 4. Run it manually to test
- Go to **Actions → Generate Jobs Digest**
- Click **Run workflow**
- Wait about 2 minutes
- Check your Pages URL — the digest should be live

---

## Schedule
Runs automatically every **Monday at 7:00am UTC**.

## Countries covered
UK, US, Australia, Germany, Austria, Netherlands, Belgium, France, Poland, Singapore, Canada

## Keywords searched
- security awareness
- human risk management
- security culture
- cybersecurity awareness

---

## Customising

**Change the schedule:** Edit `.github/workflows/weekly-digest.yml` and update the cron expression.

**Add/remove countries:** Edit the `COUNTRIES` object in `generate-digest.js`.

**Add/remove keywords:** Edit the `KEYWORDS` array in `generate-digest.js`.

**Change branding:** The HTML template is built inside the `buildHTML` function in `generate-digest.js`. Update the eyebrow text, footer links, and colours there.
