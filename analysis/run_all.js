// Runs every reported analysis with the same engine that drives the interactive map.
// Usage: node analysis/run_all.js data/model.json results [runs]
const fs=require('fs'),path=require('path');
const H=require('../src/engine.js');
const [,,modelPath,outDir,runsArg]=process.argv;
const data=JSON.parse(fs.readFileSync(modelPath,'utf8'));
const M=H.compile(data),base=H.baseParams(M),RUNS=+(runsArg||2000);
fs.mkdirSync(outDir,{recursive:true});
const pick=r=>({arrivalsForeign:r.arrivalsForeign,admittedForeign:r.admittedForeign,coverage:r.coverage,lost:r.lost,waitingEnd:r.waitingEnd,meanWaitDays:r.meanWaitDays,peakOcc:r.peakOcc,peakOccProv:r.peakOccProv,provincesOverSafe:r.provincesOverSafe,displacedBedDays:r.displacedBedDays,costUsd:r.costUsd,transportCost:r.transportCost,revLost:r.revLost,funded:r.funded,net:r.net,servedLine:r.servedLine,arrLine:r.arrLine,lostLine:r.lostLine,bedDaysLine:r.bedDaysLine,peakLine:r.peakLine,capEnd:r.capEnd,blockedDays:r.blockedDays,domesticServed:r.domesticServed});
const out={generated:new Date().toISOString(),runs:RUNS,scenarios:{}};
const LIMITS=['access','transport','coord','capacity','staff'];
for(const scn of data.scenarios){
  const det=H.simulate(M,base,scn,{});
  const relax={};for(const k of LIMITS){const x=H.simulate(M,base,scn,{relax:{[k]:true}});relax[k]={admittedForeign:x.admittedForeign,gain:x.admittedForeign-det.admittedForeign,meanWaitDays:x.meanWaitDays}}
  const all=H.simulate(M,base,scn,{relax:Object.fromEntries(LIMITS.map(k=>[k,true]))});
  const mc=H.monteCarlo(M,scn,RUNS,null,{seed:20261113});
  // Province ranking from the deterministic run.
  const ranked=M.prov.map((p,i)=>({name:p.name,region:p.region,served:det.servedProv[i],bedDays:det.bedDaysProv[i],maxOcc:det.maxOccProv[i]})).sort((a,b)=>b.served-a.served);
  const byRegion={};for(const r of ranked){byRegion[r.region]=byRegion[r.region]||{served:0,bedDays:0};byRegion[r.region].served+=r.served;byRegion[r.region].bedDays+=r.bedDays}
  out.scenarios[scn.id]={name:scn.name,deterministic:pick(det),allLimitsRemoved:pick(all),relax,monteCarlo:mc,topProvinces:ranked.slice(0,12),byRegion};
  console.log(scn.id,'admitted',Math.round(det.admittedForeign),'of',Math.round(det.arrivalsForeign),'wait',det.meanWaitDays.toFixed(1),'net',Math.round(det.net));
}
// One-at-a-time lever sweeps.
const levers=data.sweeps||[];
out.sweeps={};
for(const scn of data.scenarios){
  out.sweeps[scn.id]={};
  for(const l of levers){
    const xs=[];for(let i=0;i<=20;i++)xs.push(l.min+(l.max-l.min)*i/20);
    out.sweeps[scn.id][l.key]=xs.map(x=>{const r=H.simulate(M,{...base,[l.key]:x},scn,{});return{x,admitted:r.admittedForeign,coverage:r.coverage,wait:r.meanWaitDays,net:r.net,revLost:r.revLost,peakOcc:r.peakOcc}});
  }
}
// Policy packages under full parameter uncertainty.
out.packages={};
const PACK={adhoc:{kappa:.15,rho:0,eta:.2,fastTrack:1,airSlots:30,coordCases:150,rampDays:14},reference:{},coordinated:{kappa:.45,rho:.25,eta:1,fastTrack:2,airSlots:120,coordCases:500,rampDays:5,ptMobil:.1}};
for(const scn of data.scenarios){
  out.packages[scn.id]={};
  for(const [pk,fx] of Object.entries(PACK)){
    const mc=H.monteCarlo(M,scn,Math.min(500,RUNS),fx,{seed:4242});
    const det=H.simulate(M,{...base,...fx},scn,{});
    out.packages[scn.id][pk]={deterministic:pick(det),monteCarlo:{admittedForeign:mc.admittedForeign,coverage:mc.coverage,meanWaitDays:mc.meanWaitDays,lost:mc.lost,costUsd:mc.costUsd,revLost:mc.revLost}};
  }
}
// Absorption limit: raise crisis severity until the reserve saturates.
out.saturation={};
for(const scn of data.scenarios.filter(s=>s.hubAnalysis)){
  const rows=[];
  for(const sev of [1,1.5,2,3,4,5,6,8,10,12,15,20,25,30,40]){
    const r=H.simulate(M,{...base,severityMult:sev,accessRate:0.2,airSlots:245,landSlotsPerGate:100,coordCases:700},scn,{});
    const util=r.peakLine.map((v,i)=>r.capEnd[i]>0?v/r.capEnd[i]:0);
    rows.push({severity:sev,referrals:r.arrivalsForeign,admitted:r.admittedForeign,coverage:r.coverage,util,peakOcc:r.peakOcc,provincesOverSafe:r.provincesOverSafe,lost:r.lost,waitingEnd:r.waitingEnd,revLost:r.revLost,displaced:r.displacedBedDays});
  }
  out.saturation[scn.id]=rows;
}
// Greedy hub selection: which provinces add the most admissions when only K provinces take part.
out.hubs={};
for(const scn of data.scenarios.filter(s=>s.hubAnalysis)){
  const mask=new Uint8Array(M.nP);const chosen=[];let cur=0;
  for(let k=0;k<12;k++){
    let best=-1,bv=-1;
    for(let p=0;p<M.nP;p++){if(mask[p])continue;mask[p]=1;const v=H.simulate(M,base,scn,{mask}).admittedForeign;mask[p]=0;if(v>bv+1e-9){bv=v;best=p}}
    mask[best]=1;chosen.push({province:M.prov[best].name,admitted:bv,gain:bv-cur});cur=bv;
  }
  const full=H.simulate(M,base,scn,{}).admittedForeign;
  out.hubs[scn.id]={chosen,full};
  console.log('hubs',scn.id,chosen.slice(0,6).map(c=>c.province).join(', '));
}
fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out));
console.log('written');
