const peopleSection=document.getElementById('people');

if(peopleSection){
  const members=[...peopleSection.querySelectorAll('.member')].map((el,i)=>({
    name:el.querySelector('h3')?.textContent?.trim()||'',
    org:el.querySelector('p')?.textContent?.trim()||'',
    role:el.querySelector('small')?.textContent?.trim()||'TF MEMBER',
    avatar:el.querySelector('.avatar')?.textContent?.trim()||String(i+1).padStart(2,'0')
  }));

  const roleLabel={
    'TF LEADER':'TF 리더',
    'SUPPORT CORE':'설계 지원',
    'FIELD MEMBER':'현장 설계'
  };

  const positions=[
    ['50%','8%','0s'],['68%','11%','.18s'],['83%','20%','.36s'],['90%','36%','.54s'],
    ['90%','58%','.72s'],['81%','77%','.9s'],['64%','88%','1.08s'],['45%','91%','1.26s'],
    ['27%','86%','1.44s'],['13%','73%','1.62s'],['10%','53%','1.8s'],['13%','32%','1.98s'],['29%','16%','2.16s']
  ];
  const angles=[-90,-62,-34,-6,22,50,78,106,134,162,190,218,246];

  const style=document.createElement('style');
  style.id='people-network-style';
  style.textContent=`
    #people.people-network-section{position:relative;overflow:hidden}
    #people .section-head{margin-bottom:34px}
    #people .section-head h2{max-width:760px}
    #people .people-network-lead{margin:8px 0 0;color:#777a80;font-size:14px;max-width:620px;word-break:keep-all}

    #people .collab-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 24px;position:relative;z-index:3}
    #people .collab-node{position:relative;border:1px solid #eadcdf;background:linear-gradient(180deg,#fff 0%,#fffafb 100%);border-radius:20px;padding:20px 22px;display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;box-shadow:0 10px 26px rgba(28,28,32,.035)}
    #people .collab-node:not(:last-child)::after{content:'↔';position:absolute;right:-18px;top:50%;transform:translateY(-50%);z-index:5;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#e51b23;border:1px solid #f0c9cd;font-size:12px;font-weight:900}
    #people .collab-node>span{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#fff0f1;color:#e51b23;font-size:11px;font-weight:900}
    #people .collab-node b{display:block;font-size:16px;letter-spacing:-.02em}
    #people .collab-node small{display:block;margin-top:2px;color:#8a8c92;font-size:11px;word-break:keep-all}

    #people .people-network-canvas{position:relative;min-height:780px;border:1px solid #f0dfe1;border-radius:34px;background:radial-gradient(circle at 50% 48%,rgba(229,27,35,.08),transparent 22%),linear-gradient(180deg,#fff 0%,#fffafa 100%);overflow:hidden;box-shadow:0 24px 70px rgba(37,37,42,.045)}
    #people .people-network-canvas::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(229,27,35,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(229,27,35,.035) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(circle at center,#000 0 62%,transparent 86%);pointer-events:none}
    #people .people-network-canvas::after{content:'';position:absolute;inset:13%;border:1px dashed rgba(229,27,35,.18);border-radius:50%;animation:peopleOrbit 28s linear infinite;pointer-events:none}

    #people .network-spokes{position:absolute;inset:0;pointer-events:none;z-index:0}
    #people .network-spokes i{position:absolute;left:50%;top:50%;width:1px;height:330px;transform-origin:top center;transform:rotate(var(--a));background:linear-gradient(to bottom,rgba(229,27,35,.24),rgba(229,27,35,.03));opacity:.35;animation:spokePulse 4.8s ease-in-out infinite;animation-delay:var(--d)}
    #people .network-spokes i.active{opacity:1;width:2px;background:linear-gradient(to bottom,#e51b23,rgba(229,27,35,.08));filter:drop-shadow(0 0 8px rgba(229,27,35,.25))}

    #people .network-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:280px;height:280px;border-radius:50%;display:grid;place-items:center;text-align:center;background:rgba(255,255,255,.94);border:1px solid #efcfd2;box-shadow:0 24px 70px rgba(229,27,35,.12);z-index:2;padding:42px}
    #people .network-core::before,#people .network-core::after{content:'';position:absolute;border-radius:50%;pointer-events:none}
    #people .network-core::before{inset:-18px;border:1px dashed rgba(229,27,35,.28);animation:coreSpin 18s linear infinite}
    #people .network-core::after{inset:-38px;border:1px solid rgba(229,27,35,.10);animation:corePulse 3.6s ease-in-out infinite}
    #people .network-core small{display:block;color:#e51b23;font-size:10px;font-weight:900;letter-spacing:.16em}
    #people .network-core strong{display:block;margin:12px 0 10px;font-size:31px;line-height:1.14;letter-spacing:-.045em;word-break:keep-all}
    #people .network-core p{margin:0;color:#777a80;font-size:11px;line-height:1.55;word-break:keep-all}
    #people .core-loop{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:14px;flex-wrap:wrap}
    #people .core-loop span{padding:5px 8px;border-radius:999px;background:#fff1f2;color:#bd161d;font-size:9px;font-weight:900}
    #people .core-loop i{font-style:normal;color:#c8a6aa;font-size:10px}

    #people .network-member{--member-x:50%;--member-y:50%;position:absolute;left:var(--member-x);top:var(--member-y);transform:translate(-50%,-50%);width:192px;min-height:82px;border:1px solid #eadcdf;background:rgba(255,255,255,.96);border-radius:20px;padding:14px 18px;display:grid;grid-template-columns:minmax(0,1fr);align-items:center;z-index:2;box-shadow:0 9px 24px rgba(25,25,29,.05);transition:border-color .2s,box-shadow .2s,opacity .2s,scale .2s;animation:memberFloat 5.4s ease-in-out infinite;animation-delay:var(--member-delay);outline:none;cursor:default}
    #people .network-member:hover,#people .network-member:focus-visible,#people .network-member.active{border-color:#e51b23;box-shadow:0 16px 38px rgba(229,27,35,.14);scale:1.045;z-index:6;background:#fff}
    #people .people-network-canvas.is-interacting .network-member:not(.active){opacity:.42}
    #people .member-avatar{display:none!important}
    #people .member-copy{min-width:0}
    #people .member-role{display:flex;align-items:center;gap:5px;color:#aa6a6e;font-size:8px;font-weight:900;letter-spacing:.08em;white-space:nowrap}
    #people .member-role::before{content:'';width:5px;height:5px;border-radius:50%;background:#e51b23;box-shadow:0 0 0 4px rgba(229,27,35,.07)}
    #people .network-member h3{margin:4px 0 1px;font-size:16px;line-height:1.2;letter-spacing:-.02em}
    #people .network-member p{margin:0;color:#878a90;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    #people .people-network-caption{display:flex;justify-content:center;gap:9px;align-items:center;margin-top:18px;color:#8b8e94;font-size:11px;word-break:keep-all;text-align:center}
    #people .people-network-caption::before,#people .people-network-caption::after{content:'';width:34px;height:1px;background:#ecced1}

    @keyframes memberFloat{0%,100%{translate:0 0}50%{translate:0 -5px}}
    @keyframes peopleOrbit{to{rotate:360deg}}
    @keyframes coreSpin{to{rotate:-360deg}}
    @keyframes corePulse{0%,100%{scale:1;opacity:.6}50%{scale:1.04;opacity:1}}
    @keyframes spokePulse{0%,100%{opacity:.2}50%{opacity:.5}}

    @media(max-width:1180px){
      #people .people-network-canvas{min-height:0;padding:24px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      #people .people-network-canvas::after,#people .network-spokes{display:none}
      #people .network-core{position:relative;left:auto;top:auto;transform:none;width:auto;height:auto;min-height:190px;border-radius:26px;grid-column:1/-1;padding:30px}
      #people .network-core::before,#people .network-core::after{display:none}
      #people .network-member{position:relative;left:auto;top:auto;transform:none;width:auto;min-height:92px;animation:none}
      #people .people-network-canvas.is-interacting .network-member:not(.active){opacity:1}
    }
    @media(max-width:820px){
      #people .collab-strip{grid-template-columns:1fr}
      #people .collab-node:not(:last-child)::after{content:'↕';right:20px;top:auto;bottom:-18px;transform:none}
      #people .people-network-canvas{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:560px){
      #people .people-network-canvas{grid-template-columns:1fr;padding:14px;border-radius:24px}
      #people .network-core{grid-column:1;padding:24px;min-height:170px}
      #people .network-core strong{font-size:26px}
      #people .network-member{min-height:82px}
      #people .people-network-caption{font-size:10px}
    }
    @media(prefers-reduced-motion:reduce){
      #people .people-network-canvas::after,#people .network-core::before,#people .network-core::after,#people .network-member,#people .network-spokes i{animation:none!important}
    }
  `;
  document.head.appendChild(style);

  peopleSection.classList.add('people-network-section');
  const heading=peopleSection.querySelector('.section-head h2');
  if(heading)heading.innerHTML='역할은 다르지만,<br>기준은 함께 만듭니다.';
  const kicker=peopleSection.querySelector('.section-head .kicker');
  if(kicker)kicker.textContent='13 PEOPLE · ONE TEAM';
  const headLeft=peopleSection.querySelector('.section-head>div');
  if(headLeft&&!headLeft.querySelector('.people-network-lead')){
    const lead=document.createElement('p');lead.className='people-network-lead';lead.textContent='운영과 현장이 따로 움직이지 않고, 사례·기준·검증을 서로 주고받으며 하나의 결과물을 만듭니다.';headLeft.appendChild(lead);
  }

  const roleStrip=peopleSection.querySelector('.role-strip');
  if(roleStrip){
    roleStrip.className='collab-strip reveal visible';
    roleStrip.innerHTML=`
      <div class="collab-node"><span>01</span><div><b>연결</b><small>논의와 일정이 끊기지 않도록 연결합니다.</small></div></div>
      <div class="collab-node"><span>02</span><div><b>공동 설계</b><small>현장 사례를 기준과 프롬프트로 함께 바꿉니다.</small></div></div>
      <div class="collab-node"><span>03</span><div><b>검증·개선</b><small>실제 테스트와 피드백을 다시 설계에 반영합니다.</small></div></div>`;
  }

  const grid=peopleSection.querySelector('#memberGrid');
  if(grid){
    grid.className='people-network-canvas reveal visible';
    grid.innerHTML=`
      <div class="network-spokes" aria-hidden="true">${angles.map((a,i)=>`<i data-spoke="${i}" style="--a:${a}deg;--d:${(i*.16).toFixed(2)}s"></i>`).join('')}</div>
      <div class="network-core"><div><small>13 PEOPLE · ONE TEAM</small><strong>같이 만들고<br>같이 검증합니다.</strong><p>운영 · 현장 · 검증이 순환하는 공동 설계 구조</p><div class="core-loop"><span>현장</span><i>↔</i><span>설계</span><i>↔</i><span>검증</span></div></div></div>
      ${members.map((m,i)=>`<article class="network-member" tabindex="0" data-member="${i}" style="--member-x:${positions[i][0]};--member-y:${positions[i][1]};--member-delay:${positions[i][2]}"><div class="member-copy"><span class="member-role">${roleLabel[m.role]||'공동 설계'}</span><h3>${m.name}</h3><p title="${m.org}">${m.org}</p></div></article>`).join('')}`;

    const canvas=grid;
    const cards=[...canvas.querySelectorAll('.network-member')];
    const spokes=[...canvas.querySelectorAll('.network-spokes i')];
    const activate=(idx)=>{canvas.classList.add('is-interacting');cards.forEach((c,i)=>c.classList.toggle('active',i===idx));spokes.forEach((s,i)=>s.classList.toggle('active',i===idx));};
    const clear=()=>{canvas.classList.remove('is-interacting');cards.forEach(c=>c.classList.remove('active'));spokes.forEach(s=>s.classList.remove('active'));};
    cards.forEach((card,i)=>{
      card.addEventListener('mouseenter',()=>activate(i));
      card.addEventListener('mouseleave',clear);
      card.addEventListener('focus',()=>activate(i));
      card.addEventListener('blur',clear);
      card.addEventListener('click',()=>{if(window.matchMedia('(max-width:1180px)').matches){card.classList.contains('active')?clear():activate(i)}});
    });
  }

  if(!peopleSection.querySelector('.people-network-caption')){
    const cap=document.createElement('p');cap.className='people-network-caption';cap.textContent='누구 한 사람이 기준을 만드는 구조가 아니라, 13명의 경험이 연결될수록 기준이 선명해집니다.';peopleSection.appendChild(cap);
  }
}
