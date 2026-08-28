const board=document.getElementById('board');

if(board){
  const removedCategory='align';
  const topicOrder=['ground','success','ai','risk'];
  const topicLabels={
    ground:'그라운드 룰',
    success:'성공 기준',
    ai:'AI가 도와줄 수 있는 것',
    risk:'AI가 하면 안 될 일'
  };

  const style=document.createElement('style');
  style.id='board-four-topics-style';
  style.textContent=`
    #board .alignment-grid{grid-template-columns:repeat(4,minmax(260px,1fr))!important}
    @media(max-width:1200px){#board .alignment-grid{grid-template-columns:repeat(4,300px)!important}}
    @media(max-width:700px){#board .alignment-grid{grid-template-columns:repeat(4,84vw)!important}}
  `;
  document.head.appendChild(style);

  function removeRedundantTopic(){
    board.querySelector('.board-tabs [data-filter="align"]')?.remove();
    board.querySelector('.align-col[data-cat="align"]')?.remove();
    board.querySelectorAll('.inline-add[data-category="align"]').forEach(el=>el.remove());
    const select=board.querySelector('#boardCategory');
    select?.querySelector('option[value="align"]')?.remove();
    if(select&&(!select.value||select.value===removedCategory))select.value='ground';
  }

  function activeTopic(){
    return board.querySelector('.align-col.presentation-active')?.dataset.cat
      || board.querySelector('.board-tabs button.active[data-filter]:not([data-filter="all"])')?.dataset.filter
      || 'ground';
  }

  function patchPresentationMeta(){
    if(!board.classList.contains('presentation'))return;
    let cat=activeTopic();
    if(!topicOrder.includes(cat))cat='ground';
    const index=topicOrder.indexOf(cat);
    const step=document.getElementById('presentationStep');
    const title=document.getElementById('presentationTitle');
    if(step&&step.textContent!==`${index+1} / ${topicOrder.length}`)step.textContent=`${index+1} / ${topicOrder.length}`;
    if(title&&title.textContent!==topicLabels[cat])title.textContent=topicLabels[cat];
  }

  function setTopic(cat){
    if(!topicOrder.includes(cat))cat='ground';
    board.querySelector(`.board-tabs button[data-filter="${cat}"]`)?.click();
    requestAnimationFrame(patchPresentationMeta);
  }

  function moveTopic(delta){
    let cat=activeTopic();
    let index=topicOrder.indexOf(cat);
    if(index<0)index=0;
    setTopic(topicOrder[(index+delta+topicOrder.length)%topicOrder.length]);
  }

  function recomputeVisibleInsights(){
    const cards=[...board.querySelectorAll('.align-col:not([data-cat="align"]) .board-note')];
    const rows=cards.map(card=>({
      text:card.querySelector('.note-body p')?.textContent?.trim()||'',
      author:card.querySelector('.board-author-name')?.textContent?.trim()||card.querySelector('.author-chip')?.textContent?.trim()||'',
      likes:Number((card.querySelector('.like-btn')?.textContent||'').match(/\d+/)?.[0]||0)
    }));
    const authors=new Set(rows.map(row=>row.author).filter(Boolean));
    const maxLike=Math.max(0,...rows.map(row=>row.likes));
    const needAgree=rows.filter(row=>row.likes>=2).length;
    const top=[...rows].sort((a,b)=>b.likes-a.likes)[0];
    const values={
      needAgree:String(needAgree),
      topLikes:String(maxLike),
      authorCount:String(authors.size),
      nextAction:top&&maxLike>0?`공감 1위: ${top.text}`:'공감 상위 의견을 중심으로 합의'
    };
    Object.entries(values).forEach(([id,value])=>{
      const el=document.getElementById(id);
      if(el&&el.textContent!==value)el.textContent=value;
    });
  }

  removeRedundantTopic();
  recomputeVisibleInsights();

  const presentationBtn=document.getElementById('presentationBtn');
  presentationBtn?.addEventListener('click',()=>{
    if(!board.classList.contains('presentation')){
      const activeFilter=board.querySelector('.board-tabs button.active[data-filter]')?.dataset.filter||'all';
      if(activeFilter==='all'||!topicOrder.includes(activeFilter)){
        board.querySelector('.board-tabs button[data-filter="ground"]')?.click();
      }
    }
    requestAnimationFrame(()=>requestAnimationFrame(patchPresentationMeta));
  },true);

  board.querySelector('#boardTabs')?.addEventListener('click',()=>{
    requestAnimationFrame(patchPresentationMeta);
  },true);

  document.addEventListener('click',event=>{
    if(!board.classList.contains('presentation'))return;
    const prev=event.target.closest?.('#presentationPrev');
    const next=event.target.closest?.('#presentationNext');
    if(!prev&&!next)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    moveTopic(next?1:-1);
  },true);

  document.addEventListener('keydown',event=>{
    if(!board.classList.contains('presentation'))return;
    const tag=document.activeElement?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
    if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    moveTopic(event.key==='ArrowRight'?1:-1);
  },true);

  let raf=0;
  new MutationObserver(()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      removeRedundantTopic();
      recomputeVisibleInsights();
      patchPresentationMeta();
    });
  }).observe(board,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
}
