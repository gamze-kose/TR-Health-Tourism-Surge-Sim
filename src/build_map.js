// Projects province and country polygons into a Türkiye-centred azimuthal equidistant plane (1 unit = 1 km).
const fs=require('fs');
(async()=>{
const {geoAzimuthalEquidistant,geoPath,geoCentroid,geoArea}=await import('d3-geo');
const fixPoly=c=>geoArea({type:'Polygon',coordinates:c})>2*Math.PI?c.map(r=>r.slice().reverse()):c;
const fix=f=>{const g=f.geometry;if(!g)return f;if(g.type==='Polygon')g.coordinates=fixPoly(g.coordinates);else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map(fixPoly);return f};
const base=require('./provinces_base.js');
const [,,provPath,cntPath,out]=process.argv;
const prov=JSON.parse(fs.readFileSync(provPath,'utf8'));prov.features.forEach(fix);
const cnt=JSON.parse(fs.readFileSync(cntPath,'utf8'));cnt.features.forEach(fix);
const proj=geoAzimuthalEquidistant().rotate([-35,-39]).scale(6371).translate([0,0]).clipAngle(118).precision(25);
const provProj=geoAzimuthalEquidistant().rotate([-35,-39]).scale(6371).translate([0,0]).clipAngle(118).precision(4);
const pPath=geoPath(provProj).digits(1);
const wPath=geoPath(proj).digits(0);
const byId=new Map(base.map(b=>[b.id,b]));
const provinces=prov.features.map(f=>{
  const id=+f.properties.iso.split('-')[1];const b=byId.get(id);
  const lon=+f.properties.lon,lat=+f.properties.lat;const xy=proj([lon,lat]);
  return {id,name:b.name,region:b.region,lat,lon,x:Math.round(xy[0]*10)/10,y:Math.round(xy[1]*10)/10,d:pPath(f)};
}).sort((a,b)=>a.id-b.id);
const countries=cnt.features.filter(f=>f.geometry&&f.properties.name!=='Antarctica'&&f.properties.name!=='Turkey').map(f=>{
  const c=geoCentroid(f);const xy=proj(c)||[0,0];const d=wPath(f);
  return d?{iso:f.id||'',name:f.properties.name,lat:c[1],lon:c[0],x:Math.round(xy[0]),y:Math.round(xy[1]),d}:null;
}).filter(Boolean);
const size=JSON.stringify({provinces,countries}).length;
fs.writeFileSync(out,JSON.stringify({projection:{type:'azimuthal-equidistant',lon0:35,lat0:39,unit:'km'},provinces,countries}));
const xs=provinces.map(p=>p.x),ys=provinces.map(p=>p.y);
console.log('bytes',size,'prov',provinces.length,'cnt',countries.length,'tr bbox',Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys));
})();
