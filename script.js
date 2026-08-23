import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const stageData={s1:{badge:'01',label:'WEEK 1 · OFFLINE',title:'TF 구성 및 착수',desc:'같은 목표를 보고 출발하기 위한 프로젝트 셋업 단계입니다.',items:['구성원 확정','사업 목적·추진 방향 공유','역할 분담','주요 산출물 확정']},s2:{badge:'02',label:'WEEK 2–3 · ON/OFFLINE',title:'업무 분석 및 AI 설계',desc:'현장의 기록 방식을 해체해 AI가 이해할 수 있는 기준으로 바꾸는 핵심 단계입니다.',items:['사례관리 기록 유형·패턴 분석','AI 판단 기준 정리','보고서 어투·미사용 표현 정리','목적별 프롬프트 설계']},s3:{badge:'03',label:'WEEK 4–5 · ON/OFFLINE',title:'결과 테스트 및 보완',desc:'실제 사례를 통해 오류와 한계를 드러내고 현장 활용성을 검증합니다.',items:['실제 사례로 테스트','오류·한계 분석','현장 활용성 검증','프롬프트·출력 형식 수정/보완']},s4:{badge:'04',label:'WEEK 6 · OFFLINE',title:'최종 평가',desc:'성과물을 공유하고 개선 과제와 확대 적용 방향을 결정합니다.',items:['최종 성과물 공유','개선·보완 과제 도출','향후 확대 적용 방향 논의','다음 운영 제안 정리']}};

const tabs=[...document.querySelectorAll('.road-tab')];
const badge=document.getElementById('stageBadge'),label=document.getElementById('stageLabel'),title=document.getElementById('stageTitle'),desc=document.getElementById('stageDesc'),list=document.getElementById('stageList');
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(t=>t.classList.remove('active'));tab.classList.add('active');const d=stageData[tab.dataset.stage];badge.textContent=d.badge;label.textContent=d.label;title.textContent=d.title;desc.textContent=d.desc;list.innerHTML=d.items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const progress=document.getElementById('scrollProgress');
window.addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=`${max>0?(window.scrollY/max)*100:0}%`});
const menuBtn=document.getElementById('menuBtn'),mobileNav=document.getElementById('mobileNav');
menuBtn?.addEventListener('click',()=>mobileNav.classList.toggle('open'));
mobileNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileNav.classList.remove('open')));

const agreementChecks=[...document.querySelectorAll('.checklist input[type="checkbox"]')];
const savedAgreement=JSON.parse(localStorage.getItem('sck-tf-agreement')||'[]');
agreementChecks.forEach((box,i)=>{box.checked=Boolean(savedAgreement[i]);box.addEventListener('change',()=>{const s=agreementChecks.map(b=>b.checked);localStorage.setItem('sck-tf-agreement',JSON.stringify(s));document.getElementById('saveNote').textContent=s.every(Boolean)?'협업 원칙에 모두 체크했습니다. 이 브라우저에 저장되었습니다.':'체크 상태는 이 브라우저에 자동 저장됩니다.'})});

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:20}}});
const participantId=localStorage.getItem('sck-tf-participant-id')||crypto.randomUUID();
localStorage.setItem('sck-tf-participant-id',participantId);
const editorToken=localStorage.getItem('sck-tf-editor-token')||crypto.randomUUID();
localStorage.setItem('sck-tf-editor-token',editorToken);

const categories={align:{icon:'◎',label:'오늘 정해야 할 것'},ground:{icon:'☰',label:'그라운드 룰'},success:{icon:'★',label:'성공 기준'},ai:{icon:'✎',label:'AI가 도와줄 수 있는 것'},risk:{icon:'!',label:'AI가 하면 안 될 일'}};
const presentationOrder=['align','ground','success','ai','risk'];
let notes=[],reactions=[],presence=[],activeFilter='all',searchTerm='',reloadTimer=null,presentationMode=false,presentationCategory='align',prePresentationFilter='all';
const authorSelect=document.getElementById('boardAuthor');
authorSelect.value=localStorage.getItem('sck-tf-author')||'';
authorSelect.addEventListener('change',()=>{localStorage.setItem('sck-tf-author',authorSelect.value);touchPresence()});

ensurePresenceUI();
ensurePresentationUI();
installPresentationStyles();

async function loadBoard(quiet=false){
  if(!quiet)setConnection('동기화 중',true);
  const [{data:n,error:ne},{data:r,error:re}]=await Promise.all([
    supabase.from('sck_tf_workshop_notes').select('*').eq('workshop_id',WORKSHOP).order('created_at',{ascending:true}),
    supabase.from('sck_tf_workshop_reactions').select('*')
  ]);
  if(ne||re){setConnection('연결 확인 필요',false);console.error(ne||re);return;}
  notes=n||[];reactions=r||[];renderBoard();setConnection('실시간 연결됨',true);
}

function scheduleBoardReload(){
  clearTimeout(reloadTimer);
  reloadTimer=setTimeout(()=>loadBoard(true),120);
}

function setConnection(text,ok=true){const el=document.getElementById('connectionLabel');if(el)el.textContent=text;const dot=el?.parentElement?.querySelector('i');if(dot){dot.style.background=ok?'#35c76f':'#ffb020';dot.style.boxShadow=ok?'0 0 0 5px rgba(53,199,111,.08)':'0 0 0 5px rgba(255,176,32,.08)'}}
function likeCount(id){return reactions.filter(r=>r.note_id===id).length}
function isLiked(id){return reactions.some(r=>r.note_id===id&&r.participant_id===participantId)}
function canEdit(n){return n.editor_token===editorToken}

function renderBoard(){
  const filtered=notes.filter(n=>(activeFilter==='all'||n.category===activeFilter)&&(!searchTerm||`${n.content} ${n.author_name}`.toLowerCase().includes(searchTerm)));
  document.querySelectorAll('.align-col').forEach(col=>{
    const cat=col.dataset.cat;const listEl=col.querySelector('.note-list');const arr=filtered.filter(n=>n.category===cat).sort((a,b)=>likeCount(b.id)-likeCount(a.id)||new Date(a.created_at)-new Date(b.created_at));
    col.querySelector('.col-count').textContent=notes.filter(n=>n.category===cat).length;
    listEl.innerHTML=arr.length?arr.map(n=>noteTemplate(n)).join(''):`<div class="empty-note"><strong>아직 의견이 없습니다.</strong><span>첫 의견을 남겨주세요.</span></div>`;
  });
  bindNoteActions();updateInsights();applyPresentationView();
}

function noteTemplate(n){const liked=isLiked(n.id),count=likeCount(n.id);return `<article class="board-note" data-id="${n.id}"><div class="note-top"><div class="note-icon">${categories[n.category]?.icon||'•'}</div><div class="note-body"><p>${escapeHtml(n.content)}</p></div></div><div class="note-meta"><span class="author-chip">${escapeHtml(n.author_name||'익명')}</span><div class="note-actions"><button class="like-btn ${liked?'liked':''}" title="공감">♡ ${count}</button>${canEdit(n)?'<button class="edit-btn">수정</button><button class="delete-btn">삭제</button>':''}</div></div></article>`}

function bindNoteActions(){document.querySelectorAll('.board-note').forEach(card=>{const id=card.dataset.id;card.querySelector('.like-btn')?.addEventListener('click',()=>toggleLike(id));card.querySelector('.edit-btn')?.addEventListener('click',()=>editNote(id));card.querySelector('.delete-btn')?.addEventListener('click',()=>deleteNote(id))})}

async function addNote(){
  const author=authorSelect.value.trim(),cat=document.getElementById('boardCategory').value,content=document.getElementById('boardInput').value.trim();
  if(!author){toast('작성자를 먼저 선택해주세요.');authorSelect.focus();return}
  if(!content){toast('의견 내용을 입력해주세요.');return}
  const {data,error}=await supabase.from('sck_tf_workshop_notes').insert({workshop_id:WORKSHOP,author_name:author,category:cat,content,editor_token:editorToken}).select().single();
  if(error){toast('등록하지 못했습니다.');console.error(error);return}
  if(data&&!notes.some(n=>n.id===data.id)){notes.push(data);renderBoard()}
  document.getElementById('boardInput').value='';toast('의견이 실시간으로 공유되었습니다.');touchPresence();scheduleBoardReload();
}
async function editNote(id){const n=notes.find(x=>x.id===id);if(!n||!canEdit(n))return;const content=prompt('의견 수정',n.content);if(content===null)return;const clean=content.trim();if(!clean)return;const {error}=await supabase.from('sck_tf_workshop_notes').update({content:clean}).eq('id',id).eq('editor_token',editorToken);if(error){toast('수정하지 못했습니다.');return}n.content=clean;renderBoard();scheduleBoardReload()}
async function deleteNote(id){const n=notes.find(x=>x.id===id);if(!n||!canEdit(n))return;if(!confirm('이 의견을 삭제할까요?'))return;const {error}=await supabase.from('sck_tf_workshop_notes').delete().eq('id',id).eq('editor_token',editorToken);if(error){toast('삭제하지 못했습니다.');return}notes=notes.filter(x=>x.id!==id);reactions=reactions.filter(r=>r.note_id!==id);renderBoard();scheduleBoardReload()}
async function toggleLike(id){const existing=reactions.find(r=>r.note_id===id&&r.participant_id===participantId);if(existing){reactions=reactions.filter(r=>!(r.note_id===id&&r.participant_id===participantId));renderBoard();const {error}=await supabase.from('sck_tf_workshop_reactions').delete().eq('note_id',id).eq('participant_id',participantId);if(error){scheduleBoardReload();return}}else{const optimistic={note_id:id,participant_id:participantId,created_at:new Date().toISOString()};reactions.push(optimistic);renderBoard();const {error}=await supabase.from('sck_tf_workshop_reactions').insert({note_id:id,participant_id:participantId});if(error){scheduleBoardReload();return}}scheduleBoardReload()}

function updateInsights(){const authors=new Set(notes.map(n=>n.author_name).filter(Boolean));const maxLike=Math.max(0,...notes.map(n=>likeCount(n.id)));document.getElementById('needAgree').textContent=notes.filter(n=>likeCount(n.id)>=2).length;document.getElementById('topLikes').textContent=maxLike;document.getElementById('authorCount').textContent=authors.size;const top=[...notes].sort((a,b)=>likeCount(b.id)-likeCount(a.id))[0];document.getElementById('nextAction').textContent=top&&maxLike>0?`공감 1위: ${top.content}`:'공감 상위 의견을 중심으로 합의'}

function setupRealtime(){
  const channel=supabase.channel('sck-kickoff-live-v2');
  channel
    .on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_workshop_notes'},()=>scheduleBoardReload())
    .on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_workshop_reactions'},()=>scheduleBoardReload())
    .on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_workshop_presence'},()=>refreshPresence())
    .subscribe(status=>{
      if(status==='SUBSCRIBED')setConnection('실시간 연결됨',true);
      else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')setConnection('재연결 중',false);
      else if(status==='CLOSED')setConnection('연결 종료',false);
    });
}

function ensurePresenceUI(){
  const head=document.querySelector('.alignment-head');
  if(!head||document.getElementById('presencePanel'))return;
  const panel=document.createElement('div');
  panel.id='presencePanel';panel.className='presence-panel';
  panel.innerHTML=`<div class="presence-label"><span class="presence-pulse"></span><div><strong>현재 접속 중</strong><small>최근 90초 이내 활동</small></div></div><div class="presence-people" id="presencePeople"><span class="presence-empty">접속자를 확인하는 중...</span></div><strong class="presence-count" id="presenceCount">0명</strong>`;
  head.insertAdjacentElement('afterend',panel);
}

async function refreshPresence(){
  const cutoff=new Date(Date.now()-90000).toISOString();
  const {data,error}=await supabase.from('sck_tf_workshop_presence').select('*').gte('last_seen',cutoff).order('last_seen',{ascending:false});
  if(error){console.error(error);return}
  presence=data||[];
  const byName=new Map();
  presence.forEach(p=>{const name=(p.author_name||'미선택').trim()||'미선택';if(name!=='미선택'&&!byName.has(name))byName.set(name,p)});
  const people=[...byName.values()];
  const wrap=document.getElementById('presencePeople'),count=document.getElementById('presenceCount');
  if(count)count.textContent=`${people.length}명`;
  if(wrap)wrap.innerHTML=people.length?people.map(p=>`<span class="presence-chip" title="접속 중"><b>${escapeHtml(initials(p.author_name))}</b><span>${escapeHtml(p.author_name)}</span><i></i></span>`).join(''):`<span class="presence-empty">이름을 선택한 접속자가 아직 없습니다.</span>`;
  const legacy=document.getElementById('presenceText');if(legacy)legacy.textContent=`현재 접속 ${people.length}명 · 의견은 실시간으로 공유됩니다.`;
}

function initials(name=''){const clean=String(name).trim();return clean?clean.slice(-2):'--'}
async function touchPresence(){const name=authorSelect.value||'미선택';await supabase.from('sck_tf_workshop_presence').upsert({participant_id:participantId,author_name:name,last_seen:new Date().toISOString()},{onConflict:'participant_id'});await refreshPresence()}
setInterval(()=>{touchPresence();loadBoard(true)},15000);
window.addEventListener('focus',()=>{touchPresence();loadBoard(true)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){touchPresence();loadBoard(true)}});

function ensurePresentationUI(){
  const grid=document.querySelector('.alignment-grid');
  if(!grid||document.getElementById('presentationNav'))return;
  const nav=document.createElement('div');
  nav.id='presentationNav';nav.className='presentation-nav';
  nav.innerHTML=`<button type="button" id="presentationPrev" aria-label="이전 주제">←</button><div class="presentation-topic"><small id="presentationStep">1 / 5</small><strong id="presentationTitle">오늘 정해야 할 것</strong><span>상단 메뉴를 눌러 다른 주제로 이동할 수 있습니다.</span></div><button type="button" id="presentationNext" aria-label="다음 주제">→</button>`;
  grid.insertAdjacentElement('beforebegin',nav);
  document.getElementById('presentationPrev').addEventListener('click',()=>movePresentation(-1));
  document.getElementById('presentationNext').addEventListener('click',()=>movePresentation(1));
}

function installPresentationStyles(){
  if(document.getElementById('presentationFocusStyles'))return;
  const style=document.createElement('style');style.id='presentationFocusStyles';style.textContent=`
  .presentation-nav{display:none}
  .alignment-board.presentation{padding-top:34px}
  .alignment-board.presentation .alignment-head{margin-bottom:14px}
  .alignment-board.presentation .alignment-head p,.alignment-board.presentation .quick-compose,.alignment-board.presentation .board-search,.alignment-board.presentation .board-insights{display:none!important}
  .alignment-board.presentation .presence-panel{margin-bottom:14px}
  .alignment-board.presentation .board-controlbar{position:sticky;top:0;z-index:30;background:rgba(7,8,10,.94);backdrop-filter:blur(16px);padding:12px 0 14px;margin-bottom:0}
  .alignment-board.presentation .board-tabs{width:100%;justify-content:center;flex-wrap:wrap}
  .alignment-board.presentation .board-tabs button[data-filter="all"]{display:none}
  .alignment-board.presentation .board-tabs button{min-height:46px;padding:0 20px;font-size:13px}
  .alignment-board.presentation .board-tabs button.active{background:#ef2027;color:#fff;border-color:#ef2027;box-shadow:0 8px 28px rgba(239,32,39,.18)}
  .alignment-board.presentation .presentation-nav{display:grid;grid-template-columns:54px minmax(0,1fr) 54px;align-items:center;gap:18px;max-width:1180px;margin:20px auto 14px;padding:14px 18px;border:1px solid #292b30;border-radius:18px;background:#101115}
  .alignment-board.presentation .presentation-nav>button{width:48px;height:48px;border-radius:14px;border:1px solid #33353b;background:#191a1f;color:#fff;font-size:20px;cursor:pointer}
  .alignment-board.presentation .presentation-nav>button:hover{border-color:#ef2027;color:#ff6166}
  .presentation-topic{text-align:center;min-width:0}.presentation-topic small{display:block;color:#ff4e54;font-size:10px;font-weight:900;letter-spacing:.14em}.presentation-topic strong{display:block;font-size:24px;margin-top:3px}.presentation-topic span{display:block;color:#777a82;font-size:11px;margin-top:3px}
  .alignment-board.presentation .alignment-grid{display:block;overflow:visible;padding:0;max-width:1180px;margin:0 auto}
  .alignment-board.presentation .align-col{display:none!important}
  .alignment-board.presentation .align-col.presentation-active{display:flex!important;width:100%;min-width:0;min-height:620px;border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#17181c 0%,#101115 100%);box-shadow:0 30px 90px rgba(0,0,0,.28)}
  .alignment-board.presentation .align-col.presentation-active>header{padding:30px 34px 24px;align-items:flex-start}
  .alignment-board.presentation .align-col.presentation-active h3{font-size:34px;letter-spacing:-.035em;margin-bottom:8px}
  .alignment-board.presentation .align-col.presentation-active header p{font-size:13px}
  .alignment-board.presentation .align-col.presentation-active .col-count{font-size:28px;font-weight:900}
  .alignment-board.presentation .align-col.presentation-active .note-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:20px 24px 10px;align-content:start}
  .alignment-board.presentation .align-col.presentation-active .board-note{padding:20px;border-radius:18px;min-height:132px}
  .alignment-board.presentation .align-col.presentation-active .note-icon{width:44px;height:44px;flex-basis:44px;border-radius:13px;font-size:18px}
  .alignment-board.presentation .align-col.presentation-active .note-body p{font-size:17px;line-height:1.55}
  .alignment-board.presentation .align-col.presentation-active .note-meta{margin-top:18px}.alignment-board.presentation .align-col.presentation-active .author-chip{font-size:12px}.alignment-board.presentation .align-col.presentation-active .like-btn,.alignment-board.presentation .align-col.presentation-active .edit-btn,.alignment-board.presentation .align-col.presentation-active .delete-btn{font-size:12px;min-height:32px}
  .alignment-board.presentation .align-col.presentation-active .inline-add{margin:14px 24px 24px;min-height:54px;font-size:13px}
  .alignment-board.presentation .align-col.presentation-active .empty-note{grid-column:1/-1;padding:70px 20px;font-size:14px}
  .alignment-board.presentation .board-footerline{max-width:1180px;margin:0 auto;padding-top:14px}
  @media(max-width:800px){.alignment-board.presentation .board-tabs{justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto}.alignment-board.presentation .presentation-nav{grid-template-columns:44px minmax(0,1fr) 44px;padding:12px 10px}.presentation-topic strong{font-size:18px}.presentation-topic span{display:none}.alignment-board.presentation .align-col.presentation-active h3{font-size:26px}.alignment-board.presentation .align-col.presentation-active .note-list{grid-template-columns:1fr;padding:14px}.alignment-board.presentation .align-col.presentation-active>header{padding:24px 20px 18px}.alignment-board.presentation .align-col.presentation-active .board-note{min-height:0;padding:16px}}
  `;document.head.appendChild(style);
}

function setPresentationCategory(cat,scroll=false){
  if(!presentationOrder.includes(cat))cat='align';
  presentationCategory=cat;activeFilter=cat;
  boardTabs.querySelectorAll('button[data-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===cat));
  document.querySelectorAll('.align-col').forEach(col=>col.classList.toggle('presentation-active',col.dataset.cat===cat));
  const idx=presentationOrder.indexOf(cat);
  const step=document.getElementById('presentationStep'),pt=document.getElementById('presentationTitle');
  if(step)step.textContent=`${idx+1} / ${presentationOrder.length}`;
  if(pt)pt.textContent=categories[cat]?.label||cat;
  const select=document.getElementById('boardCategory');if(select)select.value=cat;
  renderBoard();
  if(scroll)document.querySelector('.presentation-nav')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function applyPresentationView(){
  const board=document.getElementById('board');
  if(!presentationMode||!board?.classList.contains('presentation')){document.querySelectorAll('.align-col').forEach(col=>col.classList.remove('presentation-active'));return}
  document.querySelectorAll('.align-col').forEach(col=>col.classList.toggle('presentation-active',col.dataset.cat===presentationCategory));
  const idx=presentationOrder.indexOf(presentationCategory);
  const step=document.getElementById('presentationStep'),pt=document.getElementById('presentationTitle');
  if(step)step.textContent=`${idx+1} / ${presentationOrder.length}`;
  if(pt)pt.textContent=categories[presentationCategory]?.label||presentationCategory;
}

function movePresentation(direction){const idx=presentationOrder.indexOf(presentationCategory);const next=(idx+direction+presentationOrder.length)%presentationOrder.length;setPresentationCategory(presentationOrder[next],false)}

const boardTabs=document.getElementById('boardTabs');
boardTabs.addEventListener('click',e=>{
  const b=e.target.closest('button[data-filter]');if(!b)return;
  if(presentationMode){const cat=b.dataset.filter==='all'?presentationCategory:b.dataset.filter;setPresentationCategory(cat,false);return}
  activeFilter=b.dataset.filter;boardTabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderBoard();
});
document.getElementById('boardSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderBoard()});
document.getElementById('addNote').addEventListener('click',addNote);
document.getElementById('boardInput').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')addNote()});
document.getElementById('openComposer').addEventListener('click',()=>{document.getElementById('quickComposer').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('boardInput').focus()});
document.querySelectorAll('.inline-add').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById('boardCategory').value=btn.dataset.category;document.getElementById('boardInput').focus();document.getElementById('quickComposer').scrollIntoView({behavior:'smooth',block:'center'})}));
document.getElementById('presentationBtn').addEventListener('click',()=>{
  const board=document.getElementById('board');presentationMode=!presentationMode;board.classList.toggle('presentation',presentationMode);
  const btn=document.getElementById('presentationBtn');btn.textContent=presentationMode?'발표 모드 종료':'발표 모드';
  if(presentationMode){prePresentationFilter=activeFilter;const starting=presentationOrder.includes(activeFilter)?activeFilter:'align';setPresentationCategory(starting,true)}else{activeFilter=prePresentationFilter||'all';boardTabs.querySelectorAll('button[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===activeFilter));renderBoard();}
});

document.addEventListener('keydown',e=>{if(!presentationMode)return;const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;if(e.key==='ArrowRight'){e.preventDefault();movePresentation(1)}else if(e.key==='ArrowLeft'){e.preventDefault();movePresentation(-1)}else if(e.key==='Escape'){document.getElementById('presentationBtn')?.click()}});

document.getElementById('exportBoard').addEventListener('click',()=>{const labels={align:'오늘 정해야 할 것',ground:'그라운드 룰',success:'성공 기준',ai:'AI가 도와줄 수 있는 것',risk:'AI가 하면 안 될 일'};const rows=[['카테고리','작성자','의견','공감','작성일'],...notes.map(n=>[labels[n.category]||n.category,n.author_name,n.content,likeCount(n.id),new Date(n.created_at).toLocaleString('ko-KR')])];const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='SCK_AI_TF_킥오프_정렬보드.csv';a.click();URL.revokeObjectURL(a.href)});

function toast(msg){const old=document.querySelector('.board-toast');old?.remove();const el=document.createElement('div');el.className='board-toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),1800)}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

await loadBoard();setupRealtime();await touchPresence();