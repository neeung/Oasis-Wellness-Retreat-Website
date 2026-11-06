import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';
try{
 await page.goto(base);await page.locator('.home-page').waitFor();await page.evaluate(()=>document.fonts.ready);
 const photo=page.locator('[data-node-id="22:7498"] .home-photo');await photo.evaluate(i=>i.decode());
 const later=page.locator('[data-name="A moment of stillness"] .home-reveal').first();assert.equal(await later.evaluate(e=>e.classList.contains('is-visible')),false);
 const frame=page.locator('[data-node-id="22:7498"]');const before=await frame.boundingBox();await frame.hover();await page.waitForTimeout(750);
 assert.ok(await photo.evaluate(i=>new DOMMatrix(getComputedStyle(i).transform).a>1.03));const after=await frame.boundingBox();assert.ok(Math.abs(after.width-before.width)<.1);assert.ok(Math.abs(after.height-before.height)<.1);
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow at ${width}`);
  const geometry=await page.locator('.home-photo').evaluateAll(imgs=>imgs.map(i=>{const s=getComputedStyle(i),f=i.parentElement.getBoundingClientRect(),b=i.getBoundingClientRect();return {fit:s.objectFit,fw:f.width,fh:f.height,iw:i.clientWidth,ih:i.clientHeight}}));
  for(const g of geometry){assert.equal(g.fit,'cover');assert.ok(g.fw>90&&g.fh>80,JSON.stringify({width,g}));assert.ok(Math.abs(g.fw-g.iw)<2&&Math.abs(g.fh-g.ih)<2,JSON.stringify({width,g}));}
 }
 await page.setViewportSize({width:390,height:900});
 // Wait for each intersection callback rather than assuming a fixed frame cadence.
 for(const target of await page.locator('.home-reveal').all()){
  await target.scrollIntoViewIfNeeded();
  await page.waitForFunction(e=>e.classList.contains('is-visible'),await target.elementHandle());
 }
 assert.equal(await page.locator('.home-reveal:not(.is-visible)').count(),0);
 await page.screenshot({path:'/workspace/work/fig-inspect/home-effects-mobile.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await page.locator('.home-page').waitFor();assert.equal(await page.locator('.home-reveal').count(),0);assert.equal(await photo.evaluate(i=>getComputedStyle(i).transform),'none');
 await page.goto(base+'#/retreats');await page.locator('#results').waitFor();assert.equal(await page.locator('.home-photo,.home-reveal').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS: image hover without layout movement, cover geometry at 6 widths, scroll reveals, reduced-motion, homepage-only scope and no browser errors.');
}finally{await browser.close()}
