import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:10}}});

let currentRecord=null;
let draft=null;
let dirty=false;
let dragged=null;
const $=s=>document.querySelector(s);

function esc(s=''){return String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}
function clone(v){return JSON.parse(JSON.stringify(v))}
function isEditing(){return document.body.classList.contains('editing')}

function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__minutesToast);window.__minutesToast=setTimeout(()=>el.classList.remove('show'),2200)}

function installEditSessionUI(){
  if($('#batchEditStyles'))return;
  const style=document.createElement('style');
  style.id='batchEditStyles';
  style.textContent=`
    body.editing .toolbar{box-shadow:0 14px 40px rgba(237,28,36,.08);border-color:#f0b9bc}
    .edit-session-hint{display:none;align-items:center;gap:8px;margin-top:5px;color:#9b7b7e!important;font-size:10px!important}.edit-session-hint i{width:7px;height:7px;border-radius:50%;background:#ed1c24;box-shadow:0 0 0 4px rgba(237,28,36,.08)}body.editing .edit-session-hint{display:flex}
    .drag-handle{display:none;position:absolute;left:10px;top:50%;transform:translateY(-50%);width:25px;height:32px;border:0;border-radius:8px;background:transparent;color:#a4a6aa;cursor:grab;font-size:15px;line-height:1;letter-spacing:-3px;padding:0 4px;z-index:2}.drag-handle:active{cursor:grabbing}body.editing .drag-handle{display:grid;place-items:center}
    body.editing .minutes-item{padding-left:46px;padding-right:44px;cursor:text;transition:opacity .15s ease,transform .15s ease,box-shadow .15s ease,border-color .15s ease;border:1px solid transparent}
    body.editing .minutes-item::before{display:none}.item-text{display:block;min-height:1.5em;outline:0}.item-text[contenteditable="true"]{border-radius:7px}.item-text[contenteditable="true"]:focus{background:#fff;box-shadow:0 0 0 5px #fff,0 0 0 7px rgba(237,28,36,.12)}
    .minutes-item.dragging{opacity:.35;transform:scale(.985)}.minutes-item.drag-over-before{box-shadow:0 -3px 0 #ed1c24}.minutes-item.drag-over-after{box-shadow:0 3px 0 #ed1c24}
    .role-card{position:relative}.role-drag{display:none;position:absolute;right:10px;top:9px;width:28px;height:28px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.06);color:#93969c;cursor:grab;font-size:13px}body.editing .role-drag{display:grid;place-items:center}.role-card.dragging{opacity:.35}.role-card.drag-over-before{box-shadow:-4px 0 0 #ed1c24}.role-card.drag-over-after{box-shadow:4px 0 0 #ed1c24}
    body.editing .role-card{padding-top:42px;transition:opacity .15s ease,transform .15s ease,box-shadow .15s ease}.role-text[contenteditable="true"]{outline:1px dashed rgba(255,255,255,.28);outline-offset:3px;border-radius:4px}.role-text[contenteditable="true"]:focus{outline:2px solid rgba(255,107,112,.7)}
    .role-name-display{margin:10px 0 0;color:#c3c5c9;font-size:12px;line-height:1.55;word-break:keep-all}.role-name-empty{color:#777b82;font-style:normal}.role-name-input{display:none;width:100%;height:40px;margin-top:13px;padding:0 11px;border:1px solid #44464d;border-radius:10px;background:#111216;color:#fff;font:700 12px/1 'DM Sans','Noto Sans KR',sans-serif;outline:0}.role-name-input::placeholder{color:#6e7178}.role-name-input:focus{border-color:#ff6b70;box-shadow:0 0 0 3px rgba(255,107,112,.12)}body.editing .role-name-display{display:none}body.editing .role-name-input{display:block}
    .batch-save-count{display:none;padding:5px 8px;border-radius:999px;background:#fff0f1;color:#c8171d;font-size:9px;font-weight:900;white-space:nowrap}body.editing .batch-save-count{display:inline-flex}.batch-save-count.clean{background:#f1f1ef;color:#929499}
    .tool-btn.primary.save-pulse{box-shadow:0 0 0 4px rgba(237,28,36,.12)}
    @media(max-width:620px){.edit-session-hint{max-width:210px;line-height:1.4}.drag-handle{left:6px}.minutes-item.drag-over-before{box-shadow:0 -3px 0 #ed1c24}.role-card.drag-over-before{box-shadow:0 -3px 0 #ed1c24}.role-card.drag-over-after{box-shadow:0 3px 0 #ed1c24}.role-name-input{font-size:13px}}
    @media(prefers-reduced-motion:reduce){body.editing .minutes-item,.role-card{transition:none}}
  `;
  document.head.appendChild(style);

  const status=$('.toolbar-status');
  if(status&&!$('#editSessionHint')){
    const hint=document.createElement('span');
    hint.id='editSessionHint';hint.className='edit-session-hint';
    hint.innerHTML='<i></i>여러 항목을 수정·재정렬한 뒤 마지막에 한 번만 저장합니다.';
    status.appendChild(hint);
  }
  const actions=$('.toolbar-actions');
  if(actions&&!$('#batchSaveCount')){
    const badge=document.createElement('span');badge.id='batchSaveCount';badge.className='batch-save-count clean';badge.textContent='변경 없음';
    actions.insertBefore(badge,$('#cancelBtn'));
  }
  if($('#saveBtn'))$('#saveBtn').textContent='모든 변경사항 저장';
}

async function loadMinutes(){
  const {data,error}=await supabase.from('sck_tf_meeting_minutes').select('*').eq('workshop_id',WORKSHOP).single();
  if(error){console.error(error);toast('회의결과를 불러오지 못했습니다.');return}
  currentRecord=data;draft=clone(data);dirty=false;render();updateDirtyUI();
}

function render(){
  if(!draft)return;
  $('#titleDisplay').textContent=draft.title;
  $('#titleInput').value=draft.title;
  $('#dateDisplay').textContent=draft.meeting_date;
  $('#dateInput').value=draft.meeting_date;
  $('#overviewDisplay').textContent=draft.overview;
  $('#overviewInput').value=draft.overview;
  const c=draft.summary_data?.source_counts||{};
  $('#statBoard').textContent=c.board_notes??'-';
  $('#statDeliverable').textContent=c.deliverable_notes??'-';
  $('#statAgreement').textContent=c.agreement_people??'-';
  $('#statRole').textContent=c.role_slots??'-';
  ['decisions','success','ground_rules','deliverables','next_actions'].forEach(renderList);
  renderRoles();
  const updated=new Date(draft.updated_at||Date.now());
  $('#updatedAt').textContent=`마지막 저장 ${updated.toLocaleString('ko-KR',{dateStyle:'medium',timeStyle:'short'})}`;
  bindEditableInputs();
}

function renderList(key){
  const section=document.querySelector(`[data-section="${key}"]`);if(!section)return;
  const list=section.querySelector('.minutes-list');
  const items=draft.summary_data?.[key]||[];
  list.innerHTML=items.map((item,i)=>`<li class="minutes-item" data-key="${key}" data-index="${i}" draggable="${isEditing()?'true':'false'}"><button class="drag-handle" type="button" tabindex="-1" aria-label="드래그해서 순서 변경">⠿</button><span class="item-text" data-item-text="${key}" data-index="${i}" contenteditable="${isEditing()?'true':'false'}">${esc(item)}</span><button class="item-remove" type="button" data-remove="${key}" data-index="${i}" aria-label="삭제">×</button></li>`).join('');
}

function renderRoles(){
  const roles=draft.summary_data?.roles||[];
  $('#roleGrid').innerHTML=roles.map((r,i)=>{
    const names=String(r.names||'').trim();
    return `<article class="role-card" data-role-card="${i}" draggable="${isEditing()?'true':'false'}"><button class="role-drag" type="button" tabindex="-1" aria-label="드래그해서 역할 순서 변경">⠿</button><small>ROLE ${String(i+1).padStart(2,'0')}</small><strong class="role-text" data-role-title="${i}" contenteditable="${isEditing()?'true':'false'}">${esc(r.role)}</strong><p class="role-name-display">${names?esc(names):'<span class="role-name-empty">담당자 미지정</span>'}</p><input class="role-name-input" data-role-names="${i}" type="text" value="${esc(names)}" placeholder="담당자 이름 직접 입력 · 예: 김OO, 이OO" aria-label="${esc(r.role)} 담당자 이름" /></article>`;
  }).join('');
}

function bindEditableInputs(){
  if(!isEditing())return;
  document.querySelectorAll('[data-item-text]').forEach(el=>el.addEventListener('input',()=>{
    const key=el.dataset.itemText,index=Number(el.dataset.index);
    draft.summary_data[key][index]=el.textContent.trim();markDirty();
  }));
  document.querySelectorAll('[data-role-title]').forEach(el=>el.addEventListener('input',()=>{
    const i=Number(el.dataset.roleTitle);if(draft.summary_data.roles?.[i])draft.summary_data.roles[i].role=el.textContent.trim();markDirty();
  }));
  document.querySelectorAll('[data-role-names]').forEach(el=>el.addEventListener('input',()=>{
    const i=Number(el.dataset.roleNames);if(draft.summary_data.roles?.[i])draft.summary_data.roles[i].names=el.value.trim();markDirty();
  }));
}

function syncTopFields(){
  if(!draft)return;
  draft.title=$('#titleInput').value.trim()||draft.title;
  draft.meeting_date=$('#dateInput').value.trim()||draft.meeting_date;
  draft.overview=$('#overviewInput').value.trim();
}

function syncListsFromDOM(){
  ['decisions','success','ground_rules','deliverables','next_actions'].forEach(key=>{
    const els=[...document.querySelectorAll(`.item-text[data-item-text="${key}"]`)];
    if(els.length)draft.summary_data[key]=els.map(el=>el.textContent.trim()).filter(Boolean);
  });
}

function syncRolesFromDOM(){
  const cards=[...document.querySelectorAll('[data-role-card]')];
  if(!cards.length)return;
  draft.summary_data.roles=cards.map(card=>({
    role:card.querySelector('[data-role-title]')?.textContent.trim()||'',
    names:card.querySelector('[data-role-names]')?.value.trim()||''
  }));
}

function syncAllFromDOM(){syncTopFields();syncListsFromDOM();syncRolesFromDOM()}

function markDirty(){
  if(!isEditing())return;
  dirty=true;updateDirtyUI();
}

function updateDirtyUI(){
  const badge=$('#batchSaveCount'),save=$('#saveBtn');
  if(badge){badge.textContent=dirty?'저장 전 변경사항 있음':'변경 없음';badge.classList.toggle('clean',!dirty)}
  if(save){save.disabled=!dirty;save.classList.toggle('save-pulse',dirty);if(!save.dataset.saving)save.textContent='모든 변경사항 저장'}
  if(isEditing())$('#saveState').textContent=dirty?'편집 중 · 저장 전':'편집 중 · 변경 없음';
}

function enterEdit(){
  document.body.classList.add('editing');
  draft=clone(currentRecord);dirty=false;render();updateDirtyUI();
  toast('역할별 담당자 이름을 직접 입력하고 다른 내용과 함께 한 번에 저장할 수 있습니다.');
}

function cancelEdit(){
  if(dirty&&!confirm('저장하지 않은 변경사항을 모두 취소할까요?'))return;
  document.body.classList.remove('editing');
  draft=clone(currentRecord);dirty=false;
  $('#saveState').textContent='저장된 회의결과';render();updateDirtyUI();
}

async function saveEdits(){
  if(!isEditing()||!dirty)return;
  syncAllFromDOM();
  const save=$('#saveBtn');save.disabled=true;save.dataset.saving='1';save.textContent='한 번에 저장 중...';
  const payload={title:draft.title,meeting_date:draft.meeting_date,overview:draft.overview,summary_data:draft.summary_data,updated_at:new Date().toISOString()};
  const {data,error}=await supabase.from('sck_tf_meeting_minutes').update(payload).eq('workshop_id',WORKSHOP).select().single();
  delete save.dataset.saving;
  if(error){console.error(error);save.disabled=false;save.textContent='모든 변경사항 저장';toast('저장에 실패했습니다. 변경사항은 화면에 그대로 남아 있습니다.');return}
  currentRecord=data;draft=clone(data);dirty=false;document.body.classList.remove('editing');$('#saveState').textContent='저장된 회의결과';render();updateDirtyUI();toast('수정한 내용을 한 번에 저장했습니다.');
}

function addItem(key){
  syncAllFromDOM();
  if(!draft.summary_data[key])draft.summary_data[key]=[];
  draft.summary_data[key].push('새 항목을 입력하세요.');markDirty();renderList(key);bindEditableInputs();
  const items=document.querySelectorAll(`.item-text[data-item-text="${key}"]`);const last=items[items.length-1];last?.focus();selectAllText(last);
}

function removeItem(key,index){
  syncAllFromDOM();
  draft.summary_data[key].splice(Number(index),1);markDirty();renderList(key);bindEditableInputs();
}

function selectAllText(el){if(!el)return;const range=document.createRange();range.selectNodeContents(el);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range)}

function reorderArray(arr,from,to){
  if(from===to||from<0||to<0||from>=arr.length)return;
  const [item]=arr.splice(from,1);arr.splice(Math.min(to,arr.length),0,item);
}

function clearDragIndicators(){document.querySelectorAll('.dragging,.drag-over-before,.drag-over-after').forEach(el=>el.classList.remove('dragging','drag-over-before','drag-over-after'))}

document.addEventListener('dragstart',e=>{
  if(!isEditing())return;
  const item=e.target.closest('.minutes-item');
  if(item){syncAllFromDOM();dragged={type:'item',key:item.dataset.key,index:Number(item.dataset.index)};item.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','move');return}
  const role=e.target.closest('.role-card');
  if(role){syncAllFromDOM();dragged={type:'role',index:Number(role.dataset.roleCard)};role.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','move')}
});

document.addEventListener('dragover',e=>{
  if(!dragged||!isEditing())return;
  if(dragged.type==='item'){
    const target=e.target.closest('.minutes-item');if(!target||target.dataset.key!==dragged.key)return;
    e.preventDefault();clearDragIndicators();document.querySelector(`.minutes-item[data-key="${dragged.key}"][data-index="${dragged.index}"]`)?.classList.add('dragging');
    const rect=target.getBoundingClientRect();target.classList.add(e.clientY<rect.top+rect.height/2?'drag-over-before':'drag-over-after');
  }else{
    const target=e.target.closest('.role-card');if(!target)return;e.preventDefault();clearDragIndicators();document.querySelector(`.role-card[data-role-card="${dragged.index}"]`)?.classList.add('dragging');
    const rect=target.getBoundingClientRect();const before=window.innerWidth>900?e.clientX<rect.left+rect.width/2:e.clientY<rect.top+rect.height/2;target.classList.add(before?'drag-over-before':'drag-over-after');
  }
});

document.addEventListener('drop',e=>{
  if(!dragged||!isEditing())return;
  if(dragged.type==='item'){
    const target=e.target.closest('.minutes-item');if(!target||target.dataset.key!==dragged.key)return;e.preventDefault();
    const targetIndex=Number(target.dataset.index),rect=target.getBoundingClientRect(),after=e.clientY>=rect.top+rect.height/2;
    let insertIndex=targetIndex+(after?1:0);if(dragged.index<insertIndex)insertIndex--;
    reorderArray(draft.summary_data[dragged.key],dragged.index,insertIndex);markDirty();renderList(dragged.key);bindEditableInputs();
  }else{
    const target=e.target.closest('.role-card');if(!target)return;e.preventDefault();
    const targetIndex=Number(target.dataset.roleCard),rect=target.getBoundingClientRect();const after=window.innerWidth>900?e.clientX>=rect.left+rect.width/2:e.clientY>=rect.top+rect.height/2;
    let insertIndex=targetIndex+(after?1:0);if(dragged.index<insertIndex)insertIndex--;
    reorderArray(draft.summary_data.roles,dragged.index,insertIndex);markDirty();renderRoles();bindEditableInputs();
  }
  dragged=null;clearDragIndicators();
});

document.addEventListener('dragend',()=>{dragged=null;clearDragIndicators()});

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){addItem(add.dataset.add);return}
  const remove=e.target.closest('[data-remove]');if(remove){e.preventDefault();e.stopPropagation();removeItem(remove.dataset.remove,remove.dataset.index)}
});

['titleInput','dateInput','overviewInput'].forEach(id=>$('#'+id)?.addEventListener('input',()=>{syncTopFields();markDirty()}));

$('#editBtn').onclick=enterEdit;
$('#cancelBtn').onclick=cancelEdit;
$('#saveBtn').onclick=saveEdits;
$('#printBtn').onclick=()=>window.print();

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&isEditing()){e.preventDefault();saveEdits()}
  if(e.key==='Escape'&&isEditing()&&!document.activeElement?.matches('[contenteditable="true"],input,textarea'))cancelEdit();
});

window.addEventListener('beforeunload',e=>{if(isEditing()&&dirty){e.preventDefault();e.returnValue=''}});

installEditSessionUI();
await loadMinutes();
supabase.channel('sck-tf-meeting-minutes-live').on('postgres_changes',{event:'UPDATE',schema:'public',table:'sck_tf_meeting_minutes',filter:`workshop_id=eq.${WORKSHOP}`},payload=>{
  if(isEditing())return;
  currentRecord=payload.new;draft=clone(payload.new);dirty=false;render();updateDirtyUI();
}).subscribe();
