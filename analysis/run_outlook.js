// The course of the years, 2027 to 2047, for the reference scenarios under the three development paths.
// Usage: node analysis/run_outlook.js data/model.json results [runs]
const fs = require('fs'), path = require('path');
const H = require('../src/engine.js');
const [, , modelPath, outDir, runsArg] = process.argv;
const data = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
const M0 = H.compile(data), base = H.baseParams(M0), RUNS = +(runsArg || 300);
const YEARS = [2027, 2031, 2035, 2039, 2043, 2047], MC_YEARS = [2027, 2037, 2047], PERIODS = [[2027, 2031, 2029], [2032, 2038, 2035], [2039, 2047, 2043]];
const RANGES = { phiTrend: [0.8, 0.98], ageBedRatio: [3, 9], stayDecline: [0, 0.01], payingGrowth: [0, 0.06] };
const LIMITS = ['access', 'transport', 'coord', 'capacity', 'staff'];
const stateOf = (year, p, over) => { const P = H.yearParams(Object.assign({}, base, over || {}), year, p); return { M: H.yearModel(M0, year, p, P), P }; };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const out = { generated: new Date().toISOString(), runs: RUNS, years: YEARS, ranges: RANGES, drivers: {}, units: {}, scenarios: {} };
for (const p of H.PATHS) {
  out.units[p] = Array.from(H.unitSchedule(M0, base, p).entries()).sort((a, b) => a[1] - b[1]).map(([i, y]) => ({ province: M0.prov[i].name, year: y }));
  out.drivers[p] = YEARS.map((y) => { const { M } = stateOf(y, p); return { year: y, demandIndex: M.demandIndex, beds: sum(Array.from(M.beds)), authBeds: sum(Array.from(M.authBeds)), oncSlots: sum(Array.from(M.oncSlots)), ftrBeds: sum(Array.from(M.ftrBeds)), units: sum(Array.from(M.unit)), payingPatients: M.payingPatients }; });
}
const lines = ['scenario,path,year,admitted,referred,coverage,mean_wait_days,lost,provinces_over_safe,provinces_receiving,cov_p5,cov_p50,cov_p95'];
for (const scn of data.scenarios) {
  const row = { name: scn.name, paths: {}, periods: {}, parts: {} };
  for (const p of H.PATHS) {
    row.paths[p] = YEARS.map((y) => {
      const { M, P } = stateOf(y, p), r = H.simulate(M, P, scn, {});
      const cell = { year: y, admitted: r.admittedForeign, referred: r.arrivalsForeign, coverage: r.coverage, wait: r.meanWaitDays, lost: r.lost, over: r.provincesOverSafe, receiving: r.servedProv.filter((v) => v >= 1).length };
      if (MC_YEARS.includes(y)) {
        const rng = H.mulberry32(20261113 + y), cov = new Float64Array(RUNS);
        for (let i = 0; i < RUNS; i++) {
          const Q0 = H.sampleParams(M0, rng, null);
          for (const k in RANGES) Q0[k] = H.pert(rng, RANGES[k][0], base[k], RANGES[k][1]);
          const Q = H.yearParams(Q0, y, p), Mq = H.yearModel(M0, y, p, Q);
          cov[i] = H.simulate(Mq, Q, scn, { seed: Math.floor(rng() * 2147483647) }).coverage;
        }
        cov.sort();
        cell.mc = { p5: H.quantile(cov, 0.05), p50: H.quantile(cov, 0.5), p95: H.quantile(cov, 0.95) };
      }
      lines.push([scn.id, p, y, r.admittedForeign.toFixed(1), r.arrivalsForeign.toFixed(1), r.coverage.toFixed(4), r.meanWaitDays.toFixed(1), r.lost.toFixed(1), r.provincesOverSafe, cell.receiving, cell.mc ? cell.mc.p5.toFixed(4) : '', cell.mc ? cell.mc.p50.toFixed(4) : '', cell.mc ? cell.mc.p95.toFixed(4) : ''].join(','));
      return cell;
    });
    row.periods[p] = PERIODS.map(([a, b, y]) => {
      const { M, P } = stateOf(y, p), r = H.simulate(M, P, scn, {});
      const gains = Object.fromEntries(LIMITS.map((k) => [k, Math.max(0, H.simulate(M, P, scn, { relax: { [k]: true } }).admittedForeign - r.admittedForeign)]));
      return { from: a, to: b, year: y, gains };
    });
  }
  // What each part of a programme adds by 2047, compared with the current course.
  for (const [cap, key] of [['Planned', 'planned'], ['Ambitious', 'ambitious']]) {
    const y = 2047, cur = (() => { const { M, P } = stateOf(y, 'current'); return H.simulate(M, P, scn, {}).admittedForeign; })();
    const partOf = (keep) => { const o = {}; [['units', ['units']], ['cert', ['cert']], ['care', ['rt', 'rehab']], ['response', ['response']]].forEach(([part, names]) => { if (part !== keep) names.forEach((n) => { o[n + cap] = 0; }); }); return o; };
    row.parts[key] = Object.fromEntries(['units', 'cert', 'care', 'response'].map((part) => { const { M, P } = stateOf(y, key, partOf(part)); return [part, H.simulate(M, P, scn, {}).admittedForeign - cur]; }));
  }
  out.scenarios[scn.id] = row;
  console.log(scn.id, H.PATHS.map((p) => p + ' ' + row.paths[p].map((c) => (100 * c.coverage).toFixed(0)).join('/')).join(' | '));
}
fs.writeFileSync(path.join(outDir, 'outlook.json'), JSON.stringify(out));
fs.writeFileSync(path.join(outDir, 'outlook_by_year.csv'), lines.join('\n') + '\n');
console.log('written');
