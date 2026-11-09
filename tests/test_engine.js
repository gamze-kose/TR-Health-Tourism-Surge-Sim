// Logic tests: mass balance, extreme conditions, monotonicity and reproducibility.
const H=require('../src/engine.js');const fs=require('fs');const path=require('path');
const arg=process.argv[2];
const data=arg?JSON.parse(fs.readFileSync(arg,'utf8')):require('./toy_model.js')();
const M=H.compile(data);let fails=0,count=0;
function ok(c,msg){count++;if(!c){fails++;console.log('FAIL',msg)}}
const near=(a,b,e=1e-6)=>Math.abs(a-b)<=e*Math.max(1,Math.abs(a),Math.abs(b));
const base=H.baseParams(M);
for(const scn of data.scenarios){
  for(const seed of [undefined,11]){
    const r=H.simulate(M,base,scn,{seed});
    ok(near(r.arrivals,r.admitted+r.lost+r.waitingEnd,1e-6),`arrival balance ${scn.id}: ${r.arrivals} vs ${r.admitted+r.lost+r.waitingEnd}`);
    ok(near(r.admitted,r.inCareEnd+r.completed+r.inCareDeaths,1e-6),`care balance ${scn.id}: ${r.admitted} vs ${r.inCareEnd+r.completed+r.inCareDeaths}`);
    ok(r.lost>=0&&r.waitingEnd>=-1e-6,'non-negative stocks');
  }
  // No capacity, no admissions.
  const z={...base,kappa:0,rho:0,kappaRehab:0,stepThermal:0,stepHotel:0};
  const r0=H.simulate(M,z,scn,{});
  ok(r0.admitted<1e-6,`zero capacity admits nobody (${scn.id}): ${r0.admitted}`);
  // Removing every limit admits everyone quickly.
  const r1=H.simulate(M,base,scn,{relax:{access:true,transport:true,coord:true,capacity:true,staff:true}});
  const rb=H.simulate(M,base,scn,{});
  ok(r1.admitted>=rb.admitted-1e-6,`relaxed admits at least as many (${scn.id})`);
  ok(r1.meanWaitDays<=rb.meanWaitDays+1e-6,`relaxed waits no longer (${scn.id})`);
  // Monotonic in released capacity and activated idle capacity.
  let prev=-1;for(const k of [0,.2,.4,.6,.8,1]){const v=H.simulate(M,{...base,kappa:k},scn,{}).admitted;ok(v>=prev-1e-6*Math.max(1,v),`monotone in kappa (${scn.id}) ${prev}->${v}`);prev=v}
  // Reproducible for one seed.
  const a=H.simulate(M,base,scn,{seed:5}),b=H.simulate(M,base,scn,{seed:5});ok(a.admitted===b.admitted,'same seed, same result');
  // Capacity is never exceeded.
  const R=H.simulate(M,base,scn,{record:true});
  for(let c=0;c<6;c++){let viol=0;for(let t=0;t<365;t++)if(R.daily.lineCare[c][t]>R.daily.lineCap[c][t]*1.0001+1e-6&&R.daily.lineCap[c][t]>0&&t>0)viol=Math.max(viol,R.daily.lineCare[c][t]/R.daily.lineCap[c][t]);if(viol>1.05)console.log('note: line',H.LINES[c],'occupancy above capacity ratio',viol.toFixed(2),scn.id)}
}
/* ---- Hypothetical crises from common country parameters ---- */
{
  const cP={...base,quakeInjuredLimited:20000,quakeInjuredMajor:80278,quakeInjuredExtreme:300000,quakeInjuredCap:.03,conflictInjuredLimited:45,conflictInjuredMajor:180,conflictInjuredExtreme:360,conflictInjuredCap:.03,conflictAffectedLimited:5e5,conflictAffectedMajor:21e5,conflictAffectedExtreme:5e6,dialysisPerMillion:524,cancerPerMillion:5238,epiCriticalLimited:175,epiCriticalMajor:351,epiCriticalExtreme:702,epiDialysisPerMillion:70,refBeds:2.81,gapExponent:.5,gapMin:.5,gapMax:2,refDiabetes:10.59,refAge65:3.04,ageExponent:.5,rotationHours:20};
  const c={id:'X',pop:5e6,beds:2.81,diabetes:10.59,age65:3.04};
  ok(near(H.capacityGap(c,cP),1),'reference beds give a gap of one');
  ok(H.capacityGap({...c,beds:.01},cP)===2&&H.capacityGap({...c,beds:100},cP)===.5,'capacity gap stays within its limits');
  ok(H.crisisEvent(c,{type:'quake',level:'major'},cP).injured===80278,'major earthquake uses the published figure');
  ok(near(H.crisisEvent({...c,pop:1e6},{type:'quake',level:'extreme'},cP).injured,3e4),'injured are limited by the population');
  const e=H.crisisEvent(c,{type:'conflict',level:'major',months:6},cP);
  ok(e.duration===183&&near(e.dialysisPatients,1100.4,1e-3)&&near(e.cancerPatients,10999.8,1e-3),'conflict anchors reproduce 1,100 and 11,000 patients');
  ok(near(H.crisisEvent({...c,pop:1e5},{type:'conflict',level:'extreme'},cP).injuredPerDay,3e3/365),'injuries a day are limited by the population');
  ok(near(H.crisisEvent(c,{type:'epidemic',level:'major'},cP).critical,1755),'epidemic scales with the population');
  ok(H.airFactor(4,cP)===1&&near(H.airFactor(16,cP),20/36),'long flights reduce air seats');
  const ids=Object.keys(data.scenarios[0].events[0].origins),o=ids[0],a0={...data.scenarios[0],events:[{...data.scenarios[0].events[0]}]},a1={...a0,events:[{...a0.events[0],exportMult:1.5}]};
  const v0=H.simulate(M,base,a0,{}).arrivals,v1=H.simulate(M,base,a1,{}).arrivals;
  ok(v1>v0,'a larger capacity gap sends more patients abroad');
}
/* ---- Forecast layer ---- */
const empty={horizon:0,marks:{},off:{},edits:{},access:{}};
ok(H.applyPlan(M,empty)===M,'an empty plan returns the original model');
const fs2=require('fs'),pth=require('path'),resPath=pth.join(__dirname,'..','results','results.json');
if(fs2.existsSync(resPath)){const R0=JSON.parse(fs2.readFileSync(resPath,'utf8'));for(const scn of data.scenarios){const r=H.simulate(H.applyPlan(M,empty),base,scn,{}),q=R0.scenarios[scn.id].deterministic;for(const k of ['admittedForeign','lost','waitingEnd','meanWaitDays','net'])ok(Math.abs(r[k]-q[k])<=1e-6*Math.max(1,Math.abs(q[k])),`empty plan reproduces published results (${scn.id}, ${k})`)}}
const sc0=H.scoreServices(M);
for(const sv of M.services){let mx=0,bad=0;for(const v of sc0[sv.key].score){if(!(v>=0&&v<=1))bad++;if(v>mx)mx=v}ok(bad===0&&Math.abs(mx-1)<1e-9,`scores lie in 0 to 1 with a best city at 1 (${sv.key})`)}
ok(Math.abs(M.services.reduce((a,s)=>a+s.mix,0)-1)<1e-9,'service mix sums to 1');
const fc=H.commercialForecast(M,{horizon:5});ok(Math.abs(fc.share.reduce((a,b)=>a+b,0)-1)<1e-9,'forecast shares sum to 1');
const fc0=H.commercialForecast(M,{horizon:0});ok(fc0.share.every((v,i)=>Math.abs(v-M.htShare[i])<1e-9),'forecast at horizon 0 equals today');
const conflict=data.scenarios.find(s=>s.id==='conflict');
const planAt=(lv,h)=>({horizon:h,marks:{1:{cancer:lv,limb:lv},6:{cancer:lv,heart:lv},34:{cancer:lv,sci:lv}}});
let prevAdm=H.simulate(M,base,conflict,{}).admittedForeign;
for(const lv of [1,2,3]){const v=H.simulate(H.applyPlan(M,planAt(lv,5)),base,conflict,{}).admittedForeign;ok(v>=prevAdm-1e-6,`higher marks admit at least as many (level ${lv})`);prevAdm=v}
const Moff=H.applyPlan(M,{off:{34:true}}),roff=H.simulate(Moff,base,conflict,{});ok(roff.servedProv[M.provIndex[34]]<1e-9,'a city out of service receives nobody');
const Med=H.applyPlan(M,{edits:{1:{ONCO:500}}});ok(Med.extra[H.L.ONCO][M.provIndex[1]]===500,'manual edits reach the model');
ok(M.extra.every(a=>a.every(v=>v===0)),'plans leave the original model unchanged');
const picks=H.topPicks(M,sc0);ok(Object.keys(picks).length>0,'the model names its top picks');
/* ---- Needs lens ---- */
for(const scn of data.scenarios){
  const R=H.simulate(M,base,scn,{record:true}),L=H.needLens(M,base,scn,R,sc0);
  const sum=a=>a.reduce((x,y)=>x+y,0);
  ok(Math.abs(sum(L.rows.map(r=>r.referred))-sum(R.arrLine))<1e-6*Math.max(1,sum(R.arrLine)),`needs add up to all referrals (${scn.id})`);
  ok(Math.abs(sum(L.rows.map(r=>r.admitted))-sum(R.admitLine))<1e-6*Math.max(1,sum(R.admitLine)),`needs add up to all admissions (${scn.id})`);
  ok(Math.abs(sum(R.admitLine)-R.admitted)<1e-6*Math.max(1,R.admitted),`direct admissions match the total (${scn.id})`);
  let bad=0;L.rows.forEach((r,i)=>{if(Math.abs(sum(Array.from(L.byProv[i]))-r.admitted)>1e-3*Math.max(1,r.admitted))bad++});
  ok(bad===0,`city split keeps each need's total (${scn.id})`);
  let badp=0;for(let p=0;p<M.nP;p++){let v=0;L.byProv.forEach(a=>v+=a[p]);if(Math.abs(v-R.servedProv[p])>1e-2*Math.max(1,R.servedProv[p]))badp++}
  ok(badp===0,`city split keeps each city's total (${scn.id})`);
  ok(L.limited<=sum(L.rows.map(r=>r.admitted))+1e-6,`specialised limits never add patients (${scn.id})`);
}
const conflict2=data.scenarios.find(s=>s.id==='conflict');
const r0=H.simulate(M,base,conflict2,{}),r1=H.simulate(M,{...base,extendedNeeds:1},conflict2,{});
ok(r1.arrivals>r0.arrivals,'extra needs add referrals when switched on');
const quake2=data.scenarios.find(s=>s.id==='quake');ok(H.routineCare(M,base,quake2,365).patients===0,'no routine care stream after a sudden disaster');


// Course of the years, on the real model only.
if(M.meta&&M.meta.outlook){
  const sum=a=>Array.from(a).reduce((x,y)=>x+y,0),scn=data.scenarios.find(s=>s.id==='conflict');
  let spill=0;const r=H.simulate(M,base,scn,{});M.prov.forEach((p,i)=>{if(!M.unit[i])spill+=r.servedProv[i]});
  ok(spill===0,'no patient reaches a province without a unit');
  ok(sum(M.unit)===60,'60 provinces hold an authorised hospital');
  ok(H.dampedYears(0,.9)===0&&near(H.dampedYears(1,.9),.9)&&H.dampedYears(50,.9)<9,'damped years stay bounded');
  ok(near(H.tableAt(M.meta.outlook.pop,2030),88188221)&&near(H.tableAt(M.meta.outlook.age65,2040),17.9),'projection tables read their anchors');
  ok(near(H.demandIndex(M,{...base,ageBedRatio:1,stayDecline:0},2024),1),'demand index is 1 in the data year');
  ok(H.demandIndex(M,base,2047)>H.demandIndex(M,base,2030),'ageing raises domestic demand');
  const st=(y,p,u)=>{const P=H.yearParams(base,y,p);return{M:H.yearModel(M,y,p,P,u),P}};
  const units=(y,p)=>sum(st(y,p).M.unit);
  ok(units(2047,'current')===60,'the current course opens no unit');
  ok(units(2027,'planned')===60&&units(2028,'planned')===61,'first planned unit opens in 2028');
  ok(units(2047,'ambitious')>=units(2047,'planned')&&units(2047,'planned')>units(2047,'current'),'paths add units in order');
  ok(units(2047,'ambitious')<81,'never all 81 provinces');
  let noOrder=0;for(const y of [2031,2039,2047]){const a=H.simulate(st(y,'current').M,st(y,'current').P,scn,{}).admittedForeign,b=H.simulate(st(y,'planned').M,st(y,'planned').P,scn,{}).admittedForeign,c=H.simulate(st(y,'ambitious').M,st(y,'ambitious').P,scn,{}).admittedForeign;if(!(a<=b+1e-6&&b<=c+1e-6))noOrder++}
  ok(noOrder===0,'stronger paths admit at least as many patients');
  const later=st(2047,'current').M,early=st(2027,'current').M;ok(sum(later.beds)>sum(early.beds),'beds follow the trend');
  ok(sum(later.beds)<sum(M.beds)*1.5,'damping keeps bed growth plausible');
  for(let y=2027;y<=2047;y+=5){let bad=0;for(const p of H.PATHS){const x=st(y,p).M;for(const k of H.STOCK_KEYS)if(x[k].some(v=>!(v>=0)))bad++;if(x.occAuth.some(v=>v>base.occCeiling+1e-9))bad++}ok(bad===0,'projected stocks and occupancy stay valid in '+y)}
  // Manual changes.
  const nu=M.prov.findIndex(p=>p.name==='Ardahan'),gz=M.prov.findIndex(p=>p.name==='Gaziantep'),idN=M.prov[nu].id,idG=M.prov[gz].id;
  ok(!st(2027,'current').M.unit[nu],'a province without a unit stays closed');
  const op=st(2027,'current',{unit:{[idN]:true}}).M;ok(op.unit[nu]===1&&op.authBeds[nu]>0,'opening a unit by hand gives it capacity');
  const plus=st(2027,'current',{stock:{[idG]:{authBeds:1000,oncSlots:500}}}).M,b0=st(2027,'current').M;ok(near(plus.authBeds[gz],b0.authBeds[gz]+1000)&&near(plus.oncSlots[gz],b0.oncSlots[gz]+500),'capacity changed by hand is added');
  ok(st(2027,'current',{stock:{[idG]:{authBeds:-1e9}}}).M.authBeds[gz]===0,'capacity cannot fall below zero');
  ok(b0.authBeds[gz]!==0&&H.cityPlaces(plus,base,gz)[1]>H.cityPlaces(b0,base,gz)[1],'more beds give more places');
  ok(H.cityPlaces(st(2027,'current').M,base,nu).every(v=>v===0),'no places without a unit');
  const edited=H.simulate(st(2027,'current',{stock:{[idG]:{oncSlots:3000}}}).M,base,scn,{}),plain=H.simulate(b0,base,scn,{});ok(edited.admittedForeign>plain.admittedForeign,'added cancer capacity raises admissions in a conflict');
}

const t0=Date.now();for(let i=0;i<50;i++)H.simulate(M,base,data.scenarios[1],{seed:i});
console.log('tests',count,'fails',fails,'ms/run',(Date.now()-t0)/50);
process.exit(fails?1:0);
