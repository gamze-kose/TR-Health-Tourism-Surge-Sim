const fs=require('fs');const t=require('topojson-client');
const [,,inp,out]=process.argv;const w=JSON.parse(fs.readFileSync(inp,'utf8'));
fs.writeFileSync(out,JSON.stringify(t.feature(w,w.objects.countries)));
