import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const price=id=>page.locator(`[data-node-id="22:${id}"]`);
const choose=code=>page.getByRole('combobox',{name:'สกุลเงิน',exact:true}).selectOption(code);
const number=text=>Number(text.replace(/[^\d.]/g,''));
async function go(route){await page.goto(base+route);await page.getByRole('combobox',{name:'สกุลเงิน',exact:true}).waitFor();}
try{
 await go('#/');await choose('USD');assert.equal(await page.locator('[data-name^="Article - Card"] .money-amount').first().textContent(),'USD 536.03');
 await page.reload();await page.getByRole('combobox',{name:'สกุลเงิน',exact:true}).waitFor();assert.equal(await page.locator('select[name=currency]').inputValue(),'USD');
 await go('#/retreats');await page.getByRole('button',{name:'ล้างค่าตัวกรอง',exact:true}).click();
 const max=page.locator('input[name=max]');await max.fill('500');await max.blur();await page.getByRole('button',{name:'ใช้ตัวกรอง',exact:true}).click();assert.equal(await page.locator('[data-retreat]:visible').count(),2);
 const range=page.locator('.budget-range-max'),canonical=await range.inputValue();
 for(let i=0;i<3;i++){await choose('CNY');await choose('THB');await choose('USD');}
 assert.equal(await range.inputValue(),canonical);assert.equal(await max.inputValue(),'500');assert.equal(await page.locator('[data-retreat]:visible').count(),2);
 assert.match(await range.getAttribute('aria-valuetext'),/^USD /);assert.match(await page.locator('[data-budget-chip]').textContent(),/^USD /);
 // A pending budget edit stays pending when switching currency.
 await max.fill('400');await max.blur();await choose('CNY');assert.equal(await page.locator('[data-retreat]:visible').count(),2);
 assert.equal(await page.locator('[data-budget-chip]').textContent(),`CNY 0.00–${(16790/5.06875).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} ×`);
 await page.getByRole('button',{name:'ล้างค่าตัวกรอง',exact:true}).click();assert.equal(await page.locator('[data-retreat]:visible').count(),6);assert.equal(await range.inputValue(),'50000');
 await choose('USD');await max.fill('536.03');await max.blur();await page.getByRole('button',{name:'ใช้ตัวกรอง',exact:true}).click();assert.equal(await page.locator('[data-retreat=stillness]').isVisible(),true,'A price equal to the displayed maximum must be included');
 await choose('CNY');
 await go('#/retreat/stillness');assert.match(await price(7082).textContent(),/^CNY /);
 await page.locator('select[name=room]').selectOption('Garden Deluxe Suite');await page.locator('select[name=guests]').selectOption('3');
 await choose('USD');const expected=await price(7110).textContent();
 await go('#/checkout/stillness');assert.equal(await price(6798).textContent(),expected);
 await page.locator('[name=firstName]').fill('Nina');await page.locator('[name=email]').fill('nina@example.com');await page.locator('[name=terms]').check();
 for(const currency of ['CNY','THB','USD']){
  await choose(currency);assert.equal(await page.locator('[name=firstName]').inputValue(),'Nina');assert.equal(await page.locator('[name=email]').inputValue(),'nina@example.com');assert.equal(await page.locator('[name=terms]').isChecked(),true);
  const values=await Promise.all([6788,6791,6794,6798].map(async id=>number(await price(id).textContent())));
  assert.ok(Math.abs(values[0]+values[1]+values[2]-values[3])<.005);assert.equal(await price(6751).textContent(),`${currency} ${await price(6798).textContent()}`);
  assert.match(await price(6797).textContent(),new RegExp(currency));
 }
 await page.locator('[name=lastName]').fill('Test');await page.locator('[name=phone]').fill('0812345678');
 const paid=await price(6751).textContent();await page.getByRole('button',{name:'ยืนยันการจองตัวอย่าง',exact:true}).click();assert.equal(await page.locator('.confirmation .money-amount').textContent(),`ยอดรวม ${paid}`);
 await go('#/');
 for(const currency of ['USD','CNY']){
  await choose(currency);
  for(const width of [320,576,992,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of ['#/','#/retreats','#/retreat/stillness','#/checkout/stillness']){
    await go(route);await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${currency} ${width} ${route} overflow`);
    const clipped=await page.locator('#app p,#app button,#app select').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+3&&!e.closest('[data-name="Section navigation"]')).map(e=>e.textContent.trim().slice(0,40)));
    assert.deepEqual(clipped,[],`${currency} ${width} ${route} clipped`);
   }
  }
 }
 await page.evaluate(()=>localStorage.setItem('oasis-currency','"EUR"'));await page.reload();await page.getByRole('combobox',{name:'สกุลเงิน',exact:true}).waitFor();assert.equal(await page.locator('select[name=currency]').inputValue(),'THB');
 assert.deepEqual(errors,[]);console.log('PASS: currency conversion, persistence, exact budget preservation, pending filters, room and guest prices, reconciled totals, form preservation and 32 foreign-currency responsive layouts.');
}finally{await browser.close()}
