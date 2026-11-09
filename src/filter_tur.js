const fs=require('fs');
const [,, inp, out]=process.argv;
const g=JSON.parse(fs.readFileSync(inp,'utf8'));
const f=g.features.filter(x=>x.properties.adm0_a3==='TUR');
console.log('features',f.length);
const rows=f.map(x=>[x.properties.name,x.properties.name_tr,x.properties.iso_3166_2,x.properties.region,x.properties.latitude,x.properties.longitude].join(' | '));
console.log(rows.slice(0,8).join('\n'));
fs.writeFileSync(out,JSON.stringify({type:'FeatureCollection',features:f.map(x=>({type:'Feature',properties:{name:x.properties.name,name_tr:x.properties.name_tr,iso:x.properties.iso_3166_2,lat:x.properties.latitude,lon:x.properties.longitude},geometry:x.geometry}))}));
