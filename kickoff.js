import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:20}}});
const participantId=localStorage.getItem('sck-tf-participant-id')||crypto.randomUUID();
localStorage.setItem('sck-tf-participant-id',participantId);
const editorToken=localStorage.getItem('sck-tf-editor-token')||crypto.randomUUID();
localStorage.setItem('sck-tf-editor-token',editorToken);

const members=['김홍섭','이영선','최현지','최예린','이호열','서종호','백예원','전현지','이예진','이슬기','김지원','김현주','김자연'];
const emojis=['🦊','🐰','🐼','🐶','🐱','🐯','🐻','🐹','🐨','🦁','🐧','🦄','🐬'];
const emojiMap=Object.fromEntries(members.map((n,i)=>[n,emojis[i]]));
const principleMeta={
  field_first:{title:'현장 우선',desc:'기술적으로 멋진 것보다 실제로 쓸 수 있는 것을 선택합니다.'},
  respect_diversity:{title:'현장의 다양성 존중',desc:'주관적 느낌보다 실제 사례와 근거로 서로 피드백합니다.'},
  try_fast:{title:'빠르게 시도하기',desc:'완벽한 초안보다 테스트 가능한 초안을 먼저 만듭니다.'},
  privacy:{title:'개인정보는 소중하게',desc:'테스트 과정에서도 개인정보와 민감정보 보호를 우선합니다.'}
};

let agreementVotes=[];
let deliverables=[];

function esc(s=''){return String(s).replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]))}
function selectedName(){return document.getElementById('agreementAuthor')?.value||localStorage.getItem('sck-tf-author')||''}
function currentName(){return selectedName()||document.getElementById('deliverableAuthor')?.value||document.getElementById('boardAuthor')?.value||''}

function syncAuthor(name){
  if(!name)return;
  localStorage.setItem('sck-tf-author',name);
  ['agreementAuthor','deliverableAuthor','boardAuthor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=name});
}

function uniqueVotesFor(key){
  const byName=new Map();
  agreementVotes.filter(v=>v.principle===key&&members.includes(v.author_name)).forEach(v=>byName.set(v.author_name,v));
  return [...byName.values()];
}

function renderAgreement(){
  const principleKeys=Object.keys(principleMeta);
  const allUnique=principleKeys.flatMap(uniqueVotesFor);
  const total=members.length*principleKeys.length;
  const pct=Math.round((allUnique.length/total)*100);
  const totalText=document.getElementById('agreementTotal');if(totalText)totalText.textContent=`${allUnique.length} / ${total}`;
  const pctText=document.getElementById('agreementPercent');if(pctText)pctText.textContent=`${pct}%`;
  const bar=document.getElementById('agreementBar');if(bar)bar.style.width=`${pct}%`;
  const name=selectedName();

  document.querySelectorAll('[data-principle]').forEach(card=>{
    const key=card.dataset.principle;
    const votes=uniqueVotesFor(key).sort((a,b)=>members.indexOf(a.author_name)-members.indexOf(b.author_name));
    card.classList.toggle('complete',votes.length===members.length);
    const count=card.querySelector('.principle-count');if(count)count.textContent=`동의 ${votes.length} / ${members.length}`;
    const wrap=card.querySelector('.agree-people');
    if(wrap)wrap.innerHTML=votes.length?votes.map(v=>`<span class="agree-person ${v.author_name===name?'is-me':''}"><b>${emojiMap[v.author_name]||'🙂'}</b><span>${esc(v.author_name)}</span></span>`).join(''):`<span class="agree-empty">아직 동의한 구성원이 없습니다.</span>`;
    const btn=card.querySelector('.agree-btn');
    if(btn){
      const mine=Boolean(name&&votes.some(v=>v.author_name===name));
      btn.classList.toggle('active',mine);
      btn.textContent=mine?'✓ 동의했습니다':'👍 동의합니다';
      btn.disabled=!name;
    }
    let done=card.querySelector('.agreement-complete');
    if(votes.length===members.length){if(!done){done=document.createElement('div');done.className='agreement-complete';card.appendChild(done)}done.textContent='✓ 13명 전원 합의 완료';}else done?.remove();
  });
}

async function loadAgreement(){
  const {data,error}=await supabase.from('sck_tf_agreement_votes').select('*').eq('workshop_id',WORKSHOP);
  if(error){console.error(error);return}
  agreementVotes=data||[];
  renderAgreement();
}

async function toggleAgreement(key){
  const name=selectedName();
  if(!name){alert('먼저 이름을 선택해주세요.');document.getElementById('agreementAuthor')?.focus();return}
  const mine=agreementVotes.find(v=>v.principle===key&&v.author_name===name);
  if(mine){
    agreementVotes=agreementVotes.filter(v=>!(v.principle===key&&v.author_name===name));
    renderAgreement();
    const {error}=await supabase.from('sck_tf_agreement_votes').delete().eq('workshop_id',WORKSHOP).eq('principle',key).eq('author_name',name);
    if(error)await loadAgreement();
  }else{
    const optimistic={workshop_id:WORKSHOP,principle:key,participant_id:participantId,author_name:name,created_at:new Date().toISOString()};
    agreementVotes.push(optimistic);
    renderAgreement();
    const {error}=await supabase.from('sck_tf_agreement_votes').upsert(optimistic,{onConflict:'workshop_id,principle,author_name'});
    if(error)await loadAgreement();
  }
}

function renderDeliverables(){
  document.querySelectorAll('[data-lane]').forEach(lane=>{
    const key=lane.dataset.lane,items=deliverables.filter(d=>d.lane===key);
    const count=lane.querySelector('.deliverable-lane-count');if(count)count.textContent=items.length;
    const list=lane.querySelector('.deliverable-list');if(!list)return;
    list.innerHTML=items.length?items.map(d=>`<article class="deliverable-card" data-id="${d.id}"><p>${esc(d.content)}</p><div class="deliverable-card-foot"><span>${emojiMap[d.author_name]||'🙂'} ${esc(d.author_name)}</span>${d.editor_token===editorToken?`<div class="deliverable-card-actions"><button type="button" data-edit="${d.id}">수정</button><button type="button" data-delete="${d.id}">삭제</button></div>`:''}</div></article>`).join(''):`<div class="deliverable-empty">아직 의견이 없습니다.<br>이 칸에서 꼭 합의해야 할 내용을 적어주세요.</div>`;
  });
  document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editDeliverable(b.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteDeliverable(b.dataset.delete)));
}

async function loadDeliverables(){const {data,error}=await supabase.from('sck_tf_deliverable_notes').select('*').eq('workshop_id',WORKSHOP).order('created_at',{ascending:true});if(error){console.error(error);return}deliverables=data||[];renderDeliverables()}

async function addDeliverable(){
  const name=currentName(),lane=document.getElementById('deliverableLane').value,content=document.getElementById('deliverableInput').value.trim();
  if(!name){alert('먼저 이름을 선택해주세요.');return}if(!content){alert('의견을 입력해주세요.');return}
  const {data,error}=await supabase.from('sck_tf_deliverable_notes').insert({workshop_id:WORKSHOP,author_name:name,lane,content,editor_token:editorToken}).select().single();
  if(error){alert('등록하지 못했습니다.');console.error(error);return}deliverables.push(data);document.getElementById('deliverableInput').value='';renderDeliverables();
}
async function editDeliverable(id){const item=deliverables.find(d=>d.id===id);if(!item)return;const next=prompt('내용 수정',item.content);if(next===null)return;const clean=next.trim();if(!clean)return;const {error}=await supabase.from('sck_tf_deliverable_notes').update({content:clean}).eq('id',id).eq('editor_token',editorToken);if(!error){item.content=clean;renderDeliverables()}else alert('수정하지 못했습니다.')}
async function deleteDeliverable(id){const item=deliverables.find(d=>d.id===id);if(!item||!confirm('이 의견을 삭제할까요?'))return;const {error}=await supabase.from('sck_tf_deliverable_notes').delete().eq('id',id).eq('editor_token',editorToken);if(!error){deliverables=deliverables.filter(d=>d.id!==id);renderDeliverables()}else alert('삭제하지 못했습니다.')}

function openDeliverableBoard(){document.getElementById('deliverableOverlay')?.classList.add('open');document.body.classList.add('body-modal-open');loadDeliverables()}
function closeDeliverableBoard(){document.getElementById('deliverableOverlay')?.classList.remove('open');document.body.classList.remove('body-modal-open')}

function wireUI(){
  const saved=localStorage.getItem('sck-tf-author')||'';
  ['agreementAuthor','deliverableAuthor'].forEach(id=>{const el=document.getElementById(id);if(el){el.value=saved;el.addEventListener('change',()=>{syncAuthor(el.value);renderAgreement()})}});
  document.querySelectorAll('.agree-btn').forEach(btn=>btn.addEventListener('click',()=>toggleAgreement(btn.closest('[data-principle]').dataset.principle)));
  document.getElementById('openDeliverables')?.addEventListener('click',openDeliverableBoard);
  document.getElementById('closeDeliverables')?.addEventListener('click',closeDeliverableBoard);
  document.getElementById('deliverableOverlay')?.addEventListener('click',e=>{if(e.target.id==='deliverableOverlay')closeDeliverableBoard()});
  document.getElementById('addDeliverable')?.addEventListener('click',addDeliverable);
  document.getElementById('deliverableInput')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')addDeliverable()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('deliverableOverlay')?.classList.contains('open'))closeDeliverableBoard()});
  document.getElementById('boardAuthor')?.addEventListener('change',e=>{syncAuthor(e.target.value);renderAgreement()});
}

function setupRealtime(){
  supabase.channel('sck-kickoff-agreement-live-v2').on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_agreement_votes'},()=>loadAgreement()).subscribe();
  supabase.channel('sck-kickoff-deliverables-live').on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_deliverable_notes'},()=>loadDeliverables()).subscribe();
}

wireUI();
await Promise.all([loadAgreement(),loadDeliverables()]);
setupRealtime();
setInterval(()=>{loadAgreement();if(document.getElementById('deliverableOverlay')?.classList.contains('open'))loadDeliverables()},5000);

const whyCopy=document.querySelector('#why .body-copy');
if(whyCopy){
  whyCopy.innerHTML='현장 실무자의 사례관리 경험과 기록 노하우를 분석해<br>반복 가능한 기준으로 바꾸고, 업무 분석부터 프롬프트 설계,<br>결과 검증까지 단계적으로 추진합니다.';
  whyCopy.style.wordBreak='keep-all';
  whyCopy.style.overflowWrap='normal';
  whyCopy.style.lineHeight='1.7';
}
