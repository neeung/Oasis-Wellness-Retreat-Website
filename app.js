const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=$('#app'), dialog=$('#info-dialog'), content=$('#dialog-content');
const node=id=>$(`[data-node-id="22:${id}"]`), named=(n,r=document)=>$(`[data-name="${n}"]`,r);
const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
let saved=safeRead('oasis-saved',[]), trip={destination:'เชียงใหม่',date:'2027-02-12',guests:2,room:'Private Garden Suite',...safeRead('oasis-trip',{})};
const persist=()=>{try{localStorage.setItem('oasis-trip',JSON.stringify(trip));localStorage.setItem('oasis-saved',JSON.stringify(saved))}catch{}};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=n=>Math.round(n).toLocaleString('en-US'), money=n=>`THB ${format(n)}`;
const dates=()=>{const start=new Date(trip.date+'T12:00:00');const end=new Date(start);end.setDate(end.getDate()+3);return `${start.getDate()}–${end.getDate()} ${new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric',calendar:'gregory'}).format(end)}`};
const records=[
{id:'stillness',name:'Stillness in Chiang Mai',price:18000,rating:4.9,reviews:128,location:'แม่ริม เชียงใหม่ ประเทศไทย',tags:['Yoga','Meditation'],days:4,image:'37785a3a-a455-4347-8bda-07c5b7965d15.jpg'},
{id:'forest',name:'The Forest Within',price:15500,rating:4.8,reviews:86,location:'หางดง เชียงใหม่ ประเทศไทย',tags:['Meditation','Nature immersion'],days:4,image:'82194673-82d9-4ed2-9ec2-1fa3638356fe.jpg'},
{id:'gentle',name:'A Gentler Rhythm',price:16800,rating:4.7,reviews:64,location:'แม่แตง เชียงใหม่ ประเทศไทย',tags:['Yoga','Spa'],days:4,image:'bec0e0b0-4819-494b-8e1e-269e7e661ec8.jpg'},
{id:'mountain',name:'Mountain Light Retreat',price:21000,rating:4.9,reviews:42,location:'สะเมิง เชียงใหม่ ประเทศไทย',tags:['Yoga','Nature immersion'],days:4,image:'c6ac44a4-67e6-4198-9844-be63015f9014.jpg'},
{id:'garden',name:'Garden Days',price:17500,rating:4.8,reviews:57,location:'ดอยสะเก็ด เชียงใหม่ ประเทศไทย',tags:['Spa','Meditation'],days:4,image:'ce732a00-92ba-45e5-9807-b0dbe0144d22.jpg'},
{id:'slow',name:'The Slow Morning',price:14500,rating:4.6,reviews:39,location:'แม่ริม เชียงใหม่ ประเทศไทย',tags:['Yoga','Nature immersion'],days:4,image:'f128c286-ccb5-4a2a-957a-ee569e110c38.jpg'}
];
records.push({id:'mist',name:'Mist & Teak Sanctuary',price:22500,rating:4.95,reviews:84,location:'หางดง เชียงใหม่',tags:['Nature immersion','Meditation'],days:5,image:'../enhanced/mist-teak-sanctuary.webp'},{id:'bamboo',name:'Bamboo Forest Shala',price:14200,rating:4.88,reviews:86,location:'หุบเขาสะเมิง ประเทศไทย',tags:['Yoga','Nature immersion'],days:3,image:'../enhanced/bamboo-meditation.webp'});
let current=records[0],pageName='home',routeVersion=0;
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2800)}
function modal(html){content.innerHTML=html;dialog.showModal()}
$('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
function link(el,href,label){if(!el)return;const a=document.createElement('a');a.className=el.className;a.innerHTML=el.innerHTML;a.href=href;for(const a2 of el.attributes)if(a2.name.startsWith('data-'))a.setAttribute(a2.name,a2.value);if(label)a.setAttribute('aria-label',label);el.replaceWith(a);return a}
function button(el,fn,label){if(!el)return;const b=document.createElement('button');b.type='button';b.className=el.className;b.innerHTML=el.innerHTML;for(const a of el.attributes)if(a.name.startsWith('data-'))b.setAttribute(a.name,a.value);if(label)b.setAttribute('aria-label',label);el.replaceWith(b);b.onclick=fn;return b}
function text(id,value){const el=node(id);if(el)el.textContent=value}
function select(el,values,value,name,label){if(!el)return;const s=document.createElement('select');s.className='surface-control';s.name=name;s.setAttribute('aria-label',label);s.innerHTML=values.map(v=>{const [k,t]=Array.isArray(v)?v:[v,v];return `<option value="${escape(k)}">${escape(t)}</option>`}).join('');s.value=value;el.replaceChildren(s);return s}
function input(el,name,type,value,placeholder,label){if(!el)return;const i=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')i.type=type;i.name=name;i.className='interactive-input';i.value=value;i.placeholder=placeholder;i.setAttribute('aria-label',label);el.replaceChildren(i);return i}
function common(){
 const header=named('Site header');if(header){link(header.firstElementChild,'#/','Oasis หน้าแรก');const nav=named('Main navigation',header);if(nav){[...nav.children].forEach((e,i)=>link(e,i<2?'#/retreats':'#/?section=approach'));const menu=document.createElement('button');menu.className='mobile-menu';menu.textContent='☰';menu.setAttribute('aria-label','เปิดเมนู');menu.setAttribute('aria-expanded','false');menu.onclick=()=>{nav.classList.toggle('open');menu.setAttribute('aria-expanded',nav.classList.contains('open'))};nav.after(menu)}}
 $$('[data-name="Footer group"]').forEach((g,gi)=>[...g.children].slice(1).forEach((e,i)=>{if(gi===0)link(e,i<2?'#/retreats':'#/?section=approach');else button(e,()=>modal(`<h2>${escape(e.textContent)}</h2><p>Oasis · ข้อมูลตัวอย่างสำหรับทดลองการจอง</p><p>สอบถามรายละเอียดได้ที่ hello@oasis.example</p>`))}));
 $$('[data-name="Account navigation"] p').forEach(e=>{if(e.textContent.includes('ช่วยเหลือ'))button(e,()=>modal('<h2>ความช่วยเหลือด้านการจอง</h2><p>hello@oasis.example</p><p>ทดลองจองได้โดยไม่ต้องเข้าสู่ระบบ</p>'));else if(e.textContent.includes('เข้าสู่ระบบ'))button(e,()=>modal('<h2>ยินดีต้อนรับสู่ Oasis</h2><p>คุณสามารถค้นหาและทดลองจองแพ็กเกจได้โดยไม่ต้องมีบัญชี</p><a class="button" href="#/retreats" onclick="this.closest(\'dialog\').close()">สำรวจกิจกรรม</a>'))});
 $$('img',app).forEach(i=>{if(!i.alt){const slot=i.closest('[data-name]')?.dataset.name||'';if(/photograph|Chiang Mai|Bamboo|Sanctuary/.test(slot))i.alt=slot==='Retreat photograph'?'บรรยากาศสถานที่พักผ่อน Oasis':slot}});
}
function search(){const form=named('Retreat search');if(!form)return;
 const dest=named('Destination Input',form), date=named('Dates Picker Input',form), guests=named('Guests Dropdown',form);
 const ds=select(named('Background',dest),[['เชียงใหม่','เชียงใหม่ ประเทศไทย'],['แม่ริม','แม่ริม เชียงใหม่'],['หางดง','หางดง เชียงใหม่'],['สะเมิง','สะเมิง เชียงใหม่'],['แม่แตง','แม่แตง เชียงใหม่'],['ดอยสะเก็ด','ดอยสะเก็ด เชียงใหม่']],trip.destination,'destination','จุดหมายปลายทาง');
 const dt=input(named('Background',date),'date','date',trip.date,'','วันที่เริ่มเดินทาง');dt.min=new Date().toLocaleDateString('en-CA');
 const gs=select(named('Background',guests),[[1,'1 คน · 1 ห้อง'],[2,'2 คน · 1 ห้อง'],[3,'3 คน · 2 ห้อง'],[4,'4 คน · 2 ห้อง']],trip.guests,'guests','จำนวนผู้เข้าพัก');
 [ds,dt,gs].forEach(c=>c.classList.add('search-control'));
 const action=named('Action surface',form);button(action,()=>{if(!dt.reportValidity())return;trip={...trip,destination:ds.value,date:dt.value,guests:Number(gs.value)};persist();if(pageName==='listing')filterResults();else location.hash='#/retreats'},'ค้นหาแพ็คเกจ');
}
function home(){search();
 const categoryIds=[9653,7551,9317,9328],cats=['Yoga','Spa','Meditation','Nature immersion'];categoryIds.forEach((id,i)=>link(node(id),'#/retreats?focus='+encodeURIComponent(cats[i])));
 const cards=$$('[data-name^="Article - Card"]');cards.forEach((el,i)=>{const id=['stillness','mist','bamboo'][i];link(el,'#/retreat/'+id)});
 button(named('Action surface',node(7723)),()=>location.hash='#/retreats');
 const heading=named('Retreat collection heading');if(heading){const buttons=$$('[data-name="Button"]',heading);buttons.forEach((e,i)=>button(e,()=>named('Retreats 3-Card Grid').scrollBy({left:i?400:-400,behavior:'smooth'}),i?'ถัดไป':'ก่อนหน้า'))}
 setupHomeMotion();
 named('Our approach')?.setAttribute('id','approach');if(location.hash.includes('section=approach'))setTimeout(()=>$('#approach')?.scrollIntoView(),50);
}
// Activate reveals only with browser support; content remains readable without motion.
let cleanupHomeMotion=()=>{};
function setupHomeMotion(){
 const root=$('.home-page');
 if(!root||!('IntersectionObserver' in window)||!window.matchMedia)return;
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches)return;
 const selectors=['[data-name="Hero story"]','[data-name="Immersive landscape"]','[data-name="Retreat search"]','[data-name="Section introduction"]','[data-node-id="22:9653"]','[data-node-id="22:7551"]','[data-node-id="22:9317"]','[data-node-id="22:9328"]','[data-name="Retreat collection heading"]','[data-name^="Article - Card"]','[data-name="Approach introduction"]','[data-name="Approach pillar"]','[data-name="A moment of stillness"] > div'];
 const targets=$$(selectors.join(','),root);
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('is-visible');observer.unobserve(target)}});
 },{threshold:0.06,rootMargin:'0px 0px -24px 0px'});
 targets.forEach(el=>{
  el.classList.add('home-reveal');
  const siblings=[...el.parentElement.children].filter(e=>targets.includes(e));
  el.style.setProperty('--reveal-delay',Math.min(siblings.indexOf(el),2)*70+'ms');
  observer.observe(el);
 });
 const showFocused=e=>{const target=e.target.closest('.home-reveal');if(target){target.classList.add('is-visible');observer.unobserve(target)}};
 const showAll=()=>{if(preference.matches){targets.forEach(el=>el.classList.add('is-visible'));observer.disconnect()}};
 root.addEventListener('focusin',showFocused);preference.addEventListener('change',showAll);
 cleanupHomeMotion=()=>{observer.disconnect();root.removeEventListener('focusin',showFocused);preference.removeEventListener('change',showAll)};
}
let listingCards=[],listingGrid,filters,sort,onlySaved=false;
function listing(params){search();onlySaved=params.get('saved')==='1';
 const originals=$$('[data-name="Retreat card"]');listingCards=originals.map((card,i)=>({card,record:records[i]}));
 const rows=$$('[data-name="Result row"]');listingGrid=document.createElement('div');listingGrid.className='cards-grid';listingGrid.id='results';rows[0].before(listingGrid);listingCards.forEach(({card,record})=>{card.dataset.retreat=record.id;listingGrid.append(card);const media=named('Retreat photograph',card);link(media,'#/retreat/'+record.id,'ดู '+record.name);const heading=named('Card content',card)?.children[1];link(heading,'#/retreat/'+record.id);link(named('View retreat action',card),'#/retreat/'+record.id,'ดูรายละเอียด '+record.name);const save=button(named('Save retreat control',card),()=>{saved=saved.includes(record.id)?saved.filter(x=>x!==record.id):[...saved,record.id];persist();updateSave();if(onlySaved)filterResults()},'บันทึก '+record.name);save.dataset.save=record.id;save.setAttribute('aria-pressed',saved.includes(record.id))});rows.forEach(r=>r.remove());
 filters=node(7178)||$('[data-name*="filters"]');if(!filters)filters=node(7185).parentElement;
 filters.dataset.name='Sidebar filters';filters.parentElement.classList.add('listing-layout');listingGrid.parentElement.classList.add('results-content');
 const toggle=document.createElement('button');toggle.className='button filter-toggle';toggle.style.display='none';toggle.textContent='ตัวกรองกิจกรรม';toggle.onclick=()=>filters.classList.toggle('expanded');filters.before(toggle);
 input(node(7191),'min','number','12000','','งบประมาณต่ำสุด').min=0;input(node(7195),'max','number','25000','','งบประมาณสูงสุด').min=0;
 $$('input[name=min],input[name=max]',filters).forEach(i=>i.classList.add('money-amount'));
 setupBudgetSlider();
 $$('[data-name="Checkbox option"]',filters).forEach(el=>{const labelText=el.lastElementChild.textContent.trim();const group=el.closest('[data-name="Filter group"]');const groupIndex=$$('[data-name="Filter group"]',filters).indexOf(group);const checked=!!$('img',el.firstElementChild);const label=document.createElement('label');label.className='filter-check';label.innerHTML=`<input type="checkbox" name="filter-${groupIndex}" value="${escape(labelText)}" ${checked?'checked':''}><span>${escape(labelText)}</span>`;el.replaceWith(label)});
 $$('[data-name="Filter accordion heading"]',filters).forEach(el=>{const options=[...el.parentElement.children].slice(1);const b=button(el,()=>{const open=b.getAttribute('aria-expanded')!=='false';options.forEach(o=>o.hidden=open);b.setAttribute('aria-expanded',!open)},el.textContent.trim());b.setAttribute('aria-expanded','true')});
 $$('input[name="filter-0"]',filters).forEach(i=>i.checked=false);
 if(params.has('focus')){$$('input[name="filter-0"]',filters).forEach(i=>i.checked=i.value===params.get('focus'))}
 button(named('Action surface',node(7296)),filterResults,'ใช้ตัวกรอง');button(node(7181),resetFilters,'ล้างค่าตัวกรอง');
 const chips=named('Applied filter chips');chips.replaceChildren();
 sort=select(named('Sort selector'),[['curated','เรียงตาม: แนะนำ'],['price','ราคา: ต่ำไปสูง'],['price-desc','ราคา: สูงไปต่ำ'],['rating','คะแนนรีวิวสูงสุด']],'curated','sort','เรียงลำดับกิจกรรม');sort.onchange=filterResults;
 updateSave();filterResults();
}
// Native range inputs drive both original handle graphics and the selected track.
function setupBudgetSlider(){
 const slider=named('Dual handle budget slider'),lowField=$('input[name=min]',filters),highField=$('input[name=max]',filters);
 if(!slider)return;
 const limit=50000,rail=document.createElement('div');rail.className='budget-rail';
 rail.append(...slider.children);slider.replaceChildren(rail);slider.classList.add('budget-slider');
 const track=named('Selected budget',slider),lowHandle=named('Minimum budget handle',slider),highHandle=named('Maximum budget handle',slider);
 const ranges=['ต่ำสุด','สูงสุด'].map((label,i)=>{
  const range=document.createElement('input');range.type='range';range.min=0;range.max=limit;range.step=1;range.className='budget-range '+(i?'budget-range-max':'budget-range-min');range.setAttribute('aria-label','ปรับงบประมาณ'+label);slider.append(range);return range;
 });
 function sync(source='fields',commit=false){
  const fromRange=source==='lowRange'||source==='highRange';
  let low=Math.max(0,Math.min(limit,Number(fromRange?ranges[0].value:lowField.value)||0));
  let high=Math.max(0,Math.min(limit,Number(fromRange?ranges[1].value:highField.value)||0));
  if(low>high){if(source==='highRange'||source==='highField')high=low;else low=high;}
  ranges[0].value=low;ranges[1].value=high;
  ranges[0].style.zIndex=low===limit?'3':'1';ranges[1].style.zIndex='2';
  ranges[0].setAttribute('aria-valuetext',money(low));ranges[1].setAttribute('aria-valuetext',money(high));
  const left=low/limit*100+'%',right=high/limit*100+'%';
  lowHandle.style.left=left;highHandle.style.left=right;track.style.left=left;track.style.width=(high-low)/limit*100+'%';
  if(commit){lowField.value=low;highField.value=high;}
 }
 [lowField,highField].forEach((field,i)=>{field.min=0;field.max=limit;field.step=1;field.addEventListener('input',()=>sync(i?'highField':'lowField'));field.addEventListener('change',()=>sync(i?'highField':'lowField',true));});
 ranges.forEach((range,i)=>range.addEventListener('input',()=>sync(i?'highRange':'lowRange',true)));
 let dragging=null;
 function move(event){const r=rail.getBoundingClientRect();if(!r.width)return;dragging.value=Math.round(Math.max(0,Math.min(1,(event.clientX-r.left)/r.width))*limit);sync(dragging===ranges[0]?'lowRange':'highRange',true);}
 slider.addEventListener('pointerdown',event=>{
  if(event.target instanceof HTMLInputElement||event.button!==0)return;
  const r=rail.getBoundingClientRect(),value=(event.clientX-r.left)/r.width*limit;
  dragging=Math.abs(value-Number(ranges[0].value))<Math.abs(value-Number(ranges[1].value))?ranges[0]:ranges[1];
  dragging.focus({preventScroll:true});slider.setPointerCapture(event.pointerId);move(event);event.preventDefault();
 });
 slider.addEventListener('pointermove',event=>{if(dragging)move(event)});
 const stop=()=>{dragging=null};slider.addEventListener('pointerup',stop);slider.addEventListener('pointercancel',stop);slider.addEventListener('lostpointercapture',stop);
 slider.syncBudget=()=>sync('fields',true);sync();
}
function updateSave(){$$('[data-save]').forEach(e=>{e.classList.toggle('save-active',saved.includes(e.dataset.save));e.setAttribute('aria-pressed',saved.includes(e.dataset.save))})}
function resetFilters(){$$('input[type=checkbox]',filters).forEach(c=>c.checked=false);$('input[name=min]',filters).value=0;$('input[name=max]',filters).value=50000;trip.destination='เชียงใหม่';persist();filterResults()}
function filterResults(){
 const min=Number($('input[name=min]',filters)?.value||0),max=Number($('input[name=max]',filters)?.value||50000);
 if(min>max){toast('งบประมาณต่ำสุดต้องไม่มากกว่าสูงสุด');return}
 named('Dual handle budget slider')?.syncBudget?.();
 const groups=Array.from({length:5},(_,i)=>$$(`input[name="filter-${i}"]:checked`,filters).map(x=>x.value));
 const matching=listingCards.filter(({record:r})=>r.price>=min&&r.price<=max&&r.location.includes(trip.destination)&&(!onlySaved||saved.includes(r.id))&&(!groups[0].length||groups[0].some(x=>r.tags.includes(x)))&&(!groups[1].length||groups[1].some(x=>x.includes('4–7')||x.includes('4-7')))&&(!groups[2].length||groups[2].some(x=>x.includes('ทุก')||r.rating>=(x.includes('4.5')?4.5:4)))&&(!groups[3].length||groups[3].some(x=>x.includes('ห้อง')||x.includes('รีสอร์ต')))&&(!groups[4].length||groups[4].every(x=>!x.includes('รถรับส่ง'))));
 const sorted=[...matching].sort((a,b)=>sort.value==='price'?a.record.price-b.record.price:sort.value==='price-desc'?b.record.price-a.record.price:sort.value==='rating'?b.record.rating-a.record.rating:records.indexOf(a.record)-records.indexOf(b.record));
 listingCards.forEach(({card})=>card.hidden=true);sorted.forEach(({card})=>{card.hidden=false;listingGrid.append(card)});
 $('.empty',listingGrid)?.remove();if(!sorted.length){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>ไม่พบกิจกรรมที่ตรงกับการค้นหา</h2><p>ลองเปลี่ยนจุดหมายหรือล้างตัวกรอง</p><button class="button">ล้างตัวกรอง</button>';listingGrid.append(e);$('button',e).onclick=resetFilters}
 text(7184,'กดใช้ตัวกรองเพื่ออัปเดตผลลัพธ์');text(7297,'อัปเดตผลลัพธ์แล้ว');text(7301,`${sorted.length} รีทรีตที่คัดสรรมาให้คุณ`);text(7302,`${dates()} · ผู้ใหญ่ ${trip.guests} คน`);
 const chips=named('Applied filter chips');chips.replaceChildren();const b=document.createElement('button');b.className='search-control money-amount';b.style.width='auto';b.textContent=`THB ${format(min)}–${format(max)} ×`;b.onclick=()=>{$('input[name=min]',filters).value=0;$('input[name=max]',filters).value=50000;filterResults()};chips.append(b);groups.flat().forEach(value=>{const b=document.createElement('button');b.className='search-control';b.style.width='auto';b.textContent=value+' ×';b.onclick=()=>{$$('input[type=checkbox]',filters).find(i=>i.value===value).checked=false;filterResults()};chips.append(b)});const clear=document.createElement('button');clear.textContent='ล้างทั้งหมด';clear.onclick=resetFilters;chips.append(clear);
 text(7449,`แสดงครบทั้ง ${sorted.length} กิจกรรมตามเงื่อนไข`);
}
const roomPrices={'Private Garden Suite':0,'Garden Deluxe Suite':2500};
const perPerson=()=>current.price+(roomPrices[trip.room]||0),subtotal=()=>perPerson()*trip.guests,service=()=>trip.guests*500,tax=()=>Math.round((subtotal()+service())*.07),total=()=>subtotal()+service()+tax();
function detail(){
 const isOther=current.id!=='stillness';if(isOther){text(6826,current.name);text(6828,current.location);text(6829,`★ ${current.rating} · ${current.reviews} รีวิว`);const img=$('img',node(6840));img.src='assets/figma/'+current.image;text(6822,'สำรวจรีทรีต / ประเทศไทย / เชียงใหม่ / '+current.name)}
 node(6826).classList.add('retreat-main-title');link(node(6822),'#/retreats','กลับไปผลการค้นหา');
 const date=input(node(7087),'date','date',trip.date,'','วันเดินทาง');date.min=new Date().toLocaleDateString('en-CA');date.onchange=()=>{if(date.checkValidity()){trip.date=date.value;persist()}};
 const guests=select(node(7091),[[1,'ผู้ใหญ่ 1 คน'],[2,'ผู้ใหญ่ 2 คน'],[3,'ผู้ใหญ่ 3 คน'],[4,'ผู้ใหญ่ 4 คน']],trip.guests,'guests','ผู้เข้าพัก');guests.onchange=()=>{trip.guests=Number(guests.value);persist();updatePrices()};
 const room=select(node(7095),Object.keys(roomPrices),trip.room,'room','ที่พัก');room.onchange=()=>{trip.room=room.value;persist();updatePrices()};
 button(named('Action surface',node(7111)),()=>{if(!date.reportValidity())return;persist();location.hash='#/checkout/'+current.id},'จองแพ็คเกจนี้');
 const save=button(named('Save retreat'),()=>{saved=saved.includes(current.id)?saved.filter(x=>x!==current.id):[...saved,current.id];persist();toast(saved.includes(current.id)?'บันทึกกิจกรรมแล้ว':'นำออกจากรายการบันทึกแล้ว')},'บันทึกกิจกรรม');if(save){save.dataset.save=current.id;updateSave()}
 button(named('Share retreat'),async()=>{try{await navigator.clipboard.writeText(location.href);toast('คัดลอกลิงก์แล้ว')}catch{modal(`<h2>แชร์กิจกรรม</h2><p>${escape(location.href)}</p>`) }},'แชร์กิจกรรม');
 button(named('View all gallery photos'),()=>modal('<div class="gallery-dialog">'+$$('[data-name="Retreat photo gallery"] img').slice(0,3).map(i=>`<img src="${i.getAttribute('src')}" alt="${escape(current.name)}">`).join('')+'</div>'),'ดูภาพทั้งหมด');
 const sections=$$('[data-name="Retreat section"]');$$('[data-name="Section tab"]').forEach((e,i)=>button(e,()=>sections[i]?.scrollIntoView(),e.textContent.trim()));
 $$('[data-name="Day summary"]').forEach((e,i)=>{const parent=e.parentElement;const following=[...parent.children].slice(1);const extra=document.createElement('div');extra.className='accordion-body';extra.hidden=i!==0;if(i===0)following.forEach(x=>extra.append(x));else{following.forEach(x=>extra.append(x));const p=document.createElement('p');p.textContent=['','07:00 โยคะยามเช้า · 09:00 อาหารเช้า · 14:00 สปาและเวลาพักส่วนตัว','07:00 โยคะและอาหารเช้า · 16:00 การทำสมาธิและทบทวนตนเอง','08:00 อาหารเช้า · 09:30 ทำสมาธิปิดทริป · 11:00 เช็กเอาต์'][i];extra.append(p)}parent.append(extra);const btn=button(e,()=>{extra.hidden=!extra.hidden;btn.setAttribute('aria-expanded',!extra.hidden)},e.textContent.trim());btn.style.textAlign='left';btn.setAttribute('aria-expanded',i===0)});
 button(node(7049),()=>modal('<h2>รีวิวจากผู้เข้าพัก</h2><p>4.9 / 5 · 128 รีวิวตัวอย่าง</p><p>“ช่วงเวลาพักระหว่างกิจกรรมมีคุณค่าไม่แพ้ตัวกิจกรรมเลย”</p><p>ข้อมูลรีวิวในหน้านี้เป็นข้อมูลตัวอย่างจากดีไซน์</p>'));
 updatePrices();
}
function updatePrices(){const amounts=pageName==='detail'?[[7082,money(perPerson())],[7099,`${money(perPerson())} × ${trip.guests} คน`],[7100,money(subtotal())],[7103,money(service())],[7106,money(tax())],[7110,format(total())]]:[[6787,`${money(perPerson())} × ${trip.guests} คน`],[6788,money(subtotal())],[6791,money(service())],[6794,money(tax())],[6798,format(total())],[6751,money(total())],[6762,current.name],[6763,current.location],[6764,`★ ${current.rating} · ${current.reviews} รีวิว`],[6774,`ผู้เข้าพักผู้ใหญ่ ${trip.guests} คน`],[6778,trip.room],[6770,`${dates()} · 4 วัน / 3 คืน`],[6682,`ข้อมูลผู้จองหลัก · คุณกำลังจองสำหรับผู้ใหญ่ ${trip.guests} คน`],[6784,`${money(perPerson())} ต่อผู้เข้าพัก · ราคารวมทริป คำนวณจากผู้เข้าพัก ${trip.guests} คน`]];amounts.forEach(([id,v])=>text(id,v));if(pageName==='checkout'){const action=named('Action surface',node(6753));if(action){action.classList.add('money-amount');action.textContent=`ชำระ ${money(total())} และยืนยัน`;}}}
function checkout(){
 link(named('Back to retreat'),'#/retreat/'+current.id);link(node(6759),'#/retreat/'+current.id);const original=named('Guest and payment form');const form=document.createElement('form');form.id='checkout-form';form.className=original.className+' booking-form';form.dataset.name='Guest and payment form';form.noValidate=false;form.append(...original.childNodes);original.replaceWith(form);
 const fields=[[6686,'firstName','text','อเล็กซ์','ชื่อ',true,'given-name'],[6690,'lastName','text','มอร์แกน','นามสกุล',true,'family-name'],[6694,'email','email','alex.morgan@example.com','อีเมล',true,'email'],[6705,'phone','tel','000 000 0000','เบอร์โทรศัพท์',true,'tel-national'],[6710,'notes','textarea','เช่น ข้อจำกัดอาหารหรือความต้องการพิเศษ','คำขอพิเศษ',false,'off'],[6722,'cardName','text','อเล็กซ์ มอร์แกน','ชื่อผู้ถือบัตร',false,'off'],[6726,'card','text','0000 0000 0000 0000','หมายเลขบัตรตัวอย่าง',false,'off'],[6732,'expiry','text','เดือน / ปี','วันหมดอายุ',false,'off'],[6736,'cvv','password','•••','รหัส CVV ตัวอย่าง',false,'off']];
 fields.forEach(([id,name,type,placeholder,label,required,auto])=>{const i=input(node(id),name,type,'',placeholder,label);i.required=required;i.autocomplete=auto;i.maxLength=name==='notes'?1000:name==='card'?19:80;if(name==='phone'){i.pattern='[0-9+() -]{8,20}';i.inputMode='tel'}if(['card','cvv'].includes(name))i.inputMode='numeric';if(name==='cvv')i.maxLength=3});
 select(node(6701),[['+66','ไทย +66'],['+65','สิงคโปร์ +65'],['+44','สหราชอาณาจักร +44'],['+1','สหรัฐฯ +1']],'+66','dialCode','รหัสประเทศ');
 for(const [id,name,required] of [[6743,'terms',true],[6746,'marketing',false]]){const box=node(id),i=document.createElement('input');i.type='checkbox';i.name=name;i.required=required;i.setAttribute('aria-label',required?'ยอมรับข้อกำหนดการจอง':'รับข่าวสารจาก Oasis');box.replaceWith(i);const parent=i.parentElement;parent.lastElementChild.onclick=()=>i.click()}
 // Demo payment fields stay in browser memory only. No request or persistence occurs.
 const pay=button(named('Action surface',node(6753)),null,'ยืนยันการจองตัวอย่าง');pay.type='submit';pay.onclick=null;
 const picture=$('img',node(6760));if(current.id!=='stillness')picture.src='assets/figma/'+current.image;
 text(6696,'ใช้สำหรับทดลองกรอกข้อมูลเท่านั้น ไม่มีการส่งอีเมลจริง');text(6754,'การจองตัวอย่าง ไม่มีการเรียกเก็บเงินจริงหรือส่งข้อมูล');
 form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const name=$('[name=firstName]',form).value;app.innerHTML=`<div class="confirmation"><p>OASIS · YOUR RESET STARTS HERE</p><h1>ยืนยันการจองตัวอย่างแล้ว</h1><p>ขอบคุณ ${escape(name)} สำหรับการทดลองจอง</p><h2 class="retreat-main-title">${escape(current.name)}</h2><p>${escape(dates())}<br>ผู้ใหญ่ ${trip.guests} คน · ${escape(trip.room)}</p><p class="money-amount">ยอดรวม ${money(total())}</p><p>นี่คือการสาธิต ไม่มีการจองจริง เรียกเก็บเงิน หรือส่งอีเมล<br>ข้อมูลส่วนบุคคลและข้อมูลบัตรไม่ถูกบันทึกหรือส่งออก</p><a class="button" href="#/retreats">ค้นหากิจกรรมเพิ่มเติม</a></div>`;window.scrollTo(0,0);document.title='Oasis · ยืนยันการจองตัวอย่าง';};updatePrices();
}
const templates={};
async function route(){cleanupHomeMotion();cleanupHomeMotion=()=>{};const version=++routeVersion;const path=(location.hash||'#/').slice(2).split('?'),segments=path[0].split('/'),params=new URLSearchParams(path[1]||'');if(segments[0]==='saved')params.set('saved','1');const name=segments[0]==='retreats'||segments[0]==='saved'?'listing':segments[0]==='retreat'?'detail':segments[0]==='checkout'?'checkout':'home';current=records.find(x=>x.id===segments[1])||records[0];pageName=name;document.title=`Oasis · ${{home:'Wellness Retreat',listing:'ค้นหากิจกรรม',detail:current.name,checkout:'ข้อมูลการจอง'}[name]}`;
 try{if(!templates[name]){const res=await fetch(`views/${name}.html`);if(!res.ok)throw Error('ไม่สามารถโหลดหน้าเว็บได้');templates[name]=await res.text()}if(version!==routeVersion)return;app.innerHTML=templates[name];common();if(name==='home')home();else if(name==='listing')listing(params);else if(name==='detail')detail();else checkout();window.scrollTo(0,0);app.focus({preventScroll:true});}catch(e){app.innerHTML='<div class="confirmation"><h1>ไม่สามารถโหลดหน้าได้</h1><p>โปรดรีเฟรชและลองอีกครั้ง</p></div>';console.error(e)}
}
window.addEventListener('hashchange',route);route();
