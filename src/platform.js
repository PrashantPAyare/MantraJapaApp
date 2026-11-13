import {validate} from './model.js';
import {Capacitor} from '@capacitor/core';
import {Preferences} from '@capacitor/preferences';
import {Haptics,ImpactStyle} from '@capacitor/haptics';
import {Filesystem,Directory,Encoding} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
export const native=Capacitor.isNativePlatform();
export async function platformStorage(){
 let browserStorage;try{browserStorage=localStorage;browserStorage.setItem('still.probe','1');browserStorage.removeItem('still.probe');}catch{const data=new Map();return {ephemeral:true,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
 if(!native)return browserStorage;
 // WebView storage is the synchronous write-ahead journal. Native preferences
 // survive WebView cache eviction. A timestamp selects the newest complete copy.
 const map=new Map();let pending=Promise.resolve();
 const newer=(a,b)=>{const stamp=x=>{try{return validate(JSON.parse(x))._savedAt??0;}catch{return -1;}};return stamp(a)>=stamp(b)?a:b;};
 for(const key of ['still.v1','still.v1.previous']){const result=await Preferences.get({key}).catch(()=>({value:null}));const journal=localStorage.getItem(key);map.set(key,newer(journal,result.value));}
 return {getItem:key=>map.get(key)??null,setItem:(key,value)=>{localStorage.setItem(key,value);map.set(key,value);pending=pending.catch(()=>{}).then(()=>Preferences.set({key,value})).catch(()=>{window.dispatchEvent(new Event('still-storage-error'));});},flush:()=>pending};
}
export function haptic(){if(native)Haptics.impact({style:ImpactStyle.Light}).catch(()=>{});else navigator.vibrate?.(12);}
export async function exportFile(content,name){if(!native)return false;const file=await Filesystem.writeFile({path:name,data:content,directory:Directory.Cache,encoding:Encoding.UTF8});await Share.share({title:'Still backup',files:[file.uri],dialogTitle:'Save your backup'});return true;}
