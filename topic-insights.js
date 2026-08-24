const board=document.getElementById('board');

if(board){
  const TOTAL_MEMBERS=13;
  const stopWords=new Set(['그리고','하지만','또한','대한','관련','우리','이번','하는','해야','하면','하지','있는','없는','위한','것을','것이','정도','기준','의견','내용','필요','좋은','같은','실제','서로','먼저','함께','에서','으로','하게','하기','있는지','어떻게']);

  const style=document.createElement('style');
  style.id='topic-insights-style';
  style.textContent=`
    #board .topic-insights{display:none}
    #board.presentation .align-col.presentation-active .inline-add{display:none!important}
    #board.presentation .board-insights{display:none!important}
    #board.presentation .topic-insights{
      display:block;
      margin:14px 18px 20px;
      border:1px solid #f0d6da;
      border-radius:22px;
      background:linear-gradient(180deg,#fff 0%,#fff8f9 100%);
      box-shadow:0 12px 34px rgba(229,27,35,.055);
      overflow:hidden;
    }
    #board.presentation .topic-insights-head{
      display:flex;align-items:flex-end;justify-content:space-between;gap:18px;
      padding:18px 20px 16px;border-bottom:1px solid #f4e2e4;
    }
    #board.presentation .topic-insights-kicker{display:block;color:#e51b23;font-size:9px;font-weight:900;letter-spacing:.14em;margin-bottom:5px}
    #board.presentation .topic-insights-head h4{margin:0;color:#171717;font-size:20px;letter-spacing:-.03em}
    #board.presentation .topic-insights-state{flex:0 0 auto;padding:7px 10px;border-radius:999px;background:#fff0f2;color:#c71920;border:1px solid #f3cfd3;font-size:10px;font-weight:900}
    #board.presentation .topic-insights-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #f4e2e4}
    #board.presentation .topic-stat{padding:15px 18px;border-right:1px solid #f4e2e4;min-width:0}
    #board.presentation .topic-stat:last-child{border-right:0}
    #board.presentation .topic-stat small{display:block;color:#929399;font-size:9px;font-weight:800;margin-bottom:6px}
    #board.presentation .topic-stat strong{display:block;color:#171717;font-size:23px;line-height:1.1;letter-spacing:-.03em}
    #board.presentation .topic-stat span{display:block;color:#7c7e84;font-size:9px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #board.presentation .topic-insights-body{display:grid;grid-template-columns:1.35fr 1fr;gap:0}
    #board.presentation .topic-read,#board.presentation .topic-candidates{padding:17px 20px;min-width:0}
    #board.presentation .topic-read{border-right:1px solid #f4e2e4}
    #board.presentation .topic-insights-body small{display:block;color:#e51b23;font-size:9px;font-weight:900;letter-spacing:.08em;margin-bottom:7px}
    #board.presentation .topic-read p{margin:0;color:#2b2c31;font-size:13px;line-height:1.65;word-break:keep-all}
    #board.presentation .topic-keywords{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
    #board.presentation .topic-keywords span{padding:5px 8px;border-radius:999px;background:#fff;border:1px solid #efdadd;color:#6e7076;font-size:9px;font-weight:800}
    #board.presentation .topic-candidates ol{margin:0;padding:0;list-style:none;display:grid;gap:7px}
    #board.presentation .topic-candidates li{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:start;padding:8px 9px;border-radius:11px;background:#fff;border:1px solid #f2e3e5;color:#33353a;font-size:10px;line-height:1.45}
    #board.presentation .topic-candidates li b{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#fff0f2;color:#e51b23;font-size:9px}
    #board.presentation .topic-candidates li em{font-style:normal;color:#e51b23;font-size:9px;font-weight:900;white-space:nowrap}
    #board.presentation .topic-candidates .topic-empty{color:#8b8d93;font-size:11px;line-height:1.6}
    @media(max-width:1000px){
      #board.presentation .topic-insights-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      #board.presentation .topic-stat:nth-child(2){border-right:0}
      #board.presentation .topic-stat:nth-child(-n+2){border-bottom:1px solid #f4e2e4}
      #board.presentation .topic-insights-body{grid-template-columns:1fr}
      #board.presentation .topic-read{border-right:0;border-bottom:1px solid #f4e2e4}
    }
    @media(max-width:620px){
      #board.presentation .topic-insights{margin:10px 12px 16px;border-radius:18px}
      #board.presentation .topic-insights-head{align-items:flex-start;padding:15px 14px}
      #board.presentation .topic-insights-head h4{font-size:17px}
      #board.presentation .topic-stat{padding:12px 13px}
      #board.presentation .topic-stat strong{font-size:20px}
      #board.presentation .topic-read,#board.presentation .topic-candidates{padding:14px}
    }
  `;
  document.head.appendChild(style);

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const authorOf=card=>card.querySelector('.board-author-name')?.textContent?.trim()||card.querySelector('.author-chip')?.textContent?.trim()||'';
  const likeOf=card=>Number((card.querySelector('.like-btn')?.textContent||'').match(/\d+/)?.[0]||0);
  const textOf=card=>card.querySelector('.note-body p')?.textContent?.trim()||'';

  function keywords(texts){
    const counts=new Map();
    texts.join(' ').replace(/[^가-힣A-Za-z0-9\s]/g,' ').split(/\s+/).map(x=>x.trim()).filter(x=>x.length>=2&&!stopWords.has(x)).forEach(x=>counts.set(x,(counts.get(x)||0)+1));
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,4).map(([word])=>word);
  }

  function ensurePanel(col){
    let panel=col.querySelector(':scope > .topic-insights');
    if(panel)return panel;
    panel=document.createElement('section');
    panel.className='topic-insights';
    panel.setAttribute('aria-live','polite');
    const add=col.querySelector(':scope > .inline-add');
    if(add)col.insertBefore(panel,add);else col.appendChild(panel);
    return panel;
  }

  function insightState(count,authors,likes){
    if(count===0)return '의견 수집 전';
    if(count===1)return '추가 관점 필요';
    if(authors<3)return '참여 확장 필요';
    if(likes===0)return '공감 투표 필요';
    if(count>=5)return '합의 후보 도출';
    return '비교 · 정렬 중';
  }

  function renderTopicInsight(col){
    const panel=ensurePanel(col);
    const title=col.querySelector('header h3')?.textContent?.trim()||'선택 주제';
    const cards=[...col.querySelectorAll('.note-list .board-note')];
    const data=cards.map(card=>({text:textOf(card),author:authorOf(card),likes:likeOf(card)})).filter(x=>x.text);
    const authors=new Set(data.map(x=>x.author).filter(Boolean));
    const totalLikes=data.reduce((sum,x)=>sum+x.likes,0);
    const words=keywords(data.map(x=>x.text));
    const ranked=[...data].sort((a,b)=>b.likes-a.likes||a.text.localeCompare(b.text,'ko')).slice(0,3);
    const state=insightState(data.length,authors.size,totalLikes);

    let summary='아직 이 주제에 등록된 의견이 없습니다. 발표 중 핵심 질문을 다시 확인하고 의견을 모아보세요.';
    if(data.length===1)summary='현재 1개의 의견이 등록되어 있습니다. 한 가지 관점에 치우치지 않도록 다른 현장 경험이나 반대 사례를 추가로 확인하는 것이 좋습니다.';
    else if(data.length>1&&totalLikes===0)summary=`현재 ${data.length}개의 의견이 모였습니다. 아직 공감 표시가 없어 우선순위는 정해지지 않았습니다. 비슷한 의견을 묶은 뒤 공감 투표로 합의 후보를 좁혀보세요.`;
    else if(data.length>1){
      const top=ranked[0];
      const topText=top.text.length>44?top.text.slice(0,44)+'…':top.text;
      summary=`현재 ${data.length}개의 의견 중 공감 ${top.likes}표를 받은 “${topText}” 의견이 가장 앞서 있습니다. 상위 의견 간 차이를 확인해 합의 문장으로 정리해보세요.`;
    }

    const candidates=ranked.length?ranked.map((x,i)=>`<li><b>${i+1}</b><span>${esc(x.text)}</span><em>♡ ${x.likes}</em></li>`).join(''):`<div class="topic-empty">의견이 등록되면 공감 수와 참여 현황을 기준으로 합의 후보를 자동 정리합니다.</div>`;
    const keywordHtml=words.length?words.map(w=>`<span># ${esc(w)}</span>`).join(''):'<span># 키워드 집계 전</span>';

    panel.innerHTML=`
      <div class="topic-insights-head">
        <div><span class="topic-insights-kicker">TOPIC BOARD INSIGHT</span><h4>${esc(title)} · 현재 인사이트</h4></div>
        <span class="topic-insights-state">${esc(state)}</span>
      </div>
      <div class="topic-insights-grid">
        <div class="topic-stat"><small>등록 의견</small><strong>${data.length}</strong><span>현재 주제 기준</span></div>
        <div class="topic-stat"><small>참여 인원</small><strong>${authors.size} / ${TOTAL_MEMBERS}</strong><span>${Math.round(authors.size/TOTAL_MEMBERS*100)}% 참여</span></div>
        <div class="topic-stat"><small>공감 합계</small><strong>${totalLikes}</strong><span>의견 우선순위 신호</span></div>
        <div class="topic-stat"><small>핵심 키워드</small><strong>${words[0]?esc(words[0]):'—'}</strong><span>${words.slice(1).join(' · ')||'데이터 축적 중'}</span></div>
      </div>
      <div class="topic-insights-body">
        <div class="topic-read"><small>현재 읽기</small><p>${esc(summary)}</p><div class="topic-keywords">${keywordHtml}</div></div>
        <div class="topic-candidates"><small>합의 후보</small><ol>${candidates}</ol></div>
      </div>`;
  }

  function refresh(){
    board.querySelectorAll('.align-col').forEach(col=>renderTopicInsight(col));
  }

  let raf=0;
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(refresh)};
  refresh();

  new MutationObserver(schedule).observe(board,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
  board.addEventListener('click',schedule,true);
}
