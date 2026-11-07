/* Oasis controls: native form values, branded accessible popovers. No UI runtime dependency. */
(()=>{
 const controllers=new WeakMap();let active=null,sequence=0;
 const icon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg>';
 const check='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
 const calendarIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4.5" width="14" height="13" rx="3"/><path d="M6.5 2.5v4m7-4v4M3 9h14"/></svg>';
 function closeAll(restore=false){
  if(!active)return;const previous=active;active=null;
  previous.trigger.setAttribute('aria-expanded','false');previous.trigger.removeAttribute('aria-activedescendant');
  previous.anchor.classList.remove('is-open');previous.panel.remove();
  if(restore&&previous.trigger.isConnected)previous.trigger.focus({preventScroll:true});
 }
 function position(){
  if(!active)return;const {anchor,panel}=active;
  if(!anchor.isConnected){closeAll();return;}
  const bounds=anchor.getBoundingClientRect(),viewport=window.visualViewport;
  const leftEdge=viewport?.offsetLeft||0,topEdge=viewport?.offsetTop||0;
  const width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
  const wanted=Math.min(Math.max(bounds.width,panel.classList.contains('ui-calendar')?304:180),width-24);
  panel.style.width=wanted+'px';panel.style.maxHeight=Math.min(360,height-24)+'px';
  const roomBelow=height+topEdge-bounds.bottom-16,roomAbove=bounds.top-topEdge-16;
  const above=roomBelow<Math.min(panel.scrollHeight,280)&&roomAbove>roomBelow;
  panel.style.maxHeight=Math.max(80,Math.min(360,above?roomAbove:roomBelow,height-24))+'px';
  const panelHeight=panel.getBoundingClientRect().height;
  panel.style.left=Math.max(leftEdge+12,Math.min(bounds.left,leftEdge+width-wanted-12))+'px';
  panel.style.top=Math.max(topEdge+12,above?bounds.top-panelHeight-8:bounds.bottom+8)+'px';
  panel.dataset.side=above?'top':'bottom';
 }
 function show(anchor,trigger,panel){
  closeAll();panel.classList.add('ui-popover');panel.setAttribute('popover','manual');
  panel.id='oasis-popup-'+(++sequence);document.body.append(panel);
  active={anchor,trigger,panel};trigger.setAttribute('aria-controls',panel.id);trigger.setAttribute('aria-expanded','true');anchor.classList.add('is-open');
  if(panel.showPopover)panel.showPopover();position();
 }
 document.addEventListener('pointerdown',event=>{if(active&&!active.anchor.contains(event.target)&&!active.panel.contains(event.target))closeAll();});
 document.addEventListener('keydown',event=>{if(active&&event.key==='Escape'){event.preventDefault();event.stopPropagation();closeAll(true);}},true);
 window.addEventListener('resize',position);document.addEventListener('scroll',position,true);
 window.visualViewport?.addEventListener('resize',position);window.visualViewport?.addEventListener('scroll',position);

 function enhanceSelect(select){
  if(controllers.has(select)){controllers.get(select)();return;}
  const wrapper=document.createElement('div');wrapper.className=select.className+' ui-select';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='ui-select-trigger';trigger.dataset.selectName=select.name;
  trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');
  trigger.setAttribute('aria-label',select.getAttribute('aria-label')||select.name);
  if(select.title)trigger.title=select.title;
  const label=document.createElement('span');label.className='ui-select-value';trigger.append(label);trigger.insertAdjacentHTML('beforeend',icon);
  select.before(wrapper);wrapper.append(select,trigger);select.classList.add('ui-native-select');select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  const sync=()=>{label.textContent=select.selectedOptions[0]?.textContent||'เลือก';trigger.disabled=select.disabled;};controllers.set(select,sync);sync();
  const options=()=>[...select.options].filter(o=>!o.disabled&&!o.hidden);
  let focused=0,typeahead='',lastKey=0;
  function highlight(index,scroll=true){
   const items=[...active.panel.querySelectorAll('[role=option]')];if(!items.length)return;
   focused=(index+items.length)%items.length;items.forEach((item,i)=>item.classList.toggle('is-active',i===focused));
   trigger.setAttribute('aria-activedescendant',items[focused].id);if(scroll)items[focused].scrollIntoView({block:'nearest'});
  }
  function commit(index){
   const option=options()[index];if(!option)return;select.value=option.value;
   select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));closeAll(true);
  }
  function open(){
   const panel=document.createElement('div');panel.className='ui-options';panel.setAttribute('role','listbox');panel.setAttribute('aria-label',trigger.getAttribute('aria-label'));
   options().forEach((option,index)=>{
    const item=document.createElement('div');item.className='ui-option';item.setAttribute('role','option');item.setAttribute('aria-selected',option.selected);item.dataset.value=option.value;
    item.id='oasis-option-'+(++sequence);const text=document.createElement('span');text.textContent=option.textContent;item.append(text);item.insertAdjacentHTML('beforeend',check);
    item.onpointermove=()=>{if(active?.trigger===trigger)highlight(index,false)};item.onpointerdown=e=>e.preventDefault();item.onclick=()=>commit(index);panel.append(item);
   });
   show(wrapper,trigger,panel);highlight(Math.max(0,options().findIndex(o=>o.selected)),false);
  }
  trigger.onclick=()=>active?.trigger===trigger?closeAll():open();
  trigger.onkeydown=event=>{
   const isOpen=active?.trigger===trigger;
   if(event.key==='Tab'){if(isOpen)closeAll();return;}
   if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(event.key)){
    event.preventDefault();
    if(!isOpen){open();if(event.key==='Home')highlight(0);else if(event.key==='End')highlight(options().length-1);return;}
    if(event.key==='Enter'||event.key===' '){commit(focused);return;}
    highlight(event.key==='Home'?0:event.key==='End'?options().length-1:focused+(event.key==='ArrowDown'?1:-1));return;
   }
   if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){
    event.preventDefault();const now=Date.now();typeahead=now-lastKey>650?event.key:typeahead+event.key;lastKey=now;
    if(!isOpen)open();const match=options().findIndex(o=>o.textContent.trim().toLocaleLowerCase().startsWith(typeahead.toLocaleLowerCase()));if(match>=0)highlight(match);
   }
  };
  select.addEventListener('change',()=>{sync();if(active?.trigger===trigger)closeAll();});
  select.form?.addEventListener('reset',()=>queueMicrotask(sync));
 }

 const iso=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const parse=value=>new Date(value+'T12:00:00');
 const dayLabel=date=>new Intl.DateTimeFormat('th-TH',{dateStyle:'full',calendar:'gregory'}).format(date);
 function enhanceDate(input){
  if(input.dataset.uiDate)return;input.dataset.uiDate='true';
  const field=input.parentElement;field.classList.add('ui-date-field');
  const trigger=document.createElement('button');trigger.type='button';trigger.className='ui-calendar-trigger';trigger.setAttribute('aria-label','เปิดปฏิทิน '+input.getAttribute('aria-label'));trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');trigger.innerHTML=calendarIcon;field.append(trigger);
  let month,focused;
  const allowed=date=>(!input.min||iso(date)>=input.min)&&(!input.max||iso(date)<=input.max);
  function commit(date){if(!allowed(date))return;input.value=iso(date);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));closeAll(true);}
  function render(focus=false){
   const panel=active.panel;panel.replaceChildren();
   const header=document.createElement('div');header.className='ui-calendar-heading';
   const title=document.createElement('p');title.id=panel.id+'-title';title.textContent=new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric',calendar:'gregory'}).format(month);title.setAttribute('aria-live','polite');panel.setAttribute('aria-labelledby',title.id);
   function shiftMonth(offset){
    const target=new Date(month.getFullYear(),month.getMonth()+offset,1,12);const last=new Date(target.getFullYear(),target.getMonth()+1,0,12);
    focused=new Date(target.getFullYear(),target.getMonth(),Math.min(focused.getDate(),last.getDate()),12);
    if(input.min&&iso(focused)<input.min)focused=parse(input.min);if(input.max&&iso(focused)>input.max)focused=parse(input.max);
    month=new Date(focused.getFullYear(),focused.getMonth(),1,12);render(true);
   }
   for(const offset of [-1,1]){
    const button=document.createElement('button');button.type='button';button.className='ui-calendar-nav';button.setAttribute('aria-label',offset<0?'เดือนก่อนหน้า':'เดือนถัดไป');button.innerHTML=icon;button.dataset.direction=offset;
    const edge=new Date(month.getFullYear(),month.getMonth()+(offset<0?0:1),offset<0?0:1,12);button.disabled=offset<0?!!input.min&&iso(edge)<input.min:!!input.max&&iso(edge)>input.max;
    button.onclick=()=>shiftMonth(offset);if(offset<0)header.append(button,title);else header.append(button);
   }
   panel.append(header);const weekdays=document.createElement('div');weekdays.className='ui-calendar-weekdays';weekdays.setAttribute('aria-hidden','true');
   ['จ','อ','พ','พฤ','ศ','ส','อา'].forEach(day=>{const label=document.createElement('span');label.textContent=day;weekdays.append(label)});panel.append(weekdays);
   const grid=document.createElement('div');grid.className='ui-calendar-grid';grid.setAttribute('role','grid');grid.setAttribute('aria-labelledby',title.id);
   const start=new Date(month);start.setDate(1-(month.getDay()+6)%7);const today=iso(new Date());
   for(let week=0;week<6;week++){
    const row=document.createElement('div');row.setAttribute('role','row');
    for(let column=0;column<7;column++){
     const date=new Date(start);date.setDate(start.getDate()+week*7+column);const value=iso(date);
     const button=document.createElement('button');button.type='button';button.className='ui-calendar-day';button.textContent=date.getDate();button.dataset.date=value;button.dataset.outside=date.getMonth()!==month.getMonth();button.disabled=!allowed(date);
     button.setAttribute('role','gridcell');button.setAttribute('aria-label',dayLabel(date));button.setAttribute('aria-selected',value===input.value);if(value===today)button.setAttribute('aria-current','date');button.tabIndex=value===iso(focused)?0:-1;button.onclick=()=>commit(date);
     button.onkeydown=event=>{
      if(event.key==='Tab'){closeAll(true);return;}
      if(event.key==='PageUp'||event.key==='PageDown'){event.preventDefault();shiftMonth(event.key==='PageUp'?-1:1);return;}
      const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-(date.getDay()+6)%7,End:6-(date.getDay()+6)%7};
      if(!Object.hasOwn(offsets,event.key))return;event.preventDefault();const next=new Date(date);next.setDate(date.getDate()+offsets[event.key]);if(!allowed(next))return;
      focused=next;month=new Date(next.getFullYear(),next.getMonth(),1,12);render(true);
     };row.append(button);
    }grid.append(row);
   }panel.append(grid);
   const footer=document.createElement('div');footer.className='ui-calendar-footer';const todayButton=document.createElement('button');todayButton.type='button';todayButton.textContent='วันนี้';todayButton.disabled=!allowed(new Date());todayButton.onclick=()=>commit(new Date());footer.append(todayButton);panel.append(footer);position();
   if(focus)panel.querySelector('[tabindex="0"]')?.focus({preventScroll:true});
  }
  trigger.onclick=()=>{
   if(active?.trigger===trigger){closeAll();return;}
   focused=input.value?parse(input.value):new Date();if(input.min&&iso(focused)<input.min)focused=parse(input.min);if(input.max&&iso(focused)>input.max)focused=parse(input.max);
   month=new Date(focused.getFullYear(),focused.getMonth(),1,12);const panel=document.createElement('div');panel.className='ui-calendar';panel.setAttribute('role','dialog');
   show(field,trigger,panel);render(true);
  };
 }
 function enhance(root){
  root.querySelectorAll('select').forEach(enhanceSelect);root.querySelectorAll('input[type=date]').forEach(enhanceDate);
  root.querySelectorAll('.interactive-input').forEach(input=>{
   if(input.dataset.uiInput)return;input.dataset.uiInput='true';input.parentElement.classList.add('ui-field');
   const validate=()=>{const invalid=!input.checkValidity();input.setAttribute('aria-invalid',invalid);input.parentElement.classList.toggle('ui-field-invalid',invalid);};
   input.addEventListener('blur',()=>{if(input.value)validate()});input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')validate()});input.addEventListener('invalid',()=>{input.setAttribute('aria-invalid','true');input.parentElement.classList.add('ui-field-invalid')});
  });
 }
 window.OasisUI={enhance,closeAll};
})();
