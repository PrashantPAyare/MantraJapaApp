import {initial,validate,elapsed} from './model.js';
export class Repository {
  constructor(storage){this.storage=storage;this.key='still.v1';}
  load(now=Date.now()){
    let found=false;
    for(const key of [this.key,this.key+'.previous']){const raw=this.storage.getItem(key);if(!raw)continue;found=true;try {let s=JSON.parse(raw); if(s.version===0){s.version=1;s.settings.announce??=false;} validate(s);const a=s.active;return {...s,active:{...a,elapsed:elapsed(a,now),runningSince:null,paused:a.count>0}};}catch{/* Try the last complete snapshot. */}}
    if(found)throw Error('Saved data cannot be read. Export the recovery data before resetting storage.');
    return initial(now);
  }
  save(s){validate(s);const snapshot={...s,_savedAt:Date.now(),active:{...s.active,elapsed:elapsed(s.active),runningSince:null,paused:s.active.count>0}};const raw=JSON.stringify(snapshot);const previous=this.storage.getItem(this.key);if(previous){let valid=false;try{validate(JSON.parse(previous));valid=true;}catch{}if(valid)this.storage.setItem(this.key+'.previous',previous);}this.storage.setItem(this.key,raw);}
}
