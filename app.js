// wineandart — daily-rotating showcase of Bordeaux winery architecture.
// All content lives in wineries.json. Today's featured winery is chosen
// deterministically from the date, so visitors see the same one all day.

const DATA_URL = "wineries.json";
const EPOCH = Date.UTC(2025, 0, 1); // anchor day for the rotation

async function loadWineries() {
  const res = await fetch(DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("Could not load wineries.json");
  return res.json();
}

function dayNumber(d = new Date()) {
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((today - EPOCH) / 86400000);
}

function todaysIndex(len, d = new Date()) {
  const n = dayNumber(d);
  return ((n % len) + len) % len;
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function lastFeaturedDate(wineryIdx, total, today = new Date()) {
  // Walk backward from today until dayNumber % total === wineryIdx
  const todayN = dayNumber(today);
  let n = todayN;
  for (let i = 0; i < total * 2; i++) {
    if (((n % total) + total) % total === wineryIdx) {
      const d = new Date(EPOCH + n * 86400000);
      return d;
    }
    n--;
  }
  return null;
}

function nextFeaturedDate(wineryIdx, total, today = new Date()) {
  const todayN = dayNumber(today);
  let n = todayN + 1;
  for (let i = 0; i < total * 2; i++) {
    if (((n % total) + total) % total === wineryIdx) {
      const d = new Date(EPOCH + n * 86400000);
      return d;
    }
    n++;
  }
  return null;
}

function paletteStyle(w) {
  const [c1, c2] = (w.palette && w.palette.length === 2) ? w.palette : ["#2a0708", "#5c0f1a"];
  return `--c1:${c1};--c2:${c2}`;
}

function renderHero(container, w) {
  container.innerHTML = `
    <div class="hero" style="${paletteStyle(w)}">
      ${w.image ? `<div class="hero-bg" style="background-image:url('${w.image}')"></div>` : ""}
      <div class="hero-gradient"></div>
      <div class="hero-pattern"></div>
      <div class="hero-caption">
        <h2 class="hero-name">${w.name}</h2>
        <div class="hero-meta">${w.architect} &nbsp;·&nbsp; ${w.year} &nbsp;·&nbsp; ${w.appellation}</div>
      </div>
    </div>
  `;
}

function renderBlurbs(container, w) {
  container.innerHTML = `
    <section class="blurb">
      <h2>The winery</h2>
      <p>${w.winery}</p>
    </section>
    <section class="blurb">
      <h2>The architect</h2>
      <p>${w.architect_blurb}</p>
    </section>
    <section class="blurb">
      <h2>Why this building</h2>
      <p>${w.why}</p>
    </section>
  `;
}

function renderCard(w, lastDate) {
  const meta = lastDate ? `Last featured · ${lastDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : "";
  return `
    <a class="card" href="winery.html?id=${encodeURIComponent(w.id)}" style="${paletteStyle(w)}">
      <div class="card-hero"></div>
      <div class="card-body">
        <div class="card-eyebrow">${w.architect} · ${w.year}</div>
        <h3>${w.name}</h3>
        <div class="card-meta">${w.appellation}${meta ? `<br>${meta}` : ""}</div>
      </div>
    </a>
  `;
}

function renderArchive(container, wineries, options = {}) {
  const today = new Date();
  const exclude = options.excludeIndex;
  const items = wineries
    .map((w, i) => ({ w, i, last: lastFeaturedDate(i, wineries.length, today) }))
    .filter(({ i }) => i !== exclude)
    .sort((a, b) => (b.last?.getTime() || 0) - (a.last?.getTime() || 0));
  container.innerHTML = items.map(({ w, last }) => renderCard(w, last)).join("");
}

function getQueryParam(name) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

async function bootHome() {
  try {
    const wineries = await loadWineries();
    const idx = todaysIndex(wineries.length);
    const w = wineries[idx];
    const today = new Date();

    const dateEl = document.getElementById("today-date");
    if (dateEl) dateEl.textContent = formatDate(today);

    renderHero(document.getElementById("hero"), w);
    renderBlurbs(document.getElementById("blurbs"), w);

    const archiveEl = document.getElementById("archive");
    if (archiveEl) renderArchive(archiveEl, wineries, { excludeIndex: idx });

    document.title = `${w.name} · wineandart`;
  } catch (e) {
    console.error(e);
    document.getElementById("hero").textContent = "Could not load today's winery.";
  }
}

async function bootArchive() {
  try {
    const wineries = await loadWineries();
    renderArchive(document.getElementById("archive"), wineries);
  } catch (e) {
    console.error(e);
  }
}

async function bootWinery() {
  try {
    const wineries = await loadWineries();
    const id = getQueryParam("id");
    const idx = wineries.findIndex(x => x.id === id);
    if (idx === -1) {
      document.querySelector("main").innerHTML = `<p>Winery not found. <a href="archive.html">Back to the archive →</a></p>`;
      return;
    }
    const w = wineries[idx];
    const last = lastFeaturedDate(idx, wineries.length);
    const next = nextFeaturedDate(idx, wineries.length);

    document.getElementById("eyebrow").textContent = `${w.architect}  ·  ${w.year}`;
    document.getElementById("name").textContent = w.name;
    document.getElementById("subhead").textContent = w.appellation;

    renderHero(document.getElementById("hero"), w);
    renderBlurbs(document.getElementById("blurbs"), w);

    const dates = [];
    if (last) dates.push(`Last featured on the home page: <span class="featured-date">${last.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>`);
    if (next) dates.push(`Next: <span class="featured-date">${next.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>`);
    document.getElementById("dates").innerHTML = dates.join(" &nbsp;·&nbsp; ");

    document.title = `${w.name} · wineandart`;
  } catch (e) {
    console.error(e);
  }
}

window.wineandart = { bootHome, bootArchive, bootWinery };
