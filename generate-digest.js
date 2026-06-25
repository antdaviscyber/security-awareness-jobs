const fs = require('fs');
const https = require('https');

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

const COUNTRIES = {
  gb: 'UK',
  us: 'US',
  au: 'Australia',
  de: 'Germany',
  at: 'Austria',
  nl: 'Netherlands',
  be: 'Belgium',
  fr: 'France',
  pl: 'Poland',
  sg: 'Singapore',
  ca: 'Canada'
};

const KEYWORDS = [
  'security awareness',
  'human risk management',
  'security culture',
  'cybersecurity awareness'
];

function fetchJobs(country, keyword) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(keyword);
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${query}&results_per_page=20&sort_by=date&max_days_old=7&content-type=application/json`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.results || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function classifyRole(title) {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('vp ') || t.includes('vice president') ||
      t.includes('head of') || t.includes('chief')) return 'leadership';
  if (t.includes('manager') || t.includes('lead') || t.includes('senior') ||
      t.includes('programme') || t.includes('program')) return 'manager';
  return 'specialist';
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  if (min && max) return `${Math.round(min / 1000)}k–${Math.round(max / 1000)}k`;
  if (min) return `From ${Math.round(min / 1000)}k`;
  return `Up to ${Math.round(max / 1000)}k`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function tierLabel(tier) {
  if (tier === 'leadership') return 'Director / Head of';
  if (tier === 'manager') return 'Manager / Programme Lead';
  return 'Analyst / Specialist / Coordinator';
}

function tierIcon(tier) {
  if (tier === 'leadership') return '⬆';
  if (tier === 'manager') return '◆';
  return '●';
}

function buildHTML(jobs, generatedAt) {
  const tiers = ['leadership', 'manager', 'specialist'];

  const tierSections = tiers.map(tier => {
    const tierJobs = jobs.filter(j => j.tier === tier);
    if (tierJobs.length === 0) return '';

    const cards = tierJobs.map(job => {
      const salary = formatSalary(job.salary_min, job.salary_max);
      const salaryHTML = salary ? `<span class="tag salary">${salary}</span>` : '';
      const contractHTML = job.contract ? `<span class="tag contract">${job.contract.replace('_', ' ')}</span>` : '';
      const countryHTML = `<span class="tag country">${job.country}</span>`;
      const dateHTML = job.created ? `<span class="posted">Posted ${formatDate(job.created)}</span>` : '';

      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="job-title">${job.title}</h3>
              <p class="company">${job.company}</p>
            </div>
            ${job.url ? `<a href="${job.url}" class="apply-btn" target="_blank" rel="noopener">View role →</a>` : ''}
          </div>
          <p class="location">${job.location}</p>
          <div class="tags">
            ${countryHTML}
            ${salaryHTML}
            ${contractHTML}
          </div>
          ${dateHTML}
        </div>`;
    }).join('');

    return `
      <section class="tier-section">
        <h2 class="tier-heading">
          <span class="tier-icon">${tierIcon(tier)}</span>
          ${tierLabel(tier)}
          <span class="tier-count">${tierJobs.length}</span>
        </h2>
        <div class="cards">
          ${cards}
        </div>
      </section>`;
  }).join('');

  const countryBreakdown = Object.entries(
    jobs.reduce((acc, j) => { acc[j.country] = (acc[j.country] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])
   .map(([c, n]) => `<span class="tag country">${c} <strong>${n}</strong></span>`)
   .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Awareness Jobs Digest</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f0;
      color: #1a1a1a;
      line-height: 1.6;
    }

    header {
      background: #0f1923;
      color: #fff;
      padding: 2.5rem 2rem;
    }

    .header-inner {
      max-width: 860px;
      margin: 0 auto;
    }

    .eyebrow {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #35DCC9;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    .meta {
      font-size: 0.85rem;
      color: #8a9bb0;
      margin-top: 0.75rem;
    }

    .stats-bar {
      display: flex;
      gap: 2rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-num {
      font-size: 1.5rem;
      font-weight: 700;
      color: #35DCC9;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #8a9bb0;
      margin-top: 0.2rem;
    }

    .country-bar {
      margin-top: 1.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    main {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .tier-section {
      margin-bottom: 2.5rem;
    }

    .tier-heading {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #555;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e0e0d8;
    }

    .tier-icon {
      color: #35DCC9;
      font-size: 0.7rem;
    }

    .tier-count {
      margin-left: auto;
      background: #e8e8e0;
      color: #555;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 10px;
    }

    .cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card {
      background: #fff;
      border: 1px solid #e8e8e0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.4rem;
    }

    .job-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f1923;
      line-height: 1.3;
    }

    .company {
      font-size: 0.85rem;
      color: #555;
      margin-top: 0.15rem;
    }

    .location {
      font-size: 0.8rem;
      color: #777;
      margin-bottom: 0.6rem;
    }

    .apply-btn {
      white-space: nowrap;
      font-size: 0.8rem;
      font-weight: 500;
      color: #35DCC9;
      text-decoration: none;
      border: 1px solid #35DCC9;
      padding: 0.3rem 0.75rem;
      border-radius: 4px;
      flex-shrink: 0;
      transition: background 0.15s;
    }

    .apply-btn:hover {
      background: #35DCC9;
      color: #0f1923;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 0.4rem;
    }

    .tag {
      font-size: 0.72rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }

    .tag.country {
      background: #e8f4f2;
      color: #0f6e56;
    }

    .tag.salary {
      background: #fef3e2;
      color: #854f0b;
    }

    .tag.contract {
      background: #f0eefe;
      color: #534ab7;
    }

    .posted {
      font-size: 0.72rem;
      color: #aaa;
    }

    footer {
      text-align: center;
      padding: 2rem;
      font-size: 0.78rem;
      color: #aaa;
      border-top: 1px solid #e8e8e0;
      margin-top: 2rem;
    }

    footer a {
      color: #35DCC9;
      text-decoration: none;
    }

    @media (max-width: 600px) {
      header { padding: 1.5rem 1rem; }
      main { padding: 1.5rem 1rem; }
      .card-header { flex-direction: column; }
      .apply-btn { align-self: flex-start; }
    }
  </style>
</head>
<body>

<header>
  <div class="header-inner">
    <p class="eyebrow">Secure Culture Hub</p>
    <h1>Security Awareness &amp; Human Risk Jobs</h1>
    <p class="meta">Roles posted in the last 7 days across 11 countries. Generated ${generatedAt}.</p>
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-num">${jobs.length}</span>
        <span class="stat-label">Roles this week</span>
      </div>
      <div class="stat">
        <span class="stat-num">${jobs.filter(j => j.tier === 'leadership').length}</span>
        <span class="stat-label">Director / Head of</span>
      </div>
      <div class="stat">
        <span class="stat-num">${jobs.filter(j => j.tier === 'manager').length}</span>
        <span class="stat-label">Manager / Lead</span>
      </div>
      <div class="stat">
        <span class="stat-num">${jobs.filter(j => j.tier === 'specialist').length}</span>
        <span class="stat-label">Specialist / Analyst</span>
      </div>
    </div>
    <div class="country-bar">${countryBreakdown}</div>
  </div>
</header>

<main>
  ${tierSections.trim() || '<p style="color:#777;padding:2rem 0;">No roles found this week. Check back next Monday.</p>'}
</main>

<footer>
  <p>Curated for the security awareness and human risk community.</p>
  <p style="margin-top:0.4rem">Data sourced from Adzuna. All listings verified live at time of generation. &nbsp;|&nbsp; <a href="https://antdavis.com">antdavis.com</a></p>
</footer>

</body>
</html>`;
}

async function main() {
  console.log('Fetching jobs from Adzuna...');

  const allJobs = [];
  const seenIds = new Set();

  for (const [code, name] of Object.entries(COUNTRIES)) {
    for (const keyword of KEYWORDS) {
      console.log(`  ${name}: "${keyword}"`);
      const results = await fetchJobs(code, keyword);
      for (const job of results) {
        if (seenIds.has(job.id)) continue;
        seenIds.add(job.id);
        allJobs.push({
          id: job.id,
          title: job.title || 'Unknown title',
          company: job.company?.display_name || 'Unknown',
          location: job.location?.display_name || name,
          country: name,
          countryCode: code,
          salary_min: job.salary_min || null,
          salary_max: job.salary_max || null,
          contract: job.contract_time || job.contract_type || null,
          created: job.created || null,
          url: job.redirect_url || null,
          tier: classifyRole(job.title || '')
        });
      }
      // Small delay to be polite to the API
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Sort newest first
  allJobs.sort((a, b) => new Date(b.created) - new Date(a.created));

  const generatedAt = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  console.log(`\nFound ${allJobs.length} unique roles. Generating HTML...`);

  const html = buildHTML(allJobs, generatedAt);
  fs.writeFileSync('./docs/index.html', html);

  console.log('Done. Output written to docs/index.html');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
