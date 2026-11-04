import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
// Keep validation deterministic when external photography/font services are unavailable.
await page.route('https://images.unsplash.com/**',r=>r.abort());
await page.route('https://fonts.googleapis.com/**',r=>r.abort());
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
try {
 await page.goto(base);await page.getByRole('heading',{name:/A little further/}).waitFor();
 await page.getByRole('link',{name:'Discover your oasis'}).click();
 await page.locator('#results .retreat-card').first().waitFor();
 assert.equal(await page.locator('#results .retreat-card').count(),4);
 await page.locator('#filters select[name=destination]').selectOption('Thailand');
 assert.equal(await page.locator('#results .retreat-card').count(),2);
 await page.locator('#filters select[name=budget]').selectOption('2000');
 assert.equal(await page.locator('#results .retreat-card').count(),1);
 await page.locator('[data-save=chiangmai]').click();assert.equal(await page.locator('#saved-count').textContent(),'1');
 await page.getByRole('link',{name:'Saved 1'}).click();await page.locator('#results .retreat-card').waitFor();assert.equal(await page.locator('#results .retreat-card').count(),1);
 await page.reload();await page.locator('#results .retreat-card').waitFor();assert.equal(await page.locator('#saved-count').textContent(),'1');
 await page.getByRole('link',{name:'Rooted in Stillness',exact:true}).click();
 await page.locator('#arrival').fill('2027-06-15');await page.locator('#guests').selectOption('2');
 await page.getByRole('link',{name:'Reserve your space'}).click();await page.locator('#checkout-form').waitFor();
 assert.equal(await page.locator('#total').textContent(),'$2,900');
 await page.locator('[name=guests]').selectOption('1');assert.equal(await page.locator('#total').textContent(),'$1,450');
 await page.locator('[name=firstName]').fill('Demo');await page.locator('[name=lastName]').fill('Traveller');await page.locator('[name=email]').fill('demo@example.com');await page.locator('[name=terms]').check();
 await page.getByRole('button',{name:'Confirm demo booking'}).click();await page.getByRole('heading',{name:/Your next chapter/}).waitFor();assert.match(await page.locator('.confirmation-card').textContent(),/2027-06-15/);
 assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>/email|name|booking/i.test(k))),false);
 await page.goto(base+'/#/membership');await page.locator('#member-email').fill('demo@example.com');await page.getByRole('button',{name:'Join the demo circle'}).click();await page.locator('dialog[open]').waitFor();await page.keyboard.press('Escape');
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});for(const route of ['#/','#/retreats','#/retreat/bali','#/checkout/bali']){await page.goto(base+'/'+route);await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow: ${width} ${route}`);await page.screenshot({path:`/tmp/oasis-${width}-${route.replace(/[^a-z]/g,'')||'home'}.png`,fullPage:true});}}
 await page.setViewportSize({width:390,height:844});await page.goto(base);await page.getByRole('button',{name:'Open navigation'}).click();assert.equal(await page.getByRole('button',{name:'Open navigation'}).getAttribute('aria-expanded'),'true');await page.getByRole('link',{name:'Explore retreats',exact:true}).click();await page.locator('#results').waitFor();
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#app')).transitionDuration),'0s');
 assert.deepEqual(errors,[]);console.log('PASS: navigation, filtering, saved persistence, booking, totals, confirmation, membership, mobile navigation, 8 responsive layouts, reduced motion, and no browser errors.');
}finally{await browser.close();}
