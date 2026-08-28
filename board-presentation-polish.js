import './topic-insights.js';
import './board-four-topics.js';

const board=document.getElementById('board');
const originalPresentationBtn=document.getElementById('presentationBtn');

if(board&&originalPresentationBtn){
  const style=document.createElement('style');
  style.id='board-presentation-polish-style';
  style.textContent=`
    /* Remove the duplicated category icon inside every opinion card. */
    #board .board-note .note-icon{display:none!important}
    #board .board-note .note-top{display:block!important}

    /* Presentation mode: keep the insight summary visible and readable. */
    #board.presentation{padding-bottom:108px!important}
    #board.presentation .board-insights{
      display:grid!important;
      grid-template-columns:1.25fr repeat(3,.75fr) 1.45fr!important;
      gap:0!important;
      width:100%!important;
      max-width:none!important;
      margin:16px 0 0!important;
      border:1px solid #f0d8db!important;
      border-radius:20px!important;
      background:#fff!important;
      box-shadow:0 12px 34px rgba(229,27,35,.06)!important;
      overflow:hidden!important;
    }
    #board.presentation .board-insights>div{
      display:block!important;
      padding:16px 18px!important;
      border-right:1px solid #f3e1e3!important;
      border-bottom:0!important;
      background:#fff!important;
      color:#171717!important;
      min-width:0!important;
    }
    #board.presentation .board-insights>div:last-child{border-right:0!important}
    #board.presentation .insight-icon{
      background:#fff1f2!important;
      color:#e51b23!important;
    }
    #board.presentation .insight-title h3,
    #board.presentation .insight-card strong,
    #board.presentation .insight-action strong{color:#161616!important}
    #board.presentation .insight-title p,
    #board.presentation .insight-card small,
    #board.presentation .insight-action small{color:#818187!important}
    #board.presentation .insight-card span,
    #board.presentation .insight-action span{color:#e51b23!important}

    /* The original top exit control is hidden while presenting. */
    #board.presentation #presentationBtn{visibility:hidden!important;pointer-events:none!important}

    .presentation-exit-dock{
      position:fixed;
      left:50%;
      bottom:18px;
      transform:translateX(-50%) translateY(16px);
      z-index:9998;
      display:flex;
      align-items:center;
      gap:10px;
      padding:8px;
      border:1px solid rgba(229,27,35,.18);
      border-radius:18px;
      background:rgba(255,255,255,.94);
      box-shadow:0 18px 50px rgba(45,20,22,.16);
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      opacity:0;
      visibility:hidden;
      pointer-events:none;
      transition:.2s ease;
    }
    .presentation-exit-dock.is-visible{
      opacity:1;
      visibility:visible;
      pointer-events:auto;
      transform:translateX(-50%) translateY(0);
    }
    .presentation-exit-dock span{
      padding-left:10px;
      color:#777a80;
      font-size:11px;
      white-space:nowrap;
    }
    .presentation-exit-dock button{
      min-height:48px;
      padding:0 22px;
      border:0;
      border-radius:13px;
      background:#ef2027;
      color:#fff;
      font-size:13px;
      font-weight:900;
      cursor:pointer;
      box-shadow:0 9px 24px rgba(239,32,39,.2);
    }
    .presentation-exit-dock button:hover{background:#d91b22}

    @media(max-width:1100px){
      #board.presentation .board-insights{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #board.presentation .board-insights>div{border-bottom:1px solid #f3e1e3!important}
      #board.presentation .board-insights>div:nth-child(even){border-right:0!important}
    }
    @media(max-width:700px){
      #board.presentation{padding-bottom:92px!important}
      #board.presentation .board-insights{grid-template-columns:1fr!important}
      #board.presentation .board-insights>div{border-right:0!important}
      .presentation-exit-dock{width:calc(100vw - 24px);justify-content:space-between;bottom:10px}
      .presentation-exit-dock span{font-size:10px}
      .presentation-exit-dock button{min-height:46px;padding:0 18px}
    }

    /* Topic-specific insights replace the global insight strip during presentation. */
    #board.presentation .board-insights{display:none!important}
  `;
  document.head.appendChild(style);

  const dock=document.createElement('div');
  dock.className='presentation-exit-dock';
  dock.setAttribute('role','region');
  dock.setAttribute('aria-label','발표 모드 제어');
  dock.innerHTML='<span>발표 화면을 종료하려면</span><button type="button">발표 모드 종료 ×</button>';
  document.body.appendChild(dock);

  const sync=()=>dock.classList.toggle('is-visible',board.classList.contains('presentation'));
  dock.querySelector('button')?.addEventListener('click',()=>originalPresentationBtn.click());
  new MutationObserver(sync).observe(board,{attributes:true,attributeFilter:['class']});
  sync();
}
