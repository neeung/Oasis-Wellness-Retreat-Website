import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';let cases=0;
try{
 for(const width of [320,390,575,576,767,768,991,992,1199,1200,1399,1400,1920]){
  await page.setViewportSize({width,height:900});
  for(const route of ['#/','#/retreats','#/retreat/stillness','#/checkout/stillness']){
   await page.goto(base+route);await page.locator('#app>div').waitFor();await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: ${route} horizontal overflow`);
   const clipped=await page.locator('#app p,#app h1,#app button,#app select').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+3&&!e.closest('[data-name="Section navigation"]')).map(e=>e.textContent.trim().slice(0,40)));
   assert.deepEqual(clipped,[],`${width}: ${route} clipped content`);
   if(route==='#/'){
    const cols=await page.locator('[data-name="Retreats 3-Card Grid"]').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(cols,width>=992?3:width>=576?2:1);
    assert.equal(await page.getByRole('button',{name:'เปิดเมนู',exact:true}).isVisible(),width<992);
    const prices=await page.locator('[data-name="Footer Price & Action"] [data-name="Paragraph"]').evaluateAll(es=>es.map(e=>{const [_,amount,unit]=e.children;return amount.getBoundingClientRect().right<=unit.getBoundingClientRect().left}));assert.ok(prices.every(Boolean),'Amount must not overlap per-person label');
   }
   if(route==='#/retreats'){
    const cols=await page.locator('.cards-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(cols,width>=576?2:1);assert.equal(await page.getByRole('button',{name:'ตัวกรองกิจกรรม',exact:true}).isVisible(),width<992);
   }
   if(route==='#/checkout/stillness'){
    const bounds=await page.locator('[data-name="Checkout form and summary"]>*').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,right:r.right}}));assert.ok(bounds.every(b=>b.w>180&&b.right<=width+1));if(width>=992)assert.ok(bounds[0].right<bounds[1].x);else assert.ok(bounds[1].y<bounds[0].y);
   }
   cases++;
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${cases} layouts covering every Bootstrap breakpoint boundary, column changes, navigation, filters, price labels, checkout and no clipped text or horizontal overflow.`);
}finally{await browser.close()}
