import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:10}}});

let currentRecord=null;
let draft=null;
const $=s=>document.querySelector(s);

function esc(s=''){return String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}
function clone(v){return JSON.parse(JSON.stringify(v))}

function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__minutesToast);window.__minutesToast=setTimeout(()=>el.classList.remove('show'),2200)}

async function loadMinutes(){
  const {data,error}=await supabase.from('sck_tf_meeting_minutes').select('*').eq('workshop_id',WORKSHOP).single();
  if(error){console.error(error);toast('회의결과를 불러오지 못했습니다.');return}
  currentRecord=data;draft=clone(data);render();
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
}

function renderList(key){
  const section=document.querySelector(`[data-section="${key}"]`);if(!section)return;
  const list=section.querySelector('.minutes-list');
  const items=draft.summary_data?.[key]||[];
  list.innerHTML=items.map((item,i)=>`<li class="minutes-item" data-key="${key}" data-index="${i}" contenteditable="${document.body.classList.contains('editing')?'true':'false'}">${esc(item)}<button class="item-remove" type="button" data-remove="${key}" data-index="${i}" aria-label="삭제">×</button></li>`).join('');
}

function renderRoles(){
  const roles=draft.summary_data?.roles||[];
  $('#roleGrid').innerHTML=roles.map((r,i)=>`<article class="role-card"><small>ROLE ${String(i+1).padStart(2,'0')}</small><strong data-role-title="${i}" contenteditable="${document.body.classList.contains('editing')?'true':'false'}">${esc(r.role)}</strong><p data-role-names="${i}" contenteditable="${document.body.classList.contains('editing')?'true':'false'}">${esc(r.names)}</p></article>`).join('');
}

function enterEdit(){
  document.body.classList.add('editing');
  $('#saveState').textContent='편집 중';
  draft=clone(currentRecord);
  render();
  toast('페이지에서 내용을 직접 수정할 수 있습니다.');
}

function cancelEdit(){
  document.body.classList.remove('editing');
  draft=clone(currentRecord);
  $('#saveState').textContent='저장된 회의결과';
  render();
}

function collectEdits(){
  draft.title=$('#titleInput').value.trim()||draft.title;
  draft.meeting_date=$('#dateInput').value.trim()||draft.meeting_date;
  draft.overview=$('#overviewInput').value.trim();
  ['decisions','success','ground_rules','deliverables','next_actions'].forEach(key=>{
    draft.summary_data[key]=[...document.querySelectorAll(`.minutes-item[data-key="${key}"]`)].map(el=>el.childNodes[0]?.textContent?.trim()||el.textContent.replace('×','').trim()).filter(Boolean);
  });
  const roles=draft.summary_data.roles||[];
  roles.forEach((role,i)=>{
    const title=document.querySelector(`[data-role-title="${i}"]`);
    const names=document.querySelector(`[data-role-names="${i}"]`);
    if(title)role.role=title.textContent.trim();
    if(names)role.names=names.textContent.trim();
  });
}

async function saveEdits(){
  collectEdits();
  $('#saveBtn').disabled=true;$('#saveBtn').textContent='저장 중...';
  const payload={title:draft.title,meeting_date:draft.meeting_date,overview:draft.overview,summary_data:draft.summary_data,updated_at:new Date().toISOString()};
  const {data,error}=await supabase.from('sck_tf_meeting_minutes').update(payload).eq('workshop_id',WORKSHOP).select().single();
  $('#saveBtn').disabled=false;$('#saveBtn').textContent='변경사항 저장';
  if(error){console.error(error);toast('저장에 실패했습니다.');return}
  currentRecord=data;draft=clone(data);document.body.classList.remove('editing');$('#saveState').textContent='저장된 회의결과';render();toast('회의결과를 저장했습니다.');
}

function addItem(key){
  if(!draft.summary_data[key])draft.summary_data[key]=[];
  draft.summary_data[key].push('새 항목을 입력하세요.');renderList(key);
  const items=document.querySelectorAll(`.minutes-item[data-key="${key}"]`);items[items.length-1]?.focus();
}

function removeItem(key,index){draft.summary_data[key].splice(Number(index),1);renderList(key)}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){addItem(add.dataset.add);return}
  const remove=e.target.closest('[data-remove]');if(remove){e.preventDefault();e.stopPropagation();removeItem(remove.dataset.remove,remove.dataset.index)}
});

$('#editBtn').onclick=enterEdit;
$('#cancelBtn').onclick=cancelEdit;
$('#saveBtn').onclick=saveEdits;
$('#printBtn').onclick=()=>window.print();

document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&document.body.classList.contains('editing')){e.preventDefault();saveEdits()}
  if(e.key==='Escape'&&document.body.classList.contains('editing'))cancelEdit();
});

await loadMinutes();
supabase.channel('sck-tf-meeting-minutes-live').on('postgres_changes',{event:'UPDATE',schema:'public',table:'sck_tf_meeting_minutes',filter:`workshop_id=eq.${WORKSHOP}`},payload=>{
  if(document.body.classList.contains('editing'))return;
  currentRecord=payload.new;draft=clone(payload.new);render();
}).subscribe();
