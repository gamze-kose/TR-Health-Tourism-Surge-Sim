// Evaluates a parameter sample matrix for global sensitivity analysis.
// Usage: node analysis/sobol_eval.js data/model.json samples.json out.json
const fs=require('fs');const H=require('../src/engine.js');
const [,,m,s,o]=process.argv;
const data=JSON.parse(fs.readFileSync(m,'utf8'));const M=H.compile(data),base=H.baseParams(M);
const S=JSON.parse(fs.readFileSync(s,'utf8'));
const out={};
for(const id of S.scenarios){
  const scn=data.scenarios.find(x=>x.id===id);
  const n=S.X.length;const Y={admitted:new Array(n),coverage:new Array(n),wait:new Array(n),net:new Array(n),lost:new Array(n)};
  for(let i=0;i<n;i++){
    const P={...base};S.names.forEach((k,j)=>P[k]=S.X[i][j]);
    const r=H.simulate(M,P,scn,{});
    Y.admitted[i]=r.admittedForeign;Y.coverage[i]=r.coverage;Y.wait[i]=r.meanWaitDays;Y.net[i]=r.net;Y.lost[i]=r.lost;
  }
  out[id]=Y;console.log(id,'done',n);
}
fs.writeFileSync(o,JSON.stringify(out));
