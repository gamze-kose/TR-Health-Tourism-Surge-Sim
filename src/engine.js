/*
 * TR-Health-Tourism-Surge-Sim engine.
 * Stochastic, capacity-constrained compartmental network model of cross-border emergency
 * patient flows into the 81 provinces of Türkiye. The same file runs in Node for the
 * reported analyses and in the browser for the interactive map.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HTSim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LINES = ['ICU', 'TRAUMA', 'DIAL', 'ONCO', 'REHAB', 'STEP'];
  const L = { ICU: 0, TRAUMA: 1, DIAL: 2, ONCO: 3, REHAB: 4, STEP: 5 };
  const NL = LINES.length;
  const K = 3; // Erlang stages per service line
  const PRIORITY = [L.ICU, L.TRAUMA, L.DIAL, L.ONCO, L.REHAB, L.STEP];
  const DAY = 365;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function stdNormal(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function poisson(rng, lam) {
    if (lam <= 0) return 0;
    if (lam > 40) return Math.max(0, Math.round(lam + Math.sqrt(lam) * stdNormal(rng)));
    const limit = Math.exp(-lam);
    let k = 0, p = 1;
    do { k++; p *= rng(); } while (p > limit);
    return k - 1;
  }

  function gammaSample(rng, shape) {
    if (shape < 1) return gammaSample(rng, shape + 1) * Math.pow(rng() || 1e-12, 1 / shape);
    const d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x, v;
      do { x = stdNormal(rng); v = 1 + c * x; } while (v <= 0);
      v = v * v * v;
      const u = rng() || 1e-12;
      if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
    }
  }

  // Beta-PERT sample on [low, high] with the given mode.
  function pert(rng, low, mode, high, lambda) {
    if (!(high > low)) return mode;
    const l = lambda === undefined ? 4 : lambda;
    const a = 1 + (l * (mode - low)) / (high - low);
    const b = 1 + (l * (high - mode)) / (high - low);
    const x = gammaSample(rng, a), y = gammaSample(rng, b);
    return low + (high - low) * (x / (x + y));
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180, dlat = (lat2 - lat1) * r, dlon = (lon2 - lon1) * r;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dlon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(a));
  }

  /* ---- Model compilation: JSON inputs to typed arrays and travel-time tables ---- */
  function compile(data) {
    const prov = data.provinces, nP = prov.length;
    const origins = data.origins, nO = origins.length;
    const f = (key) => Float64Array.from(prov.map((p) => +p[key] || 0));
    const M = {
      nP, nO, prov, origins, params: data.params, scenarios: data.scenarios,
      beds: f('beds'), authBeds: f('authBeds'), authIcu: f('authIcu'), occAuth: f('occAuth'), occAll: f('occAll'),
      ftrBeds: f('ftrBeds'), dialSlots: f('dialSlots'), oncSlots: f('oncSlots'),
      thermal: f('thermalBeds'), hotel: f('hotelBeds'), htShare: f('htShare'),
      commInpBeds: f('commInpBeds'), commIcu: f('commIcu'),
      unit: Uint8Array.from(prov.map((p) => (p.unit === undefined ? 1 : p.unit))),
    };
    // Normalise tourist share.
    let s = 0; for (let i = 0; i < nP; i++) s += M.htShare[i];
    if (s > 0) for (let i = 0; i < nP; i++) M.htShare[i] /= s;

    // Travel hours from each origin to each province by the faster of land and air.
    const airports = prov.map((p, i) => (p.airportIntl ? i : -1)).filter((i) => i >= 0);
    const hub = airports.map((i) => prov[i]);
    M.hours = origins.map((o) => {
      const h = new Float64Array(nP);
      for (let p = 0; p < nP; p++) {
        let best = Infinity;
        for (const a of hub) {
          const air = haversine(o.lat, o.lon, a.lat, a.lon) / 700 + 3;
          const last = (haversine(a.lat, a.lon, prov[p].lat, prov[p].lon) * 1.3) / 75;
          if (air + last < best) best = air + last;
        }
        for (const g of o.landGates || []) {
          const gp = prov[g - 1];
          const land = ((haversine(o.lat, o.lon, gp.lat, gp.lon) + haversine(gp.lat, gp.lon, prov[p].lat, prov[p].lon)) * 1.3) / 70 + 2;
          if (land < best) best = land;
        }
        h[p] = best;
      }
      return h;
    });
    M.extra = LINES.map(() => new Float64Array(nP));
    M.visOverride = new Uint8Array(nP);
    M.services = data.services || [];
    M.specCap = {};
    for (const key of data.specKeys || []) M.specCap[key] = Float64Array.from(prov.map((p) => (p.spec && p.spec[key]) || 0));
    M.indicators = data.indicators || [];
    M.meta = data.meta || {};
    M.originIndex = Object.fromEntries(origins.map((o, i) => [o.id, i]));
    M.provIndex = Object.fromEntries(prov.map((p, i) => [p.id, i]));
    return M;
  }

  /* ---- Parameter handling ---- */
  function baseParams(M) {
    const P = {};
    for (const k in M.params) P[k] = M.params[k].base;
    return P;
  }

  function sampleParams(M, rng, fixed) {
    const P = {};
    for (const k in M.params) {
      const q = M.params[k];
      if (fixed && k in fixed) P[k] = fixed[k];
      else if (q.low === undefined || q.high === undefined || q.low === q.high) P[k] = q.base;
      else P[k] = pert(rng, q.low, q.base, q.high);
    }
    return P;
  }

  /* ---- Temporal profiles ---- */
  function shapeGamma(T, start, mean, k) {
    // Discretised gamma density beginning at day `start`.
    const y = new Float64Array(T);
    const theta = mean / k;
    let sum = 0;
    for (let t = start; t < T; t++) {
      const x = t - start + 0.5;
      y[t] = Math.pow(x, k - 1) * Math.exp(-x / theta);
      sum += y[t];
    }
    if (sum > 0) for (let t = start; t < T; t++) y[t] /= sum;
    return y;
  }

  function shapeFlat(T, start, dur) {
    const y = new Float64Array(T);
    const end = Math.min(T, start + Math.max(1, dur));
    const v = 1 / Math.max(1, end - start);
    for (let t = start; t < end; t++) y[t] = v;
    return y;
  }

  function buildArrivals(M, P, scn, T) {
    // Returns lam[o][line] = Float64Array(T) of expected daily referrals.
    const lam = M.origins.map(() => null);
    const add = (o, c, n, shape) => {
      if (!lam[o]) lam[o] = LINES.map(() => new Float64Array(T));
      const a = lam[o][c];
      for (let t = 0; t < T; t++) a[t] += n * shape[t];
    };
    for (const ev of scn.events) {
      const sev = (ev.severity || 1) * (P.severityMult === undefined ? 1 : P.severityMult);
      const start = ev.start || 0, gap = ev.exportMult === undefined ? 1 : ev.exportMult;
      for (const [iso, w] of Object.entries(ev.origins)) {
        const o = M.originIndex[iso];
        if (o === undefined) continue;
        if (ev.type === 'disaster') {
          const inj = ev.injured * w * sev;
          const x = (iso === 'TUR' ? P.domesticOnReserve : P.exportDisaster) * gap;
          add(o, L.ICU, inj * P.dzIcu * x, shapeGamma(T, start, 4, 2));
          add(o, L.TRAUMA, inj * P.dzSurg * x, shapeGamma(T, start, 6, 2));
          add(o, L.DIAL, inj * P.dzCrush * x, shapeGamma(T, start, 3, 2));
          add(o, L.REHAB, inj * P.dzRehab * x * (iso === 'TUR' ? 1 : P.exportRehabBoost), shapeGamma(T, start + 10, 35, 2));
          add(o, L.STEP, inj * P.dzStep * x * (iso === 'TUR' ? 1 : P.exportRehabBoost), shapeGamma(T, start + 20, 60, 2));
        } else if (ev.type === 'conflict') {
          const days = Math.min(ev.duration || T, T - start);
          const inj = ev.injuredPerDay * days * w * sev;
          const x = P.exportConflict * gap;
          const f = shapeFlat(T, start, days);
          add(o, L.ICU, inj * P.cfIcu * x, f);
          add(o, L.TRAUMA, inj * P.cfSurg * x, f);
          add(o, L.REHAB, inj * P.cfRehab * x, shapeLag(f, 30, T));
          add(o, L.STEP, inj * P.cfStep * x, shapeLag(f, 60, T));
          if (ev.dialysisPatients) add(o, L.DIAL, ev.dialysisPatients * w * P.chronicLoss * gap, shapeGamma(T, start, 14, 2));
          if (ev.cancerPatients) add(o, L.ONCO, ev.cancerPatients * w * P.chronicLoss * gap, shapeGamma(T, start, 21, 2));
          if (P.extendedNeeds && ev.cancerPatients) {
            const base = ev.cancerPatients * w * P.chronicLoss * gap, sh = shapeGamma(T, start, 21, 2);
            add(o, L.ICU, base * (P.xHeart * 0.2 + P.xCongenital * 0.1), sh);
            add(o, L.TRAUMA, base * (P.xHeart * 0.8 + P.xCongenital * 0.9 + P.xEye), sh);
            add(o, L.ONCO, base * P.xBlood, sh);
          }
        } else if (ev.type === 'epidemic') {
          const days = Math.min(ev.duration || 120, T - start);
          const crit = ev.critical * w * sev;
          const wave = shapeWave(T, start, days);
          add(o, L.ICU, crit * P.epiTransfer * gap, wave);
          add(o, L.STEP, crit * P.epiRehabNeed * P.epiStepTransfer * gap, shapeLag(wave, 28, T));
          if (ev.dialysisPatients) add(o, L.DIAL, ev.dialysisPatients * w * P.epiChronicLoss * gap, wave);
          if (ev.cancerPatients) add(o, L.ONCO, ev.cancerPatients * w * P.epiChronicLoss * gap, wave);
        }
      }
    }
    return lam;
  }

  function shapeLag(src, lag, T) {
    const y = new Float64Array(T);
    for (let t = 0; t + lag < T; t++) y[t + lag] = src[t];
    return y;
  }

  function shapeWave(T, start, dur) {
    const y = new Float64Array(T);
    const mid = start + dur / 2, sd = dur / 4.5;
    let s = 0;
    for (let t = start; t < T; t++) {
      y[t] = Math.exp(-0.5 * ((t - mid) / sd) ** 2);
      s += y[t];
    }
    if (s > 0) for (let t = start; t < T; t++) y[t] /= s;
    return y;
  }

  /* Proportional allocation with caps, repeated until the amount or the capacity runs out. */
  function waterFill(amount, weight, cap, out, n) {
    let rem = amount;
    for (let i = 0; i < n; i++) out[i] = 0;
    for (let pass = 0; pass < 5 && rem > 1e-9; pass++) {
      let W = 0;
      for (let i = 0; i < n; i++) if (cap[i] - out[i] > 1e-9) W += weight[i];
      if (W <= 0) break;
      let used = 0;
      for (let i = 0; i < n; i++) {
        const room = cap[i] - out[i];
        if (room > 1e-9) {
          const x = Math.min((rem * weight[i]) / W, room);
          out[i] += x; used += x;
        }
      }
      rem -= used;
      if (used < 1e-9) break;
    }
    return amount - rem;
  }

  /* ---- Main simulation ---- */
  /* Places open to crisis patients in one province, by care line, given the state of the day. */
  function capacityOf(M, P, p, d, out) {
    const idleGen = M.authBeds[p] * Math.max(0, P.occSafe - M.occAuth[p]) * d.kappa;
    const vacated = M.commInpBeds[p] * d.seasonComm * (1 - d.commEffect) * d.kappa;
    const commGen = P.rho * M.commInpBeds[p] * d.seasonComm * d.commEffect;
    const gen = d.r * (idleGen + vacated + commGen) * d.alive;
    out[L.TRAUMA] = (1 - P.theta) * gen * P.capTrauma;
    out[L.REHAB] = P.theta * gen * P.convRehab + d.r * P.kappaRehab * M.ftrBeds[p] * d.alive;
    out[L.ICU] = d.r * d.alive * (M.authIcu[p] * Math.max(0, P.occSafeIcu - d.occIcu) * d.kappa + P.rho * M.commIcu[p] * d.seasonComm * d.commEffect);
    out[L.DIAL] = d.r * d.alive * d.kappa * M.dialSlots[p] * P.dialIdle;
    out[L.ONCO] = d.r * d.alive * d.kappa * M.oncSlots[p] * P.oncIdle;
    out[L.STEP] = d.rStep * d.alive * (P.stepThermal * M.thermal[p] * d.thermalFree + P.stepHotel * M.hotel[p] * d.hotelFree);
    return out;
  }

  /* Places a province can offer once the response is fully under way, on an average day. */
  function cityPlaces(M, P, p) {
    const out = new Float64Array(NL);
    if (!M.unit[p]) return out;
    return capacityOf(M, P, p, { r: 1, rStep: 1, alive: 1, kappa: P.kappa, occIcu: Math.min(P.occCeiling === undefined ? 1 : P.occCeiling, P.occIcu * (M.occIcuMult === undefined ? 1 : M.occIcuMult)), seasonComm: 1, commEffect: 1, hotelFree: Math.max(0, 1 - P.hotelOccMean), thermalFree: Math.max(0, 1 - P.thermalOccMean) }, out);
  }

  function simulate(M, P, scn, opt) {
    opt = opt || {};
    const T = opt.T || 365, nP = M.nP, nO = M.nO;
    const rng = opt.seed === undefined ? null : mulberry32(opt.seed);
    const rec = !!opt.record;
    const relax = opt.relax || {};
    const kappa = P.kappa * (scn.kappaMult === undefined ? 1 : scn.kappaMult);
    const occIcuNow = Math.min(P.occCeiling === undefined ? 1 : P.occCeiling, (scn.occIcu === undefined ? P.occIcu : scn.occIcu) * (M.occIcuMult === undefined ? 1 : M.occIcuMult));
    const cell = new Float64Array(NL);
    const lam = buildArrivals(M, P, scn, T);
    const active = [];
    for (let o = 0; o < nO; o++) if (lam[o]) active.push(o);
    const nA = active.length;
    const grav = M.origins.map((_, o) => lam[o] ? M.hours[o].map((h) => Math.exp(-h / P.tauHours)) : null);
    const needO = new Float64Array(nO), landPool = new Float64Array(nO);
    let admittedToday = 0, today = 0;
    const LOS = [P.losIcu, P.losTrauma, P.losDial, P.losOnco, P.losRehab, P.losStep];
    const stageRate = LOS.map((l) => 1 - Math.exp(-K / Math.max(1, l)));
    // Probability of moving to another service line in Türkiye on completing a line.
    const nextL = [L.TRAUMA, L.REHAB, -1, -1, L.STEP, -1];
    const nextP = [P.icuToTrauma, P.traumaToRehab, 0, 0, P.rehabToStep, 0];
    const vis = new Float64Array(nP);
    for (let p = 0; p < nP; p++) vis[p] = M.visOverride[p] ? 1 : P.eta + (1 - P.eta) * Math.min(1, M.htShare[p] / P.htRef);
    const mort = [P.mortIcu, P.mortTrauma, P.mortDial, P.mortOnco, 0, 0];
    const hazard = [P.waitHazIcu, P.waitHazTrauma, P.waitHazDial, P.waitHazOnco, P.waitHazRehab, P.waitHazStep];
    const slotCost = [P.slotIcu, P.slotTrauma, 1, 1, 1, P.slotStep];

    // State arrays.
    const O = LINES.map(() => Array.from({ length: K }, () => new Float64Array(nP)));
    const B = LINES.map(() => new Float64Array(nP));
    const W = M.origins.map(() => new Float64Array(NL));
    const Cap = LINES.map(() => new Float64Array(nP));
    const Avail = new Float64Array(nP), wgt = new Float64Array(nP), out = new Float64Array(nP), occV = new Float64Array(nP);

    // Totals.
    const servedLine = new Float64Array(NL), lostLine = new Float64Array(NL), arrLine = new Float64Array(NL);
    const servedOrigin = new Float64Array(nO), arrOrigin = new Float64Array(nO), lostOrigin = new Float64Array(nO);
    const servedProv = new Float64Array(nP), bedDaysLine = new Float64Array(NL), bedDaysProv = new Float64Array(nP);
    const peakLine = new Float64Array(NL), capEnd = new Float64Array(NL);
    const admitLine = new Float64Array(NL);
    const domesticServed = { n: 0 };
    let waitArea = 0, inCareDeaths = 0, completed = 0, displacedBedDays = 0, overSafeProvDays = 0, internalMoves = 0;
    let peakOcc = 0, peakOccProv = -1, blockedDays = 0;
    const provOver = new Uint8Array(nP);
    const maxOccProv = new Float64Array(nP);

    const daily = rec ? {
      arrivals: new Float64Array(T), admitted: new Float64Array(T), waiting: new Float64Array(T), inCare: new Float64Array(T),
      lineCare: LINES.map(() => new Float64Array(T)), lineCap: LINES.map(() => new Float64Array(T)),
      occ: Array.from({ length: T }, () => new Float32Array(nP)),
      load: Array.from({ length: T }, () => new Float32Array(nP)),
      flows: M.origins.map(() => new Float64Array(T)),
      flowOP: M.origins.map(() => new Float32Array(nP)),
      flowOL: M.origins.map(() => new Float64Array(NL)),
      lost: new Float64Array(T), done: new Float64Array(T),
      waitO: M.origins.map(() => new Float32Array(T)),
      careP: LINES.map(() => new Float32Array(T * nP)), capP: LINES.map(() => new Float32Array(T * nP)),
      admitPL: LINES.map(() => new Float64Array(nP)),
    } : null;

    // Damage to Turkish provinces in domestic events.
    const damage = new Float64Array(nP);
    const domesticIdx = M.originIndex.TUR;
    for (const ev of scn.events) {
      if (!ev.damage) continue;
      for (const [id, d] of Object.entries(ev.damage)) {
        const i = M.provIndex[+id];
        if (i !== undefined) damage[i] = Math.max(damage[i], Math.min(1, d * (P.severityMult || 1)));
      }
    }
    const scnStart = Math.min(...scn.events.map((e) => e.start || 0));
    const startDoy = scn.startDoy === undefined ? P.startDoy : scn.startDoy;
    const commCrisis = scn.commercialMult === undefined ? 1 : scn.commercialMult;

    for (let t = 0; t < T; t++) {
      today = t;
      /* 1. Capacity available to the emergency programme on day t. */
      const doy = (startDoy + t) % DAY;
      const r = t < scnStart ? 0 : 1 - Math.exp(-(t - scnStart) / Math.max(0.5, P.rampDays));
      const rStep = t < scnStart ? 0 : 1 - Math.exp(-(t - scnStart) / Math.max(0.5, P.rampDaysStep));
      const seasonComm = 1 + P.seasonAmpComm * Math.cos((2 * Math.PI * (doy - P.seasonPeakComm)) / DAY);
      const hotelFree = Math.max(0, 1 - (P.hotelOccMean + P.hotelOccAmp * Math.cos((2 * Math.PI * (doy - 215)) / DAY)));
      const thermalFree = Math.max(0, 1 - (P.thermalOccMean + P.thermalOccAmp * Math.cos((2 * Math.PI * (doy - 15)) / DAY)));
      const commEffect = t < scnStart ? 1 : commCrisis;
      let rehabCapTotal = 0;
      for (let p = 0; p < nP; p++) {
        const alive = damage[p] > 0 ? 1 - damage[p] * (t < scnStart ? 0 : Math.exp(-(t - scnStart) / P.damageRecoveryDays)) : 1;
        capacityOf(M, P, p, { r, rStep, alive, kappa, occIcu: occIcuNow, seasonComm, commEffect, hotelFree, thermalFree }, cell);
        for (let c = 0; c < NL; c++) Cap[c][p] = cell[c];
        rehabCapTotal += Cap[L.REHAB][p] + Cap[L.STEP][p];
      }
      // National rehabilitation workforce limit.
      const staffCap = r * P.ptTotal * P.ptMobil * P.ptPatientsPerStaff * (M.staffMult === undefined ? 1 : M.staffMult);
      if (!relax.staff && rehabCapTotal > staffCap && rehabCapTotal > 0) {
        const scale = staffCap / rehabCapTotal;
        for (let p = 0; p < nP; p++) { Cap[L.REHAB][p] *= scale; Cap[L.STEP][p] *= scale; }
      }
      for (let c = 0; c < NL; c++) {
        const ex = M.extra[c], ramp = c === L.STEP ? rStep : r;
        for (let p = 0; p < nP; p++) if (ex[p] !== 0) Cap[c][p] = Math.max(0, Cap[c][p] + ramp * ex[p] * (damage[p] > 0 ? 1 - damage[p] * (t < scnStart ? 0 : Math.exp(-(t - scnStart) / P.damageRecoveryDays)) : 1));
      }
      if (relax.capacity) for (let c = 0; c < NL; c++) for (let p = 0; p < nP; p++) Cap[c][p] = 1e9;
      const provMask = opt.mask || M.mask;
      if (provMask) for (let c = 0; c < NL; c++) for (let p = 0; p < nP; p++) if (!provMask[p]) Cap[c][p] = 0;
      for (let c = 0; c < NL; c++) for (let p = 0; p < nP; p++) if (!M.unit[p]) Cap[c][p] = 0;
      if (t === T - 1) for (let c = 0; c < NL; c++) capEnd[c] = sum(Cap[c], nP);

      /* 2. Clinical progress through Erlang stages. */
      for (let c = 0; c < NL; c++) {
        const a = stageRate[c];
        const S = O[c];
        for (let p = 0; p < nP; p++) {
          const out3 = S[K - 1][p] * a;
          for (let k = K - 1; k > 0; k--) {
            const inflow = S[k - 1][p] * a;
            S[k][p] += inflow - (k === K - 1 ? out3 : S[k][p] * a);
          }
          S[0][p] -= S[0][p] * a;
          if (out3 > 0) {
            const dead = out3 * mort[c];
            inCareDeaths += dead;
            let live = out3 - dead;
            if (nextL[c] >= 0) {
              const mv = live * nextP[c];
              B[c][p] += mv; // Remains in the bed until the next line can receive the patient.
              live -= mv;
            }
            completed += live;
          }
        }
      }

      /* 3. Internal step-down moves, relieving blocked beds. */
      for (let c = 0; c < NL; c++) {
        const nx = nextL[c];
        if (nx >= 0) {
          const blockedTotal = sum(B[c], nP);
          if (blockedTotal < 1e-9) continue;
          occFill(nx);
          for (let p = 0; p < nP; p++) Avail[p] = Math.max(0, Cap[nx][p] - occV[p]);
          // Same-province placement first.
          for (let p = 0; p < nP; p++) {
            const x = Math.min(B[c][p], Avail[p]);
            if (x > 0) { B[c][p] -= x; O[nx][0][p] += x; Avail[p] -= x; servedLine[nx] += x; }
          }
          // Remaining blocked patients are moved between provinces by available capacity.
          const rem = sum(B[c], nP);
          if (rem > 1e-9) {
            const room = sum(Avail, nP);
            if (room > 1e-9) {
              const take = Math.min(rem, room) / rem;
              for (let p = 0; p < nP; p++) {
                const x = B[c][p] * take;
                B[c][p] -= x; internalMoves += x;
              }
              for (let p = 0; p < nP; p++) {
                const x = (Math.min(rem, room) * Avail[p]) / room;
                O[nx][0][p] += x; servedLine[nx] += x;
              }
            }
          }
        }
      }

      /* 4. New referrals and attrition while waiting. */
      let arrivalsToday = 0;
      for (let ia = 0; ia < nA; ia++) {
        const o = active[ia];
        for (let c = 0; c < NL; c++) {
          const expct = lam[o][c][t];
          if (expct > 0) {
            const n = rng ? poisson(rng, expct) : expct;
            W[o][c] += n; arrLine[c] += n; arrOrigin[o] += n; arrivalsToday += n;
          }
          if (W[o][c] > 0 && hazard[c] > 0) {
            const lost = W[o][c] * hazard[c];
            W[o][c] -= lost; lostLine[c] += lost; lostOrigin[o] += lost;
          }
        }
      }

      /* 5. Cross-border admission: access, transport, coordination, then province capacity. */
      let airPool = relax.transport ? 1e12 : r * P.airSlots;
      let coordPool = relax.coord ? 1e12 : r * P.coordCases;
      admittedToday = 0;
      let airDemand = 0;
      for (let ia = 0; ia < nA; ia++) {
        const o = active[ia];
        landPool[o] = hasLand(o) ? (relax.transport ? 1e12 : r * P.landSlotsPerGate * M.origins[o].landGates.length) : 0;
        needO[o] = 0;
        for (let c = 0; c < NL; c++) needO[o] += W[o][c] * slotCost[c];
        if (o !== domesticIdx && !hasLand(o)) airDemand += needO[o];
      }
      for (const c of PRIORITY) {
        occFill(c);
        const capRelax = !!relax.capacity;
        for (let p = 0; p < nP; p++) Avail[p] = Math.max(0, Cap[c][p] - occV[p]) * (capRelax ? 1 : vis[p]);
        for (let ia = 0; ia < nA; ia++) {
          const o = active[ia];
          if (W[o][c] < 1e-9) continue;
          if (o === domesticIdx) {
            // Domestic casualties have priority and no border or airlift constraint.
            for (let p = 0; p < nP; p++) wgt[p] = grav[o][p] * (Avail[p] > 0 ? 1 : 0);
            const got = waterFill(W[o][c], wgt, Avail, out, nP);
            applyAdmit(o, c, got, true);
            continue;
          }
          const originAccess = M.origins[o].access === undefined ? 1 : M.origins[o].access;
          const access = relax.access ? 1 : Math.min(1, P.accessRate * originAccess * P.fastTrack);
          let candidates = W[o][c] * access;
          const cost = slotCost[c];
          // Land corridors first, then the shared air pool.
          let transport;
          if (hasLand(o)) {
            transport = landPool[o] / cost;
          } else {
            transport = (Math.min(airPool, (airPool * needO[o]) / Math.max(1e-9, airDemand)) * (M.origins[o].airFactor === undefined ? 1 : M.origins[o].airFactor)) / cost;
          }
          candidates = Math.min(candidates, transport, coordPool);
          if (candidates < 1e-9) continue;
          const capE = P.capExp;
          for (let p = 0; p < nP; p++) wgt[p] = grav[o][p] * (capE === 1 ? Math.max(Avail[p], 1e-9) : Math.pow(Math.max(Avail[p], 1e-9), capE));
          const got = waterFill(candidates, wgt, Avail, out, nP);
          if (got <= 0) continue;
          applyAdmit(o, c, got, false);
          if (hasLand(o)) landPool[o] = Math.max(0, landPool[o] - got * cost);
          else if (!relax.transport) airPool = Math.max(0, airPool - (got * cost) / (M.origins[o].airFactor === undefined ? 1 : M.origins[o].airFactor));
          if (!relax.coord) coordPool = Math.max(0, coordPool - got);
        }
      }

      /* 6. Accounting. */
      let wTotal = 0;
      for (let ia = 0; ia < nA; ia++) for (let c = 0; c < NL; c++) { wTotal += W[active[ia]][c]; if (rec) daily.waitO[active[ia]][t] += W[active[ia]][c]; }
      waitArea += wTotal;
      let careTotal = 0;
      for (let c = 0; c < NL; c++) {
        let lc = 0;
        for (let p = 0; p < nP; p++) {
          const v = occ(c, p);
          lc += v; bedDaysProv[p] += v; blockedDays += B[c][p];
          if (rec) { daily.careP[c][t * nP + p] = v; daily.capP[c][t * nP + p] = Cap[c][p]; }
        }
        bedDaysLine[c] += lc; careTotal += lc;
        if (lc > peakLine[c]) peakLine[c] = lc;
        if (rec) { daily.lineCare[c][t] = lc; daily.lineCap[c][t] = sum(Cap[c], nP); }
      }
      for (let p = 0; p < nP; p++) {
        const genLoad = occ(L.TRAUMA, p) + occ(L.ICU, p) + occ(L.REHAB, p) * P.theta;
        const alv = damage[p] > 0 ? Math.max(0.05, 1 - damage[p] * (t < scnStart ? 0 : Math.exp(-(t - scnStart) / P.damageRecoveryDays))) : 1;
        const occP = M.occAll[p] / alv + (M.beds[p] > 0 ? genLoad / (M.beds[p] * alv) : 0);
        if (M.unit[p]) {
          if (occP > P.occSafe) { overSafeProvDays += 1; provOver[p] = 1; }
          if (occP > maxOccProv[p]) maxOccProv[p] = occP;
          if (occP > peakOcc) { peakOcc = occP; peakOccProv = p; }
        }
        const idleUse = r * M.authBeds[p] * Math.max(0, P.occSafe - M.occAuth[p]) * kappa;
        const beyond = occ(L.TRAUMA, p) - idleUse * (1 - P.theta) * P.capTrauma;
        if (beyond > 0) displacedBedDays += beyond;
        if (rec) {
          daily.occ[t][p] = occP;
          let lp = 0; for (let c = 0; c < NL; c++) lp += occ(c, p);
          daily.load[t][p] = lp;
        }
      }
      if (rec) { daily.arrivals[t] = arrivalsToday; daily.admitted[t] = admittedToday; daily.waiting[t] = wTotal; daily.inCare[t] = careTotal; let lc = 0; for (let c = 0; c < NL; c++) lc += lostLine[c]; daily.lost[t] = lc; daily.done[t] = completed; }

    }

    function applyAdmit(o, c, got, domestic) {
      for (let p = 0; p < nP; p++) {
        if (out[p] > 0) {
          O[c][0][p] += out[p];
          Avail[p] -= out[p];
          servedProv[p] += out[p];
          if (rec) { daily.flowOP[o][p] += out[p]; daily.admitPL[c][p] += out[p]; }
        }
      }
      W[o][c] -= got;
      servedLine[c] += got;
      admitLine[c] += got;
      servedOrigin[o] += got;
      if (domestic) domesticServed.n += got;
      admittedToday += got;
      if (rec) { daily.flows[o][today] += got; daily.flowOL[o][c] += got; }
    }
    function hasLand(o) { return (M.origins[o].landGates || []).length > 0; }
    function occ(c, p) { return O[c][0][p] + O[c][1][p] + O[c][2][p] + B[c][p]; }
    function occFill(c) {
      const a = O[c][0], b = O[c][1], d = O[c][2], e = B[c];
      for (let p = 0; p < nP; p++) occV[p] = a[p] + b[p] + d[p] + e[p];
    }
    function sum(a, n) { let s = 0; for (let i = 0; i < n; i++) s += a[i]; return s; }

    let waitingEnd = 0, inCareEnd = 0;
    for (let o = 0; o < nO; o++) for (let c = 0; c < NL; c++) waitingEnd += W[o][c];
    for (let c = 0; c < NL; c++) for (let p = 0; p < nP; p++) inCareEnd += occ(c, p);

    let arrivals = 0, lost = 0, servedForeign = 0, arrivalsForeign = 0;
    for (let c = 0; c < NL; c++) { arrivals += arrLine[c]; lost += lostLine[c]; }
    for (let o = 0; o < nO; o++) {
      if (o === domesticIdx) continue;
      servedForeign += servedOrigin[o]; arrivalsForeign += arrOrigin[o];
    }
    const admitted = sumArr(servedOrigin);
    const costUsd = bedDaysLine[L.ICU] * P.costIcu + bedDaysLine[L.TRAUMA] * P.costTrauma + bedDaysLine[L.DIAL] * P.costDial +
      bedDaysLine[L.ONCO] * P.costOnco + bedDaysLine[L.REHAB] * P.costRehab + bedDaysLine[L.STEP] * P.costStep;
    const revLost = displacedBedDays * P.commRevPerBedDay;
    const revMult = scn.commercialRevMult === undefined ? (scn.commercialMult === undefined ? 1 : scn.commercialMult) : scn.commercialRevMult;
    const revCrisis = (1 - revMult) * P.incomeHt * (T / DAY);
    const transportCost = servedForeign * P.costTransfer;
    const funded = (costUsd + transportCost) * P.funding;
    const net = funded - costUsd - transportCost - revLost;

    const res = {
      arrivals, arrivalsForeign, admitted, admittedForeign: servedForeign,
      coverage: arrivalsForeign > 0 ? servedForeign / arrivalsForeign : 0,
      lost, waitingEnd, inCareEnd, completed, inCareDeaths,
      meanWaitDays: arrivals > 0 ? waitArea / arrivals : 0,
      servedLine: Array.from(servedLine), arrLine: Array.from(arrLine), lostLine: Array.from(lostLine),
      servedOrigin: Array.from(servedOrigin), arrOrigin: Array.from(arrOrigin), lostOrigin: Array.from(lostOrigin),
      servedProv: Array.from(servedProv), bedDaysLine: Array.from(bedDaysLine), bedDaysProv: Array.from(bedDaysProv),
      admitLine: Array.from(admitLine), peakLine: Array.from(peakLine), capEnd: Array.from(capEnd), provincesOverSafe: provOver.reduce((a, b) => a + b, 0), overSafeProvDays,
      peakOcc, peakOccProv: peakOccProv >= 0 ? M.prov[peakOccProv].name : null, maxOccProv: Array.from(maxOccProv),
      blockedDays, internalMoves, displacedBedDays, costUsd, transportCost, revLost, revCrisis, funded, net,
      domesticServed: domesticServed.n,
    };
    if (rec) res.daily = daily;
    return res;
  }

  function sumArr(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }

  function quantile(sorted, q) {
    const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
  }

  /* Monte Carlo over parameter uncertainty and Poisson referral noise. */
  function monteCarlo(M, scn, runs, fixed, opt) {
    opt = opt || {};
    const seed = opt.seed === undefined ? 20261113 : opt.seed;
    const rng = mulberry32(seed);
    const keys = opt.keys || ['arrivalsForeign', 'admittedForeign', 'coverage', 'lost', 'waitingEnd', 'meanWaitDays', 'peakOcc', 'provincesOverSafe', 'displacedBedDays', 'costUsd', 'transportCost', 'revLost', 'revCrisis', 'funded', 'net', 'blockedDays', 'admitted', 'completed', 'inCareDeaths'];
    const store = Object.fromEntries(keys.map((k) => [k, new Float64Array(runs)]));
    const lineA = LINES.map(() => new Float64Array(runs));
    const provA = M.prov.map(() => new Float64Array(runs));
    for (let i = 0; i < runs; i++) {
      const P = sampleParams(M, rng, fixed);
      const res = simulate(M, P, scn, { T: opt.T, seed: Math.floor(rng() * 2147483647) });
      for (const k of keys) store[k][i] = res[k];
      for (let c = 0; c < NL; c++) lineA[c][i] = res.servedLine[c];
      for (let p = 0; p < M.nP; p++) provA[p][i] = res.servedProv[p];
    }
    const summarize = (arr) => {
      const s = Float64Array.from(arr).sort();
      let m = 0; for (let j = 0; j < s.length; j++) m += s[j];
      return { mean: m / s.length, p5: quantile(s, 0.05), p50: quantile(s, 0.5), p95: quantile(s, 0.95) };
    };
    const out = {};
    for (const k of keys) out[k] = summarize(store[k]);
    out.servedLine = lineA.map(summarize);
    out.servedProv = provA.map(summarize);
    out.runs = runs;
    return out;
  }


  /* ---- City potential: TOPSIS over normalised health, tourism, access and presence indicators ---- */
  function scoreServices(M, groupWeights) {
    const gw = groupWeights || {};
    const nP = M.nP, inds = M.indicators, out = {};
    for (const sv of M.services) {
      const keys = inds.filter((k) => (sv.weights[k.key] || 0) > 0);
      const w = keys.map((k) => sv.weights[k.key] * (gw[k.group] === undefined ? 1 : gw[k.group]));
      const tw = w.reduce((a, b) => a + b, 0) || 1;
      for (let j = 0; j < w.length; j++) w[j] /= tw;
      const ideal = keys.map(() => -Infinity), anti = keys.map(() => Infinity);
      for (let p = 0; p < nP; p++) keys.forEach((k, j) => {
        const v = (M.prov[p].ind[k.key] || 0) * w[j];
        if (v > ideal[j]) ideal[j] = v;
        if (v < anti[j]) anti[j] = v;
      });
      const c = new Float64Array(nP);
      let mx = 0;
      for (let p = 0; p < nP; p++) {
        let dp = 0, dn = 0;
        keys.forEach((k, j) => {
          const v = (M.prov[p].ind[k.key] || 0) * w[j];
          dp += (v - ideal[j]) ** 2; dn += (v - anti[j]) ** 2;
        });
        dp = Math.sqrt(dp); dn = Math.sqrt(dn);
        c[p] = dp + dn > 0 ? dn / (dp + dn) : 0;
        if (c[p] > mx) mx = c[p];
      }
      if (mx > 0) for (let p = 0; p < nP; p++) c[p] /= mx;
      out[sv.key] = { score: c, keys: keys.map((k) => k.key), weights: w };
    }
    return out;
  }

  const LEVEL_GAIN = [0, 0.25, 0.6, 1];

  function realised(h) { return 1 - Math.exp(-h / 3); }
  function demandShift(h) { return 1 - Math.exp(-h / 8); }

  /* Applies a forward-looking plan: horizon growth, city marks, exclusions, manual edits, corridor changes. */
  function applyPlan(M0, plan) {
    plan = plan || {};
    const marks = plan.marks || {}, off = plan.off || {}, edits = plan.edits || {}, access = plan.access || {};
    const H = plan.horizon || 0, yearMode = !!plan.yearMode;
    const nMarks = Object.keys(marks).length, nOff = Object.keys(off).length, nEd = Object.keys(edits).length, nAc = Object.keys(access).length;
    if ((!H || yearMode) && !nMarks && !nOff && !nEd && !nAc) return M0;
    const nP = M0.nP, M = Object.assign({}, M0);
    const grow = (key, rate) => Float64Array.from(M0[key], (v, p) => v * Math.pow(1 + rate(p), H));
    const tr = (p) => Math.max(-0.01, Math.min(0.06, M0.prov[p].bedTrend === undefined ? 0.01 : M0.prov[p].bedTrend));
    const hotelG = plan.hotelGrowth === undefined ? 0.02 : plan.hotelGrowth;
    const htG = plan.htGrowth === undefined ? 0.05 : plan.htGrowth;
    if (H && !yearMode) {
      M.authBeds = grow('authBeds', tr); M.authIcu = grow('authIcu', tr); M.ftrBeds = grow('ftrBeds', tr);
      M.dialSlots = grow('dialSlots', tr); M.oncSlots = grow('oncSlots', tr); M.hotel = grow('hotel', () => hotelG);
    }
    M.extra = LINES.map(() => new Float64Array(nP));
    M.visOverride = new Uint8Array(nP);
    M.specExtra = {};
    const scores = M0.services.length ? scoreServices(M0, plan.groupWeights) : {};
    const realism = plan.realism === undefined ? 0.7 : plan.realism;
    const conv = M0.meta.conversion || {}, ref = M0.meta.refAdd || {};
    const f = H ? realised(H) : 0;
    const boost = new Float64Array(nP);
    for (const pid in marks) {
      const p = M0.provIndex[+pid];
      if (p === undefined) continue;
      for (const key in marks[pid]) {
        const lv = marks[pid][key];
        if (!lv) continue;
        M.visOverride[p] = 1;
        if (!M.unit[p]) continue;
        const sc = scores[key] ? scores[key].score[p] : 0.5;
        const q = 1 - realism + realism * sc;
        const row = conv[key] || {};
        for (const line in row) {
          const c = L[line];
          M.extra[c][p] += LEVEL_GAIN[lv] * q * f * row[line] * (ref[line] || 0);
        }
        const svc = M0.services.find((x) => x.key === key);
        if (svc && svc.spec && svc.spec.ref) {
          if (!M.specExtra[svc.spec.key]) M.specExtra[svc.spec.key] = new Float64Array(nP);
          M.specExtra[svc.spec.key][p] += LEVEL_GAIN[lv] * q * f * svc.spec.ref;
        }
      }
    }
    for (const pid in edits) {
      const p = M0.provIndex[+pid];
      if (p === undefined) continue;
      for (const line in edits[pid]) M.extra[L[line]][p] += edits[pid][line];
    }
    if (nOff) {
      M.mask = new Uint8Array(nP).fill(1);
      for (const pid in off) if (off[pid]) { const p = M0.provIndex[+pid]; if (p !== undefined) M.mask[p] = 0; }
    }
    if (nAc) M.origins = M0.origins.map((o) => (o.id in access ? Object.assign({}, o, { access: access[o.id] }) : o));
    if (H || nMarks) {
      const fc = commercialForecast(M0, plan, scores);
      M.htShare = Float64Array.from(fc.share);
      const tot = M0.commInpBeds.reduce((a, b) => a + b, 0) * (yearMode ? 1 : Math.pow(1 + htG, H));
      M.commInpBeds = Float64Array.from(fc.share, (v) => tot * v);
      M.commIcu = Float64Array.from(M.commInpBeds, (v) => v * (M0.meta.htIcuShare || 0));
    }
    return M;
  }

  /* Distribution of paying patients across provinces and services under a plan. */
  function commercialForecast(M0, plan, scoresIn) {
    plan = plan || {};
    const marks = plan.marks || {}, nP = M0.nP, H = plan.horizon || 0;
    const scores = scoresIn || (M0.services.length ? scoreServices(M0, plan.groupWeights) : {});
    const today = Array.from(M0.htShare);
    const phi = H ? demandShift(H) : 0;
    const markGain = plan.markDemand === undefined ? 1.5 : plan.markDemand;
    const res = new Float64Array(nP);
    const byService = {};
    for (const sv of M0.services) {
      const a = new Float64Array(nP);
      let sum = 0;
      for (let p = 0; p < nP; p++) {
        const lv = (marks[M0.prov[p].id] || {})[sv.key] || 0;
        // Path dependence: a city's future share grows from what it already has, scaled by its potential for this service.
        const base = Math.pow(today[p] + 0.001, 0.7) * Math.pow(scores[sv.key].score[p], 1.5);
        a[p] = base * (1 + markGain * LEVEL_GAIN[lv]) + (lv ? 0.002 * LEVEL_GAIN[lv] : 0);
        sum += a[p];
      }
      if (sum > 0) for (let p = 0; p < nP; p++) a[p] /= sum;
      byService[sv.key] = a;
      for (let p = 0; p < nP; p++) res[p] += sv.mix * a[p];
    }
    const share = new Float64Array(nP);
    let tot = 0;
    for (let p = 0; p < nP; p++) { share[p] = (1 - phi) * today[p] + phi * res[p]; tot += share[p]; }
    if (tot > 0) for (let p = 0; p < nP; p++) share[p] /= tot;
    const N0 = M0.meta.nHt || 0, rev = M0.meta.revPerPatient || 0;
    const g = plan.htGrowth === undefined ? 0.05 : plan.htGrowth;
    const N = plan.payingN === undefined ? N0 * Math.pow(1 + g, H) : plan.payingN;
    return { share: Array.from(share), today, patients: Array.from(share, (v) => v * N), patientsToday: today.map((v) => v * N0), revenue: N * rev, revenueToday: N0 * rev, byService, N, N0 };
  }


  /* ---- Course of the years: the system in a calendar year ---- */
  const DATA_YEAR = 2024;
  const PATHS = ['current', 'planned', 'ambitious'];
  const STOCK_KEYS = ['authBeds', 'authIcu', 'dialSlots', 'oncSlots', 'ftrBeds', 'thermal', 'hotel'];

  function tableAt(tbl, y) {
    if (y <= tbl[0][0]) return tbl[0][1];
    for (let i = 1; i < tbl.length; i++) if (y <= tbl[i][0]) { const a = tbl[i - 1], b = tbl[i]; return a[1] + ((b[1] - a[1]) * (y - a[0])) / (b[0] - a[0]); }
    return tbl[tbl.length - 1][1];
  }
  /* Number of years of full growth that h years of damped growth amount to. */
  function dampedYears(h, phi) { if (h <= 0) return 0; return phi >= 1 ? h : (phi * (1 - Math.pow(phi, h))) / (1 - phi); }
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  /* Domestic inpatient demand in a year, relative to the data year. */
  function demandIndex(M0, P, y) {
    const o = M0.meta.outlook, a = tableAt(o.age65, y) / 100, a0 = tableAt(o.age65, DATA_YEAR) / 100, r = P.ageBedRatio;
    return (tableAt(o.pop, y) / tableAt(o.pop, DATA_YEAR)) * ((1 - a + r * a) / (1 - a0 + r * a0)) * Math.pow(1 - P.stayDecline, Math.max(0, y - DATA_YEAR));
  }
  function pathSettings(path, P) {
    if (path === 'planned') return { units: P.unitsPlanned, cert: P.certPlanned, rt: P.rtPlanned, rehab: P.rehabPlanned };
    if (path === 'ambitious') return { units: P.unitsAmbitious, cert: P.certAmbitious, rt: P.rtAmbitious, rehab: P.rehabAmbitious };
    return { units: 0, cert: 0, rt: 0, rehab: 0 };
  }
  /* Provinces without a unit, most ready first. Very small provinces are left out. */
  function unitQueue(M0, P) {
    const sc = scoreServices(M0), keys = Object.keys(sc), mean = (p) => keys.reduce((a, k) => a + sc[k].score[p], 0) / (keys.length || 1);
    const rows = [];
    for (let p = 0; p < M0.nP; p++) if (!M0.unit[p] && M0.prov[p].specialists >= P.unitMinSpecialists) rows.push([p, mean(p)]);
    return rows.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  }
  /* Year in which each queued province opens a unit under a path. */
  function unitSchedule(M0, P, path) {
    const out = new Map(), n = pathSettings(path, P).units;
    if (!n) return out;
    unitQueue(M0, P).forEach((p, k) => { const y = P.unitStartYear + Math.floor(k / n); if (y <= P.outlookEnd) out.set(p, y); });
    return out;
  }
  /* A development programme moves the response part of the way to a prepared national plan. Settings the user has fixed stay as they are. */
  const RESPONSE_TARGET = { kappa: 0.45, eta: 1, fastTrack: 2, airSlots: 120, landSlotsPerGate: 100, coordCases: 500, rampDays: 5, ptMobil: 0.1 };
  function yearParams(P, year, path, keep) {
    const share = path === 'planned' ? P.responsePlanned : path === 'ambitious' ? P.responseAmbitious : 0;
    if (!share) return P;
    const t = clamp01((year - P.programmeStart) / (P.programmeEnd - P.programmeStart)), Q = Object.assign({}, P);
    for (const k in RESPONSE_TARGET) if (!keep || !(k in keep)) Q[k] = P[k] + (RESPONSE_TARGET[k] - P[k]) * share * t;
    return Q;
  }
  function yearModel(M0, year, path, P, user) {
    user = user || {};
    const nP = M0.nP, o = M0.meta.outlook, s = pathSettings(path, P), dy = dampedYears(year - DATA_YEAR, P.phiTrend), D = demandIndex(M0, P, year);
    const M = Object.assign({}, M0, { year, path });
    const t = clamp01((year - P.programmeStart) / (P.programmeEnd - P.programmeStart));
    const fBed = M0.prov.map((q) => Math.pow(1 + q.trendBeds, dy)), fIcu = M0.prov.map((q) => Math.pow(1 + q.trendIcu, dy)), fSpec = M0.prov.map((q) => Math.pow(1 + q.trendSpec, dy));
    const when = unitSchedule(M0, P, path), unit = Uint8Array.from(M0.unit), ramp = new Float64Array(nP).fill(1), opened = new Int16Array(nP), cs = new Float64Array(nP);
    for (let p = 0; p < nP; p++) {
      const q = M0.prov[p], c0 = q.certShare || 0;
      if (M0.unit[p]) { cs[p] = c0 + Math.max(0, s.cert - c0) * t; continue; }
      const y0 = when.get(p);
      if (y0 !== undefined && y0 <= year) { unit[p] = 1; opened[p] = y0; ramp[p] = clamp01((year - y0 + 1) / P.unitRampYears); cs[p] = 1 / Math.max(1, q.hospitals); }
    }
    for (const id in user.unit || {}) {
      const p = M0.provIndex[+id];
      if (p !== undefined && user.unit[id] && !unit[p]) { unit[p] = 1; opened[p] = -1; ramp[p] = 1; cs[p] = 1 / Math.max(1, M0.prov[p].hospitals); }
    }
    const certScale = (p) => { const c0 = M0.prov[p].certShare || 0; return c0 > 0 ? cs[p] / c0 : 0; };
    const sc = M0.meta.scales || {};
    const arr = (fn) => Float64Array.from({ length: nP }, (_, p) => fn(p));
    M.unit = unit; M.opened = opened; M.cs = cs; M.ramp = ramp;
    M.beds = arr((p) => M0.beds[p] * fBed[p]);
    M.authBeds = arr((p) => (M0.unit[p] ? M0.authBeds[p] * certScale(p) : (sc.authBedsPerCertBed || 0) * cs[p] * M0.beds[p]) * fBed[p] * ramp[p]);
    M.authIcu = arr((p) => (M0.unit[p] ? M0.authIcu[p] * certScale(p) : (sc.authIcuPerCertBed || 0) * cs[p] * M0.prov[p].icuBeds) * fIcu[p] * ramp[p]);
    M.occAuth = arr((p) => Math.min(P.occCeiling, (M0.occAuth[p] * D) / fBed[p]));
    M.occAll = arr((p) => Math.min(P.occCeiling, (M0.occAll[p] * D) / fBed[p]));
    let icu0 = 0, icu1 = 0, sp0 = 0, sp1 = 0;
    for (let p = 0; p < nP; p++) { const q = M0.prov[p]; icu0 += q.icuBeds; icu1 += q.icuBeds * fIcu[p]; sp0 += q.specialists; sp1 += q.specialists * fSpec[p]; }
    M.occIcuMult = (D * icu0) / icu1;
    M.staffMult = sp1 / sp0;
    M.dialSlots = arr((p) => M0.dialSlots[p] * fBed[p] * ramp[p]);
    const rtProg = 1 + (s.rt ? (s.rt / P.rtDevicesBase - 1) * t : 0);
    M.oncSlots = arr((p) => M0.oncSlots[p] * Math.max(fSpec[p], rtProg) * ramp[p]);
    const ftrNew = year >= o.ftrAdded.year && M0.provIndex[o.ftrAdded.province] !== undefined ? M0.provIndex[o.ftrAdded.province] : -1;
    M.ftrBeds = arr((p) => (M0.ftrBeds[p] * fSpec[p] + (p === ftrNew ? o.ftrAdded.beds : 0)) * (1 + s.rehab * t) * ramp[p]);
    M.hotel = arr((p) => M0.hotel[p] * Math.pow(1 + P.hotelTrend, dy));
    M.thermal = Float64Array.from(M0.thermal);
    const nRatio = Math.pow(1 + P.payingGrowth, dampedYears(year - o.payingBaseYear, P.phiTrend));
    M.commInpBeds = arr((p) => M0.commInpBeds[p] * nRatio);
    M.commIcu = arr((p) => M0.commIcu[p] * nRatio);
    M.payingPatients = (M0.meta.nHt || 0) * nRatio;
    M.demandIndex = D;
    for (const id in user.stock || {}) {
      const p = M0.provIndex[+id];
      if (p === undefined) continue;
      for (const k in user.stock[id]) {
        if (!STOCK_KEYS.includes(k)) continue;
        const d = user.stock[id][k];
        M[k] = Float64Array.from(M[k]);
        M[k][p] = Math.max(0, M[k][p] + d);
        if (k === 'authBeds') { M.beds = Float64Array.from(M.beds); M.beds[p] = Math.max(1, M.beds[p] + d); }
      }
    }
    return M;
  }

  /* ---- Needs lens: reads the care lines as the needs described in the literature ---- */

  /* Share of each care line's direct referrals that belongs to each need, for this scenario. */
  function needMix(M, P, scn, T) {
    const N = M.services, nN = N.length, A = N.map(() => new Float64Array(NL));
    const core = Object.assign({}, P, { extendedNeeds: 0 });
    const idx = (k) => N.findIndex((x) => x.key === k);
    for (const ev of scn.events) {
      const lam = buildArrivals(M, core, { events: [ev] }, T);
      for (let o = 0; o < M.nO; o++) {
        if (!lam[o]) continue;
        for (let c = 0; c < NL; c++) {
          let s = 0;
          for (let t = 0; t < T; t++) s += lam[o][c][t];
          if (s <= 0) continue;
          for (let n = 0; n < nN; n++) A[n][c] += s * (((N[n].shares || {})[ev.type] || {})[LINES[c]] || 0);
        }
      }
      if (P.extendedNeeds && ev.type === 'conflict' && ev.cancerPatients) {
        let w = 0;
        for (const iso in ev.origins) if (M.originIndex[iso] !== undefined) w += ev.origins[iso];
        const base = ev.cancerPatients * w * P.chronicLoss * (ev.exportMult === undefined ? 1 : ev.exportMult), h = idx('heart'), g = idx('congenital'), b = idx('blood'), e = idx('eye');
        if (e >= 0) A[e][L.TRAUMA] += base * P.xEye;
        if (h >= 0) { A[h][L.ICU] += base * P.xHeart * 0.2; A[h][L.TRAUMA] += base * P.xHeart * 0.8; }
        if (g >= 0) { A[g][L.ICU] += base * P.xCongenital * 0.1; A[g][L.TRAUMA] += base * P.xCongenital * 0.9; }
        if (b >= 0) A[b][L.ONCO] += base * P.xBlood;
      }
    }
    const phi = N.map(() => new Float64Array(NL));
    for (let c = 0; c < NL; c++) {
      let s = 0;
      for (let n = 0; n < nN; n++) s += A[n][c];
      if (s > 0) for (let n = 0; n < nN; n++) phi[n][c] = A[n][c] / s;
    }
    return phi;
  }

  /* Divides each province's admissions on one line among needs, so that province and need totals both hold. */
  function splitLine(rows, targets, seeds, nP) {
    const nN = targets.length, x = targets.map(() => new Float64Array(nP));
    for (let n = 0; n < nN; n++) if (targets[n] > 0) for (let p = 0; p < nP; p++) x[n][p] = rows[p] > 0 ? seeds[n][p] * rows[p] : 0;
    for (let it = 0; it < 25; it++) {
      for (let n = 0; n < nN; n++) {
        if (!(targets[n] > 0)) continue;
        let s = 0;
        for (let p = 0; p < nP; p++) s += x[n][p];
        if (s > 0) { const k = targets[n] / s; for (let p = 0; p < nP; p++) x[n][p] *= k; }
      }
      for (let p = 0; p < nP; p++) {
        let s = 0;
        for (let n = 0; n < nN; n++) s += x[n][p];
        if (s > 0) { const k = rows[p] / s; for (let n = 0; n < nN; n++) x[n][p] *= k; }
      }
    }
    return x;
  }

  function needLens(M, P, scn, res, scores) {
    const N = M.services, nN = N.length, d = res.daily, T = d ? d.inCare.length : 365, nP = M.nP;
    const phi = needMix(M, P, scn, T);
    const rows = N.map((n, i) => {
      let referred = 0, admitted = 0;
      for (let c = 0; c < NL; c++) { referred += res.arrLine[c] * phi[i][c]; admitted += res.admitLine[c] * phi[i][c]; }
      return { key: n.key, referred, admitted, peak: 0, careDays: 0, capacity: null, coverage: null };
    });
    let byProv = null;
    if (d) {
      for (let i = 0; i < nN; i++) {
        let peak = 0, days = 0;
        for (let t = 0; t < T; t++) {
          let v = 0;
          for (let c = 0; c < NL; c++) v += d.lineCare[c][t] * phi[i][c];
          days += v;
          if (v > peak) peak = v;
        }
        rows[i].peak = peak; rows[i].careDays = days;
      }
      const sc = scores || scoreServices(M);
      const seeds = N.map((n) => Array.from(sc[n.key].score, (v) => v * v + 0.01));
      byProv = N.map(() => new Float64Array(nP));
      for (let c = 0; c < NL; c++) {
        const totalLine = sumArr(d.admitPL[c]);
        if (totalLine <= 0) continue;
        const x = splitLine(d.admitPL[c], N.map((_, i) => totalLine * phi[i][c]), seeds, nP);
        for (let i = 0; i < nN; i++) for (let p = 0; p < nP; p++) byProv[i][p] += x[i][p];
      }
    }
    // Specialised units against the peak number of patients in care.
    let limited = 0;
    N.forEach((n, i) => {
      const r = rows[i];
      let cov = 1;
      if (n.spec && M.specCap[n.spec.key]) {
        const extra = M.specExtra && M.specExtra[n.spec.key];
        let cap = 0;
        for (let p = 0; p < nP; p++) cap += M.specCap[n.spec.key][p] * (n.spec.idle === undefined ? P.specIdle : n.spec.idle) + (extra ? extra[p] : 0);
        r.capacity = cap;
        if (d && r.peak > 0) { r.coverage = cap / r.peak; cov = Math.min(1, r.coverage); }
      }
      limited += r.admitted * cov;
    });
    return { phi, rows, byProv, limited };
  }

  /* Routine care that grows when a conflict lasts: patients from the affected country who travel for ordinary treatment. */
  function routineCare(M, P, scn, T) {
    const base = (M.meta && M.meta.routineBase) || {}, byOrigin = {};
    let patients = 0;
    for (const ev of scn.events) {
      if (ev.type !== 'conflict') continue;
      const days = Math.min(ev.duration || T, T - (ev.start || 0)), share = Math.max(0, days - P.routineDelay) / DAY;
      for (const iso in ev.origins) {
        const v = (base[iso] || 0) * ev.origins[iso] * P.routineUplift * share;
        if (v > 0) { byOrigin[iso] = (byOrigin[iso] || 0) + v; patients += v; }
      }
    }
    return { patients, byOrigin, revenue: patients * ((M.meta && M.meta.revPerPatient) || 0) };
  }

  /* ---- Hypothetical crises built from one common set of country parameters ---- */
  function capacityGap(c, P) {
    const g = Math.pow(P.refBeds / Math.max(0.05, c.beds), P.gapExponent);
    return Math.max(P.gapMin, Math.min(P.gapMax, g));
  }

  /* c: a country from data/countries.json. spec: { type: quake|conflict|epidemic, level: limited|major|extreme, months }. */
  function crisisEvent(c, spec, P) {
    const lv = (spec.level || 'major').replace(/^./, (x) => x.toUpperCase()), mio = c.pop / 1e6;
    const base = { start: 0, origins: { [c.id]: 1 }, exportMult: capacityGap(c, P) };
    if (spec.type === 'quake') return Object.assign(base, { type: 'disaster', injured: Math.min(P['quakeInjured' + lv], P.quakeInjuredCap * c.pop) });
    if (spec.type === 'conflict') {
      const affected = Math.min(1, P['conflictAffected' + lv] / c.pop) * mio, days = Math.round(((spec.months || 12) * 365) / 12);
      return Object.assign(base, {
        type: 'conflict', injuredPerDay: Math.min(P['conflictInjured' + lv], (P.conflictInjuredCap * c.pop) / 365), duration: days,
        dialysisPatients: affected * P.dialysisPerMillion * (c.diabetes / P.refDiabetes),
        cancerPatients: affected * P.cancerPerMillion * Math.pow(c.age65 / P.refAge65, P.ageExponent),
      });
    }
    return Object.assign(base, { type: 'epidemic', critical: mio * P['epiCritical' + lv], duration: 150, dialysisPatients: mio * P.epiDialysisPerMillion * (c.diabetes / P.refDiabetes) });
  }

  /* Share of aircraft time that long flights leave for medical transfers. */
  function airFactor(flightHours, P) { return Math.min(1, P.rotationHours / (2 * flightHours + 4)); }

  /* The model's own forecast: for each service the six best-rated cities, at falling levels. */
  function topPicks(M, scores) {
    const levels = [3, 2, 2, 1, 1, 1], marks = {};
    for (const sv of M.services) {
      const sc = scores[sv.key].score;
      const idx = Array.from(sc.keys()).sort((a, b) => sc[b] - sc[a]).slice(0, levels.length);
      idx.forEach((p, k) => { const id = M.prov[p].id; if (!marks[id]) marks[id] = {}; marks[id][sv.key] = levels[k]; });
    }
    return marks;
  }

  /* Plain reasons for placement of one origin's patients in one province. */
  function explainLink(M, P, res, o, p) {
    const h = M.hours[o][p];
    const gravity = Math.exp(-h / P.tauHours);
    const f = res.daily ? res.daily.flowOP[o] : null;
    let tot = 0, best = 0;
    const rankH = 1 + M.hours[o].reduce((a, v) => a + (v < h ? 1 : 0), 0);
    if (f) for (let i = 0; i < M.nP; i++) { tot += f[i]; if (f[i] > best) best = f[i]; }
    return { hours: h, gravity, rankHours: rankH, patients: f ? f[p] : 0, share: tot > 0 && f ? f[p] / tot : 0 };
  }

  return { yearModel, yearParams, RESPONSE_TARGET, demandIndex, unitQueue, unitSchedule, dampedYears, tableAt, pathSettings, cityPlaces, capacityOf, PATHS, STOCK_KEYS, DATA_YEAR, capacityGap, crisisEvent, airFactor, LINES, L, K, LEVEL_GAIN, realised, demandShift, scoreServices, topPicks, needMix, needLens, routineCare, applyPlan, commercialForecast, explainLink, compile, baseParams, sampleParams, simulate, monteCarlo, buildArrivals, mulberry32, pert, haversine, quantile };
});
