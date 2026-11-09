// Forecast layer results: city potential by service and the effect of the model's own picks.
// Usage: node analysis/run_forecast.js data/model.json results
const fs = require('fs'), path = require('path');
const H = require('../src/engine.js');
const [, , modelPath, outDir] = process.argv;
const data = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
const M = H.compile(data), base = H.baseParams(M), scores = H.scoreServices(M), picks = H.topPicks(M, scores);
const out = { generated: new Date().toISOString(), horizons: [3, 5, 10], scenarios: {}, potential: {}, shareForecast: {} };
for (const scn of data.scenarios) {
  const r0 = H.simulate(M, base, scn, {});
  const row = { name: scn.name, none: r0.admittedForeign, referred: r0.arrivalsForeign, picks: {}, growthOnly: {} };
  for (const h of out.horizons) {
    row.growthOnly[h] = H.simulate(H.applyPlan(M, { horizon: h }), base, scn, {}).admittedForeign;
    row.picks[h] = H.simulate(H.applyPlan(M, { horizon: h, marks: picks }), base, scn, {}).admittedForeign;
  }
  out.scenarios[scn.id] = row;
  console.log(scn.id.padEnd(11), 'none', Math.round(row.none), 'growth 5y', Math.round(row.growthOnly[5]), 'picks 5y', Math.round(row.picks[5]));
}
// Needs: referred, admitted and peak in care for the core run and with heart, congenital, blood and eye disease added.
const row = ['scenario', 'run', 'need', 'layer', 'referred', 'admitted', 'peak_in_care', 'care_days'];
const needRows = [row.join(',')];
out.needs = {};
for (const scn of data.scenarios) {
  out.needs[scn.id] = {};
  for (const [label, P] of [['core', base], ['all_needs', { ...base, extendedNeeds: 1 }]]) {
    const r = H.simulate(M, P, scn, { record: true }), L = H.needLens(M, P, scn, r, scores);
    out.needs[scn.id][label] = { admittedForeign: r.admittedForeign, arrivalsForeign: r.arrivalsForeign, costUsd: r.costUsd + r.transportCost, rows: L.rows };
    L.rows.forEach((x, i) => { if (x.referred >= 0.5) needRows.push([scn.id, label, x.key, M.services[i].layer, x.referred.toFixed(1), x.admitted.toFixed(1), x.peak.toFixed(1), x.careDays.toFixed(0)].join(',')); });
  }
}
fs.writeFileSync(path.join(outDir, 'needs_by_scenario.csv'), needRows.join('\n') + '\n');
// Potential in three parts: how many could be treated, how many at the share observed in one documented evacuation programme, and who pays.
const OBSERVED_SHARE = 430 / 4895;
const scaled = (scn, f) => { const b = JSON.parse(JSON.stringify(scn)); b.events.forEach((e) => { for (const k in e.origins) if (k !== 'TUR') e.origins[k] *= f; }); return b; };
const potRows = ['scenario,referred,could_be_treated,treated_at_observed_share,care_and_transfer_usd,paid_international,paid_origin_government,paid_patients_families,paid_turkiye,companions,companion_nights,companion_lodging_usd,routine_patients,routine_usd'];
out.potentialByScenario = {};
for (const scn of data.scenarios) {
  const r = H.simulate(M, base, scn, { record: true }), g = H.simulate(M, base, scaled(scn, OBSERVED_SHARE), {});
  const total = r.costUsd * (r.admitted > 0 ? r.admittedForeign / r.admitted : 1) + r.transportCost, host = Math.max(0, 1 - base.funding - base.payOrigin - base.payFamily);
  const companions = r.admittedForeign * base.companionsPerPatient;
  const nights = r.bedDaysLine.reduce((a, b) => a + b, 0) * base.companionsPerPatient * (r.arrivalsForeign ? r.admittedForeign / Math.max(r.admitted, 1) : 1);
  const routine = H.routineCare(M, base, scn, 365);
  out.potentialByScenario[scn.id] = { name: scn.name, referred: r.arrivalsForeign, couldBeTreated: r.admittedForeign, treatedAtObservedShare: g.admittedForeign, observedShare: OBSERVED_SHARE, careAndTransferUsd: total, companions, companionNights: nights, routinePatients: routine.patients, routineUsd: routine.revenue };
  potRows.push([scn.id, r.arrivalsForeign.toFixed(0), r.admittedForeign.toFixed(0), g.admittedForeign.toFixed(0), total.toFixed(0), (total * base.funding).toFixed(0), (total * base.payOrigin).toFixed(0), (total * base.payFamily).toFixed(0), (total * host).toFixed(0), companions.toFixed(0), nights.toFixed(0), (nights * base.companionNightUsd).toFixed(0), routine.patients.toFixed(0), routine.revenue.toFixed(0)].join(','));
}
fs.writeFileSync(path.join(outDir, 'potential_by_scenario.csv'), potRows.join('\n') + '\n');
for (const sv of M.services) {
  const sc = scores[sv.key].score, idx = Array.from(sc.keys()).sort((a, b) => sc[b] - sc[a]).slice(0, 10);
  out.potential[sv.key] = { label: sv.label, top: idx.map((p) => ({ city: M.prov[p].name, score: +sc[p].toFixed(3) })) };
}
for (const h of [0].concat(out.horizons)) {
  const fc = H.commercialForecast(M, { horizon: h }, scores), idx = Array.from(fc.share.keys()).sort((a, b) => fc.share[b] - fc.share[a]).slice(0, 10);
  out.shareForecast[h] = { patients: fc.N, revenue: fc.revenue, top: idx.map((p) => ({ city: M.prov[p].name, share: +fc.share[p].toFixed(4) })) };
}
fs.writeFileSync(path.join(outDir, 'forecast.json'), JSON.stringify(out, null, 1));
const lines = ['service,rank,city,score'];
for (const k in out.potential) out.potential[k].top.forEach((c, i) => lines.push(`${k},${i + 1},${c.city},${c.score}`));
fs.writeFileSync(path.join(outDir, 'city_potential.csv'), lines.join('\n') + '\n');
