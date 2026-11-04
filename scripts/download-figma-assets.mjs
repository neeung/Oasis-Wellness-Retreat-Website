// Run promptly after obtaining a fresh design context. Figma sources expire.
import fs from 'node:fs/promises';import {spawnSync} from 'node:child_process';
if(!process.argv[2])throw Error('Pass the private asset manifest path from a fresh Figma design context.');
const manifest=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
let failures=0;for(const [path,url] of Object.entries(manifest)){const result=spawnSync('curl',['-fLsS','--retry','2',url,'-o',path],{stdio:'inherit'});if(result.status!==0)failures++}
console.log(`Figma assets: ${Object.keys(manifest).length-failures} downloaded, ${failures} failed.`);process.exitCode=failures?1:0;
