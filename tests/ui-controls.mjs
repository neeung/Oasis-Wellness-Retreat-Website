import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const trigger=name=>page.locator(`[data-select-name="${name}"]`);
async function go(route){await page.goto(base+route);await trigger('currency').waitFor();}
async function select(name,value){await trigger(name).click();await page.locator(`[role=option][data-value="${value}"]`).click();}
async function bounds(){
 const box=await page.locator('.ui-popover').boundingBox(),viewport=page.viewportSize();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,JSON.stringify({box,viewport}));
}
try{
 await go('#/');await trigger('destination').click();assert.equal(await page.getByRole('listbox').count(),1);await bounds();
 const option=page.getByRole('option',{name:'แม่ริม เชียงใหม่',exact:true});await option.hover();assert.equal(await option.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(44, 74, 59)');await option.click();assert.equal(await page.locator('select[name=destination]').inputValue(),'แม่ริม');assert.match(await trigger('destination').textContent(),/แม่ริม/);
 await trigger('destination').press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await page.locator('select[name=destination]').inputValue(),'ดอยสะเก็ด');assert.equal(await trigger('destination').getAttribute('aria-expanded'),'false');
 await trigger('destination').click();await page.keyboard.press('Escape');assert.equal(await trigger('destination').evaluate(e=>e===document.activeElement),true);
 await trigger('guests').click();await page.keyboard.press('Tab');assert.equal(await page.locator('.ui-popover').count(),0);
 await trigger('currency').click();await page.locator('[data-name="Hero story"]').click();assert.equal(await page.locator('.ui-popover').count(),0);
 // Date keyboard selection flows through the original booking state.
 await page.getByRole('button',{name:'เปิดปฏิทิน วันที่เริ่มเดินทาง',exact:true}).click();await bounds();
 const selected=page.locator('.ui-calendar-day[aria-selected=true]');await selected.press('ArrowRight');const next=await page.locator('.ui-calendar-day[tabindex="0"]').getAttribute('data-date');await page.keyboard.press('Enter');assert.equal(await page.locator('input[name=date]').inputValue(),next);
 await select('destination','เชียงใหม่');await page.getByRole('button',{name:'ค้นหาแพ็คเกจ',exact:true}).click();await trigger('sort').waitFor();assert.equal(await page.locator('input[name=date]').inputValue(),next);
 await select('sort','price');assert.equal(await page.locator('[data-retreat]:visible').first().getAttribute('data-retreat'),'slow');
 await go('#/retreat/stillness');await select('room','Garden Deluxe Suite');await select('guests','3');assert.equal(await page.locator('[data-node-id="22:7110"]').textContent(),'67,410');
 await go('#/checkout/stillness');await select('dialCode','+1');const first=page.locator('input[name=firstName]');await first.fill('Nina');await first.focus();assert.match(await first.evaluate(e=>getComputedStyle(e.parentElement).boxShadow),/44, 74, 59/);
 await select('currency','USD');assert.equal(await first.inputValue(),'Nina');await page.locator('input[name=terms]').check();assert.equal(await page.locator('input[name=terms]').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(44, 74, 59)');
 await page.getByRole('button',{name:'ยืนยันการจองตัวอย่าง',exact:true}).click();assert.equal(await page.locator('input[name=lastName]').getAttribute('aria-invalid'),'true');
 for(const width of [320,390,575,576,767,768,991,992,1199,1200,1399,1400,1920]){
  await page.setViewportSize({width,height:900});await go('#/');
  assert.ok(await page.locator('input[type=date]').evaluate(e=>e.clientWidth>=120),`Readable date field at ${width}px`);
  if(width===320){await page.getByRole('button',{name:'เปิดเมนู',exact:true}).click();await page.getByRole('button',{name:'เข้าสู่ระบบ',exact:true}).click();await page.getByRole('button',{name:'ปิด',exact:true}).click();await page.getByRole('button',{name:'เปิดเมนู',exact:true}).click();}
  for(const name of ['currency','destination','guests']){await trigger(name).click();await bounds();await page.keyboard.press('Escape');}
  const date=page.getByRole('button',{name:'เปิดปฏิทิน วันที่เริ่มเดินทาง',exact:true});await date.click();await bounds();assert.equal(await page.locator('.ui-calendar-day:not([disabled])').count()>0,true);await page.keyboard.press('Escape');
 }
 await page.setViewportSize({width:1440,height:1000});await go('#/');await trigger('destination').click();await page.screenshot({path:'/workspace/work/fig-inspect/dropdown-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.keyboard.press('Escape');await trigger('destination').click();await page.screenshot({path:'/workspace/work/fig-inspect/dropdown-mobile.png'});
 await go('#/checkout/stillness');assert.equal(await page.locator('.ui-popover').count(),0);assert.deepEqual(errors,[]);
 console.log('PASS: branded dropdowns and focus states, mouse and keyboard selection, outside/Tab/Escape dismissal, calendar-to-search state, room/guest pricing, preserved form values, validation, checkboxes and popover bounds at all Bootstrap boundaries.');
}finally{await browser.close()}
