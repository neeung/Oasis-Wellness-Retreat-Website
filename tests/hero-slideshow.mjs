import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const frame=page.locator('.hero-slideshow'),active=()=>frame.locator('.hero-slide.is-active');
const expectSlide=async index=>{await page.waitForFunction(i=>[...document.querySelectorAll('.hero-slide')].findIndex(e=>e.classList.contains('is-active'))===i,index,{timeout:8000})};
try{
 await page.goto(base);await page.locator('[data-slideshow-ready=true]').waitFor();await page.evaluate(()=>document.fonts.ready);await page.mouse.move(0,0);
 const landscape=page.locator('[data-name="Immersive landscape"]');await page.locator('[data-name="Immersive landscape"].is-visible').waitFor();await landscape.evaluate(async e=>Promise.all(e.getAnimations().map(animation=>animation.finished)));
 assert.equal(await frame.locator('img').count(),3);const before=await frame.boundingBox(),inset=await page.locator('[data-name="Inset tactile moment"] img').getAttribute('src');
 // Observe real timers and CSS interpolation through a complete three-image loop.
 await expectSlide(1);const firstChange=Date.now();await page.waitForTimeout(300);
 const opacity=await active().evaluate(e=>Number(getComputedStyle(e).opacity));assert.ok(opacity>0&&opacity<1,`Fade interpolates: ${opacity}`);
 assert.equal(await frame.locator('.is-previous').evaluate(e=>Number(getComputedStyle(e).opacity)),1);
 assert.match(await page.locator('[data-node-id="22:7501"]').textContent(),/โยคะ/);
 await expectSlide(2);assert.ok(Date.now()-firstChange<4200,'Autoplay advances every three seconds');await expectSlide(0);const after=await frame.boundingBox();for(const dimension of ['x','y','width','height'])assert.ok(Math.abs(after[dimension]-before[dimension])<.1,`Stable hero ${dimension}`);
 const insetBox=await page.locator('[data-node-id="22:7500"]').boundingBox();
 const point={x:(Math.max(before.x,insetBox.x)+Math.min(before.x+before.width,insetBox.x+insetBox.width))/2,y:(Math.max(before.y,insetBox.y)+Math.min(before.y+before.height,insetBox.y+insetBox.height))/2};
 assert.equal(await page.evaluate(({x,y})=>!!document.elementFromPoint(x,y)?.closest('[data-name="Inset tactile moment"]'),point),true,'Inset stays in front of every slide');
 assert.notEqual(await frame.evaluate(e=>getComputedStyle(e).borderRadius),'0px');
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(3500);assert.equal(await active().getAttribute('src'),await frame.locator('img').first().getAttribute('src'));await frame.scrollIntoViewIfNeeded();
 await frame.getByRole('button',{name:'พักการสลับภาพ',exact:true}).click();await page.mouse.move(0,0);const paused=await active().getAttribute('src');await page.waitForTimeout(3500);assert.equal(await active().getAttribute('src'),paused);
 await frame.getByRole('button',{name:/แสดงภาพที่ 3:/}).click();assert.match(await page.locator('[data-node-id="22:7501"]').textContent(),/สปา/);assert.equal(await page.locator('[data-name="Inset tactile moment"] img').getAttribute('src'),inset);
 await frame.getByRole('button',{name:'เล่นภาพต่อ',exact:true}).click();await page.mouse.move(0,0);await expectSlide(0);
 // Motion preference updates immediately and manual navigation remains available.
 await page.emulateMedia({reducedMotion:'reduce'});await frame.locator('.hero-slide-pause').waitFor({state:'hidden'});
 const still=await active().getAttribute('src');await page.waitForTimeout(3500);assert.equal(await active().getAttribute('src'),still);
 await frame.getByRole('button',{name:/แสดงภาพที่ 2:/}).click();assert.match(await active().getAttribute('src'),/0742b74d/);assert.equal(await active().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 for(const width of [320,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const geometry=await frame.locator('img').evaluateAll(es=>es.map(e=>({fit:getComputedStyle(e).objectFit,w:e.clientWidth,h:e.clientHeight,pw:e.parentElement.clientWidth,ph:e.parentElement.clientHeight})));
  geometry.forEach(g=>{assert.equal(g.fit,'cover');assert.ok(Math.abs(g.w-g.pw)<2&&Math.abs(g.h-g.ph)<2)});
 }
 const detached=await frame.elementHandle();await page.goto(base+'#/retreats');await page.locator('#results').waitFor();assert.equal(await page.locator('.hero-slideshow-controls').count(),0);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(base);await mobile.locator('[data-slideshow-ready=true]').waitFor();await mobile.locator('.hero-slideshow').scrollIntoViewIfNeeded();
 await mobile.waitForFunction(()=>document.querySelectorAll('.hero-slide')[1].classList.contains('is-active'),null,{timeout:8000});
 await page.waitForTimeout(1300);assert.ok(await detached.evaluate(e=>e.querySelectorAll('.is-active').length===1));
 assert.deepEqual(errors,[]);console.log('PASS: complete timed loop, real crossfade without blank frames or layout shift, captions, pause/resume, manual selection, unchanged inset, responsive cover, reduced motion, mobile autoplay and route cleanup.');
}finally{await browser.close()}
