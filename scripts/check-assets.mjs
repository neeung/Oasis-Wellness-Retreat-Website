import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const pages=['home','listing','detail','checkout'];const paths=new Set();for(const page of pages){const source=await fs.readFile(`views/${page}.html`,'utf8');assert.ok(!source.includes('www.figma.com/api/mcp/asset'),'No temporary runtime sources');for(const m of source.matchAll(/src="([^"]+)"/g))paths.add(m[1]);}
let missing=0;for(const path of paths){try{const stat=await fs.stat(path);assert.ok(stat.size>0)}catch{missing++}}
console.log(`${paths.size-missing}/${paths.size} Figma assets present and nonempty.`);if(missing){console.error(`${missing} assets pending: download blocked by environment HTTP proxy (403).`);process.exitCode=1}
