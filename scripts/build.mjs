import {build} from 'esbuild';
import {mkdir,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await rm('dist',{recursive:true,force:true}); await mkdir('dist');
await cp('src','dist/src',{recursive:true}); await build({absWorkingDir:process.cwd(),tsconfig:'tsconfig.json',entryPoints:['./src/app.js'],bundle:true,format:'esm',target:['chrome109','firefox115','safari15.4'],outfile:'dist/src/app.js'});await cp('public','dist',{recursive:true});await cp('index.html','dist/index.html');
const files=['index.html','src/app.js','src/model.js','src/storage.js','src/style.css','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest'];
let combined='';for(const f of files)combined+=await readFile('dist/'+f);
const hash=createHash('sha256').update(combined).digest('hex').slice(0,12);
let sw=await readFile('public/sw.js','utf8');sw=sw.replace('__VERSION__',hash).replace('__ASSETS__',JSON.stringify(files.map(f=>'./'+f)));await writeFile('dist/sw.js',sw);
console.log('Built dist; offline cache '+hash);

