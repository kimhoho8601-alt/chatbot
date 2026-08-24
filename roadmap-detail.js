const roadmapSlides=[
  {key:'purpose',step:'01',tab:'사업 목적',title:'AI 도입으로 해결하고자 하는 3가지 문제',desc:'반복 기록업무 부담 완화 · 기록 품질과 일관성 확보 · 인력 운영 효율화',src:'assets/roadmap-purpose.svg'},
  {key:'direction',step:'02',tab:'추진 방향',title:'사례관리 업무 프로세스 내 AI 도입',desc:'상담 기록과 사례정리 구간에 AI를 적용하고 최종 판단은 사람이 수행',src:'assets/roadmap-direction.svg'}
];
let roadmapSlideIndex=0;

function installRoadmapDetailStyles(){
  if(document.getElementById('roadmap-detail-styles'))return;
  const style=document.createElement('style');style.id='roadmap-detail-styles';style.textContent=`
    #stageList li.roadmap-detail-item{padding:0!important;overflow:visible;border-color:#45464c;background:#17181b}
    .roadmap-detail-card{width:100%;min-height:100%;background:transparent;color:#fff;text-align:left;padding:14px 15px;display:flex;flex-direction:column;gap:10px;cursor:pointer;border-radius:15px;transition:.2s;outline:none}
    .roadmap-detail-card:hover,.roadmap-detail-card:focus-visible{background:#202126;box-shadow:0 0 0 1px #ef2027 inset;transform:translateY(-1px)}
    .roadmap-detail-card>span{font-weight:800;word-break:keep-all;line-height:1.4}
    .roadmap-detail-chips{display:flex;gap:7px;flex-wrap:wrap}
    .roadmap-detail-chip{border:1px solid #3b3d43;background:#101115;color:#b9bbc1;border-radius:999px;padding:5px 9px;font-size:9px;font-weight:900;letter-spacing:.02em;cursor:pointer}
    .roadmap-detail-chip:hover{border-color:#ef2027;color:#fff;background:#2a1114}
    .roadmap-detail-card>small{font-size:9px;color:#ff555b;font-weight:900;letter-spacing:.04em}
    .roadmap-detail-overlay{position:fixed;inset:0;z-index:5000;display:none;background:rgba(4,5,7,.92);backdrop-filter:blur(12px);padding:16px;color:#fff}
    .roadmap-detail-overlay.open{display:grid;place-items:center}
    .roadmap-detail-dialog{width:min(1500px,calc(100vw - 32px));height:min(930px,calc(100vh - 32px));background:#111216;border:1px solid #303138;border-radius:26px;box-shadow:0 36px 120px rgba(0,0,0,.46);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto}
    .roadmap-detail-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:18px 22px 14px;border-bottom:1px solid #292a30;background:#15161a}
    .roadmap-detail-head small{display:block;color:#ff4b51;font-weight:900;letter-spacing:.14em;font-size:9px;margin-bottom:4px}
    .roadmap-detail-head h3{margin:0;font-size:clamp(21px,2.2vw,32px);letter-spacing:-.035em;word-break:keep-all}
    .roadmap-detail-head p{margin:4px 0 0;color:#8f9198;font-size:11px;word-break:keep-all}
    .roadmap-detail-close{width:44px;height:44px;border-radius:13px;border:1px solid #35363d;background:#1c1d22;color:#fff;font-size:22px;cursor:pointer}
    .roadmap-detail-body{min-height:0;display:grid;grid-template-rows:auto 1fr;background:#0b0c0f}
    .roadmap-detail-tabs{display:flex;justify-content:center;gap:8px;padding:12px 18px 8px}
    .roadmap-detail-tab{border:1px solid #303139;background:#17181d;color:#9b9da5;border-radius:999px;min-height:38px;padding:0 16px;font-size:11px;font-weight:900;cursor:pointer}
    .roadmap-detail-tab.active{background:#ef2027;border-color:#ef2027;color:#fff;box-shadow:0 8px 24px rgba(239,32,39,.2)}
    .roadmap-detail-stage{min-height:0;padding:6px 18px 14px;display:flex;align-items:center;justify-content:center;position:relative}
    .roadmap-detail-image-frame{width:100%;height:100%;min-height:0;background:#fff;border-radius:15px;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 55px rgba(0,0,0,.28)}
    .roadmap-detail-image{display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain}
    .roadmap-detail-arrow{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(10,11,14,.84);color:#fff;font-size:21px;cursor:pointer;z-index:2;backdrop-filter:blur(8px)}
    .roadmap-detail-arrow:hover{background:#ef2027;border-color:#ef2027}.roadmap-detail-prev{left:30px}.roadmap-detail-next{right:30px}
    .roadmap-detail-foot{display:grid;grid-template-columns:1fr auto 1fr;gap:18px;align-items:center;padding:12px 22px 14px;border-top:1px solid #292a30;background:#15161a}
    .roadmap-detail-caption strong{display:block;font-size:13px;word-break:keep-all}.roadmap-detail-caption span{display:block;margin-top:2px;color:#84868d;font-size:10px;word-break:keep-all}
    .roadmap-detail-page{font-size:12px;font-weight:900;color:#b7b9bf;letter-spacing:.08em;text-align:center}.roadmap-detail-help{justify-self:end;color:#6e7077;font-size:9px;white-space:nowrap}
    body.roadmap-detail-open{overflow:hidden}
    @media(max-width:800px){.roadmap-detail-overlay{padding:8px}.roadmap-detail-dialog{width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:18px}.roadmap-detail-head{padding:14px}.roadmap-detail-head p{display:none}.roadmap-detail-tabs{justify-content:flex-start;overflow-x:auto}.roadmap-detail-stage{padding:4px 8px 10px}.roadmap-detail-arrow{width:40px;height:40px}.roadmap-detail-prev{left:14px}.roadmap-detail-next{right:14px}.roadmap-detail-foot{grid-template-columns:1fr auto;padding:10px 14px}.roadmap-detail-help{display:none}.roadmap-detail-caption span{display:none}}
  `;document.head.appendChild(style);
}

function ensureRoadmapModal(){
  if(document.getElementById('roadmapDetailOverlay'))return;
  const overlay=document.createElement('div');overlay.id='roadmapDetailOverlay';overlay.className='roadmap-detail-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.innerHTML=`
    <div class="roadmap-detail-dialog">
      <header class="roadmap-detail-head"><div><small>WEEK 1 · PURPOSE & DIRECTION</small><h3 id="roadmapDetailTitle"></h3><p id="roadmapDetailDesc"></p></div><button type="button" class="roadmap-detail-close" id="roadmapDetailClose" aria-label="닫기">×</button></header>
      <div class="roadmap-detail-body"><div class="roadmap-detail-tabs" id="roadmapDetailTabs"></div><div class="roadmap-detail-stage"><button type="button" class="roadmap-detail-arrow roadmap-detail-prev" id="roadmapDetailPrev" aria-label="이전 페이지">←</button><div class="roadmap-detail-image-frame"><img class="roadmap-detail-image" id="roadmapDetailImage" alt="" /></div><button type="button" class="roadmap-detail-arrow roadmap-detail-next" id="roadmapDetailNext" aria-label="다음 페이지">→</button></div></div>
      <footer class="roadmap-detail-foot"><div class="roadmap-detail-caption"><strong id="roadmapDetailCaption"></strong><span id="roadmapDetailCaptionSub"></span></div><div class="roadmap-detail-page" id="roadmapDetailPage"></div><div class="roadmap-detail-help">← → 페이지 이동 · ESC 닫기</div></footer>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeRoadmapDetail()});
  document.getElementById('roadmapDetailClose').addEventListener('click',closeRoadmapDetail);
  document.getElementById('roadmapDetailPrev').addEventListener('click',()=>showRoadmapSlide(roadmapSlideIndex-1));
  document.getElementById('roadmapDetailNext').addEventListener('click',()=>showRoadmapSlide(roadmapSlideIndex+1));
  document.getElementById('roadmapDetailTabs').addEventListener('click',e=>{const b=e.target.closest('[data-roadmap-index]');if(b)showRoadmapSlide(Number(b.dataset.roadmapIndex))});
}

function renderRoadmapTabs(){
  const tabs=document.getElementById('roadmapDetailTabs');if(!tabs)return;
  tabs.innerHTML=roadmapSlides.map((s,i)=>`<button type="button" class="roadmap-detail-tab ${i===roadmapSlideIndex?'active':''}" data-roadmap-index="${i}">${s.step} · ${s.tab}</button>`).join('');
}
function showRoadmapSlide(index){
  roadmapSlideIndex=(index+roadmapSlides.length)%roadmapSlides.length;const s=roadmapSlides[roadmapSlideIndex];
  document.getElementById('roadmapDetailTitle').textContent=s.title;document.getElementById('roadmapDetailDesc').textContent=s.desc;
  const img=document.getElementById('roadmapDetailImage');img.src=s.src;img.alt=s.title;
  document.getElementById('roadmapDetailCaption').textContent=`${s.step}. ${s.tab}`;document.getElementById('roadmapDetailCaptionSub').textContent=s.desc;document.getElementById('roadmapDetailPage').textContent=`${roadmapSlideIndex+1} / ${roadmapSlides.length}`;renderRoadmapTabs();
}
function openRoadmapDetail(index=0){ensureRoadmapModal();showRoadmapSlide(index);document.getElementById('roadmapDetailOverlay').classList.add('open');document.body.classList.add('roadmap-detail-open')}
function closeRoadmapDetail(){document.getElementById('roadmapDetailOverlay')?.classList.remove('open');document.body.classList.remove('roadmap-detail-open')}

function decorateRoadmapStageList(){
  const list=document.getElementById('stageList');if(!list)return;
  [...list.querySelectorAll('li')].forEach(li=>{
    if(!li.textContent.replace(/\s+/g,'').includes('사업목적·추진방향공유'))return;
    if(li.classList.contains('roadmap-detail-item'))return;
    li.classList.add('roadmap-detail-item');li.innerHTML=`<div class="roadmap-detail-card" data-roadmap-open="0" role="button" tabindex="0"><span>사업 목적·추진 방향 공유</span><div class="roadmap-detail-chips"><button type="button" class="roadmap-detail-chip" data-roadmap-open="0">사업 목적</button><button type="button" class="roadmap-detail-chip" data-roadmap-open="1">추진 방향</button></div><small>상세 페이지 열기 ↗</small></div>`;
  });
}

installRoadmapDetailStyles();ensureRoadmapModal();decorateRoadmapStageList();
const stageList=document.getElementById('stageList');
stageList?.addEventListener('click',e=>{const target=e.target.closest('[data-roadmap-open]');if(!target)return;e.preventDefault();e.stopPropagation();openRoadmapDetail(Number(target.dataset.roadmapOpen)||0)});
stageList?.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const target=e.target.closest('.roadmap-detail-card[data-roadmap-open]');if(!target)return;e.preventDefault();openRoadmapDetail(Number(target.dataset.roadmapOpen)||0)});
if(stageList)new MutationObserver(decorateRoadmapStageList).observe(stageList,{childList:true,subtree:true});
document.addEventListener('keydown',e=>{const open=document.getElementById('roadmapDetailOverlay')?.classList.contains('open');if(!open)return;if(e.key==='Escape')closeRoadmapDetail();else if(e.key==='ArrowRight')showRoadmapSlide(roadmapSlideIndex+1);else if(e.key==='ArrowLeft')showRoadmapSlide(roadmapSlideIndex-1)});
