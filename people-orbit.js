import './board-avatars.js';

const peopleCanvas=document.querySelector('#people .people-network-canvas');

if(peopleCanvas){
  const cards=[...peopleCanvas.querySelectorAll('.network-member')];
  const spokes=[...peopleCanvas.querySelectorAll('.network-spokes i')];
  const desktop=window.matchMedia('(min-width:1181px)');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const orbitSeconds=115;
  let phase=0;
  let last=performance.now();
  let cardPaused=false;
  let inView=true;

  const style=document.createElement('style');
  style.id='people-orbit-style';
  style.textContent=`
    @media(min-width:1181px){
      #people .network-member{
        left:50%!important;
        top:50%!important;
        transform:translate(-50%,-50%) translate3d(var(--orbit-x,0px),var(--orbit-y,0px),0)!important;
        will-change:transform;
      }
    }
  `;
  document.head.appendChild(style);

  const setOrbitPosition=(angle,index,width,height)=>{
    const rx=Math.min(width*.40,Math.max(0,width/2-118));
    const ry=Math.min(height*.40,Math.max(0,height/2-60));
    const x=Math.cos(angle)*rx;
    const y=Math.sin(angle)*ry;
    const card=cards[index];
    card.style.setProperty('--orbit-x',`${x.toFixed(2)}px`);
    card.style.setProperty('--orbit-y',`${y.toFixed(2)}px`);

    const spoke=spokes[index];
    if(spoke){
      const distance=Math.hypot(x,y);
      const deg=Math.atan2(-x,y)*180/Math.PI;
      spoke.style.height=`${distance.toFixed(1)}px`;
      spoke.style.transform=`rotate(${deg.toFixed(2)}deg)`;
    }
  };

  const renderOrbit=()=>{
    if(!desktop.matches)return;
    const rect=peopleCanvas.getBoundingClientRect();
    const step=(Math.PI*2)/Math.max(cards.length,1);
    cards.forEach((_,i)=>setOrbitPosition(-Math.PI/2+(step*i)+phase,i,rect.width,rect.height));
  };

  const tick=now=>{
    const dt=Math.min((now-last)/1000,.05);
    last=now;
    if(desktop.matches&&!reduceMotion.matches&&inView&&!cardPaused){
      phase=(phase+(dt*Math.PI*2/orbitSeconds))%(Math.PI*2);
    }
    renderOrbit();
    requestAnimationFrame(tick);
  };

  const pause=()=>{cardPaused=true};
  const resume=()=>{cardPaused=false;last=performance.now()};
  cards.forEach(card=>{
    card.addEventListener('mouseenter',pause);
    card.addEventListener('mouseleave',resume);
    card.addEventListener('focus',pause);
    card.addEventListener('blur',resume);
  });

  new IntersectionObserver(entries=>{
    inView=entries[0]?.isIntersecting??true;
    last=performance.now();
  },{threshold:.08}).observe(peopleCanvas);

  const resetForBreakpoint=()=>{
    if(!desktop.matches){
      cards.forEach(card=>{
        card.style.removeProperty('--orbit-x');
        card.style.removeProperty('--orbit-y');
      });
    }else renderOrbit();
    last=performance.now();
  };
  desktop.addEventListener?.('change',resetForBreakpoint);
  reduceMotion.addEventListener?.('change',()=>{last=performance.now();renderOrbit()});
  window.addEventListener('resize',renderOrbit,{passive:true});

  renderOrbit();
  requestAnimationFrame(tick);
}

/* Presentation board: use the viewport much more efficiently when one topic is focused. */
if(!document.getElementById('presentation-wide-override')){
  const presentationStyle=document.createElement('style');
  presentationStyle.id='presentation-wide-override';
  presentationStyle.textContent=`
    .alignment-board.presentation{
      min-height:calc(100vh - 76px)!important;
      padding-left:0!important;
      padding-right:0!important;
    }
    .alignment-board.presentation .board-wide{
      width:calc(100vw - 32px)!important;
      max-width:none!important;
      margin-left:auto!important;
      margin-right:auto!important;
    }
    .alignment-board.presentation .presentation-nav,
    .alignment-board.presentation .alignment-head,
    .alignment-board.presentation .presence-panel,
    .alignment-board.presentation .alignment-grid,
    .alignment-board.presentation .board-footerline{
      width:100%!important;
      max-width:none!important;
    }
    .alignment-board.presentation .alignment-grid{
      display:block!important;
      overflow:visible!important;
      padding:0!important;
    }
    .alignment-board.presentation .align-col{
      width:100%!important;
      max-width:none!important;
      min-width:0!important;
      min-height:calc(100vh - 250px)!important;
      border-radius:26px!important;
    }
    .alignment-board.presentation .align-col header{
      padding:28px 34px 22px!important;
    }
    .alignment-board.presentation .align-col h3{
      font-size:clamp(26px,2.2vw,38px)!important;
      line-height:1.18!important;
    }
    .alignment-board.presentation .align-col header p{
      font-size:13px!important;
      margin-top:6px!important;
    }
    .alignment-board.presentation .col-count{
      font-size:26px!important;
    }
    .alignment-board.presentation .note-list{
      display:grid!important;
      grid-template-columns:repeat(3,minmax(0,1fr))!important;
      gap:14px!important;
      align-content:start!important;
      padding:18px!important;
    }
    .alignment-board.presentation .board-note{
      min-height:138px!important;
      padding:18px!important;
    }
    .alignment-board.presentation .note-body p{
      font-size:15px!important;
      line-height:1.6!important;
    }
    .alignment-board.presentation .empty-note{
      grid-column:1/-1!important;
      min-height:320px!important;
      display:grid!important;
      place-items:center!important;
    }
    .alignment-board.presentation .inline-add{
      margin:0 18px 18px!important;
      min-height:54px!important;
    }
    @media(min-width:1500px){
      .alignment-board.presentation .note-list{
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
      }
    }
    @media(max-width:1100px){
      .alignment-board.presentation .board-wide{width:calc(100vw - 24px)!important}
      .alignment-board.presentation .note-list{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }
    @media(max-width:700px){
      .alignment-board.presentation .board-wide{width:calc(100vw - 16px)!important}
      .alignment-board.presentation .align-col{min-height:calc(100vh - 210px)!important}
      .alignment-board.presentation .align-col header{padding:22px 20px 18px!important}
      .alignment-board.presentation .note-list{
        grid-template-columns:1fr!important;
        padding:12px!important;
      }
      .alignment-board.presentation .empty-note{min-height:220px!important}
    }
  `;
  document.head.appendChild(presentationStyle);
}
