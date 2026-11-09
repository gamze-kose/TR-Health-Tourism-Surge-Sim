// Lists every English string the interface can show and reports those missing from src/i18n_tr.json.
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const app = rd('src/app.js'), html = rd('src/ui.template.html');
const set = new Set(), add = (s) => { if (typeof s === 'string' && s.trim()) set.add(s); };
function literals(text) {
  const out = []; let i = 0;
  while (i < text.length) {
    const q = text[i];
    if (q === "'" || q === '"' || q === '`') { let j = i + 1, s = ''; while (j < text.length && text[j] !== q) { if (text[j] === '\\') { s += text[j + 1]; j += 2; } else { s += text[j]; j++; } } out.push(s); i = j + 1; } else i++;
  }
  return out;
}
// First argument of every T(...) call.
for (const m of app.matchAll(/\bT\(/g)) {
  let i = m.index + 2, depth = 0, q = null, start = i;
  for (; i < app.length; i++) {
    const c = app[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; continue; }
    if ('([{'.includes(c)) depth++;
    if (')]}'.includes(c)) { if (depth === 0) break; depth--; }
    if (c === ',' && depth === 0) break;
  }
  literals(app.slice(start, i)).filter((s) => !/^(tr|en)$/.test(s)).forEach(add);
}
// Labels held in constants.
const blocks = [/const LINE = \{[\s\S]*?\n\};/, /const PRESET = \{[\s\S]*?\n\};/, /const TYPES = \{[\s\S]*?\n\};/, /const PATHS = \{[\s\S]*?\n\};/];
blocks.forEach((b) => { for (const m of app.match(b)[0].matchAll(/\b(?:n|s|l|d|note): '((?:[^'\\]|\\.)*)'/g)) add(m[1].replace(/\\'/g, "'")); });
for (const m of app.match(/const STOCK = (\[[\s\S]*?\]\]);/)[1].matchAll(/\['\w+', '([^']+)', '[\w-]+', '([^']+)'\]/g)) { add(m[1]); add(m[2]); }
for (const name of ['LEVELS', 'EXITS', 'STARS', 'KIND_TRAVEL', 'BOARD', 'STEPS', 'LIMITS', 'PARTS']) { const m = app.match(new RegExp('const ' + name + ' = ([\\s\\S]*?);\\n')) || app.match(new RegExp('const ' + name + ' = ([\\s\\S]*?), BN')); literals(m[1]).filter((s) => /[A-Z]/.test(s[0] || '') && !/^(ok)$/.test(s)).forEach(add); }
['Hospital beds', 'Qualified beds', 'Intensive care beds', 'Bed occupancy, %', 'Specialist physicians', 'Nurses', 'Surgeries a year', 'Inpatients a year', 'Health capacity', 'Lodging and recovery', 'Access and transport', 'Health tourism already here', "How much a city's starting point limits your stars", 'At 0%, stars on a small city count as much as stars on İstanbul.', 'Growth of paying patients a year', 'Growth of hotel beds a year', 'Pull of a top rating on paying patients', 'Exit permits and access', 'Transport seats', 'Case coordinators', 'Bed and treatment capacity', 'Rehabilitation staff', 'Data', 'Literature', 'Derived', 'Assumption', 'Setting', 'Why here', 'Past years', 'Forecast', 'Code copied.', 'Link copied.', 'Your own settings'].forEach(add);
// Fixed page text.
for (const m of html.matchAll(/<(\w+)([^>]*\bdata-t\b[^>]*)>([^<]*)</g)) add(m[3].trim());
for (const m of html.matchAll(/data-ta="([^"]*)"/g)) add(m[1]);
for (const m of html.matchAll(/data-tp="([^"]*)"/g)) add(m[1]);
// Data.
const model = JSON.parse(rd('data/model.json')), levers = JSON.parse(rd('data/levers.json')), cities = JSON.parse(rd('data/cities.json'));
Object.values(model.params).forEach((q) => { if (q.label) { add(q.label); add(q.source); } });
model.services.forEach((n) => { add(n.label); add(n.short); add(n.why); add(n.care); add(n.bridge); (n.evidence || []).forEach((e) => add(e.t)); if (n.travel) { add(n.travel.when); add(n.travel.judge); } if (n.spec) add(n.spec.label); });
Object.values(model.groups).forEach(add); (model.stays || []).forEach((x) => { add(x.label); add(x.why); add(x.judge); }); add(model.notUsed);
(model.shareBasis || []).forEach((b) => { add(b.crisis); add(b.line); add(b.data); add(b.assumed); });
levers.forEach((g) => { add(g.group); g.items.forEach((l) => { add(l.label); add(l.hint); }); });
model.provinces.forEach((p) => add(p.region));
Object.values(cities.precedents).forEach((a) => a.forEach((x) => { add(x.e); add(x.r); add(x.u); }));
Object.values(cities.info).forEach((c) => { add(c.coast); (c.unesco || []).forEach(add); (c.ftr || []).forEach(add); (c.signals || []).forEach((x) => { add(x.t); add(x.s); }); (c.mentions || []).forEach((x) => add(x.t)); });
const all = [...set].sort(), tr = JSON.parse(rd('src/i18n_tr.json')), missing = all.filter((s) => tr[s] === undefined), bad = all.filter((s) => tr[s] !== undefined && ((s.match(/\{\w+\}/g) || []).sort().join() !== (tr[s].match(/\{\w+\}/g) || []).sort().join()));
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(all, null, 0));
console.log('strings', all.length, 'missing', missing.length, 'placeholder mismatches', bad.length);
if (process.argv[3] === 'show') { missing.slice(0, 60).forEach((s) => console.log('  ', s.slice(0, 110))); bad.slice(0, 30).forEach((s) => console.log('  BAD', s.slice(0, 110))); }
