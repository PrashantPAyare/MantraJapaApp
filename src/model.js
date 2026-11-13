export const integer = (n, min=0, max=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n>=min && n<=max;
export const day = (time=Date.now()) => { const d=new Date(time); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export function initial(now=Date.now()) {
  return {version:1,mantras:[{id:'om',name:'Om Shanti',text:'ॐ शान्तिः शान्तिः शान्तिः',meaning:'Peace within. Peace around. Peace everywhere.'},{id:'sohum',name:'So Hum',text:'सो ऽहम्',meaning:'I am that.'},{id:'omnamah',name:'Om Namah Shivaya',text:'ॐ नमः शिवाय',meaning:'I bow to the inner self.'}],settings:{theme:'light',sound:false,haptics:false,announce:false,target:108,mala:108},sessions:[],active:{id:crypto.randomUUID(),mantraId:'om',name:'Om Shanti',started:now,count:0,elapsed:0,runningSince:null,paused:false,target:108,mala:108,events:[]}};
}
export function elapsed(a,now=Date.now()) { return a.elapsed+(a.runningSince===null?0:Math.max(0,now-a.runningSince)); }
export function count(state,now=Date.now()) {
  if(state.active.paused || state.active.count>=Number.MAX_SAFE_INTEGER) return state;
  const a=state.active;
  return {...state,active:{...a,count:a.count+1,runningSince:a.runningSince??now,events:[...a.events,{at:now,day:day(now)}]}};
}
export function undo(s) { const a=s.active; return a.count?{...s,active:{...a,count:a.count-1,events:a.events.slice(0,-1)}}:s; }
export function pause(s,now=Date.now()) { const a=s.active; return {...s,active:{...a,paused:!a.paused,elapsed:elapsed(a,now),runningSince:a.paused&&a.count?now:null}}; }
export function finish(s,now=Date.now(),discard=false) {
  const a=s.active; const sessions=a.count&&!discard?[...s.sessions,{...a,elapsed:elapsed(a,now),runningSince:null,ended:now}]:s.sessions;
  return {...s,sessions,active:{id:crypto.randomUUID(),mantraId:a.mantraId,name:a.name,started:now,count:0,elapsed:0,runningSince:null,paused:false,target:s.settings.target,mala:s.settings.mala,events:[]}};
}
export function select(s,id) {const m=s.mantras.find(m=>m.id===id); if(!m) throw Error('Mantra not found'); return {...s,active:{...s.active,mantraId:id,name:m.name}};}
export function stats(s,today=day()) { const all=[...s.sessions,s.active]; return {total:all.reduce((n,a)=>n+a.count,0),today:all.reduce((n,a)=>n+a.events.filter(e=>e.day===today).length,0),malas:all.reduce((n,a)=>n+Math.floor(a.count/a.mala),0),sessions:s.sessions.length}; }
const fail=()=>{throw Error('Invalid backup. No data was changed.');};
export function validate(s) {
  if(!s||s.version!==1||!Array.isArray(s.mantras)||!s.mantras.length||s.mantras.length>1000||!Array.isArray(s.sessions)||s.sessions.length>100000) fail();
  const text=(x,max=500)=>typeof x==='string'&&x.length>0&&x.length<=max;
  const ids=new Set(); for(const m of s.mantras){if(!text(m.id,100)||ids.has(m.id)||!text(m.name,100)||!text(m.text,2000)||typeof m.meaning!=='string'||m.meaning.length>2000)fail();ids.add(m.id);}
  const c=s.settings; if(!c||!['light','dark','system'].includes(c.theme)||!integer(c.target,1,1000000)||!integer(c.mala,1,1000000)||!['sound','haptics','announce'].every(k=>typeof c[k]==='boolean'))fail();
  const sessionIds=new Set(); for(const a of [...s.sessions,s.active]) {
    if(!a||!text(a.id,100)||sessionIds.has(a.id)||!text(a.name,100)||!text(a.mantraId,100)||!integer(a.started)||!integer(a.count,0,10000000)||!integer(a.elapsed)||!integer(a.target,1,1000000)||!integer(a.mala,1,1000000)||typeof a.paused!=='boolean'||!(a.runningSince===null||integer(a.runningSince))||!Array.isArray(a.events)||a.events.length!==a.count)fail();
    sessionIds.add(a.id); if(a.ended!==undefined&&!integer(a.ended))fail();
    for(const e of a.events)if(!e||!integer(e.at)||typeof e.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(e.day)||Number.isNaN(Date.parse(e.day+'T00:00:00Z')))fail();
  }
  if(!ids.has(s.active.mantraId))fail(); return s;
}
export function importBackup(current,input) {
  if(typeof input!=='string'||input.length>25000000)fail();
  const incoming=validate(JSON.parse(input));
  // Union by immutable ID. Existing IDs win; importing the same file is idempotent.
  const mantras=[...current.mantras,...incoming.mantras.filter(m=>!current.mantras.some(x=>x.id===m.id))];
  const known=new Set([...current.sessions,current.active].map(x=>x.id));
  const candidates=[...incoming.sessions,...(incoming.active.count?[{...incoming.active,ended:incoming.active.events.at(-1)?.at??incoming.active.started,runningSince:null}]:[])];
  return validate({...current,mantras,sessions:[...current.sessions,...candidates.filter(s=>!known.has(s.id))]});
}
