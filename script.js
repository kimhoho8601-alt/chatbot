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
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);
const participantId=localStorage.getItem('sck-tf-participant-id')||crypto.randomUUID();
localStorage.setItem('sck-tf-participant-id',participantId);
const editorToken=localStorage.getItem('sck-tf-editor-token')||crypto.randomUUID();
localStorage.setItem('sck-tf-editor-token',editorToken);

const categories={align:{icon:'◎'},ground:{icon:'☰'},success:{icon:'★'},ai:{icon:'✎'},risk:{icon:'!'}};
let notes=[],reactions=[],activeFilter='all',searchTerm='';
const authorSelect=document.getElementById('boardAuthor');
authorSelect.value=localStorage.getItem('sck-tf-author')||'';
authorSelect.addEventListener('change',()=>{localStorage.setItem('sck-tf-author',authorSelect.value);touchPresence()});

async function loadBoard(){
  setConnection('동기화 중');
  const [{data:n,error:ne},{data:r,error:re}]=await Promise.all([
    supabase.from('sck_tf_workshop_notes').select('*').eq('workshop_id',WORKSHOP).order('created_at',{ascending:true}),
    supabase.from('sck_tf_workshop_reactions').select('*')
  ]);
  if(ne||re){setConnection('연결 확인 필요',false);console.error(ne||re);return;}
  notes=n||[];reactions=r||[];renderBoard();setConnection('실시간 연결됨',true);
}

function setConnection(text,ok=true){const el=document.getElementById('connectionLabel');if(el)el.textContent=text;const dot=el?.parentElement?.querySelector('i');if(dot)dot.style.background=ok?'#35c76f':'#ffb020'}
function likeCount(id){return reactions.filter(r=>r.note_id===id).length}
function isLiked(id){return reactions.some(r=>r.note_id===id&&r.participant_id===participantId)}
function canEdit(n){return n.editor_token===editorToken&&n.author_name!=='킥오프 제안'}

function renderBoard(){
  const filtered=notes.filter(n=>(activeFilter==='all'||n.category===activeFilter)&&(!searchTerm||`${n.content} ${n.author_name}`.toLowerCase().includes(searchTerm)));
  document.querySelectorAll('.align-col').forEach(col=>{
    const cat=col.dataset.cat;const listEl=col.querySelector('.note-list');const arr=filtered.filter(n=>n.category===cat).sort((a,b)=>likeCount(b.id)-likeCount(a.id)||new Date(a.created_at)-new Date(b.created_at));
    col.querySelector('.col-count').textContent=notes.filter(n=>n.category===cat).length;
    listEl.innerHTML=arr.length?arr.map(n=>noteTemplate(n)).join(''):`<div class="empty-note">아직 표시할 의견이 없습니다.</div>`;
  });
  bindNoteActions();updateInsights();
}

function noteTemplate(n){const liked=isLiked(n.id),count=likeCount(n.id);return `<article class="board-note" data-id="${n.id}"><div class="note-top"><div class="note-icon">${categories[n.category]?.icon||'•'}</div><div class="note-body"><p>${escapeHtml(n.content)}</p></div></div><div class="note-meta"><span class="author-chip">${escapeHtml(n.author_name||'익명')}</span><div class="note-actions"><button class="like-btn ${liked?'liked':''}" title="공감">♡ ${count}</button>${canEdit(n)?'<button class="edit-btn">수정</button><button class="delete-btn">삭제</button>':''}</div></div></article>`}

function bindNoteActions(){document.querySelectorAll('.board-note').forEach(card=>{const id=card.dataset.id;card.querySelector('.like-btn')?.addEventListener('click',()=>toggleLike(id));card.querySelector('.edit-btn')?.addEventListener('click',()=>editNote(id));card.querySelector('.delete-btn')?.addEventListener('click',()=>deleteNote(id))})}

async function addNote(){const author=authorSelect.value.trim(),cat=document.getElementById('boardCategory').value,content=document.getElementById('boardInput').value.trim();if(!author){toast('작성자를 먼저 선택해주세요.');authorSelect.focus();return}if(!content){toast('의견 내용을 입력해주세요.');return}const {error}=await supabase.from('sck_tf_workshop_notes').insert({workshop_id:WORKSHOP,author_name:author,category:cat,content,editor_token:editorToken});if(error){toast('등록하지 못했습니다.');console.error(error);return}document.getElementById('boardInput').value='';toast('의견이 등록되었습니다.');touchPresence();}
async function editNote(id){const n=notes.find(x=>x.id===id);if(!n||!canEdit(n))return;const content=prompt('의견 수정',n.content);if(content===null)return;const clean=content.trim();if(!clean)return;await supabase.from('sck_tf_workshop_notes').update({content:clean}).eq('id',id).eq('editor_token',editorToken)}
async function deleteNote(id){const n=notes.find(x=>x.id===id);if(!n||!canEdit(n))return;if(!confirm('이 의견을 삭제할까요?'))return;await supabase.from('sck_tf_workshop_notes').delete().eq('id',id).eq('editor_token',editorToken)}
async function toggleLike(id){const existing=reactions.find(r=>r.note_id===id&&r.participant_id===participantId);if(existing){await supabase.from('sck_tf_workshop_reactions').delete().eq('note_id',id).eq('participant_id',participantId)}else{await supabase.from('sck_tf_workshop_reactions').insert({note_id:id,participant_id:participantId})}}

function updateInsights(){const nonStarter=notes.filter(n=>n.author_name!=='킥오프 제안');const authors=new Set(nonStarter.map(n=>n.author_name).filter(Boolean));const maxLike=Math.max(0,...notes.map(n=>likeCount(n.id)));document.getElementById('needAgree').textContent=notes.filter(n=>likeCount(n.id)>=2).length;document.getElementById('topLikes').textContent=maxLike;document.getElementById('authorCount').textContent=authors.size;const top=[...notes].sort((a,b)=>likeCount(b.id)-likeCount(a.id))[0];document.getElementById('nextAction').textContent=top&&maxLike>0?`공감 1위: ${top.content}`:'공감 상위 의견을 중심으로 합의'}

function setupRealtime(){supabase.channel('sck-kickoff-board').on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_workshop_notes'},loadBoard).on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_workshop_reactions'},loadBoard).subscribe(status=>setConnection(status==='SUBSCRIBED'?'실시간 연결됨':'연결 중',status==='SUBSCRIBED'))}
async function touchPresence(){const name=authorSelect.value||'미선택';await supabase.from('sck_tf_workshop_presence').upsert({participant_id:participantId,author_name:name,last_seen:new Date().toISOString()},{onConflict:'participant_id'});const {data}=await supabase.from('sck_tf_workshop_presence').select('*').gte('last_seen',new Date(Date.now()-120000).toISOString());document.getElementById('presenceText').textContent=`현재 접속 ${data?.length||1}명 · 의견은 실시간으로 공유됩니다.`}
setInterval(touchPresence,45000);

const boardTabs=document.getElementById('boardTabs');boardTabs.addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;activeFilter=b.dataset.filter;boardTabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderBoard()});
document.getElementById('boardSearch').addEventListener('input',e=>{searchTerm=e.target.value.trim().toLowerCase();renderBoard()});
document.getElementById('addNote').addEventListener('click',addNote);
document.getElementById('boardInput').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')addNote()});
document.getElementById('openComposer').addEventListener('click',()=>{document.getElementById('quickComposer').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('boardInput').focus()});
document.querySelectorAll('.inline-add').forEach(btn=>btn.addEventListener('click',()=>{document.getElementById('boardCategory').value=btn.dataset.category;document.getElementById('boardInput').focus();document.getElementById('quickComposer').scrollIntoView({behavior:'smooth',block:'center'})}));
document.getElementById('presentationBtn').addEventListener('click',()=>{const board=document.getElementById('board');board.classList.toggle('presentation');document.getElementById('presentationBtn').textContent=board.classList.contains('presentation')?'발표 모드 종료':'발표 모드'});
document.getElementById('exportBoard').addEventListener('click',()=>{const rows=[['카테고리','작성자','의견','공감','작성일'],...notes.map(n=>[n.category,n.author_name,n.content,likeCount(n.id),new Date(n.created_at).toLocaleString('ko-KR')])];const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='SCK_AI_TF_킥오프_정렬보드.csv';a.click();URL.revokeObjectURL(a.href)});

function toast(msg){const old=document.querySelector('.board-toast');old?.remove();const el=document.createElement('div');el.className='board-toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),1800)}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

await loadBoard();setupRealtime();touchPresence();