// Inlines the engine, interface, icons, model, map and text into one self-contained index.html.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
let html = rd('src/ui.template.html');
const engine = rd('src/engine.js');
const app = rd('src/app.js');
const icons = rd('data/icons.svg');
const model = JSON.parse(rd('data/model.json'));
const map = JSON.parse(rd('data/map.json'));
const levers = JSON.parse(rd('data/levers.json'));
const cities = JSON.parse(rd('data/cities.json'));
const foot = rd('src/foot.html');
const countries = JSON.parse(rd('data/countries.json'));
const tr = JSON.parse(rd('src/i18n_tr.json'));
// The page only offers scenarios the user builds. The reference scenarios stay in the batch analyses.
const turkey = model.origins.find((o) => o.id === 'TUR');
model.origins = [Object.assign({}, turkey, { name: 'Türkiye', tr: 'Türkiye' })];
delete model.scenarios; delete model.sweeps;
const data = {
  model, countries, tr, marmara: JSON.parse(rd('data/marmara.json')),
  map: { countries: map.countries.map((c) => ({ d: c.d, iso: c.iso })), provinces: map.provinces.map((p) => ({ id: p.id, name: p.name, d: p.d })) },
  levers, foot: { en: foot, tr: rd('src/foot_tr.html') }, cities,
};
const json = JSON.stringify(data).replace(/</g, '\\u003c');
html = html.replace('<!--__ICONS__-->', () => icons).replace('/*__ENGINE__*/', () => engine).replace('/*__DATA__*/null', () => json).replace('/*__APP__*/', () => app);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('index.html bytes', html.length);
