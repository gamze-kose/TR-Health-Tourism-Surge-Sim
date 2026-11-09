/* Health Tourism Surge Map: interface code. The simulation itself lives in engine.js and is the same code the batch analyses run. */
(function () {
'use strict';
const TR = DATA.tr || {};
let LANG = 'en';
try { const v = localStorage.getItem('surge-lang'); if (v === 'tr' || v === 'en') LANG = v; } catch (e) { /* storage can be unavailable */ }
const T = (s, v) => { let x = LANG === 'tr' && TR[s] !== undefined ? TR[s] : s; if (v) x = x.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)); return x; };

const COUNTRIES = DATA.countries, CN = Object.fromEntries(COUNTRIES.map((c) => [c.id, c])), BYNUM = Object.fromEntries(COUNTRIES.map((c) => [c.num, c.id]));
const M0 = HTSim.compile(Object.assign({}, DATA.model, { origins: COUNTRIES.concat(DATA.model.origins) }));
const CITY = DATA.cities, LN = HTSim.LINES, NL = LN.length, nP = M0.nP;
const SVC = M0.services, SVK = Object.fromEntries(SVC.map((s) => [s.key, s])), NIDX = Object.fromEntries(SVC.map((s, i) => [s.key, i])), LAYERNAME = DATA.model.groups, STAYS = DATA.model.stays || [];
const NS = 'http://www.w3.org/2000/svg', $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches, phone = matchMedia('(max-width:980px)');
const BY_ID = Object.fromEntries(M0.prov.map((p, i) => [p.id, i]));
const BASE_YEAR = 2026, YEAR_MIN = 2027, YEAR_MAX = 2047, OUT_YEARS = [2027, 2031, 2035, 2039, 2043, 2047], PATH_KEYS = HTSim.PATHS;
const PERIODS = [[2027, 2031, 2029], [2032, 2038, 2035], [2039, 2047, 2043]];
const META0 = JSON.parse(JSON.stringify(M0.meta));

const LINE = {
  ICU: { n: 'Intensive care', s: 'ICU', i: 'heart-rate-monitor', c: '#c7301e', o: '#fff' },
  TRAUMA: { n: 'Surgery and trauma', s: 'Trauma', i: 'bandage', c: '#d39200', o: '#12244a' },
  DIAL: { n: 'Dialysis', s: 'Dialysis', i: 'droplet', c: '#1a5fcf', o: '#fff' },
  ONCO: { n: 'Cancer care', s: 'Cancer', i: 'ribbon-health', c: '#b52aa8', o: '#fff' },
  REHAB: { n: 'Rehabilitation', s: 'Rehab', i: 'wheelchair', c: '#0f8a5a', o: '#fff' },
  STEP: { n: 'Step-down recovery', s: 'Recovery', i: 'home-heart', c: '#3ba6dc', o: '#12244a' },
};
const GC = { caused: '#c7301e', interrupted: '#1a5fcf', routine: '#0f8a5a' };
const RAMP = {
  tomato: ['#ffe6dc', '#fbc4ad', '#ef8561', '#cf4c31', '#8c1e11'], amber: ['#fff0c9', '#fbd98b', '#efae42', '#c6790e', '#7a4603'],
  teal: ['#d4f1ec', '#ace2da', '#62c1ba', '#1e908f', '#0c5a60'], violet: ['#ece0f6', '#d8bdeb', '#b482d6', '#8949b4', '#531e7b'],
  caused: ['#ffe6dc', '#fbc4ad', '#ef8561', '#cf4c31', '#8c1e11'], interrupted: ['#dfeafb', '#b7cff5', '#79a4eb', '#1a5fcf', '#103a82'],
  routine: ['#d9f1e5', '#b0e0c7', '#68c097', '#0f8a5a', '#0a5438'],
};
const PRESET = {
  adhoc: { l: 'Improvised', i: 'alert-triangle', note: 'Organised during the crisis: few idle beds, limited transport.', v: { kappa: 0.15, rho: 0, eta: 0.2, fastTrack: 1, airSlots: 30, coordCases: 150, rampDays: 14 } },
  model: { l: 'Reference', i: 'shield-plus', note: 'Values from the literature and the current regulation.', v: {} },
  coordinated: { l: 'Coordinated', i: 'route', note: 'A national plan prepared in advance: fast-track, more seats and staff.', v: { kappa: 0.45, rho: 0.25, eta: 1, fastTrack: 2, airSlots: 120, coordCases: 500, rampDays: 5, ptMobil: 0.1 } },
};
const TYPES = {
  quake: { l: 'Earthquake or sudden disaster', i: 'wave-saw-tool', d: 'Many injuries at once, then rehabilitation.' },
  conflict: { l: 'Armed conflict', i: 'flame', d: 'Injuries over months, and treatment cut off.' },
  epidemic: { l: 'Epidemic', i: 'virus', d: 'Critical illness and interrupted care.' },
};
const LEVELS = { limited: 'Limited', major: 'Major', extreme: 'Extreme' };
const EXITS = { open: { l: 'Open', i: 'lock-open', d: 'Patients leave once cleared.' }, limited: { l: 'Limited', i: 'door-exit', d: 'Half the usual clearance.' }, restricted: { l: 'Almost closed', i: 'lock', d: 'Very few exit permits.' } };
const PATHS = {
  current: { l: 'Current course', i: 'route', c: '#c7301e', d: 'Capacity follows past trends, more slowly each year. Cities without a unit stay closed.' },
  planned: { l: 'Planned expansion', i: 'trending-up', c: '#1a5fcf', d: 'One new city a year, more certified hospitals, smaller gaps in cancer and rehabilitation care, and a better prepared response.' },
  ambitious: { l: 'Ambitious programme', i: 'rocket', c: '#0f8a5a', d: 'Two new cities a year, most hospitals certified, the full need for radiotherapy met, and a national plan in place by 2040.' },
};
const MINE = '#b52aa8';
const STOCK = [['authBeds', 'Beds in authorised hospitals', 'building-hospital', 'beds'], ['authIcu', 'Intensive care beds in authorised hospitals', 'heart-rate-monitor', 'ICU beds'], ['dialSlots', 'Dialysis places', 'droplet', 'dialysis places'], ['oncSlots', 'Radiotherapy places', 'ribbon-health', 'radiotherapy places'], ['ftrBeds', 'Rehabilitation beds', 'wheelchair', 'rehabilitation beds'], ['thermal', 'Thermal beds', 'bath', 'thermal beds'], ['hotel', 'Licensed hotel beds', 'building', 'hotel beds']];
const LIMITS = [['access', 'Exit permits and access'], ['transport', 'Transport seats'], ['coord', 'Case coordinators'], ['capacity', 'Bed and treatment capacity'], ['staff', 'Rehabilitation staff']];
const PARTS = [['units', 'Open new units'], ['cert', 'Certify more hospitals'], ['care', 'Add cancer and rehabilitation capacity'], ['response', 'Prepare the national response']];
const STARS = ['', 'Rising', 'Strong', 'Leading'];
const PEOPLE = ['man', 'woman', 'old', 'man', 'woman', 'walk', 'baby-carriage', 'woman', 'man'];
const KIND_TRAVEL = { yes: 'Can travel', later: 'After stabilising', partly: 'Partly', no: 'Stays at home' };

const planDefault = () => ({ year: YEAR_MIN, path: 'current', units: {}, stock: {}, horizon: 0, marks: {}, off: {}, edits: {}, damage: {}, access: {}, groupWeights: { health: 1, tourism: 1, access: 1, presence: 1 }, realism: 0.7, htGrowth: 0.05, hotelGrowth: 0.02, markDemand: 1.5 });
const crisisDefault = () => ({ country: null, type: null, level: 'major', exit: 'open', months: 12 });
const S = {
  step: 1, ran: false, crises: [crisisDefault()], domestic: false, preset: 'model', levers: {}, plan: planDefault(), over: { conv: {}, ref: {} }, destShare: 1,
  cam: 'reg', layer: 'reserve', service: null, day: 90, play: false, res: null, noPlan: null, out: null, mc: null, sel: null, tab: 'summary', cityTab: 'why', pin: null, Mx: M0, P: null, scores: null, fc: null,
};

/* ---- Formats that follow the language ---- */
const nloc = () => (LANG === 'tr' ? 'tr-TR' : 'en-US');
const dec = (n, d) => Number(n).toLocaleString(nloc(), { minimumFractionDigits: d, maximumFractionDigits: d });
const int = (n) => Math.round(n).toLocaleString(nloc());
const U = () => (LANG === 'tr' ? { k: ' bin', m: ' milyon', b: ' milyar' } : { k: ' k', m: ' m', b: ' bn' });
const fmt = (n) => { if (n === null || n === undefined || isNaN(n)) return T('n/a'); const a = Math.abs(n), u = U(); if (a >= 1e9) return dec(n / 1e9, 2) + u.b; if (a >= 1e6) return dec(n / 1e6, 1) + u.m; if (a >= 1e4) return dec(Math.round(n / 100) / 10, 1) + u.k; if (a >= 100) return int(n); if (a >= 10) return dec(n, 0); if (a === 0) return '0'; return dec(n, 1); };
const pctv = (v, d) => (LANG === 'tr' ? '%' + dec(v, d || 0) : dec(v, d || 0) + '%');
const pct = (x) => pctv(100 * x, x < 0.1 ? 1 : 0);
const usd = (n) => (LANG === 'tr' ? (n < 0 ? '-' : '') + fmt(Math.abs(n)) + ' $' : (n < 0 ? '-$' : '$') + fmt(Math.abs(n)));
const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = (n, c) => `<svg class="ic ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const tok = (c, n, on) => `<span class="tok-c" style="background:${c};color:${on || '#fff'}">${ic(n)}</span>`;
const order = (a) => Array.from(a.keys()).sort((x, y) => a[y] - a[x]);
const rankOf = (a, i) => { let r = 1; for (let k = 0; k < a.length; k++) if (a[k] > a[i]) r++; return r; };
const cname = (o) => (LANG === 'tr' ? o.tr || o.name : o.name);
function mk(n, a, p) { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
const lerpHex = (a, b, k) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + pa.map((x, j) => Math.round(x + (pb[j] - x) * k)).join(',') + ')'; };
function ramp(name, v) { const r = RAMP[name]; v = Math.max(0, Math.min(1, v)) * (r.length - 1); const i = Math.min(r.length - 2, Math.floor(v)); return lerpHex(r[i], r[i + 1], v - i); }
const lvl = (pid, svc) => ((S.plan.marks[pid] || {})[svc] || 0);
const planEmpty = () => ['marks', 'off', 'edits', 'damage', 'access', 'units', 'stock'].every((k) => !Object.keys(S.plan[k]).length);
const unitCount = (M) => { let n = 0; for (let p = 0; p < nP; p++) n += M.unit[p]; return n; };
const total = (a) => { let n = 0; for (let i = 0; i < a.length; i++) n += a[i]; return n; };

/* ---- Scenario and parameters ---- */
function params() { const P = HTSim.baseParams(M0); for (const k in S.levers) P[k] = S.levers[k]; return P; }
const leverVal = (k) => (S.levers[k] !== undefined ? S.levers[k] : M0.params[k].base);
const ready = () => !!(S.crises[0].country && S.crises[0].type);
function nearestFlight(c) { let b = Infinity; M0.prov.forEach((a) => { if (a.airportIntl) { const v = HTSim.haversine(c.lat, c.lon, a.lat, a.lon) / 700; if (v < b) b = v; } }); return b; }
function curScn(share) {
  const dest = share === undefined ? S.destShare : share, P = params();
  const events = S.crises.filter((r) => r.country && r.type).map((r) => HTSim.crisisEvent(CN[r.country], r, P));
  const b = { id: 'user', name: '', note: '', commercialMult: 0.95, events };
  if (S.crises.some((r) => r.type === 'epidemic')) Object.assign(b, { commercialMult: 0.581, commercialRevMult: 0.78, occIcu: 0.88, kappaMult: 0.6 });
  if (S.domestic) { b.events = events.concat([{ type: 'disaster', injured: P.quakeInjuredMajor, start: 0, origins: { TUR: 1 }, damage: DATA.marmara }]); b.commercialMult = 0.75; }
  if (Object.keys(S.plan.damage).length && b.events.length) b.events[0].damage = Object.assign({}, b.events[0].damage || {}, S.plan.damage);
  if (dest !== 1) b.events.forEach((e) => { for (const k in e.origins) if (k !== 'TUR') e.origins[k] *= dest; });
  return b;
}
/* Country settings that depend on the scenario: how open the exit is, how far aircraft must fly, and the routine care base. */
function prepareOrigins(P) {
  const base = {};
  M0.origins.forEach((o) => { if (o.id !== 'TUR') { o.access = 1; o.airFactor = HTSim.airFactor(nearestFlight(o), P); } });
  S.crises.forEach((r) => {
    if (!r.country || !r.type) return;
    const o = M0.origins[M0.originIndex[r.country]], key = 'exit' + r.exit.replace(/^./, (x) => x.toUpperCase());
    if (r.type === 'conflict') { o.access = P[key]; base[r.country] = (o.pop / 1e6) * P.routinePerMillion * Math.exp(-nearestFlight(o) / P.tauHours); }
  });
  M0.meta.routineBase = base;
}
function applyOver() {
  const cv = JSON.parse(JSON.stringify(META0.conversion));
  for (const k in S.over.conv) for (const l in S.over.conv[k]) { if (!cv[k]) cv[k] = {}; cv[k][l] = S.over.conv[k][l]; }
  M0.meta.conversion = cv; M0.meta.refAdd = Object.assign({}, META0.refAdd, S.over.ref);
}

/* ---- The system in a chosen year ---- */
function stateFor(year, path, mine, extra) {
  const P = HTSim.yearParams(params(), year, path, S.levers);
  let user = mine ? { unit: Object.assign({}, S.plan.units), stock: S.plan.stock } : null;
  let plan = mine ? S.plan : { groupWeights: S.plan.groupWeights, realism: S.plan.realism, marks: {}, off: {}, edits: {}, access: {} };
  if (extra) { const [id, key] = extra; user = user || { unit: {}, stock: {} }; user.unit[id] = true; const marks = JSON.parse(JSON.stringify(plan.marks)); marks[id] = Object.assign({}, marks[id], { [key]: 3 }); plan = Object.assign({}, plan, { marks }); }
  const My = HTSim.yearModel(M0, year, path, P, user);
  return { M: HTSim.applyPlan(My, Object.assign({}, plan, { horizon: year - BASE_YEAR, yearMode: true, payingN: My.payingPatients })), P };
}
let DEF = null, defKey = '';
/* The chosen year as the data and the path describe it, with any unit the user has opened but no manual capacity. */
function defaults() {
  const k = [S.plan.year, S.plan.path, JSON.stringify(S.levers), JSON.stringify(S.plan.units)].join('|');
  if (k !== defKey) { const P = HTSim.yearParams(params(), S.plan.year, S.plan.path, S.levers); DEF = { M: HTSim.yearModel(M0, S.plan.year, S.plan.path, P, { unit: S.plan.units }), P }; defKey = k; }
  return DEF;
}

/* ---- Running the model ---- */
let timer = null, mcT = null, findJob = 0;
function run(now) {
  clearTimeout(timer);
  const go = () => {
    applyOver();
    S.scores = HTSim.scoreServices(M0, S.plan.groupWeights);
    S.plan.horizon = S.plan.year - BASE_YEAR;
    { const st = stateFor(S.plan.year, S.plan.path, true); S.Mx = st.M; S.P = st.P; }
    if (!S.ran) {
      S.res = HTSim.simulate(S.Mx, S.P, { id: 'idle', events: [] }, { record: true }); S.maxLoad = 1; S.lim = null; S.mc = null;
      paint(); tintCountries();
      if (S.step === 4) { renderPlaces(); overlays(); }
      return;
    }
    prepareOrigins(S.P);
    const scn = curScn();
    S.res = HTSim.simulate(S.Mx, S.P, scn, { record: true });
    if (planEmpty()) S.noPlan = S.res; else { const st = stateFor(S.plan.year, S.plan.path, false); S.noPlan = HTSim.simulate(st.M, st.P, scn, {}); }
    S.full = S.destShare === 1 ? S.res : HTSim.simulate(S.Mx, S.P, curScn(1), {});
    S.lens = HTSim.needLens(S.Mx, S.P, scn, S.res, S.scores);
    S.routine = HTSim.routineCare(S.Mx, S.P, curScn(1), 365);
    S.fc = HTSim.commercialForecast(M0, Object.assign({}, S.plan, { payingN: S.Mx.payingPatients }), S.scores);
    const d = S.res.daily; let m = 1; for (let t = 0; t < 365; t++) for (let p = 0; p < nP; p++) if (d.load[t][p] > m) m = d.load[t][p]; S.maxLoad = m;
    S.lim = null; S.mc = null;
    S.cand = null; S.out = null; renderResults(); startFindings(scn);
    $('code').value = setupCode();
    clearTimeout(mcT);
  };
  if (now) go(); else timer = setTimeout(go, 60);
}
function renderResults() { spark(); paint(); tintCountries(); renderBanner(); renderKPI(); renderSummary(); renderFindings(); renderBoard(true); renderRank(); renderPlanEff(); if (S.tab === 'needs') renderNeeds(); if (S.tab === 'impact') renderImpact(); if (S.tab === 'outlook') renderOutlook(); if (S.sel !== null) renderCity(); }

/* ---- Map ---- */
const svg = $('chart');
const CAM = { tr: [-860, -440, 1780, 860], reg: [-1500, -950, 3000, 1900], world: [-13300, -13300, 26600, 26600] };
let vb = CAM[S.cam].slice();
const g = {};
function unit() { const r = svg.getBoundingClientRect(); return r.width ? Math.max(vb[2] / r.width, vb[3] / r.height) : vb[2] / 800; }
function buildChart() {
  const defs = mk('defs', {}, svg);
  const rg = mk('radialGradient', { id: 'seaG', gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: 13130 }, defs);
  [[0, '#b9e7ea'], [0.2, '#a3dde4'], [0.6, '#79c6d8'], [1, '#55abca']].forEach(([o, c]) => mk('stop', { offset: o, 'stop-color': c }, rg));
  const h = mk('pattern', { id: 'hatch', patternUnits: 'userSpaceOnUse', width: 16, height: 16, patternTransform: 'rotate(45)' }, defs);
  mk('rect', { width: 16, height: 16, fill: '#e3e6ec' }, h); mk('rect', { width: 5, height: 16, fill: '#aab3c2' }, h);
  mk('circle', { cx: 0, cy: 0, r: 13130, fill: 'url(#seaG)' }, svg);
  g.rings = mk('g', {}, svg); g.ringT = [];
  [[1400, 2], [2800, 4], [5600, 8], [8400, 12]].forEach(([r, n]) => {
    mk('circle', { cx: 0, cy: 0, r, fill: 'none', stroke: '#ffffff', 'stroke-opacity': 0.55, 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, g.rings);
    const tx = mk('text', { x: 0, y: -r, 'text-anchor': 'middle', fill: '#2b6a86', class: 'ring' }, g.rings); g.ringT.push([tx, n]);
  });
  g.cnt = mk('g', {}, svg); g.cp = {}; g.cpT = {};
  DATA.map.countries.forEach((c) => {
    const k = BYNUM[c.iso], e = mk('path', { d: c.d, fill: '#faf5e6', stroke: '#d5c9a8', 'stroke-width': 0.6, 'vector-effect': 'non-scaling-stroke', class: k ? 'cnt on' : 'cnt' }, g.cnt);
    if (k) { e.setAttribute('data-c', k); g.cp[k] = e; g.cpT[k] = mk('title', {}, e); }
  });
  g.prov = mk('g', {}, svg); g.pv = [];
  DATA.map.provinces.forEach((p, i) => {
    const e = mk('path', { d: p.d, fill: '#fff', stroke: '#ffffff', 'stroke-width': 0.7, 'vector-effect': 'non-scaling-stroke', 'data-p': i, style: 'cursor:pointer' }, g.prov);
    mk('title', {}, e).textContent = p.name;
    g.pv.push(e);
  });
  g.route = mk('g', {}, svg); g.tok = mk('g', { 'pointer-events': 'none' }, svg); g.orig = mk('g', { 'pointer-events': 'none' }, svg); g.ann = mk('g', { 'pointer-events': 'none' }, svg);
  for (let i = 0; i < 68; i++) {
    const e = mk('g', { style: 'display:none' }, g.tok);
    const c = mk('circle', { r: 12, stroke: '#fff', 'stroke-width': 2.2 }, e);
    const u = mk('use', { x: -7.5, y: -7.5, width: 15, height: 15, class: 'ic' }, e);
    tokenPool.push({ e, c, u });
  }
}
function mapLabels() {
  g.ringT.forEach(([tx, n]) => { tx.textContent = n === 2 ? T('{n} h flight', { n }) : T('{n} h', { n }); });
  Object.entries(g.cpT).forEach(([k, e]) => { e.textContent = cname(CN[k]); });
}
function tintCountries() {
  const on = new Set(S.crises.map((r) => r.country).filter(Boolean));
  Object.entries(g.cp).forEach(([k, e]) => e.classList.toggle('sel', on.has(k)));
}
function setCam(c, instant) {
  S.cam = c; document.querySelectorAll('.cam button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cam === c));
  const to = CAM[c], from = vb.slice(), t0 = performance.now(), D = instant || reduced ? 0 : 520;
  function step(now) { const k = D ? Math.min(1, (now - t0) / D) : 1, e = k * k * (3 - 2 * k); vb = from.map((v, i) => v + (to[i] - v) * e); svg.setAttribute('viewBox', vb.join(' ')); if (k < 1) requestAnimationFrame(step); else { overlays(); staticTokens(); } }
  requestAnimationFrame(step);
}
const svcLabel = (s) => T(s.label);
function layerInfo() {
  const d = S.res.daily, t = S.day, a = new Float64Array(nP);
  if (!S.ran) { let m = 1; for (let p = 0; p < nP; p++) { a[p] = S.Mx.authBeds[p]; if (a[p] > m) m = a[p]; } return { a, lo: 0, hi: m, r: 'teal', title: T('Beds in authorised hospitals, {y}', { y: S.plan.year }), f: fmt }; }
  if (S.layer === 'occ') { for (let p = 0; p < nP; p++) a[p] = d.occ[t][p]; return { a, lo: 0.4, hi: 0.95, lin: true, r: 'amber', title: T('Bed occupancy'), f: (v) => pct(v) }; }
  if (S.layer === 'reserve') { let m = 1; for (let p = 0; p < nP; p++) { let v = 0; for (let c = 0; c < NL; c++) v += Math.max(0, d.capP[c][t * nP + p] - d.careP[c][t * nP + p]); a[p] = v; if (v > m) m = v; } return { a, lo: 0, hi: m, r: 'teal', title: T('Free care places'), f: fmt }; }
  if (S.layer === 'share') { let m = 0; for (let p = 0; p < nP; p++) { a[p] = S.Mx.htShare[p]; if (a[p] > m) m = a[p]; } return { a, lo: 0, hi: m, r: 'violet', title: S.plan.year ? T('Paying health tourists, {y}', { y: S.plan.year }) : T('Paying health tourists, estimate'), f: pct }; }
  if (S.layer === 'pot' && S.service) { const s = SVK[S.service], sc = S.scores[s.key].score; for (let p = 0; p < nP; p++) a[p] = sc[p]; return { a, lo: 0, hi: 1, lin: true, r: s.layer, title: T('Readiness: {x}', { x: svcLabel(s) }), f: (v) => Math.round(v * 100) }; }
  if (S.layer === 'need' && S.service) { const s = SVK[S.service], v = S.lens.byProv[NIDX[s.key]]; let m = 1; for (let p = 0; p < nP; p++) { a[p] = v[p]; if (a[p] > m) m = a[p]; } return { a, lo: 0, hi: m, r: s.layer, title: T('Patients over the year: {x}', { x: svcLabel(s) }), f: fmt }; }
  for (let p = 0; p < nP; p++) a[p] = d.load[t][p];
  return { a, lo: 0, hi: S.maxLoad, r: 'tomato', title: T('Patients in care'), f: fmt };
}
function paint(light) {
  const d = S.res && S.res.daily; if (!d) return;
  const t = S.day, L = layerInfo(), safe = S.P.occSafe;
  for (let i = 0; i < nP; i++) {
    const id = M0.prov[i].id, off = S.plan.off[id], noUnit = !S.Mx.unit[i], over = S.ran && !noUnit && d.occ[t][i] > safe, mine = S.plan.stock[id] || S.plan.units[id] || S.plan.off[id], fresh = S.Mx.opened[i] > 0;
    let v = (L.a[i] - L.lo) / Math.max(1e-9, L.hi - L.lo); if (!L.lin) v = Math.sqrt(Math.max(0, v));
    const e = g.pv[i], sel = i === S.sel;
    e.setAttribute('fill', off || (noUnit && S.layer !== 'pot') ? 'url(#hatch)' : ramp(L.r, v));
    e.setAttribute('stroke', sel ? '#12244a' : mine ? MINE : over ? '#c7301e' : fresh ? '#0f8a5a' : '#ffffff');
    e.setAttribute('stroke-width', sel ? 2.4 : mine ? 2 : over || fresh ? 1.7 : 0.7);
    const tip = M0.prov[i].name + (noUnit ? ' (' + T('no unit') + ')' : ''); if (e.firstChild.textContent !== tip) e.firstChild.textContent = tip;
    if (sel && e.parentNode.lastChild !== e) e.parentNode.appendChild(e);
  }
  const stops = RAMP[L.r].map((c, i, a) => `${c} ${(i / (a.length - 1)) * 100}%`).join(',');
  const mid = L.lin ? (L.lo + L.hi) / 2 : L.hi / 4;
  $('legend').innerHTML = `<span>${esc(L.title)}</span><div class="bar" style="background:linear-gradient(90deg,${stops})"></div><div class="ticks"><span>${L.f(L.lo)}</span><span>${L.f(mid)}</span><span>${L.f(L.hi)}</span></div>${S.ran ? `<div class="amber"><i></i>${T('Above safe occupancy')}</div>` : ''}<div class="nu"><i></i>${T('No authorised unit')}</div>${Array.from(S.Mx.opened).some((y) => y > 0) ? `<div class="nw"><i></i>${T('New unit on this course')}</div>` : ''}${planEmpty() ? '' : `<div class="mn"><i></i>${T('Changed by you')}</div>`}`;
  $('dayOut').textContent = T('Day {d}', { d: t + 1 });
  $('day').value = t; cursor(); computeRoutes(); drawRoutes(); staticTokens();
  if (!light || t % 4 === 0) overlays();
  if (S.ran) renderBoard();
}

/* Routes and travelling patient tokens. */
const tokenPool = [], tokens = []; let routes = [], sumV = 1, rafT = 0, lastF = 0, mapVisible = true;
function computeRoutes() {
  routes = [];
  if (!S.ran) { clearTokens(); return; }
  const d = S.res.daily, t = S.day, w = 7, rs = [];
  M0.origins.forEach((o, i) => {
    let v = 0; for (let q = Math.max(0, t - w); q <= t; q++) v += d.flows[i][q]; v /= Math.min(t, w) + 1;
    if (v < 0.02) return;
    const f = d.flowOP[i]; let tot = 0; for (let p = 0; p < nP; p++) tot += f[p]; if (tot <= 0) return;
    const idx = Array.from(f.keys()).filter((p) => f[p] / tot > 0.03).sort((a, b) => f[b] - f[a]).slice(0, 7);
    if (S.sel !== null && f[S.sel] > 0 && !idx.includes(S.sel)) idx.push(S.sel);
    const mix = d.flowOL[i]; let mt = 0; for (let c = 0; c < NL; c++) mt += mix[c];
    idx.forEach((p) => {
      const a = M0.prov[p], x0 = o.xy[0], y0 = o.xy[1], dx = a.x - x0, dy = a.y - y0, len = Math.hypot(dx, dy) || 1;
      rs.push({ o: i, p, v: (v * f[p]) / tot, x0, y0, x1: a.x, y1: a.y, cx: (a.x + x0) / 2 - dy * 0.16, cy: (a.y + y0) / 2 + dx * 0.16, len, acc: Math.random(), mix, mt });
    });
  });
  routes = rs; sumV = rs.reduce((a, r) => a + r.v, 0) || 1;
}
function drawRoutes() {
  g.route.textContent = ''; const mx = Math.max(0.1, ...routes.map((r) => r.v));
  routes.forEach((r) => {
    const sel = S.sel === r.p, dim = S.sel !== null && !sel, sw = 1 + 5.5 * Math.sqrt(r.v / mx), d = `M${r.x0} ${r.y0}Q${r.cx} ${r.cy} ${r.x1} ${r.y1}`;
    mk('path', { class: 'route', d, stroke: '#ffffff', 'stroke-width': sw + 2, 'stroke-opacity': dim ? 0.2 : 0.7 }, g.route);
    mk('path', { class: 'route', d, stroke: sel ? '#c7301e' : '#1a3f8f', 'stroke-width': sw, 'stroke-opacity': dim ? 0.25 : 0.82 }, g.route);
  });
}
function pickLine(r) { let x = Math.random() * (r.mt || 1); for (let c = 0; c < NL; c++) { x -= r.mix[c]; if (x <= 0) return c; } return 0; }
function pickNeed(r) { const c = pickLine(r), phi = S.lens.phi; let x = Math.random(); for (let n = 0; n < SVC.length; n++) { x -= phi[n][c]; if (x <= 0) return SVC[n]; } return SVC[0]; }
function launch(r, t) {
  const n = pickNeed(r); if (S.service && n.key !== S.service) return;
  const k = tokenPool.pop(); if (!k) return;
  k.c.setAttribute('fill', GC[n.layer]); k.u.setAttribute('href', '#i-' + n.icon); k.u.setAttribute('color', '#fff'); k.e.style.display = '';
  k.r = r; k.t = t || 0; k.sp = 1 / (2 + r.len / 1400); tokens.push(k);
}
function placeTok(k, sc) { const t = k.t, a = 1 - t, r = k.r, x = a * a * r.x0 + 2 * a * t * r.cx + t * t * r.x1, y = a * a * r.y0 + 2 * a * t * r.cy + t * t * r.y1; k.e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(4)})`); }
const tokSize = () => ((phone.matches ? 8 : 10) * unit()) / 12;
function clearTokens() { while (tokens.length) { const k = tokens.pop(); k.e.style.display = 'none'; tokenPool.push(k); } }
function staticTokens() { if (!reduced || !S.ran) return; clearTokens(); const sc = tokSize(); routes.slice(0, 22).forEach((r) => [0.3, 0.55, 0.8].forEach((t) => { launch(r, t); if (tokens.length) placeTok(tokens[tokens.length - 1], sc); })); }
function frame(now) {
  rafT = requestAnimationFrame(frame);
  if (!mapVisible || document.hidden || !routes.length && !tokens.length) { lastF = now; return; }
  const dt = Math.min(0.05, (now - lastF) / 1000 || 0.016); lastF = now;
  const sc = tokSize(), rate = phone.matches ? 6 : 11, cap = phone.matches ? 36 : 66;
  routes.forEach((r) => { r.acc += dt * rate * Math.max(0.05, r.v / sumV); if (r.acc >= 1 && tokens.length < cap) { r.acc -= 1; launch(r); } });
  for (let i = tokens.length - 1; i >= 0; i--) { const k = tokens[i]; k.t += dt * k.sp; if (k.t >= 1) { k.e.style.display = 'none'; tokens.splice(i, 1); tokenPool.push(k); } else placeTok(k, sc); }
}

/* Crowds waiting abroad, need badges and names. */
let boxes = [];
function fits(x, y, w, h) { for (const b of boxes) if (x < b[0] + b[2] && x + w > b[0] && y < b[1] + b[3] && y + h > b[1]) return false; boxes.push([x, y, w, h]); return true; }
function overlays() { drawOrigins(); annotate(); }
function labelAt(x, y, txt, fs, fill) { const e = mk('text', { x, y, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': fs * 0.26 }, g.orig); e.textContent = txt; }
function drawOrigins() {
  if (!S.res) return; g.orig.textContent = ''; boxes = [];
  const u = unit(), fs = 11.5 * u;
  if (!S.ran) { S.crises.forEach((r) => { if (r.country) { const o = CN[r.country]; mk('circle', { cx: o.xy[0], cy: o.xy[1], r: 5 * u, fill: '#c7301e', stroke: '#fff', 'stroke-width': 1.6 * u }, g.orig); labelAt(o.xy[0], o.xy[1] - 9 * u, cname(o), fs, '#8c1e11'); } }); return; }
  const d = S.res.daily, t = S.day;
  const list = M0.origins.map((o, i) => [o, i]).filter(([o, i]) => o.id !== 'TUR' && S.res.arrOrigin[i] > 0);
  const mxW = Math.max(1, ...list.map(([o, i]) => d.waitO[i][t]));
  list.forEach(([o, i]) => {
    const w = d.waitO[i][t], n = w > 0.5 ? Math.max(1, Math.ceil(9 * Math.sqrt(w / mxW))) : 0, s = 11 * u, cols = 3, x0 = o.xy[0] - (cols * s) / 2;
    if (n) mk('rect', { x: x0 - 3 * u, y: o.xy[1] - 3 * u, width: cols * s + 6 * u, height: Math.ceil(n / cols) * s + 6 * u, rx: 5 * u, fill: '#fff', 'fill-opacity': 0.9 }, g.orig);
    for (let k = 0; k < n; k++) { const q = k % cols, r = Math.floor(k / cols); mk('use', { href: '#i-' + PEOPLE[k % PEOPLE.length], x: x0 + q * s, y: o.xy[1] + r * s, width: s, height: s, class: 'ic', color: '#c7301e' }, g.orig); }
    const ly = o.xy[1] - 7 * u, name = cname(o), txt = w > 0.5 ? T('{c}, {n} waiting', { c: name, n: fmt(w) }) : name, tw = fs * 0.54 * txt.length;
    if (fits(o.xy[0] - tw / 2, ly - fs, tw, fs * 1.2)) labelAt(o.xy[0], ly, txt, fs, '#8c1e11');
  });
}
function badgeList() {
  const out = [], seen = new Set(), cnt = new Float64Array(nP);
  const add = (p, k, lv) => { const id = p + k; if (seen.has(id)) return; seen.add(id); out.push({ p, k, lv }); cnt[p]++; };
  for (const pid in S.plan.marks) for (const k in S.plan.marks[pid]) if (!S.service || S.service === k) add(BY_ID[pid], k, S.plan.marks[pid][k]);
  if (S.service) order(S.scores[S.service].score).slice(0, 10).forEach((p) => add(p, S.service, lvl(M0.prov[p].id, S.service)));
  else SVC.forEach((s) => { const o = order(S.scores[s.key].score); const p = o.find((q) => cnt[q] < 2); if (p !== undefined) add(p, s.key, lvl(M0.prov[p].id, s.key)); });
  return out;
}
function annotate() {
  if (!S.res) return; g.ann.textContent = '';
  const u = unit(), fs = 11.5 * u, cam = S.cam;
  g.rings.querySelectorAll('.ring').forEach((t) => t.setAttribute('font-size', fs * 0.92));
  if (!S.ran && S.step !== 4) return;
  if (S.sel !== null) { const a = M0.prov[S.sel]; mk('circle', { cx: a.x, cy: a.y, r: 9 * u, fill: 'none', stroke: '#12244a', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, g.ann); }
  const nameAt = (p, big) => { const a = M0.prov[p], w = fs * 0.54 * a.name.length, y = a.y + (big ? 16 : 11) * u; if (!fits(a.x - w / 2, y - fs, w, fs * 1.2)) return; const e = mk('text', { x: a.x, y, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: '#12244a', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': fs * 0.26 }, g.ann); e.textContent = a.name; };
  if (S.sel !== null) nameAt(S.sel, true);
  if (!S.ran) { order(S.Mx.authBeds).slice(0, phone.matches ? 5 : 9).forEach((p) => nameAt(p)); return; }
  if (cam !== 'world') {
    const r = (phone.matches ? 9 : 12) * u, per = new Float64Array(nP);
    badgeList().forEach((b) => {
      const a = M0.prov[b.p], x = a.x + per[b.p] * r * 2.1, y = a.y - r * 0.6;
      if (!fits(x - r, y - r, r * 2, r * 2)) return;
      per[b.p]++; const s = SVK[b.k], e = mk('g', { transform: `translate(${x} ${y})` }, g.ann);
      mk('circle', { r, fill: GC[s.layer], stroke: b.lv ? '#ffc53d' : '#fff', 'stroke-width': b.lv ? 2.5 + b.lv * 0.5 : 2, 'vector-effect': 'non-scaling-stroke' }, e);
      mk('use', { href: '#i-' + s.icon, x: -r * 0.66, y: -r * 0.66, width: r * 1.32, height: r * 1.32, class: 'ic', color: '#fff' }, e);
    });
    const K = cam === 'tr' ? (phone.matches ? 8 : 16) : phone.matches ? 3 : 7;
    order(S.res.servedProv).slice(0, K).forEach((p) => { if (S.res.servedProv[p] > 0.5) nameAt(p); });
  }
}

/* ---- Timeline ---- */
function spark() {
  const d = S.res.daily, sv = $('spark'); sv.textContent = ''; const mx = Math.max(1, ...d.waiting, ...d.inCare);
  const path = (a) => { let s = ''; a.forEach((v, i) => { s += (i ? 'L' : 'M') + i + ' ' + (32 - (v / mx) * 30).toFixed(1); }); return s; };
  mk('path', { d: path(d.inCare) + 'L364 33L0 33Z', fill: '#1a5fcf', 'fill-opacity': 0.2 }, sv);
  mk('path', { d: path(d.inCare), fill: 'none', stroke: '#1a5fcf', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, sv);
  mk('path', { d: path(d.waiting) + 'L364 33L0 33Z', fill: '#c7301e', 'fill-opacity': 0.16 }, sv);
  mk('path', { d: path(d.waiting), fill: 'none', stroke: '#c7301e', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }, sv);
  mk('line', { id: 'sparkC', x1: 0, x2: 0, y1: 0, y2: 34, stroke: '#12244a', 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }, sv); cursor();
}
function cursor() { const c = $('sparkC'); if (c) { c.setAttribute('x1', S.day); c.setAttribute('x2', S.day); } }
let raf2 = 0, last = 0;
function setPlay(on) { S.play = on; $('play').innerHTML = ic(on ? 'player-pause' : 'player-play'); $('play').setAttribute('aria-label', T(on ? 'Pause the year' : 'Play the year')); if (on) { last = 0; raf2 = requestAnimationFrame(tick); } else { cancelAnimationFrame(raf2); overlays(); if (S.sel !== null && S.cityTab === 'why') renderCity(); } }
function tick(n) { if (!S.play) return; if (n - last > (phone.matches ? 110 : 75)) { last = n; S.day = (S.day + 1) % 365; paint(true); if (S.sel !== null && S.cityTab === 'why' && S.day % 6 === 0) renderCity(); } raf2 = requestAnimationFrame(tick); }

/* ---- Numbers ---- */
function delta(k, down) { const ref = S.pin || (planEmpty() ? null : S.noPlan); if (!ref) return ''; const v = S.res[k] - ref[k]; if (Math.abs(v) < 0.5) return `<small>${T(S.pin ? 'same as pinned' : 'same as the defaults')}</small>`; const good = down ? v < 0 : v > 0; return `<small class="${good ? 'up' : 'down'}">${T(S.pin ? '{v} vs pinned' : '{v} vs the defaults', { v: (v > 0 ? '+' : '') + fmt(v) })}</small>`; }
function renderKPI() {
  const r = S.res, tot = Array.from(r.servedProv).sort((a, b) => b - a), all = tot.reduce((a, b) => a + b, 0) || 1; let run80 = 0, cities = 0; for (const v of tot) { if (run80 >= 0.8 * all) break; run80 += v; cities++; }
  const K = [['users-group', T('Referred from abroad'), fmt(r.arrivalsForeign), `<small>${T('over the year')}</small>`],
    ['building-hospital', T('Admitted in Türkiye'), fmt(r.admittedForeign), S.pin || !planEmpty() ? delta('admittedForeign') : `<small>${T('{p} of referrals', { p: r.arrivalsForeign ? pct(r.coverage) : pctv(0) })}</small>`],
    ['map-pin', T('Cities taking 80%'), T('{n} of {m}', { n: cities, m: unitCount(S.Mx) }), `<small>${T('of all patients')}</small>`],
    ['clock-hour-4', T('Average wait'), T('{n} days', { n: dec(r.meanWaitDays || 0, 0) }), S.pin || !planEmpty() ? delta('meanWaitDays', true) : `<small>${T('before transfer')}</small>`],
    ['user-x', T('Lost while waiting'), fmt(r.lost), S.pin || !planEmpty() ? delta('lost', true) : `<small>${T('over the year')}</small>`],
    ['users', T('Still waiting'), fmt(r.waitingEnd), S.pin || !planEmpty() ? delta('waitingEnd', true) : `<small>${T('at day 365')}</small>`]];
  $('kpis').innerHTML = K.map(([i, l, v, s]) => `<div class="kpi"><div class="h">${ic(i)}<span>${l}</span></div><b>${v}</b>${s}</div>`).join('');
}
const BOARD = [{ k: 'wait', l: 'Waiting abroad' }, { k: 'care', l: 'In care in Türkiye' }, { k: 'done', l: 'Care completed' }, { k: 'lost', l: 'Lost while waiting' }], BN = 36;
let boardUnit = 1;
function buildBoard() {
  $('board').innerHTML = BOARD.map((r) => `<div class="brd"><div class="t"><span>${T(r.l)}</span><b id="bv-${r.k}"></b></div><div class="pp" id="bp-${r.k}">${Array(BN).fill('<svg class="ic" style="display:none"><use/></svg>').join('')}</div></div>`).join('');
}
function renderBoard(rescale) {
  const d = S.res.daily, t = S.day;
  if (rescale) { const m = Math.max(...d.waiting, ...d.inCare, d.done[364], d.lost[364]), nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]; boardUnit = nice.find((x) => m / x <= BN) || 50000; }
  $('boardTitle').textContent = T(boardUnit === 1 ? 'Day {d}. One icon is {n} patient' : 'Day {d}. One icon is {n} patients', { d: t + 1, n: int(boardUnit) });
  const fill = (k, items, val) => {
    $('bv-' + k).textContent = int(val); const box = $('bp-' + k).children;
    for (let i = 0; i < BN; i++) { const e = box[i], it = items[i]; if (it) { if (e.style.display) e.style.display = ''; if (e.dataset.i !== it[0]) { e.firstChild.setAttribute('href', '#i-' + it[0]); e.dataset.i = it[0]; } if (e.dataset.c !== it[1]) { e.style.color = it[1]; e.dataset.c = it[1]; } } else if (!e.style.display) e.style.display = 'none'; }
  };
  const n = (v) => Math.min(BN, v > 0 ? Math.max(v / boardUnit >= 0.25 ? 1 : 0, Math.round(v / boardUnit)) : 0);
  fill('wait', Array.from({ length: n(d.waiting[t]) }, (_, i) => [PEOPLE[i % PEOPLE.length], '#c7301e']), d.waiting[t]);
  const care = []; SVC.forEach((nd, i) => { let v = 0; for (let c = 0; c < NL; c++) v += d.lineCare[c][t] * S.lens.phi[i][c]; for (let k = 0; k < Math.round(v / boardUnit); k++) care.push([nd.icon, GC[nd.layer]]); });
  fill('care', care.slice(0, BN), d.inCare[t]);
  fill('done', Array.from({ length: n(d.done[t]) }, () => ['user-check', '#0f8a5a']), d.done[t]);
  fill('lost', Array.from({ length: n(d.lost[t]) }, () => ['user-x', '#5b6472']), d.lost[t]);
}

/* ---- Steps ---- */
const STEPS = [[1, 'Country'], [2, 'Crisis'], [3, 'Year'], [4, 'Cities'], [5, 'Results']];
function canGo(n) { const c = S.crises[0]; if (n === 1) return true; if (n === 2) return !!c.country; if (n <= 4) return !!(c.country && c.type); return S.ran; }
function renderStepper() {
  $('stepper').innerHTML = STEPS.map(([n, l]) => { const done = n < S.step, now = n === S.step; return `<button class="stp${done ? ' done' : ''}${now ? ' now' : ''}" data-step="${n}"${canGo(n) ? '' : ' disabled'}${now ? ' aria-current="step"' : ''}><span class="num">${done ? ic('check') : n}</span><span>${T(l)}</span></button>`; }).join('');
}
function hintText() {
  if (S.step === 1) return T(S.crises[0].country ? 'Tap another country to change it' : 'Tap a country on the map');
  if (S.step === 4) return T('Tap a city to change it');
  if (S.step === 5) return `${T('Tap a city')}<span class="long"> ${T('to see why patients go there')}</span>`;
  return '';
}
function renderHint() { const h = hintText(), b = $('hint'); $('hintTxt').innerHTML = h; b.hidden = !h || (S.step >= 4 && S.sel !== null); b.classList.toggle('wiz', S.step < 5); }
function goStep(n) {
  if (!canGo(n)) return;
  if (S.step !== n && n < 5 && S.ran) { S.ran = false; S.layer = 'reserve'; $('layer').value = 'reserve'; S.service = null; S.sel = null; setPlay(false); renderCity(); S.pin = null; document.querySelectorAll('#strip button').forEach((b) => b.setAttribute('aria-pressed', false)); S.day = 90; run(true); }
  const was = S.step; S.step = n;
  if (n === 4 && was !== 4) { S.sel = null; setCam('tr'); } else if (was === 4 && n < 4) { S.sel = null; setCam('reg'); }
  showStep(); if (n === 4) run(true); else if (was === 4) { paint(); overlays(); } window.scrollTo(0, 0);
}
function showStep() {
  const n = S.step;
  [1, 2, 3, 4].forEach((k) => { $('w' + k).hidden = n !== k; });
  $('results').hidden = n !== 5; $('finds').hidden = n !== 5; $('timeBar').hidden = n !== 5; $('keys').hidden = n !== 5; $('layerbox').hidden = n !== 5; $('pinBtn').hidden = n !== 5;
  renderStepper(); renderHint();
  if (n === 1) renderStep1(); if (n === 2) renderStep2(); if (n === 3) renderStep3(); if (n === 4) renderStep4();
}
function countryOptions(sel) {
  const nameSort = (a, b) => cname(a).localeCompare(cname(b), nloc());
  const near = COUNTRIES.filter((c) => c.landGates.length).sort(nameSort);
  const fly = COUNTRIES.filter((c) => !c.landGates.length && nearestFlight(c) <= 4).sort(nameSort);
  const far = COUNTRIES.filter((c) => !c.landGates.length && nearestFlight(c) > 4).sort(nameSort);
  const opt = (c) => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${esc(cname(c))}</option>`;
  return [[T('Road border with Türkiye'), near], [T('Within a 4-hour flight'), fly], [T('Further away'), far]].map(([l, a]) => `<optgroup label="${esc(l)}">${a.map(opt).join('')}</optgroup>`).join('');
}
function renderStep1() {
  const id = S.crises[0].country, sel = $('country');
  sel.innerHTML = `<option value="">${T('Choose a country')}</option>` + countryOptions(id); sel.value = id || '';
  $('next1').disabled = !id; $('next1').innerHTML = `<span>${T(id ? 'Next: choose the crisis' : 'Choose a country to continue')}</span>${id ? ic('arrow-right') : ''}`;
  const box = $('profile'); if (!id) { box.innerHTML = ''; return; }
  const c = CN[id], P = S.P || params(), gap = HTSim.capacityGap(c, P), mark = (k) => (c.est.includes(k) ? ' *' : ''), gates = c.landGates.map((p) => M0.prov[p - 1].name);
  const F = [['users-group', T('Population'), fmt(c.pop)], ['building-hospital', T('Hospital beds per 1,000 people'), dec(c.beds, 1) + mark('beds')], ['chart-bar', T('Human development index'), dec(c.hdi, 2) + mark('hdi')],
    ['old', T('People aged 65 or over'), pctv(c.age65, 1) + mark('age65')], ['droplet', T('Adults with diabetes'), pctv(c.diabetes, 1) + mark('diabetes')], ['plane-departure', T('Shortest transfer to a Turkish city'), T('{n} hours', { n: dec(Math.min(...M0.hours[M0.originIndex[c.id]]), 1) })]];
  F.push(['road', T('Road border gates with Türkiye'), gates.length ? String(gates.length) : T('None, by air only')]);
  const eff = gap > 1.05 ? T('This country has fewer hospital beds than the reference level, so the model expects more severe cases to need care abroad ({g} times the reference).', { g: dec(gap, 2) }) : gap < 0.95 ? T('This country has more hospital beds than the reference level, so the model expects fewer severe cases to need care abroad ({g} times the reference).', { g: dec(gap, 2) }) : T('Hospital beds are close to the reference level.');
  box.innerHTML = `<div class="card"><h2>${ic('map-pin')}${esc(cname(c))}</h2><div class="facts">${F.map(([q, l, v]) => `<div>${ic(q)}<span><b>${v}</b>${l}</span></div>`).join('')}</div>`
    + (gates.length ? `<p class="note">${T('Road routes enter through {p}.', { p: esc(gates.join(', ')) })}</p>` : '')
    + `<p class="note">${eff}</p><p class="note">${T('Every country is described by the same parameters. Sources: United Nations, World Bank, OECD, UNDP and the International Diabetes Federation, compiled by Our World in Data.')}${c.est.length ? ' ' + T('* Estimated, because no value was available.') : ''}</p></div>`;
}
function tile(attr, val, active, icon, title, sub) { return `<button class="tile" data-${attr}="${val}" aria-pressed="${active}">${icon ? ic(icon) : ''}<b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</button>`; }
function levelSub(c, type, lv, P) { const e = HTSim.crisisEvent(c, { type, level: lv, months: 12 }, P); if (type === 'quake') return T('{n} injured', { n: fmt(e.injured) }); if (type === 'conflict') return T('{n} injured a day', { n: fmt(e.injuredPerDay) }); return T('{n} critical cases', { n: fmt(e.critical) }); }
function renderStep2() {
  const r = S.crises[0], c = CN[r.country], P = S.P || params();
  $('w2Note').textContent = T('The event below has not happened. Sizes come from published figures for past events and are scaled to the population and health system of {c}.', { c: cname(c) });
  $('typeTiles').innerHTML = Object.entries(TYPES).map(([k, v]) => tile('type', k, r.type === k, v.i, T(v.l), T(v.d))).join('');
  $('w2More').hidden = !r.type;
  if (r.type) {
    $('levelTiles').innerHTML = Object.entries(LEVELS).map(([k, l]) => tile('level', k, r.level === k, '', T(l), levelSub(c, r.type, k, P))).join('');
    $('conflictOpts').hidden = r.type !== 'conflict';
    if (r.type === 'conflict') {
      $('exitTiles').innerHTML = Object.entries(EXITS).map(([k, v]) => tile('exit', k, r.exit === k, v.i, T(v.l), T(v.d))).join('');
      $('monthsSeg').innerHTML = [[6, T('6 months')], [12, T('1 year')]].map(([m, l]) => `<button data-months="${m}" aria-pressed="${r.months === m}">${l}</button>`).join('');
    }
    $('preview').innerHTML = previewHTML(c, r, P);
  }
  $('extra').innerHTML = S.crises.slice(1).map((x, i) => `<div class="xrow"><select data-x="${i + 1}|country" aria-label="${T('Country')}"><option value="">${T('Choose a country')}</option>${countryOptions(x.country)}</select><select data-x="${i + 1}|type" aria-label="${T('Type of crisis')}"><option value="">${T('Choose')}</option>${Object.entries(TYPES).map(([k, v]) => `<option value="${k}"${x.type === k ? ' selected' : ''}>${T(v.l)}</option>`).join('')}</select><button class="icon-btn" data-xdel="${i + 1}" aria-label="${T('Remove this crisis')}">${ic('trash')}</button><select class="full" data-x="${i + 1}|level" aria-label="${T('Size')}">${Object.entries(LEVELS).map(([k, l]) => `<option value="${k}"${x.level === k ? ' selected' : ''}>${T(l)}</option>`).join('')}</select></div>`).join('')
    + (S.crises.length < 4 ? `<button class="btn" data-xadd>${ic('plus')}${T('Add another crisis')}</button>` : '');
  $('domestic').checked = S.domestic;
  $('next2').disabled = !r.type; $('next2').innerHTML = `<span>${T(r.type ? 'Next: year and development path' : 'Choose a type of crisis to continue')}</span>${r.type ? ic('arrow-right') : ''}`;
}
function previewHTML(c, r, P) {
  const e = HTSim.crisisEvent(c, r, P), rows = [];
  if (r.type === 'quake') rows.push([T('People injured'), fmt(e.injured)]);
  if (r.type === 'conflict') { rows.push([T('People injured over the period'), fmt(e.injuredPerDay * e.duration)]); rows.push([T('Cancer patients cut off from treatment'), fmt(e.cancerPatients)]); rows.push([T('Dialysis patients cut off from treatment'), fmt(e.dialysisPatients)]); }
  if (r.type === 'epidemic') { rows.push([T('People critically ill'), fmt(e.critical)]); rows.push([T('Dialysis patients affected'), fmt(e.dialysisPatients)]); }
  const lam = HTSim.buildArrivals(M0, P, { events: [e] }, 365); let v = 0; lam.forEach((a) => { if (a) a.forEach((x) => { for (let t = 0; t < 365; t++) v += x[t]; }); });
  rows.push([`<b>${T('Expected to need care abroad')}</b>`, `<b>${fmt(v)}</b>`]);
  return `<div class="card tint ledger"><h2>${ic('info-circle')}${T('What this means')}</h2>${rows.map(([a, b]) => `<div class="row"><span>${a}</span><div>${b}</div></div>`).join('')}</div>`;
}
function yearFacts() {
  const y = S.plan.year, st = stateFor(y, S.plan.path, false), M = st.M, o = M0.meta.outlook, F = [
    ['map-pin', T('Cities that can receive patients'), T('{n} of 81', { n: unitCount(M) })], ['building-hospital', T('Beds in authorised hospitals'), fmt(total(M.authBeds))],
    ['old', T('People aged 65 or over'), pctv(HTSim.tableAt(o.age65, y), 1)], ['activity', T('Domestic demand for hospital beds'), T('{n} compared with {y}', { n: (M.demandIndex >= 1 ? '+' : '') + pctv((M.demandIndex - 1) * 100), y: HTSim.DATA_YEAR })]];
  return `<div class="card tint"><h2>${ic('calendar-time')}${T('Türkiye in {y}', { y })}</h2><div class="facts">${F.map(([q, l, v]) => `<div>${ic(q)}<span><b>${v}</b>${l}</span></div>`).join('')}</div></div>`;
}
function renderStep3() {
  $('w3Sum').textContent = T('Your hypothetical scenario: {s}.', { s: scenarioText() });
  $('year').value = S.plan.year; $('o-year').textContent = S.plan.year;
  $('pathTiles').innerHTML = PATH_KEYS.map((k) => tile('path', k, S.plan.path === k, PATHS[k].i, T(PATHS[k].l), T(PATHS[k].d))).join('');
  $('yearFacts').innerHTML = yearFacts();
  $('presetTiles').innerHTML = Object.entries(PRESET).map(([k, p]) => tile('p', k, S.preset === k, p.i, T(p.l), T(p.note))).join('');
  $('dest').value = S.destShare; $('o-dest').textContent = pctv(S.destShare * 100);
  document.querySelectorAll('#extSeg button').forEach((b) => b.setAttribute('aria-pressed', (+b.dataset.e) === (+(S.levers.extendedNeeds || 0))));
}
function scenarioText() {
  return S.crises.filter((r) => r.country && r.type).map((r) => T('{level} {type} in {c}', { level: T(LEVELS[r.level]), type: T(r.type === 'quake' ? 'earthquake' : r.type === 'conflict' ? 'armed conflict' : 'epidemic'), c: cname(CN[r.country]) })).join(', ') + (S.domestic ? T(', with a Marmara earthquake in Türkiye') : '');
}
function renderBanner() {
  const pre = PRESET[S.preset] ? T(PRESET[S.preset].l) : T('Your own settings');
  $('banner').innerHTML = `<div><b>${esc(scenarioText())}</b><small>${T('Hypothetical scenario in {y}. Course: {c}. Response: {r}. Patients choosing Türkiye: {p}.', { y: S.plan.year, c: T(PATHS[S.plan.path].l), r: pre, p: pctv(S.destShare * 100) })}</small></div><button class="btn" data-step="1">${ic('arrow-back-up')}${T('Change')}</button>`;
}
function renderSummary() {
  const r = S.res, top = order(r.servedProv)[0], hasCity = r.servedProv[top] >= 1;
  $('sumLead').innerHTML = r.arrivalsForeign >= 1 ? T('In this hypothetical scenario, Türkiye could admit <b>{a}</b> of the <b>{b}</b> patients referred from abroad ({p}).', { a: int(r.admittedForeign), b: int(r.arrivalsForeign), p: pct(r.coverage) }) : T('This scenario sends no patients abroad.');
  const A = [['player-play', T('Press play and watch patients travel to Türkiye over the year.'), 'data-do="play"', T('Play')]];
  if (hasCity) A.push(['map-pin', T('Open the city that received the most patients and see why.'), `data-city="${top}"`, esc(M0.prov[top].name)]);
  A.push(['chart-line', T('See how the same crisis would go in any year up to {y}, and what can be done.', { y: YEAR_MAX }), 'data-go="outlook"', T('20 years')]);
  A.push(['stethoscope', T('See which care needs this crisis creates and whether they can travel.'), 'data-go="needs"', T('Needs')]);
  A.push(['star', T('Rate cities to test your own forecast.'), 'data-go="cities"', T('Cities')]);
  A.push(['target-arrow', T('See the potential for Türkiye and who would pay.'), 'data-go="impact"', T('Impact')]);
  $('todo').innerHTML = A.map(([i, l, attr, b], k) => `<li><span class="n">${k + 1}</span><span>${l}</span><button class="btn" ${attr}>${ic(i)}${b}</button></li>`).join('');
}
function runScenario() {
  if (!ready()) return;
  S.ran = true; S.step = 5; S.sel = null; S.service = null; S.layer = 'load'; $('layer').value = 'load'; S.pin = null; renderCity();
  document.querySelectorAll('#strip button').forEach((b) => b.setAttribute('aria-pressed', false));
  const f = S.crises[0]; S.day = f.type === 'quake' ? 25 : f.type === 'epidemic' ? 70 : 90;
  const far = S.crises.some((r) => r.country && Math.hypot(CN[r.country].xy[0], CN[r.country].xy[1]) > 3200);
  setCam(far ? 'world' : 'reg');
  showStep(); setTab('summary'); run(true); window.scrollTo(0, 0); requestAnimationFrame(() => window.scrollTo(0, 0));
}
function pickCountry(id) {
  const c = CN[id]; if (!c) return;
  S.crises[0].country = id; tintCountries(); overlays();
  const far = Math.hypot(c.xy[0], c.xy[1]) > 3200; if (far && S.cam !== 'world') setCam('world');
  if (S.step === 1) renderStep1(); else if (S.step === 2) renderStep2();
  renderStepper(); renderHint();
}

/* ---- City panel ---- */
function select(i) { S.sel = i; $('hint').hidden = true; if (S.sel !== null) { $('citySel').value = i; $('editSel').value = i; } paint(); renderCity(); if (S.step === 4) { renderEditor(); overlays(); } }
function mainOrigin() { let b = 0, m = -1; S.res.arrOrigin.forEach((v, i) => { if (v > m) { m = v; b = i; } }); return b; }
function routeInfo(oi, pi) {
  const o = M0.origins[oi], pv = M0.prov[pi]; let best = Infinity, mode = '', via = -1;
  M0.prov.forEach((a, k) => { if (!a.airportIntl) return; const v = HTSim.haversine(o.lat, o.lon, a.lat, a.lon) / 700 + 3 + (HTSim.haversine(a.lat, a.lon, pv.lat, pv.lon) * 1.3) / 75; if (v < best) { best = v; mode = 'air'; via = k; } });
  (o.landGates || []).forEach((g2) => { const gp = M0.prov[g2 - 1], v = ((HTSim.haversine(o.lat, o.lon, gp.lat, gp.lon) + HTSim.haversine(gp.lat, gp.lon, pv.lat, pv.lon)) * 1.3) / 70 + 2; if (v < best) { best = v; mode = 'land'; via = g2 - 1; } });
  return { h: best, mode, via };
}
const fbar = (l, v, r, sub, c) => `<div class="fbar"><span>${l}</span><b>${r}</b><div class="tr"><i style="width:${Math.max(2, v * 100)}%;background:${c}"></i></div>${sub ? `<small>${sub}</small>` : ''}</div>`;
function whyHTML(i) {
  const r = S.res, d = r.daily, t = S.day, Mx = S.Mx, P = S.P, p = M0.prov[i], served = r.servedProv[i];
  const byO = []; M0.origins.forEach((o, k) => { const v = d.flowOP[k][i]; if (v > 0.5) byO.push([k, v]); }); byO.sort((a, b) => b[1] - a[1]);
  const oi = byO.length ? byO[0][0] : mainOrigin(), o = M0.origins[oi], oName = cname(o), H = Mx.hours[oi], hmin = Math.min(...H), rankH = 1 + Array.from(H).filter((v) => v < H[i]).length;
  const capAt = (q) => { let s = 0; for (let c = 0; c < NL; c++) s += d.capP[c][t * nP + q]; return s; };
  const capAll = Array.from({ length: nP }, (_, q) => capAt(q)), mxCap = Math.max(1, ...capAll), capHere = capAll[i], capRank = rankOf(capAll, i);
  const vis = Mx.visOverride[i] ? 1 : P.eta + (1 - P.eta) * Math.min(1, Mx.htShare[i] / P.htRef), close = Math.exp(-(H[i] - hmin) / P.tauHours);
  const ri = o.id === 'TUR' ? null : routeInfo(oi, i);
  const routeTxt = !ri ? T('Domestic transfer within Türkiye') : ri.mode === 'land' ? T('Fastest route in the model: by road through {c}', { c: M0.prov[ri.via].name }) : ri.via === i ? T('Fastest route in the model: by air to {c}', { c: M0.prov[ri.via].name }) : T('Fastest route in the model: by air to {c}, then by road', { c: M0.prov[ri.via].name });
  const hTxt = dec(H[i], 1), city = esc(p.name);
  let lead;
  if (S.plan.off[p.id]) lead = T('You took {c} out of service, so the model sends no patients here.', { c: city });
  else if (!Mx.unit[i]) lead = T('No patients come to <b>{c}</b>, because no authorised hospital is on record here. A hospital needs the certificate before it can treat international patients. A new unit could open here in step 4 of this tool.', { c: city });
  else if (served >= 1) lead = T('<b>{c}</b> took <b>{n}</b> of the {all} patients admitted this year ({p}). Patients from {o} get here in {h} hours, {r}, and it has {cap} (number {cr} of 81).', { c: city, n: int(served), all: int(r.admitted), p: pct(served / r.admitted), o: esc(oName), h: hTxt, r: rankH === 1 ? T('the closest city of 81') : T('number {n} of 81 for closeness', { n: rankH }), cap: capHere >= 1 ? T('{n} emergency care places', { n: fmt(capHere) }) : T('very few emergency care places'), cr: capRank });
  else if (capHere < 1) lead = T('No patients come to <b>{c}</b> because the model finds almost no emergency care places here.', { c: city });
  else lead = T('No patients come to <b>{c}</b> in this crisis. It is number {r} of 81 for closeness to {o} and number {cr} for free places, so closer or larger cities fill first.', { c: city, r: rankH, o: esc(oName), cr: capRank });
  const lines = LN.map((l, c) => { const v = d.capP[c][t * nP + i]; return `<div>${tok(LINE[l].c, LINE[l].i, LINE[l].o)}<span><b>${fmt(v)}</b>${T(LINE[l].s)}</span></div>`; }).join('');
  const from = byO.slice(0, 5).map(([k, v]) => `<div class="fbar"><span>${esc(cname(M0.origins[k]))}</span><b>${int(v)}</b></div>`).join('');
  const needs = SVC.map((n, k) => [n, S.lens.byProv[k][i]]).filter((x) => x[1] >= 1).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, v]) => `<div class="sv">${tok(GC[n.layer], n.icon)}<span>${esc(T(n.label))}</span><b style="font-family:var(--display)">${int(v)}</b></div>`).join('');
  const inf = CITY.info[p.id];
  const f = [['building-hospital', T('Hospital beds'), fmt(Mx.beds[i])], ['heart-rate-monitor', T('Intensive care beds'), fmt(p.icuBeds)], ['stethoscope', T('Specialists'), fmt(p.specialists)], ['shield-plus', T('Facilities authorised for health tourism'), p.authFacilities ? fmt(p.authFacilities) : T('none listed')],
    ['building', T('Licensed hotel beds'), fmt(p.hotelBeds)], ['plane-departure', T('International passengers, Jan to May 2026'), p.intlPax ? fmt(p.intlPax) : T('none')]];
  return `<p class="lead">${lead}</p>${unitNote(i, 'note')}`
    + fbar(T('Closeness to {o}', { o: esc(oName) }), close, ri ? T('{n} h', { n: hTxt }) : '', routeTxt, '#1a5fcf')
    + fbar(T('Emergency care places'), capHere / mxCap, fmt(capHere), T('Largest city has {n}', { n: fmt(mxCap) }), '#0f8a5a')
    + fbar(T('Known to dispatchers'), vis, pct(vis), Mx.visOverride[i] ? T('You marked this city') : Mx.unit[i] ? T('Rises with the health tourism already here') : T('No unit here'), '#d39200')
    + `<h3>${T('Care places today')}</h3><div class="lines6">${lines}</div>`
    + (needs ? `<h3>${T('Patients treated here, by need')}</h3>${needs}` : '')
    + (from ? `<h3>${T('Patients came from')}</h3>${from}` : '')
    + `<h3>${T('The city')}</h3><div class="facts">${f.map(([ic2, l, v]) => `<div>${ic(ic2)}<span><b>${v}</b>${l}</span></div>`).join('')}</div>`;
}
function mini(vals, years, color) {
  const pts = vals.map((v, i) => [years[i], v]).filter((x) => x[1] !== null && x[1] !== undefined && !isNaN(x[1])); if (pts.length < 2) return '';
  const W = 96, H = 30, y0 = years[0], y1 = years[years.length - 1], lo = Math.min(...pts.map((x) => x[1])), hi = Math.max(...pts.map((x) => x[1])), sp = hi - lo || 1;
  const X = (y) => 3 + ((y - y0) / (y1 - y0)) * (W - 7), Y = (v) => H - 4 - ((v - lo) / sp) * (H - 9);
  const line = pts.map((x, k) => (k ? 'L' : 'M') + X(x[0]).toFixed(1) + ' ' + Y(x[1]).toFixed(1)).join(''), e = pts[pts.length - 1];
  return `<svg class="mini" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${line}L${X(e[0]).toFixed(1)} ${H - 1}L${X(pts[0][0]).toFixed(1)} ${H - 1}Z" fill="${color}" opacity=".14"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(e[0]).toFixed(1)}" cy="${Y(e[1]).toFixed(1)}" r="3" fill="${color}"/></svg>`;
}
const EV_ICON = (e) => (/earthquake/i.test(e) ? 'wave-saw-tool' : /covid/i.test(e) ? 'virus' : 'flag');
function pastHTML(i) {
  const p = M0.prov[i], H = CITY.hist[p.id], Y = CITY.years, rec = CITY.precedents[p.id] || [], info = CITY.info[p.id];
  const R = [['Hospital beds', 'beds', fmt], ['Qualified beds', 'qualified', fmt], ['Intensive care beds', 'icu', fmt], ['Bed occupancy, %', 'occ', (v) => dec(v, 1)], ['Specialist physicians', 'spec', fmt], ['Nurses', 'nurse', fmt], ['Surgeries a year', 'surg', fmt], ['Inpatients a year', 'inp', fmt]];
  const rows = R.map(([l, k, f], n) => {
    const v = H[k], pts = v.map((x, j) => [Y[j], x]).filter((x) => x[1] !== null); if (pts.length < 2) return '';
    const a = pts[0], b = pts[pts.length - 1], ch = k === 'occ' ? T('{v} points', { v: (b[1] - a[1] > 0 ? '+' : '') + dec(b[1] - a[1], 1) }) : a[1] ? (b[1] >= a[1] ? '+' : '') + pctv(Math.round((b[1] / a[1] - 1) * 100)) : '';
    return `<div class="trend"><div>${T(l)}<small>${a[0]}: ${f(a[1])}, ${b[0]}: ${f(b[1])} (${ch})</small></div>${mini(v, Y, ['#1a5fcf', '#1a5fcf', '#c7301e', '#d39200', '#0f8a5a', '#0f8a5a', '#b52aa8', '#b52aa8'][n])}</div>`;
  }).join('');
  const recs = rec.slice(0, 8).map((x) => { const s = CITY.sources[x.s]; return `<div class="rec">${ic(EV_ICON(x.e))}<div><b>${esc(x.y)}, ${esc(T(x.e))}.</b> ${esc(T(x.r))}${x.v !== null ? ` <b>${int(x.v)}</b> ${esc(T(x.u))}.` : ''} ${s ? `<a href="${esc(s.u)}" rel="noopener">${T('Source')}</a>` : ''}</div></div>`; }).join('');
  const lines = [];
  if (info.coast) lines.push(['beach', T('{c} coast', { c: T(info.coast) })]);
  if (info.unesco.length) lines.push(['building-monument', `UNESCO: ${info.unesco.map((x) => T(x)).join(', ')}`]);
  if (info.centres) lines.push(['bath', T(info.centres === 1 ? '{n} thermal tourism centre on the Ministry list (2021)' : '{n} thermal tourism centres on the Ministry list (2021)', { n: info.centres })]);
  if (p.thermalBeds) lines.push(['bed', T('{n} thermal beds in press reports', { n: fmt(p.thermalBeds) })]);
  if (info.fac) lines.push(['stethoscope', T(info.fac === 1 ? '{n} medical faculty (2022)' : '{n} medical faculties (2022)', { n: info.fac })]);
  if (info.heart) lines.push(['heartbeat', T(info.heart === 1 ? '{n} heart surgery centre (2009)' : '{n} heart surgery centres (2009)', { n: info.heart })]);
  (info.ftr || []).forEach((h) => lines.push(['wheelchair', T(h)]));
  if (info.visitors) lines.push(['plane-departure', T('{n} foreign visitors entered here in 2025', { n: fmt(info.visitors) })]);
  if (info.nightsF) lines.push(['building', T('{n} foreign guest nights in 2019', { n: fmt(info.nightsF) })]);
  if (info.jan !== null && info.jan !== undefined) lines.push(['sun', T('January average {n} °C', { n: dec(info.jan, 1) })]);
  return (rows ? `<h3>${T('Health system, 2015 to 2024')}</h3><div>${rows}</div>` : '')
    + `<h3>${T('Specialised care, lodging and climate')}</h3>` + (lines.length ? `<div class="facts" style="grid-template-columns:1fr">${lines.map(([q, t]) => `<div>${ic(q)}<span>${esc(t)}</span></div>`).join('')}</div>` : `<p class="note">${T('Nothing further was found for this city.')}</p>`)
    + `<h3>${T('Record in past disasters and epidemics')}</h3>` + (recs || `<p class="note">${T('No role found in the sources searched.')}</p>`)
    + (rec.length > 8 ? `<p class="note">${T('And {n} more.', { n: rec.length - 8 })}</p>` : '') + `<p class="note">${T('This record helps you judge the model. The model does not use it to send patients.')}</p>`;
}
function starsHTML(pid, k, name) { const lv = lvl(pid, k); return `<span class="stars" role="group" aria-label="${esc(name)}">` + [1, 2, 3].map((n) => `<button class="st${lv >= n ? ' on' : ''}" data-mark="${pid}|${k}|${n}" aria-label="${T(STARS[n])}" title="${T(STARS[n])}">${ic('star')}</button>`).join('') + '</span>'; }
function planHTML(i) {
  const p = M0.prov[i], info = CITY.info[p.id];
  const rows = SVC.map((s) => [s, S.scores[s.key].score[i]]).sort((a, b) => b[1] - a[1]).map(([s, v]) => `<div class="sv">${tok(GC[s.layer], s.icon)}<span>${esc(T(s.label))}</span>${starsHTML(p.id, s.key, T(s.label) + ', ' + p.name)}<div class="tr"><i style="width:${v * 100}%;background:${GC[s.layer]}"></i></div></div>`).join('');
  const status = S.plan.off[p.id] ? 'off' : S.plan.damage[p.id] ? 'damaged' : 'ok';
  const sig = [...info.signals.map((x) => `${esc(T(x.t))} (${esc(T(x.s))})`), ...info.mentions.map((x) => esc(T(x.t)))];
  return `<p>${T('Bars show how ready this city is for each need, relative to the best city. Add stars if you expect it to build this care. Stars take time to become care places, so their effect grows with the year chosen.')}</p>${S.Mx.unit[i] ? '' : `<p class="note">${T('Rating this city also opens a health tourism unit here.')}</p>`}<div>${rows}</div>`
    + (sig.length ? `<h3>${T('Signals found in published reports')}</h3><div class="facts" style="grid-template-columns:1fr">${sig.map((t) => `<div>${ic('flag')}<span>${t}</span></div>`).join('')}</div>` : '')
    + `<h3>${T('In this run')}</h3><div class="field"><label for="st-${p.id}">${T('City status')}</label><select id="st-${p.id}" data-status="${p.id}"><option value="ok"${status === 'ok' ? ' selected' : ''}>${T('Working normally')}</option><option value="damaged"${status === 'damaged' ? ' selected' : ''}>${T('Damaged, 40% lost at first')}</option><option value="off"${status === 'off' ? ' selected' : ''}>${T('Out of service')}</option></select></div>`
    + `<h3>${T('Capacity of this city')}</h3>${stockHTML(i, 'cs-')}<div class="places"></div>`;
}
function renderCity() {
  const i = S.sel, box = $('city'); if (i === null || !S.ran) { box.hidden = true; return; }
  if (box.contains(document.activeElement) && document.activeElement.dataset.stock) { renderPlaces(); return; }
  box.hidden = false; const p = M0.prov[i], prev = box.querySelector('.cbody'), sc = prev ? prev.scrollTop : 0;
  const body = S.cityTab === 'why' ? whyHTML(i) : S.cityTab === 'past' ? pastHTML(i) : planHTML(i);
  const best = SVC.map((s) => [s, S.scores[s.key].score[i]]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  box.innerHTML = `<header><h2>${esc(p.name)}</h2><button class="x" data-close aria-label="${T('Close city panel')}">${ic('x')}</button><div class="sub">${esc(T(p.region))}. ${T('Most ready for: {x}', { x: best.map(([s]) => esc(T(s.short))).join(', ') })}</div></header>`
    + `<div class="ctabs" role="tablist">${[['why', 'Why here'], ['past', 'Past years'], ['plan', 'Forecast']].map(([k, l]) => `<button role="tab" aria-selected="${S.cityTab === k}" data-ctab="${k}">${T(l)}</button>`).join('')}</div><div class="cbody">${body}</div>`;
  box.querySelector('.cbody').scrollTop = sc; renderPlaces();
}

/* ---- Forecast tab ---- */
function setMark(pid, k, n) {
  const m = S.plan.marks; const cur = lvl(pid, k);
  if (cur === n) { delete m[pid][k]; if (!Object.keys(m[pid]).length) delete m[pid]; } else { if (!m[pid]) m[pid] = {}; m[pid][k] = n; if (!S.Mx.unit[BY_ID[pid]]) S.plan.units[pid] = true; }
  run(true);
}
function syncHz() { document.querySelectorAll('#hz button').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.year === S.plan.year)); }
function renderRank() {
  const host = $('rank'), title = $('rankTitle');
  if (S.service) {
    const s = SVK[S.service], sc = S.scores[s.key].score, o = order(sc).slice(0, 12);
    title.textContent = T('Most ready cities: {x}', { x: svcLabel(s) });
    host.innerHTML = '<div class="rank">' + o.map((i, k) => { const p = M0.prov[i]; return `<div class="rk"><span class="n">${k + 1}</span><button class="nm" data-city="${i}">${esc(p.name)}${S.Mx.unit[i] ? '' : `<small class="nounit">${T('needs a unit first')}</small>`}</button>${starsHTML(p.id, s.key, T(s.label) + ', ' + p.name)}<span></span><div class="tr"><i style="width:${sc[i] * 100}%;background:${GC[s.layer]}"></i></div></div>`; }).join('') + '</div>';
  } else {
    title.textContent = T('Most ready cities for each need, tap one to rate cities');
    const sm = Math.max(...M0.htShare), best = Array.from({ length: nP }, (_, i) => Math.max(...SVC.map((s) => S.scores[s.key].score[i])));
    const gap = order(best.map((b, i) => b - Math.sqrt(M0.htShare[i] / sm))).slice(0, 8);
    const gapHTML = `<div class="card"><h3>${T('Most ready compared with health tourism today')}</h3><div class="chips">${gap.map((i) => { const b = SVC.slice().sort((x, y) => S.scores[y.key].score[i] - S.scores[x.key].score[i])[0]; return `<button class="chip" data-city="${i}">${ic(b.icon)}${esc(M0.prov[i].name)}</button>`; }).join('')}</div></div>`;
    host.innerHTML = gapHTML + SVC.map((s) => { const o = order(S.scores[s.key].score).slice(0, 3).map((i) => M0.prov[i].name).join(', '); return `<button class="ov" data-svc="${s.key}">${tok(GC[s.layer], s.icon)}<b>${esc(T(s.label))}</b><small>${esc(o)}</small></button>`; }).join('');
  }
}
function renderPlanEff() {
  const host = $('planEff');
  if (planEmpty()) { host.innerHTML = `<p class="note">${T('No city has been changed. Results use the data and the development path you chose.')}</p>`; return; }
  const gain = S.res.admittedForeign - S.noPlan.admittedForeign, nm = Object.values(S.plan.marks).reduce((a, m) => a + Object.keys(m).length, 0), Y = S.plan.year;
  const ex = LN.map((l, c) => { let v = 0; for (let p = 0; p < nP; p++) v += S.Mx.extra[c][p]; return `<div>${tok(LINE[l].c, LINE[l].i, LINE[l].o)}<span><b>${v > 0 ? '+' : ''}${fmt(v)}</b>${T(LINE[l].s)}</span></div>`; }).join('');
  const head = nm ? T(nm === 1 ? 'Your changes for {y}, {n} city rating' : 'Your changes for {y}, {n} city ratings', { y: Y, n: nm }) : T('Your changes for {y}', { y: Y });
  host.innerHTML = `<div class="card tint"><h3>${head}</h3><div class="ledger"><div class="row"><span>${T('Extra patients admitted in this crisis')}</span><div><b>${gain >= 0 ? '+' : ''}${fmt(gain)}</b></div></div><div class="row"><span>${T('Paying health tourists a year')}</span><div><b>${fmt(S.fc.N)}</b><small>${T('{n} today', { n: fmt(S.fc.N0) })}</small></div></div><div class="row"><span>${T('Health tourism income a year')}</span><div><b>${usd(S.fc.revenue)}</b><small>${T('{n} today', { n: usd(S.fc.revenueToday) })}</small></div></div></div><h3>${T('Care places your stars add')}</h3><div class="lines6">${ex}</div></div>`;
}
function autoMark() { S.plan.marks = HTSim.topPicks(M0, S.scores); for (const id in S.plan.marks) if (!S.Mx.unit[BY_ID[id]]) S.plan.units[id] = true; run(true); }
function buildCities() {
  $('hz').innerHTML = [2027, 2032, 2037, 2047].map((y) => `<button data-year="${y}">${y}</button>`).join('');
  const cs = $('citySel'), keep = cs.value; cs.innerHTML = `<option value="">${T('Choose')}</option>` + M0.prov.map((p, i) => [p, i]).sort((a, b) => a[0].name.localeCompare(b[0].name, 'tr')).map(([p, i]) => `<option value="${i}">${esc(p.name)}</option>`).join(''); cs.value = keep;
  cs.onchange = () => { if (cs.value !== '') select(+cs.value); };
  $('autoMark').onclick = autoMark; $('clearMarks').onclick = () => { S.plan.marks = {}; run(true); };
  const W = [['health', 'Health capacity'], ['tourism', 'Lodging and recovery'], ['access', 'Access and transport'], ['presence', 'Health tourism already here']];
  const sl = (id, lab, min, max, step, val, f, hint) => `<div class="lever"><label for="${id}">${T(lab)}</label><output id="o-${id}">${f(val)}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}">${hint ? `<p>${T(hint)}</p>` : ''}</div>`;
  const x1 = (v) => dec(v, 1) + ' x', p0 = (v) => pctv(v * 100), p1 = (v) => pctv(v * 100, 1);
  $('scoreCtl').innerHTML = W.map(([k, l]) => sl('gw-' + k, l, 0, 3, 0.1, S.plan.groupWeights[k], x1)).join('')
    + sl('realism', 'How much a city\'s starting point limits your stars', 0, 1, 0.05, S.plan.realism, p0, 'At 0%, stars on a small city count as much as stars on İstanbul.')
    + sl('htg', 'Growth of paying patients a year', 0, 0.2, 0.01, S.plan.htGrowth, p0) + sl('hog', 'Growth of hotel beds a year', 0, 0.08, 0.005, S.plan.hotelGrowth, p1)
    + sl('mdem', 'Pull of a top rating on paying patients', 0, 5, 0.1, S.plan.markDemand, x1);
  W.forEach(([k]) => { $('gw-' + k).oninput = (e) => { S.plan.groupWeights[k] = +e.target.value; $('o-gw-' + k).textContent = x1(e.target.value); run(); }; });
  [['realism', 'realism', p0], ['htg', 'htGrowth', p0], ['hog', 'hotelGrowth', p1], ['mdem', 'markDemand', x1]].forEach(([id, key, f]) => { $(id).oninput = (e) => { S.plan[key] = +e.target.value; $('o-' + id).textContent = f(e.target.value); run(); }; });
  buildConv();
}
function buildConv() {
  const head = LN.map((l) => `<th title="${T(LINE[l].n)}">${T(LINE[l].s)}</th>`).join('');
  const rows = SVC.map((s) => `<tr><td>${esc(T(s.label))}</td>${LN.map((l) => `<td><input type="number" min="0" max="2" step="0.05" value="${(M0.meta.conversion[s.key] || {})[l] || 0}" data-conv="${s.key}|${l}" aria-label="${esc(T(s.label))}, ${T(LINE[l].n)}"></td>`).join('')}</tr>`).join('');
  $('convTbl').innerHTML = `<p class="note">${T('A rating turns into emergency care places through this table. Each number is the share of one reference centre that can serve that kind of care. These are assumptions you can change.')}</p><div class="scroll"><table><thead><tr><th>${T('Need')}</th>${head}</tr></thead><tbody>${rows}<tr><td><b>${T('Places added by one full centre')}</b></td>${LN.map((l) => `<td><input type="number" min="0" step="10" value="${M0.meta.refAdd[l]}" data-ref="${l}" aria-label="${T(LINE[l].n)}"></td>`).join('')}</tr></tbody></table></div>`;
}

/* ---- Needs tab ---- */
function crisisSize() {
  const b = curScn(1), sev = S.P.severityMult || 1; let inj = 0, chronic = 0;
  b.events.forEach((e) => {
    const w = Object.entries(e.origins).reduce((a, [k, v]) => a + (k === 'TUR' ? 0 : v), 0);
    if (e.type === 'disaster') inj += e.injured * w * sev;
    if (e.type === 'conflict') { inj += e.injuredPerDay * Math.min(e.duration || 365, 365) * w * sev; chronic += ((e.dialysisPatients || 0) + (e.cancerPatients || 0)) * w; }
    if (e.type === 'epidemic') { inj += e.critical * w * sev; chronic += (e.dialysisPatients || 0) * w; }
  });
  return { inj, chronic };
}
const srcLinks = (ids) => (ids || []).map((id) => { const q = CITY.sources[id]; return q ? `<a href="${esc(q.u)}" rel="noopener" title="${esc(q.c)}">${esc(q.l || id)}</a>` : ''; }).filter(Boolean).join(', ');
const judge = (x) => (x ? ` <span class="judge">${T('Authors\' judgement: {x}', { x: esc(T(x)) })}</span>` : '');
function needCard(n, i) {
  const r = S.lens.rows[i], active = r.referred >= 0.5, cov = r.coverage, travel = n.travel || {};
  const check = n.spec ? (r.capacity === null ? '' : `<div class="fbar"><span>${esc(T(n.spec.label))}</span><b>${cov === null ? T('{n} free', { n: fmt(r.capacity) }) : T(cov >= 1.25 ? 'Enough' : cov >= 1 ? 'Tight' : 'Short')}</b>${active && cov !== null ? `<div class="tr"><i style="width:${Math.min(100, cov * 50)}%;background:${cov >= 1.25 ? '#0f8a5a' : cov >= 1 ? '#d39200' : '#c7301e'}"></i></div><small>${T('{n} free places against a peak of {m} patients', { n: fmt(r.capacity), m: fmt(r.peak) })}</small>` : ''}</div>`) : '';
  return `<details class="need"${S.service === n.key ? ' open' : ''}><summary>${tok(GC[n.layer], n.icon)}<span class="nt"><b>${esc(T(n.label))}</b><small>${active ? T('{a} of {b} admitted', { a: fmt(r.admitted), b: fmt(r.referred) }) : T('Not part of this crisis')}</small></span><span class="pill t-${travel.kind}">${T(KIND_TRAVEL[travel.kind] || '')}</span></summary><div class="nb">`
    + (n.why ? `<p>${esc(T(n.why))}</p>` : '')
    + (n.evidence || []).map((x) => `<p class="ev">${esc(T(x.t))} <span class="srcs">${srcLinks(x.s)}</span></p>`).join('')
    + (travel.when || travel.judge ? `<p><b>${T('Moving abroad.')}</b> ${travel.when ? `${esc(T(travel.when))} <span class="srcs">${srcLinks(travel.s || [])}</span>` : ''}${judge(travel.judge)}</p>` : '')
    + (n.care ? `<p><b>${T('Care needed.')}</b> ${esc(T(n.care))}</p>` : '')
    + (n.bridge ? `<p><b>${T('Health tourism capacity that can help.')}</b> ${esc(T(n.bridge))}</p>` : '')
    + check
    + `<button class="btn" data-need="${n.key}">${ic('map-pin')}${T('Show on the map')}</button></div></details>`;
}
function renderNeeds() {
  const host = $('t-needs'), r = S.res, full = S.full, c = crisisSize(), cols = [], onlyEpi = S.crises.every((x) => !x.type || x.type === 'epidemic');
  cols.push([T(c.chronic ? 'People injured or cut off from treatment' : onlyEpi ? 'People critically ill' : 'People injured'), c.inj + c.chronic, '#8c1e11']);
  cols.push([T('Need care they cannot get at home'), full.arrivalsForeign, '#c7301e']);
  cols.push([T('Could be treated in Türkiye'), full.admittedForeign, '#1a5fcf']);
  if (S.destShare < 1) cols.push([T('Treated if {p} choose Türkiye', { p: pctv(S.destShare * 100) }), r.admittedForeign, '#0f8a5a']);
  const mx = Math.max(1, cols[0][1]);
  const funnel = cols.map(([l, v, col]) => `<div class="barow"><span>${l}</span><b>${fmt(v)}</b><div class="tr"><i style="width:${Math.max(0.5, (100 * v) / mx)}%;background:${col}"></i></div></div>`).join('');
  const groups = Object.entries(LAYERNAME).map(([k, name]) => {
    const list = SVC.map((n, i) => [n, i]).filter(([n]) => n.layer === k).sort((a, b) => S.lens.rows[b[1]].referred - S.lens.rows[a[1]].referred);
    return `<h3 class="lh"><span class="dot" style="background:${GC[k]}"></span>${esc(T(name))}</h3>${list.map(([n, i]) => needCard(n, i)).join('')}`;
  }).join('');
  const stays = STAYS.map((x) => `<div class="rec">${ic(x.icon)}<div><b>${esc(T(x.label))}.</b> ${esc(T(x.why))} <span class="srcs">${srcLinks(x.s)}</span>${judge(x.judge)}</div></div>`).join('');
  host.innerHTML = `<p class="note">${T('Everything starts from what a crisis does to people. Each need below is set out from published evidence, with its source. Where no source was found, the text says it is the authors\' judgement. Open one to see why it matters and whether it can move abroad.')}</p>`
    + `<div class="card"><h2>${ic('users-group')}${T('From the crisis to care in Türkiye')}</h2><div class="bars">${funnel}</div></div>`
    + groups
    + `<h3 class="lh"><span class="dot" style="background:#5b6472"></span>${T('Needs that stay at home')}</h3><div class="card">${stays}</div>`
    + `<p class="note">${esc(T(DATA.model.notUsed || ''))}</p>`
    + `<details class="fold"><summary>${T('How the shares of each care line were set')}</summary>${(DATA.model.shareBasis || []).map((b) => `<p class="note"><b>${esc(T(b.crisis))}, ${esc(T(b.line))}.</b> ${b.data ? `${esc(T(b.data))} <span class="srcs">${srcLinks(b.s)}</span> ` : ''}<span class="judge">${esc(T(b.assumed))}</span></p>`).join('')}</details>`
    + `<button class="btn big" data-go="cities"><span>${T('Next: which cities can do this')}</span>${ic('arrow-right')}</button>`;
}

/* ---- Impact tab ---- */
const row = (l, v, s) => `<div class="row"><span>${l}</span><div><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div></div>`;
const iv = (q, f) => (q ? T('Likely range {a} to {b}', { a: f(q.p5), b: f(q.p95) }) : '');
function barow(l, v, mx, txt, color, sub) { return `<div class="barow"><span>${l}</span><b>${txt}</b><div class="tr"><i style="width:${mx > 0 ? (100 * v) / mx : 0}%;background:${color}"></i></div>${sub ? `<small>${sub}</small>` : ''}</div>`; }
function renderImpact() {
  const r = S.res, m = S.mc || {}, host = $('t-impact');
  const rows = (LN.map((l, c) => [l, c])).map(([l, c]) => barow(`${tok(LINE[l].c, LINE[l].i, LINE[l].o)} ${T(LINE[l].n)}`, r.servedLine[c], Math.max(1, ...r.servedLine), fmt(r.servedLine[c]), LINE[l].c, r.servedLine[c] > r.arrLine[c] ? T('{n} referred directly, the rest came from other care in Türkiye', { n: fmt(r.arrLine[c]) }) : T('{n} referred directly', { n: fmt(r.arrLine[c]) }))).join('');
  const by = {}; M0.prov.forEach((p, i) => { by[p.region] = (by[p.region] || 0) + r.servedProv[i]; }); const reg = Object.entries(by).sort((a, b) => b[1] - a[1]), rm = Math.max(1, ...reg.map((x) => x[1]));
  const oc = M0.origins.map((o, i) => [o, i]).filter(([o, i]) => r.arrOrigin[i] > 0).sort((a, b) => r.servedOrigin[b[1]] - r.servedOrigin[a[1]]); const om = Math.max(1, ...oc.map(([o, i]) => r.arrOrigin[i]));
  const top = order(r.servedProv).slice(0, 10), tm = Math.max(1, r.servedProv[top[0]]);
  host.innerHTML = potentialCard() + `<div class="grid2"><div class="card ledger"><h2>${ic('users-group')}${T('For patients abroad')}</h2>`
    + row(T('Referred for care'), fmt(r.arrivalsForeign), iv(m.arrivalsForeign, fmt)) + row(T('Admitted in Türkiye'), fmt(r.admittedForeign), iv(m.admittedForeign, fmt)) + row(T('Share admitted'), pct(r.coverage || 0), iv(m.coverage, pct))
    + row(T('Average wait'), T('{n} days', { n: dec(r.meanWaitDays || 0, 0) }), iv(m.meanWaitDays, (v) => dec(v, 0))) + row(T('Lost while waiting'), fmt(r.lost), iv(m.lost, fmt)) + row(T('Deaths during care'), fmt(r.inCareDeaths)) + row(T('Still waiting at day 365'), fmt(r.waitingEnd), iv(m.waitingEnd, fmt))
    + `</div><div class="card ledger"><h2>${ic('building-hospital')}${T('For Türkiye')}</h2>` + row(T('Care days delivered'), fmt(r.bedDaysLine.reduce((a, b) => a + b, 0)))
    + row(T('Provinces above safe occupancy'), T('{n} of {m}', { n: r.provincesOverSafe, m: unitCount(S.Mx) }), iv(m.provincesOverSafe, (v) => dec(v, 0))) + row(T('Highest occupancy'), T('{p} in {c}', { p: pct(r.peakOcc), c: esc(r.peakOccProv) }))
    + row(T('Paying patient income lost'), usd(r.revLost), iv(m.revLost, usd)) + row(T('Care and transfer cost'), usd(r.costUsd + r.transportCost), iv(m.costUsd, usd)) + row(T('Net cost after outside funding'), usd(r.net), iv(m.net, usd)) + `</div></div>`
    + `<div class="card"><h2>${ic('activity')}${T('Patients treated by type of care')}</h2><div class="bars">${rows}</div></div>`
    + `<div class="card"><h2>${ic('target-arrow')}${T('What holds the response back')}</h2><p class="note">${T('Extra patients admitted if one limit were removed.')}</p><div class="bars" id="limits">${S.lim ? limitBars() : `<p class="note">${T('Calculating.')}</p>`}</div></div>`
    + `<div class="grid2"><div class="card"><h2>${ic('world')}${T('Countries helped')}</h2><div class="bars">${oc.map(([o, i]) => barow(esc(cname(o)), r.servedOrigin[i], om, T('{a} of {b}', { a: fmt(r.servedOrigin[i]), b: fmt(r.arrOrigin[i]) }), '#1a5fcf')).join('')}</div></div>`
    + `<div class="card"><h2>${ic('map-pin')}${T('Cities that received most')}</h2><div class="bars">${top.filter((i) => r.servedProv[i] >= 1).map((i) => barow(`<button class="nm" style="background:none;border:0;padding:0;font-weight:700" data-city="${i}">${esc(M0.prov[i].name)}</button>`, r.servedProv[i], tm, fmt(r.servedProv[i]), '#0f8a5a')).join('')}</div></div></div>`
    + `<div class="card"><h2>${ic('map-pin')}${T('By region')}</h2><div class="bars">${reg.map(([k, v]) => barow(esc(T(k)), v, rm, fmt(v), '#0f93a8')).join('')}</div></div>`
    + `<button class="btn big" data-step="1">${ic('arrow-back-up')}<span>${T('Try another country or crisis')}</span></button>`;
}
function potentialCard() {
  const r = S.res, f = S.full, P = S.P, total = r.costUsd * (r.admitted > 0 ? r.admittedForeign / r.admitted : 1) + r.transportCost, intl = P.funding, origin = P.payOrigin, fam = P.payFamily, host = Math.max(0, 1 - intl - origin - fam);
  const comp = r.admittedForeign * P.companionsPerPatient, nights = (r.bedDaysLine.reduce((a, b) => a + b, 0) * P.companionsPerPatient) * (r.arrivalsForeign ? r.admittedForeign / Math.max(r.admitted, 1) : 1);
  const pShare = pctv(S.destShare * 100);
  const tiles = [[T('Could be treated'), fmt(f.admittedForeign), T('of {n} referred, if all came to Türkiye', { n: fmt(f.arrivalsForeign) })],
    [S.destShare < 1 ? T('If {p} choose Türkiye', { p: pShare }) : T('Share choosing Türkiye'), S.destShare < 1 ? fmt(r.admittedForeign) : pctv(100), S.destShare < 1 ? T('patients treated') : T('you can change it in step 3')],
    [T('Value of care'), usd(total), T('care and transfer, at cost')]];
  const pay = [[T('International programmes'), intl, '#1a5fcf'], [T('Patients\' own governments'), origin, '#0f93a8'], [T('Patients and families'), fam, '#d39200'], [T('Türkiye'), host, '#c7301e']];
  return `<div class="card tint"><h2>${ic('target-arrow')}${T('Potential for Türkiye')}</h2><div class="pot3">${tiles.map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><small>${c}</small></div>`).join('')}</div>`
    + `<h3>${T('Who pays for {n} of care and transfer', { n: usd(total) })}</h3><div class="bars">${pay.map(([l, v, col]) => barow(l, v, 1, `${pctv(v * 100)}, ${usd(total * v)}`, col)).join('')}</div>`
    + `<p class="note">${T('These payer shares are assumptions. If {p} of bills sent to governments and families are never paid, {n} is lost.', { p: pctv(P.unpaidShare * 100), n: usd(total * (origin + fam) * P.unpaidShare) })}</p>`
    + `<h3>${T('Companions')}</h3><p class="note">${T('About {a} companions would come with these patients, for {b} nights of lodging worth {c}.', { a: fmt(comp), b: fmt(nights), c: usd(nights * P.companionNightUsd) })}</p>`
    + (S.routine.patients > 0.5 ? `<h3>${T('Routine care in a long crisis')}</h3><p class="note">${T('Ordinary treatment that patients could no longer get at home could bring about {a} more paying patients, worth {b}. This is the part that is health tourism in the usual sense. The figure rests on an assumed baseline.', { a: fmt(S.routine.patients), b: usd(S.routine.revenue) })}</p>` : '')
    + `</div>`;
}
/* Findings that need extra runs are worked out one run at a time, so that the page stays responsive. */
function startFindings(scn) {
  const job = ++findJob, res = S.res, P = S.P, Mx = S.Mx, items = LIMITS;
  const lim = [], minGain = Math.max(5, 0.01 * res.arrivalsForeign);
  let i = 0, phase = 0, need = null, h = 0, base = 0, pool = [], gains = [];
  const finish = (cand) => { S.cand = cand; renderFindings(); clearTimeout(mcT); startOutlook(scn, job, () => { mcT = setTimeout(() => { if (job !== findJob || !S.ran) return; const fix = Object.assign({}, S.levers); if (S.plan.path !== 'current') for (const k in HTSim.RESPONSE_TARGET) fix[k] = P[k]; S.mc = HTSim.monteCarlo(Mx, scn, 24, fix, { seed: 7 }); if (S.tab === 'impact') renderImpact(); }, 60); }); };
  const tick = () => {
    if (job !== findJob || !S.ran) return;
    if (phase === 0) {
      const [k, l] = items[i++], x = HTSim.simulate(Mx, P, scn, { relax: { [k]: true } }); lim.push([l, Math.max(0, x.admittedForeign - res.admittedForeign), k]);
      if (i === items.length) {
        S.lim = lim; const e = $('limits'); if (e) e.innerHTML = limitBars(); renderFindings(); phase = 1;
        const best = S.lens.rows.map((r, q) => [q, r.referred - r.admitted]).sort((a, b) => b[1] - a[1])[0];
        if (res.arrivalsForeign < 1 || best[1] < minGain) { finish({ none: true }); return; }
        need = SVC[best[0]]; h = Math.max(S.plan.year, YEAR_MIN + 5);
        pool = order(S.scores[need.key].score).filter((p) => lvl(M0.prov[p].id, need.key) < 3).slice(0, 6);
        { const st = stateFor(h, S.plan.path, true); base = HTSim.simulate(st.M, st.P, scn, {}).admittedForeign; }
      }
    } else {
      const p = pool[gains.length], st = stateFor(h, S.plan.path, true, [M0.prov[p].id, need.key]);
      gains.push([p, HTSim.simulate(st.M, st.P, scn, {}).admittedForeign - base]);
      if (gains.length === pool.length) {
        gains.sort((a, b) => b[1] - a[1]);
        finish(!gains.length || gains[0][1] < minGain ? { none: true } : { need, h, list: gains.slice(0, 3) });
        return;
      }
    }
    setTimeout(tick, 0);
  };
  setTimeout(tick, 150);
}
function renderFindings() {
  const r = S.res, box = $('fgrid'); if (!S.ran || !S.lens) return;
  if (r.arrivalsForeign < 1) { box.innerHTML = `<div class="find"><small>${T('No patients are referred in this scenario.')}</small></div>`; return; }
  const c = r.coverage, w = r.meanWaitDays, cls = c >= 0.85 && w <= 45 ? 'good' : c >= 0.5 ? 'mid' : 'low', low = (s) => s.toLocaleLowerCase(nloc());
  const verdict = { good: ['check', 'Strong response'], mid: ['alert-triangle', 'Partial response'], low: ['x', 'Limited response'] }[cls];
  const occ = r.provincesOverSafe ? T('{n} provinces go above safe occupancy.', { n: r.provincesOverSafe }) : T('No province goes above safe occupancy.');
  const wait = `<small>${T('Calculating.')}</small>`;
  const card1 = `<div class="find ${cls}"><h3>${T('Can Türkiye respond well?')}</h3><div class="big">${ic(verdict[0])}${T(verdict[1])}</div><small>${T('{p} of referred patients are admitted, after an average wait of {w} days.', { p: pct(c), w: dec(w, 0) })} ${occ}</small></div>`;
  const top = SVC.map((n, i) => [n, S.lens.rows[i].admitted]).filter((x) => x[1] >= 1).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const card2 = `<div class="find"><h3>${T('Where is the greatest potential?')}</h3>${top.map(([n, v]) => `<div class="fr" title="${esc(T(n.label))}">${tok(GC[n.layer], n.icon)}<span>${esc(T(n.short))}</span><b>${int(v)}</b></div>`).join('')}<small>${T('Patients admitted, by need.')}</small></div>`;
  let body3 = wait;
  if (S.lim) {
    const b = S.lim.slice().sort((x, y) => y[1] - x[1])[0], th = Math.max(5, 0.01 * r.arrivalsForeign), g = S.lens.rows.map((x, i) => [SVC[i], x.referred - x.admitted]).sort((x, y) => y[1] - x[1])[0];
    body3 = b[1] < th ? `<div class="big">${T('No major limit')}</div><small>${T('Capacity, transport and permits are enough for this scenario.')}</small>`
      : `<div class="big">${T(b[0])}</div><small>${T('Removing this limit would admit {n} more patients.', { n: int(b[1]) })}${g[1] >= th ? ' ' + T('The largest shortfall is in {x}, with {n} patients not admitted.', { x: esc(low(T(g[0].label))), n: int(g[1]) }) : ''}</small>`;
  }
  const card3 = `<div class="find"><h3>${T('What holds the response back?')}</h3>${body3}</div>`;
  const cityRow = (p, v) => `<div class="fr">${ic('map-pin', 'pin')}<button class="cityl" data-city="${p}">${esc(M0.prov[p].name)}${S.Mx.unit[p] ? '' : `<small class="nounit">${T('needs a unit first')}</small>`}</button><b>${v}</b></div>`;
  let body4 = wait;
  if (S.cand && S.cand.none) { const o = order(r.servedProv).slice(0, 3).filter((p) => r.servedProv[p] >= 1); body4 = o.map((p) => cityRow(p, int(r.servedProv[p]))).join('') + `<small>${T('New capacity would add little here. The cities that receive the most patients are shown.')}</small>`; }
  else if (S.cand) { const L3 = S.cand.list, same = L3.length > 1 && Math.abs(L3[0][1] - L3[L3.length - 1][1]) < 1; body4 = L3.map(([p, v]) => cityRow(p, '+' + int(v))).join('') + `<small>${T('Extra patients admitted in this scenario if the city builds a leading centre for {x} by {y}.', { x: esc(low(T(S.cand.need.label))), y: S.cand.h })}${same ? ' ' + T('Any one of them would be enough.') : ''}</small>`; }
  const card4 = `<div class="find"><h3>${T('Which cities should be supported?')}</h3>${body4}</div>`;
  let extra = '';
  if (S.out) {
    const last = S.out.years.length - 1, rows = PATH_KEYS.map((k) => `<div class="fr"><i class="lk" style="background:${PATHS[k].c}"></i><span>${T(PATHS[k].l)}</span><b>${pct(S.out.series[k][last].cov)}</b></div>`).join('');
    extra += `<div class="find"><h3>${T('And over 20 years?')}</h3>${rows}<small>${T('Share of referred patients admitted if this crisis came in {y}.', { y: YEAR_MAX })}</small><button class="btn" data-go="outlook">${ic('chart-line')}${T('20 years')}</button></div>`;
  } else extra += `<div class="find"><h3>${T('And over 20 years?')}</h3><small>${T('Calculating.')}</small></div>`;
  if (!planEmpty() && S.noPlan) {
    const a = S.noPlan, v = r.admittedForeign - a.admittedForeign;
    extra += `<div class="find"><h3>${T('What your changes did')}</h3><div class="fr"><span>${T('With the default values')}</span><b>${int(a.admittedForeign)}</b></div><div class="fr"><span>${T('With your changes')}</span><b>${int(r.admittedForeign)}</b></div><small>${T(Math.abs(v) < 1 ? 'No change in patients admitted. Average wait {b} days.' : '{v} patients admitted. Average wait {b} days, against {a} with the default values.', { v: (v > 0 ? '+' : '') + int(v), b: dec(r.meanWaitDays, 0), a: dec(a.meanWaitDays, 0) })}</small></div>`;
  }
  box.innerHTML = card1 + card2 + card3 + card4 + extra;
}

/* ---- City capacities ---- */
function stepOf(v) { const t = Math.max(10, v * 0.05), m = Math.pow(10, Math.floor(Math.log10(t))); return Math.round(t / m) * m; }
function unitNote(i, cls) {
  const p = M0.prov[i], open = S.Mx.opened[i], base = p.unit, P = S.P;
  let t;
  if (base && p.unitBasis === 'named') t = T('Named as holding the certificate in a published source. About {a} of its {b} hospitals are estimated to be authorised.', { a: dec(p.authHosp, p.authHosp < 10 ? 1 : 0), b: int(p.hospitals) });
  else if (base) t = T('Not named in a source. Included so that the region matches the published count of provinces with an authorised hospital. Check it against the Ministry list.');
  else if (open === -1) t = T('You opened a unit here. It starts with one authorised hospital.');
  else if (open > 0) t = T('This course opens a unit here in {y}. It starts with one hospital and needs {n} years to reach full use.', { y: open, n: P.unitRampYears });
  else if (p.specialists < P.unitMinSpecialists) t = T('No authorised hospital on record, and fewer specialists than any province that holds the certificate today.');
  else { const q = HTSim.unitQueue(M0, P).indexOf(i); t = T('No authorised hospital on record. It is number {n} in line for a new unit.', { n: q + 1 }); }
  return `<p class="${cls}">${esc(t)}</p>`;
}
function stockHTML(i, prefix) {
  const p = M0.prov[i], D = defaults().M, ch = S.plan.stock[p.id] || {}, has = D.unit[i], dis = has ? '' : ' disabled';
  const rows = STOCK.map(([k, l, q]) => {
    const def = D[k][i], v = Math.max(0, Math.round(def + (ch[k] || 0))), id = prefix + k;
    return `<div class="srow${ch[k] ? ' changed' : ''}"><label for="${id}">${ic(q)}<span>${T(l)}<small>${T('Default: {n}', { n: int(def) })}</small></span></label><div class="bump"><button type="button" data-bump="${p.id}|${k}|-1" aria-label="${T('Less')}"${dis}>${ic('minus')}</button><input id="${id}" type="number" min="0" step="1" value="${v}" data-stock="${p.id}|${k}" aria-label="${esc(T(l))}"${dis}><button type="button" data-bump="${p.id}|${k}|1" aria-label="${T('More')}"${dis}>${ic('plus')}</button></div></div>`;
  }).join('');
  const toggle = p.unit ? (S.plan.off[p.id] ? [T('Bring this unit back'), 'on'] : [T('Close this unit'), 'off']) : D.opened[i] === -1 ? [T('Remove this unit'), 'del'] : D.opened[i] > 0 ? null : [T('Open a unit here'), 'add'];
  return `${has ? '' : `<p class="note">${T('This city has no unit, so its numbers cannot be used yet.')}</p>`}<div class="stock">${rows}</div><div class="btnrow">${toggle ? `<button class="btn${toggle[1] === 'add' ? ' primary' : ''}" data-unit="${p.id}|${toggle[1]}">${ic(toggle[1] === 'add' ? 'map-pin-plus' : 'map-pin')}${toggle[0]}</button>` : ''}<button class="btn" data-reset-city="${p.id}">${ic('restore')}${T('Back to the default values')}</button></div>`;
}
function placesHTML(i) {
  const D = defaults(), now = HTSim.cityPlaces(S.Mx, S.P, i), def = HTSim.cityPlaces(D.M, D.P, i);
  return `<h3>${T('Places open to crisis patients')}</h3><div class="lines6">${LN.map((l, c) => { const dv = now[c] - def[c]; return `<div>${tok(LINE[l].c, LINE[l].i, LINE[l].o)}<span><b>${fmt(now[c])}</b>${T(LINE[l].s)}${Math.abs(dv) >= 0.5 ? `<small class="${dv > 0 ? 'up' : 'down'}">${dv > 0 ? '+' : ''}${fmt(dv)}</small>` : ''}</span></div>`; }).join('')}</div><p class="note">${T('Most beds are already in use. These are the places left for crisis patients once the response is fully under way.')}</p>`;
}
function renderPlaces() { document.querySelectorAll('.places').forEach((e) => { if (S.sel !== null) e.innerHTML = placesHTML(S.sel); }); }
function renderEditor() {
  const host = $('editor'); if (S.sel === null) { host.innerHTML = `<p class="note">${T('Tap a city on the map or choose one from the list.')}</p>`; return; }
  const i = S.sel, p = M0.prov[i], has = S.Mx.unit[i];
  host.innerHTML = `<div class="card"><h2>${ic('map-pin')}${esc(p.name)} <span class="pill ${has ? 'k-data' : 'k-assumption'}">${T(has ? 'Has a unit' : 'No unit')}</span></h2>${unitNote(i, 'note')}${stockHTML(i, 'ed-')}<div class="places"></div></div>`;
  renderPlaces();
}
function renderChanges() {
  const ids = Array.from(new Set([...Object.keys(S.plan.stock), ...Object.keys(S.plan.units), ...Object.keys(S.plan.off)])), host = $('changes');
  if (!ids.length) { host.innerHTML = `<p class="note">${T('No city has been changed, so the default values will be used.')}</p>`; return; }
  const row = (id) => {
    const i = BY_ID[id], parts = [];
    if (S.plan.units[id]) parts.push(T('new unit')); if (S.plan.off[id]) parts.push(T('closed'));
    STOCK.forEach(([k, , , sh]) => { const d = (S.plan.stock[id] || {})[k]; if (d) parts.push(`${d > 0 ? '+' : ''}${int(d)} ${T(sh)}`); });
    return `<div class="chg"><button class="cityl" data-city="${i}">${esc(M0.prov[i].name)}</button><span>${esc(parts.join(', '))}</span><button class="icon-btn" data-reset-city="${id}" aria-label="${T('Back to the default values')}">${ic('x')}</button></div>`;
  };
  host.innerHTML = `<div class="card tint"><h3>${T(ids.length === 1 ? 'Your changes in {n} city' : 'Your changes in {n} cities', { n: ids.length })}</h3>${ids.map(row).join('')}<button class="btn" data-clear-all>${ic('trash')}${T('Clear all changes')}</button></div>`;
}
function renderStep4() {
  const cs = $('editSel'), M = S.Mx;
  $('w4Note').textContent = T('In {y}, {n} of the 81 cities can receive patients from abroad. Striped cities have no authorised hospital on record and receive nobody until a unit opens. Change a city to test your own assumptions, or leave them all as they are. The default values are the latest data in the model, carried forward to the chosen year.', { y: S.plan.year, n: unitCount(M) });
  cs.innerHTML = `<option value="">${T('Choose')}</option>` + M0.prov.map((p, i) => [p, i]).sort((a, b) => a[0].name.localeCompare(b[0].name, 'tr')).map(([p, i]) => `<option value="${i}">${esc(p.name)}${M.unit[i] ? '' : ' (' + T('no unit') + ')'}</option>`).join('');
  cs.value = S.sel === null ? '' : S.sel;
  renderEditor(); renderChanges();
}
function afterCityChange() { const st = stateFor(S.plan.year, S.plan.path, true); S.Mx = st.M; S.P = st.P; renderPlaces(); if (S.step === 4) renderChanges(); run(); }
function setStock(pid, key, val) {
  const i = BY_ID[pid], def = Math.round(defaults().M[key][i]), d = Math.max(-def, Math.round(val) - def), st = S.plan.stock;
  if (!st[pid]) st[pid] = {};
  if (d) st[pid][key] = d; else delete st[pid][key];
  if (!Object.keys(st[pid]).length) delete st[pid];
  afterCityChange();
}
function refreshCity() { if (S.step === 4) { renderStep4(); run(true); } else run(true); }

/* ---- Twenty years ---- */
function partState(year, path, part) {
  const cap = path === 'ambitious' ? 'Ambitious' : 'Planned', Q = params(), zero = (names) => names.forEach((n) => { Q[n + cap] = 0; });
  if (part !== 'units') zero(['units']); if (part !== 'cert') zero(['cert']); if (part !== 'care') zero(['rt', 'rehab']); if (part !== 'response') zero(['response']);
  const P = HTSim.yearParams(Q, year, path, S.levers);
  return { M: HTSim.yearModel(M0, year, path, P, null), P };
}
function startOutlook(scn, job, after) {
  const out = { years: OUT_YEARS, series: { current: [], planned: [], ambitious: [] }, mine: planEmpty() ? null : [], periods: [] }, tasks = [];
  const pick = (r, M) => ({ adm: r.admittedForeign, arr: r.arrivalsForeign, cov: r.coverage, wait: r.meanWaitDays, lost: r.lost, units: unitCount(M) });
  OUT_YEARS.forEach((y, j) => PATH_KEYS.forEach((k) => tasks.push(() => { const st = stateFor(y, k, false); out.series[k][j] = pick(HTSim.simulate(st.M, st.P, scn, {}), st.M); })));
  if (out.mine) OUT_YEARS.forEach((y, j) => tasks.push(() => { const st = stateFor(y, S.plan.path, true); out.mine[j] = pick(HTSim.simulate(st.M, st.P, scn, {}), st.M); }));
  PERIODS.forEach(([a, b, y]) => {
    const row = { a, b, y, lim: [] }; out.periods.push(row); let st;
    tasks.push(() => { st = stateFor(y, S.plan.path, true); const r = HTSim.simulate(st.M, st.P, scn, {}); row.base = pick(r, st.M); row.short = LN.map((l, c) => [c, r.arrLine[c] - r.admitLine[c]]).sort((p, q) => q[1] - p[1])[0]; row.D = st.M.demandIndex; });
    LIMITS.forEach(([k, l]) => tasks.push(() => { const x = HTSim.simulate(st.M, st.P, scn, { relax: { [k]: true } }); row.lim.push([k, l, Math.max(0, x.admittedForeign - row.base.adm)]); }));
  });
  const main = S.plan.path === 'current' ? 'planned' : S.plan.path;
  out.partsOf = main; out.parts = [];
  let cur2047 = 0;
  tasks.push(() => { const st = stateFor(YEAR_MAX, 'current', false); cur2047 = HTSim.simulate(st.M, st.P, scn, {}).admittedForeign; });
  PARTS.forEach(([part, label]) => tasks.push(() => { const st = partState(YEAR_MAX, main, part); out.parts.push([label, Math.max(0, HTSim.simulate(st.M, st.P, scn, {}).admittedForeign - cur2047)]); }));
  let i = 0;
  const tick = () => {
    if (job !== findJob || !S.ran) return;
    tasks[i++]();
    if (i < tasks.length) { setTimeout(tick, 0); return; }
    S.out = out; renderFindings(); if (S.tab === 'outlook') renderOutlook(); after();
  };
  setTimeout(tick, 0);
}
function chartOutlook(host) {
  const out = S.out, W = Math.max(300, host.clientWidth || 560), H = 250, m = { l: 42, r: 14, t: 12, b: 26 };
  const lines = PATH_KEYS.map((k) => ({ k, name: T(PATHS[k].l), c: PATHS[k].c, v: out.series[k].map((x) => x.cov * 100) }));
  if (out.mine) lines.push({ k: 'mine', name: T('With your changes'), c: MINE, v: out.mine.map((x) => x.cov * 100), dash: true });
  const all = lines.flatMap((l) => l.v), lo = Math.max(0, Math.min(60, Math.floor((Math.min(...all) - 5) / 10) * 10)), hi = 100;
  const endY = (v) => ((hi - v) / (hi - lo)) * (H - m.t - m.b), order2 = lines.map((l) => endY(l.v[l.v.length - 1])).sort((a, b) => a - b), roomy = W >= 460 && order2.every((v, j) => !j || v - order2[j - 1] >= 14);
  if (roomy) m.r = 96;
  const X = (y) => m.l + ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (W - m.l - m.r), Y = (v) => m.t + ((hi - v) / (hi - lo)) * (H - m.t - m.b);
  let g2 = '';
  for (let v = lo; v <= hi + 0.01; v += hi - lo > 50 ? 20 : 10) g2 += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end" class="ax">${pctv(v)}</text>`;
  OUT_YEARS.forEach((y, j) => { if (!phone.matches || j % 2 === 0 || j === OUT_YEARS.length - 1) g2 += `<text x="${X(y)}" y="${H - 8}" text-anchor="middle" class="ax">${y}</text>`; });
  const yNow = S.plan.year;
  g2 += `<line x1="${X(yNow)}" x2="${X(yNow)}" y1="${m.t}" y2="${H - m.b}" class="yr"/>`;
  lines.forEach((l) => {
    g2 += `<path d="${l.v.map((v, j) => (j ? 'L' : 'M') + X(OUT_YEARS[j]).toFixed(1) + ' ' + Y(v).toFixed(1)).join('')}" fill="none" stroke="${l.c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${l.dash ? ' stroke-dasharray="5 4"' : ''}/>`;
    l.v.forEach((v, j) => { g2 += `<circle cx="${X(OUT_YEARS[j]).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4" fill="${l.c}" stroke="var(--card)" stroke-width="2"/>`; });
  });
  if (roomy) lines.forEach((l) => { g2 += `<text x="${W - m.r + 8}" y="${Y(l.v[l.v.length - 1]) + 4}" class="ev">${pctv(l.v[l.v.length - 1])}</text>`; });
  const key = lines.map((l) => `<span><i style="background:${l.c}"></i>${esc(l.name)}</span>`).join('');
  host.innerHTML = `<div class="okey">${key}</div><div class="ochart"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(T('Share of referred patients admitted, by year and development path'))}">${g2}<line id="oc" class="xh" y1="${m.t}" y2="${H - m.b}" x1="-9" x2="-9"/><rect id="ohit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg><div class="otip" id="otip" hidden></div></div>`;
  const hit = host.querySelector('#ohit'), tip = host.querySelector('#otip'), cross = host.querySelector('#oc');
  const move = (e) => {
    const r = hit.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * (W - m.l - m.r) + m.l;
    let j = 0, bd = Infinity; OUT_YEARS.forEach((y, q) => { const v = Math.abs(X(y) - x); if (v < bd) { bd = v; j = q; } });
    cross.setAttribute('x1', X(OUT_YEARS[j])); cross.setAttribute('x2', X(OUT_YEARS[j]));
    tip.hidden = false;
    tip.innerHTML = `<b>${OUT_YEARS[j]}</b>` + lines.slice().sort((a, b) => b.v[j] - a.v[j]).map((l) => `<div><i style="background:${l.c}"></i><span>${esc(l.name)}</span><b>${pctv(l.v[j])}</b></div>`).join('');
    const ow = tip.offsetWidth, x0 = X(OUT_YEARS[j]);
    tip.style.left = Math.max(0, Math.min(host.clientWidth - ow, x0 + 10 + ow > W ? x0 - ow - 10 : x0 + 10)) + 'px';
  };
  hit.addEventListener('pointermove', move); hit.addEventListener('pointerdown', move);
  hit.addEventListener('pointerleave', () => { tip.hidden = true; cross.setAttribute('x1', -9); cross.setAttribute('x2', -9); });
}
function renderOutlook() {
  const host = $('t-outlook');
  if (!S.out) { host.innerHTML = `<p class="note">${T('Calculating the 20-year course.')}</p>`; return; }
  const out = S.out, y = S.plan.year, path = S.plan.path, YS = [2027, 2037, 2047], st = YS.map((q) => stateFor(q, path, true)), o = M0.meta.outlook;
  const rows = [
    [T('People in Türkiye'), (q) => fmt(HTSim.tableAt(o.pop, q))], [T('People aged 65 or over'), (q) => pctv(HTSim.tableAt(o.age65, q), 1)],
    [T('Domestic demand for hospital beds, {y} = 100', { y: HTSim.DATA_YEAR }), (q, s) => dec(s.M.demandIndex * 100, 0)], [T('Hospital beds'), (q, s) => fmt(total(s.M.beds))], [T('Beds in authorised hospitals'), (q, s) => fmt(total(s.M.authBeds))],
    [T('Radiotherapy places'), (q, s) => fmt(total(s.M.oncSlots))], [T('Rehabilitation beds'), (q, s) => fmt(total(s.M.ftrBeds))], [T('Cities that can receive patients'), (q, s) => T('{n} of 81', { n: unitCount(s.M) })], [T('Paying health tourists a year'), (q, s) => fmt(s.M.payingPatients)]];
  const when = HTSim.unitSchedule(M0, st[0].P, path), opened = Array.from(when.entries()).sort((a, b) => a[1] - b[1]);
  const table = `<div class="scroll"><table class="otab"><thead><tr><th>${T('Share admitted')}</th>${out.years.map((q) => `<th>${q}</th>`).join('')}</tr></thead><tbody>${PATH_KEYS.map((k) => `<tr><td>${T(PATHS[k].l)}</td>${out.series[k].map((c) => `<td>${pct(c.cov)}</td>`).join('')}</tr>`).join('')}${out.mine ? `<tr><td>${T('With your changes')}</td>${out.mine.map((c) => `<td>${pct(c.cov)}</td>`).join('')}</tr>` : ''}</tbody></table></div>`;
  const period = (r) => {
    const th = Math.max(5, 0.01 * r.base.arr), best = r.lim.slice().sort((a, b) => b[2] - a[2])[0], named = opened.filter(([p, q]) => q >= r.a && q <= r.b).map(([p]) => M0.prov[p].name), line = LN[r.short[0]];
    let act;
    if (best[2] < th) act = T('No major limit in this scenario. Keep the present capacity and rehearse the referral procedures.');
    else if (best[0] === 'access') act = T('Agree corridors and exit permits with the country in crisis in advance. Türkiye cannot solve this limit alone.');
    else if (best[0] === 'transport') act = T('Add medical flight and ambulance seats, and sign standing agreements for them.');
    else if (best[0] === 'coord') act = T('Add case coordinators and one national referral desk.');
    else if (best[0] === 'staff') act = T('Train and mobilise more rehabilitation staff.');
    else act = T('Add {x} places in cities that already have a unit.', { x: T(LINE[line].n).toLocaleLowerCase(nloc()) });
    const u = named.length ? T('New units on this course: {x}.', { x: named.join(', ') }) : path === 'current' ? T('No new unit opens on this course.') : T('No new unit opens in this period.');
    return `<div class="card period"><h3>${T('{a} to {b}', { a: r.a, b: r.b })}</h3><div class="fr"><span>${T('Share admitted in {y}', { y: r.y })}</span><b>${pct(r.base.cov)}</b></div><div class="fr"><span>${T('Main limit')}</span><b>${best[2] < th ? T('None') : T(best[1])}</b></div><p><b>${T('What can be done.')}</b> ${esc(act)} ${esc(u)}</p><p class="note">${T('Domestic demand for hospital beds is {n} compared with {y}.', { n: (r.D >= 1 ? '+' : '') + pctv((r.D - 1) * 100), y: HTSim.DATA_YEAR })}</p></div>`;
  };
  host.innerHTML = `<h2>${ic('chart-line')}${T('The same crisis in any year to {y}', { y: YEAR_MAX })}</h2><p class="note">${T('Each point runs this hypothetical crisis in that year. The crisis stays the same, while Türkiye changes with its population, hospitals, certified units and preparation.')}</p><div id="ochartHost"></div>${table}`
    + `<h3>${T('Run this crisis in')}</h3><div class="seg years" role="group" aria-label="${T('Year of the crisis')}">${out.years.map((q) => `<button data-year="${q}" aria-pressed="${q === y}">${q}</button>`).join('')}</div>`
    + `<div class="card"><h2>${ic('target-arrow')}${T('What each part of the programme adds by {y}', { y: YEAR_MAX })}</h2><p class="note">${T('{c}, one part at a time. Extra patients admitted compared with the current course.', { c: T(PATHS[out.partsOf].l) })}</p><div class="bars">${(() => { const mx = Math.max(1, ...out.parts.map((x) => x[1])); return out.parts.slice().sort((a, b) => b[1] - a[1]).map(([l, v]) => barow(T(l), v, mx, '+' + fmt(v), '#1a5fcf')).join(''); })()}</div></div>`
    + `<h2>${ic('bulb')}${T('What can be done, period by period')}</h2><p class="note">${T('Course shown: {c}. The main limit is the one whose removal would admit the most extra patients.', { c: T(PATHS[path].l) })}</p><div class="grid3">${out.periods.map(period).join('')}</div>`
    + `<h2>${ic('activity')}${T('How Türkiye changes on this course')}</h2><div class="scroll"><table class="otab"><thead><tr><th></th>${YS.map((q) => `<th>${q}</th>`).join('')}</tr></thead><tbody>${rows.map(([l, f]) => `<tr><td>${l}</td>${YS.map((q, j) => `<td>${f(q, st[j])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    + (opened.length ? `<h3>${T('Cities that open a unit on this course')}</h3><div class="chips">${opened.map(([p, q]) => `<button class="chip" data-city="${p}"><b>${q}</b> ${esc(M0.prov[p].name)}</button>`).join('')}</div>` : '')
    + `<details class="fold"><summary>${T('How the years are projected')}</summary><p class="note">${T('Beds, intensive care beds and specialists follow each province\'s trend for 2015 to 2024, damped year by year so that no past trend continues for ever. Population and ageing follow the TÜİK main scenario. Domestic demand rises with them and slows the release of free beds. Authorised hospitals by region come from the December 2024 count. The targets of the two programmes are the authors\' judgement, except radiotherapy, which uses the published estimates of need.')}</p></details>`;
  chartOutlook($('ochartHost'));
}
function limitBars() { const mx = Math.max(1, ...S.lim.map((x) => x[1])); return S.lim.slice().sort((a, b) => b[1] - a[1]).map(([l, v]) => barow(T(l), v, mx, '+' + fmt(v), '#c7301e')).join(''); }

/* ---- Settings ---- */
const fmL = (l, v) => (l.pct ? pctv(v * 100, l.dp || 0) : dec(v, l.dp || 0));
function buildLevers() {
  $('levers').innerHTML = DATA.levers.map((gr, i) => `<details class="fold"${i === 1 ? ' open' : ''}><summary>${esc(T(gr.group))}</summary>${gr.items.map((l) => `<div class="lever"><label for="l_${l.key}">${esc(T(l.label))}</label><output id="o_${l.key}"></output><input id="l_${l.key}" type="range" min="${l.min}" max="${l.max}" step="${l.step}" data-lever="${l.key}">${l.hint ? `<p>${esc(T(l.hint))}</p>` : ''}</div>`).join('')}</details>`).join('');
}
const LEV = Object.fromEntries(DATA.levers.flatMap((g2) => g2.items).map((l) => [l.key, l]));
function syncLevers() {
  for (const k in LEV) { const v = leverVal(k); $('l_' + k).value = v; $('o_' + k).textContent = fmL(LEV[k], v); }
  document.querySelectorAll('#ptable input').forEach((e) => { e.value = leverVal(e.dataset.k); });
}
function buildParams() {
  const KN = { data: 'Data', lit: 'Literature', derived: 'Derived', assumption: 'Assumption', setting: 'Setting' };
  $('ptable').innerHTML = Object.entries(M0.params).filter(([k, q]) => q.label).map(([k, q]) => `<tr data-s="${esc((T(q.label) + ' ' + T(q.source || '')).toLocaleLowerCase(nloc()))}"><td>${esc(T(q.label))}</td><td><input type="number" step="any" data-k="${k}" value="${q.base}" aria-label="${esc(T(q.label))}"></td><td style="white-space:nowrap">${q.low === undefined ? '' : T('{a} to {b}', { a: q.low, b: q.high })}</td><td class="src"><span class="pill k-${q.kind}">${T(KN[q.kind] || q.kind)}</span> ${esc(T(q.source || ''))}</td></tr>`).join('');
  $('psearch').oninput = (e) => { const v = e.target.value.trim().toLocaleLowerCase(nloc()); document.querySelectorAll('#ptable tr').forEach((r) => { r.hidden = !!v && !r.dataset.s.includes(v); }); };
}

/* ---- Setup codes ---- */
function setupCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify({ v: 4, crises: S.crises, domestic: S.domestic, preset: S.preset, levers: S.levers, plan: S.plan, over: S.over, dest: S.destShare })))); } catch (e) { return ''; } }
function loadSetup(code) {
  const o = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  if ((o.v !== 3 && o.v !== 4) || !o.crises || !o.crises[0].country || !CN[o.crises[0].country]) throw new Error('bad code');
  Object.assign(S, { crises: o.crises, domestic: !!o.domestic, preset: o.preset, levers: o.levers, plan: Object.assign(planDefault(), o.plan), over: o.over || { conv: {}, ref: {} }, destShare: o.dest === undefined ? 1 : o.dest });
  applyOver(); syncAll(); runScenario();
}
function syncAll() {
  syncLevers(); syncHz(); buildConv();
  [['health'], ['tourism'], ['access'], ['presence']].forEach(([k]) => { $('gw-' + k).value = S.plan.groupWeights[k]; $('o-gw-' + k).textContent = dec(S.plan.groupWeights[k], 1) + ' x'; });
  [['realism', 'realism', (v) => pctv(v * 100)], ['htg', 'htGrowth', (v) => pctv(v * 100)], ['hog', 'hotelGrowth', (v) => pctv(v * 100, 1)], ['mdem', 'markDemand', (v) => dec(v, 1) + ' x']].forEach(([id, key, f]) => { $(id).value = S.plan[key]; $('o-' + id).textContent = f(S.plan[key]); });
}
function flash(msg) { $('codeMsg').textContent = msg; }
function copy(text, ok) { try { navigator.clipboard.writeText(text).then(() => flash(T(ok)), () => flash(T('Your browser blocked copying. Select the text and copy it yourself.'))); } catch (e) { flash(T('Your browser blocked copying. Select the text and copy it yourself.')); } }

/* ---- Language ---- */
function pinLabel() { $('pinTxt').textContent = T(S.pin ? 'Unpin' : 'Pin this run'); }
function buildStatic() {
  $('lineKey').innerHTML = Object.entries(LAYERNAME).map(([k, v]) => `<span><span class="dot" style="background:${GC[k]}"></span>${esc(T(v))}</span>`).join('');
  $('strip').innerHTML = SVC.map((s) => `<button data-svc="${s.key}" aria-pressed="${S.service === s.key}" title="${esc(T(s.label))}">${tok(GC[s.layer], s.icon)}<span>${esc(T(s.short))}</span></button>`).join('');
  $('foot').innerHTML = DATA.foot[LANG];
  pinLabel(); mapLabels();
}
function applyLang() {
  document.documentElement.lang = LANG; document.title = T('Health Tourism Surge Map');
  document.querySelectorAll('[data-t]').forEach((e) => { if (e.dataset.en === undefined) e.dataset.en = e.textContent; e.textContent = T(e.dataset.en); });
  document.querySelectorAll('[data-ta]').forEach((e) => e.setAttribute('aria-label', T(e.dataset.ta)));
  document.querySelectorAll('[data-tp]').forEach((e) => e.setAttribute('placeholder', T(e.dataset.tp)));
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === LANG));
  $('play').setAttribute('aria-label', T(S.play ? 'Pause the year' : 'Play the year'));
  buildStatic(); buildBoard(); buildLevers(); buildParams(); buildCities(); syncLevers(); syncHz();
  showStep();
  if (S.ran) { renderResults(); } else if (S.res) paint();
}

/* ---- Wiring ---- */
function setTab(k) {
  S.tab = k; ['summary', 'outlook', 'needs', 'cities', 'impact', 'settings'].forEach((t) => { $('tab-' + t).setAttribute('aria-selected', t === k); $('t-' + t).hidden = t !== k; });
  if (k === 'outlook') renderOutlook();
  if (k === 'impact') renderImpact();
  if (k === 'needs') renderNeeds();
}
function selectService(k, stay) {
  S.service = S.service === k ? null : k; if (S.service) { if (S.layer !== 'need') S.layer = 'pot'; } else S.layer = 'load'; $('layer').value = S.layer;
  document.querySelectorAll('#strip button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.svc === S.service));
  if (!stay) setTab('cities'); else if (S.tab === 'needs') renderNeeds(); renderRank(); paint();
}
function setCrisis(f, v) { S.crises[0][f] = v; renderStep2(); renderStepper(); }
function setPreset(k) { S.preset = k; Object.keys(PRESET.coordinated.v).forEach((q) => { delete S.levers[q]; }); Object.assign(S.levers, PRESET[k].v); syncLevers(); renderStep3(); }
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-step],[data-go],[data-do],[data-type],[data-level],[data-exit],[data-months],[data-p],[data-path],[data-year],[data-bump],[data-unit],[data-reset-city],[data-clear-all],[data-xadd],[data-xdel],[data-mark],[data-city],[data-svc],[data-need],[data-close],[data-ctab],[data-lang]'); if (!t) return;
  if (t.dataset.step) goStep(+t.dataset.step);
  else if (t.dataset.go) { setTab(t.dataset.go); window.scrollTo(0, 0); }
  else if (t.dataset.do === 'play') setPlay(!S.play);
  else if (t.dataset.type) setCrisis('type', t.dataset.type);
  else if (t.dataset.level) setCrisis('level', t.dataset.level);
  else if (t.dataset.exit) setCrisis('exit', t.dataset.exit);
  else if (t.dataset.months) setCrisis('months', +t.dataset.months);
  else if (t.dataset.p !== undefined && t.classList.contains('tile')) setPreset(t.dataset.p);
  else if (t.dataset.path) { S.plan.path = t.dataset.path; renderStep3(); run(); }
  else if (t.dataset.year) { S.plan.year = +t.dataset.year; syncHz(); run(true); }
  else if (t.dataset.bump) { const [id, k, dir] = t.dataset.bump.split('|'), box = t.closest('.bump').querySelector('input'), def = defaults().M[k][BY_ID[id]], v = Math.max(0, +box.value + +dir * stepOf(def)); box.value = v; setStock(id, k, v); t.closest('.srow').classList.toggle('changed', !!((S.plan.stock[id] || {})[k])); }
  else if (t.dataset.unit) { const [id, a] = t.dataset.unit.split('|'); if (a === 'add') S.plan.units[id] = true; if (a === 'del') { delete S.plan.units[id]; delete S.plan.stock[id]; } if (a === 'off') S.plan.off[id] = true; if (a === 'on') delete S.plan.off[id]; defKey = ''; refreshCity(); }
  else if (t.dataset.resetCity) { const id = t.dataset.resetCity; delete S.plan.stock[id]; delete S.plan.units[id]; delete S.plan.off[id]; delete S.plan.damage[id]; defKey = ''; refreshCity(); if (S.step === 5 && S.sel !== null) renderCity(); }
  else if (t.hasAttribute('data-clear-all')) { S.plan.stock = {}; S.plan.units = {}; S.plan.off = {}; S.plan.damage = {}; defKey = ''; refreshCity(); }
  else if (t.hasAttribute('data-xadd')) { S.crises.push(crisisDefault()); renderStep2(); }
  else if (t.dataset.xdel !== undefined) { S.crises.splice(+t.dataset.xdel, 1); tintCountries(); overlays(); renderStep2(); }
  else if (t.dataset.mark) { const [pid, k, n] = t.dataset.mark.split('|'); setMark(pid, k, +n); }
  else if (t.dataset.city !== undefined) select(+t.dataset.city);
  else if (t.dataset.svc) selectService(t.dataset.svc);
  else if (t.dataset.need) selectService(t.dataset.need, true);
  else if (t.hasAttribute('data-close')) { S.sel = null; $('citySel').value = ''; paint(); renderCity(); renderHint(); }
  else if (t.dataset.ctab) { S.cityTab = t.dataset.ctab; renderCity(); }
  else if (t.dataset.lang) { LANG = t.dataset.lang; try { localStorage.setItem('surge-lang', LANG); } catch (err) { /* storage can be unavailable */ } applyLang(); }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.stock) { const [id, k] = t.dataset.stock.split('|'); if (t.value === '') return; setStock(id, k, +t.value); t.closest('.srow').classList.toggle('changed', !!((S.plan.stock[id] || {})[k])); }
  else if (t.dataset.lever) { const k = t.dataset.lever; S.levers[k] = +t.value; if (PRESET[S.preset] && Object.keys(PRESET.coordinated.v).includes(k)) S.preset = 'custom'; $('o_' + k).textContent = fmL(LEV[k], t.value); const q = document.querySelector(`#ptable input[data-k="${k}"]`); if (q) q.value = t.value; run(); }
  else if (t.dataset.k) { const k = t.dataset.k; if (t.value === '') return; S.levers[k] = +t.value; if (LEV[k]) { $('l_' + k).value = t.value; $('o_' + k).textContent = fmL(LEV[k], t.value); } run(); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.status) { const id = t.dataset.status; delete S.plan.off[id]; delete S.plan.damage[id]; if (t.value === 'off') S.plan.off[id] = true; if (t.value === 'damaged') S.plan.damage[id] = 0.4; run(true); }
  else if (t.dataset.conv) { const [k, l] = t.dataset.conv.split('|'); if (!S.over.conv[k]) S.over.conv[k] = {}; S.over.conv[k][l] = +t.value; run(true); }
  else if (t.dataset.ref) { S.over.ref[t.dataset.ref] = +t.value; run(true); }
  else if (t.dataset.x) { const [i, f] = t.dataset.x.split('|'); S.crises[+i][f] = t.value || null; tintCountries(); overlays(); renderStep2(); }
});
svg.addEventListener('click', (e) => {
  if (S.step < 4) {
    const c = e.target.closest('[data-c]');
    if (c) pickCountry(c.dataset.c);
    else if (e.target.closest('[data-p]') && S.step === 1) { $('hintTxt').textContent = T('Türkiye is the destination. Choose another country.'); $('hint').hidden = false; }
    return;
  }
  const t = e.target.closest('[data-p]'); if (t) { select(+t.dataset.p); return; }
  const m = svg.getScreenCTM(); if (!m) return; const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); let b = -1, bd = Infinity;
  M0.prov.forEach((p, i) => { const v = Math.hypot(p.x - q.x, p.y - q.y); if (v < bd) { bd = v; b = i; } });
  if (bd < unit() * 24) select(b);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.sel !== null) { S.sel = null; $('citySel').value = ''; paint(); renderCity(); renderHint(); } });
document.querySelectorAll('.cam button').forEach((b) => { b.onclick = () => setCam(b.dataset.cam); });
['summary', 'outlook', 'needs', 'cities', 'impact', 'settings'].forEach((t) => { $('tab-' + t).onclick = () => setTab(t); });
$('country').onchange = (e) => { if (e.target.value) pickCountry(e.target.value); };
$('next1').onclick = () => goStep(2); $('next2').onclick = () => goStep(3); $('next3').onclick = () => goStep(4); $('runBtn').onclick = runScenario; $('runNow').onclick = runScenario;
$('year').oninput = (e) => { S.plan.year = +e.target.value; $('o-year').textContent = S.plan.year; $('yearFacts').innerHTML = yearFacts(); syncHz(); run(); };
$('editSel').onchange = (e) => { select(e.target.value === '' ? null : +e.target.value); };
$('domestic').onchange = (e) => { S.domestic = e.target.checked; };
$('dest').oninput = (e) => { S.destShare = +e.target.value; $('o-dest').textContent = pctv(S.destShare * 100); };
$('extSeg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (+b.dataset.e) S.levers.extendedNeeds = 1; else delete S.levers.extendedNeeds; document.querySelectorAll('#extSeg button').forEach((x) => x.setAttribute('aria-pressed', x === b)); const q = document.querySelector('#ptable input[data-k="extendedNeeds"]'); if (q) q.value = S.levers.extendedNeeds || 0; };
$('layer').onchange = (e) => { S.layer = e.target.value; if ((S.layer === 'pot' || S.layer === 'need') && !S.service) { const want = S.layer; selectService(SVC[0].key, true); S.layer = want; $('layer').value = want; paint(); return; } paint(); };
$('day').oninput = (e) => { S.day = +e.target.value; paint(true); if (S.sel !== null && S.cityTab === 'why') renderCity(); };
$('day').onchange = () => overlays();
$('play').onclick = () => setPlay(!S.play);
$('hint').onclick = () => { if (S.step === 5) select(order(S.res.servedProv)[0]); };
$('pinBtn').onclick = () => { S.pin = S.pin ? null : Object.assign({}, S.res); $('pinBtn').setAttribute('aria-pressed', !!S.pin); pinLabel(); renderKPI(); };
$('resetBtn').onclick = () => {
  setPlay(false);
  defKey = '';
  Object.assign(S, { out: null, step: 1, ran: false, crises: [crisisDefault()], domestic: false, levers: {}, plan: planDefault(), preset: 'model', destShare: 1, over: { conv: {}, ref: {} }, service: null, layer: 'reserve', sel: null, pin: null, day: 90 });
  $('layer').value = 'reserve'; document.querySelectorAll('#strip button').forEach((b) => b.setAttribute('aria-pressed', false)); applyOver(); syncAll(); renderCity(); setCam('reg'); showStep(); run(true);
};
$('copyCode').onclick = () => copy($('code').value, 'Code copied.');
$('loadCode').onclick = () => { try { loadSetup($('code').value); flash(T('Setup loaded.')); } catch (e) { flash(T('That code could not be read. Check that you pasted all of it.')); } };
const onPages = /github\.io$|^localhost$|^127\./.test(location.hostname);
if (onPages) { $('copyLink').hidden = false; $('copyLink').onclick = () => copy(location.origin + location.pathname + '#s=' + encodeURIComponent($('code').value), 'Link copied.'); }
if ('IntersectionObserver' in window) new IntersectionObserver((en) => { mapVisible = en[0].isIntersecting; }).observe(svg);
window.addEventListener('resize', () => { if (S.res) overlays(); });

buildChart();
S.P = params(); S.scores = HTSim.scoreServices(M0, S.plan.groupWeights);
applyLang();
svg.setAttribute('viewBox', vb.join(' ')); document.querySelectorAll('.cam button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cam === S.cam));
$('play').innerHTML = ic('player-play');
let loaded = false;
if (location.hash.startsWith('#s=')) { try { loadSetup(decodeURIComponent(location.hash.slice(3))); loaded = true; } catch (e) { /* a broken link falls back to the first step */ } }
if (!loaded) run(true);
if (!reduced) rafT = requestAnimationFrame(frame);
(function keepTabsBelowMap() {
  const st = document.querySelector('.stage');
  const fi = $('finds'), sync = () => { document.documentElement.style.setProperty('--stage-h', st.offsetHeight + 'px'); document.documentElement.style.setProperty('--finds-h', (fi.offsetHeight ? fi.offsetHeight + 8 : 0) + 'px'); };
  sync();
  if (window.ResizeObserver) { const ro = new ResizeObserver(sync); ro.observe(st); ro.observe(fi); } else addEventListener('resize', sync);
})();
window.surgeMap = { state: S, model: M0, run, T };
})();
