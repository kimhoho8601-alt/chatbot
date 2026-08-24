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
