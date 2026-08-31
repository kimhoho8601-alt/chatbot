import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:10}}});

const participants=['김홍섭','이영선','최현지','최예린','이호열','서종호','백예원','전현지','이예진','이슬기','김지원','김현주','김자연'];

const dimensions={
  delegation:{code:'D1',label:'역할 정의',desc:'사람과 AI가 각각 맡을 일과 최종 판단 지점을 정합니다.'},
  description:{code:'D2',label:'명확한 요청',desc:'목적·맥락·조건·형식을 구체적으로 전달합니다.'},
  discernment:{code:'D3',label:'결과 판단',desc:'AI 결과의 정확성, 누락, 적절성을 스스로 판단합니다.'},
  diligence:{code:'D4',label:'책무성',desc:'보안과 영향, 최종 책임을 고려해 안전하게 활용합니다.'}
};

const questions=[
  {d:'delegation',q:'업무를 시작할 때, 내가 직접 판단할 일과 AI에 맡길 일을 먼저 구분하는 편이다.'},
  {d:'delegation',q:'AI가 잘할 수 있는 일과 사람이 반드시 확인해야 하는 일을 구분해서 사용하는 편이다.'},
  {d:'delegation',q:'AI를 활용하기 전에 이 업무에서 사람이 최종적으로 책임져야 할 판단이 무엇인지 생각하는 편이다.'},
  {d:'description',q:'AI에게 요청할 때 원하는 결과만 말하기보다 목적과 배경 맥락까지 함께 설명하는 편이다.'},
  {d:'description',q:'원하는 답의 형식·길이·대상·톤을 구체적으로 지정하는 편이다.'},
  {d:'description',q:'첫 답이 아쉬우면 좋은 예시를 주거나 조건을 바꾸며 결과를 반복해서 다듬는 편이다.'},
  {d:'discernment',q:'AI가 사실처럼 말해도 중요한 정보는 다른 자료나 원문을 통해 다시 확인하는 편이다.'},
  {d:'discernment',q:'AI 답변에서 빠진 맥락, 지나친 단순화, 근거가 약한 부분을 찾으려고 하는 편이다.'},
  {d:'discernment',q:'여러 답안 중 무엇이 더 적절한지 내 기준으로 비교하고 선택하는 편이다.'},
  {d:'diligence',q:'개인정보나 민감한 업무정보를 AI에 입력해도 되는지 먼저 확인하는 편이다.'},
  {d:'diligence',q:'AI가 만든 내용을 업무에 활용할 때 필요한 경우 AI 활용 사실과 한계를 설명할 수 있다.'},
  {d:'diligence',q:'AI 결과가 실제 사람이나 의사결정에 영향을 줄 수 있다면, 최종 사용 전에 사람이 반드시 검토해야 한다고 생각한다.'}
];

const scale=[['전혀 아니다',1],['별로 아니다',2],['보통이다',3],['그런 편이다',4],['매우 그렇다',5]];

const experienceQuestions=[
  {key:'tools',label:'업무에 사용해본 AI 도구는 몇 개인가요?',help:'예: ChatGPT, Claude, Gemini, Copilot, Perplexity, NotebookLM 등',options:[['사용해본 적 없음',0],['1개',1],['2개',2],['3~4개',3],['5개 이상',4]]},
  {key:'frequency',label:'최근 한 달 동안 업무에 AI를 얼마나 자주 사용했나요?',help:'개인적인 사용이 아니라 실제 업무 목적의 사용 기준입니다.',options:[['거의 사용하지 않음',0],['월 1~2회',1],['주 1~2회',2],['주 3~4회',3],['거의 매일',4]]},
  {key:'functions',label:'업무에서 사용해본 AI 활용 방식은 어느 정도인가요?',help:'문서 작성뿐 아니라 분석, 검색, 이미지, 자동화 등 활용 범위를 봅니다.',options:[['단순 질문·검색 정도',0],['문장 작성·요약',1],['자료 분석·아이디어 정리',2],['이미지·파일·데이터 등 여러 기능',3],['자동화·코딩·업무도구 연계까지',4]]},
  {key:'workflow',label:'AI를 업무 과정에 어느 정도까지 적용해봤나요?',help:'일회성 사용보다 실제 업무 흐름 안에서 활용한 경험을 봅니다.',options:[['시험 삼아 사용',0],['일부 과업에 가끔 사용',1],['반복 업무에 정기적으로 사용',2],['업무 단계 여러 곳에 활용',3],['업무 흐름 자체를 AI 중심으로 재설계',4]]},
  {key:'output',label:'AI 결과물을 실제 업무 산출물에 어느 정도 활용해봤나요?',help:'보고서, 자료, 분석, 안내문, 발표자료, 코드 등 실제 결과물 기준입니다.',options:[['거의 활용하지 않음',0],['참고 아이디어 정도',1],['수정 후 일부 반영',2],['주요 초안이나 분석에 활용',3],['검토를 거쳐 핵심 산출물에 정기 활용',4]]}
];

let answers=Array(questions.length).fill(null);
let experienceAnswers={};
let current=0,participant='',results=[];
let advancing=false,submitting=false;
const $=s=>document.querySelector(s);
const participantSelect=$('#participantSelect');

participants.forEach(name=>participantSelect.insertAdjacentHTML('beforeend',`<option>${name}</option>`));
participantSelect.value=localStorage.getItem('sck-fluency-name')||'';
$('#beginBtn').disabled=!participantSelect.value;
participantSelect.addEventListener('change',()=>{
  $('#beginBtn').disabled=!participantSelect.value;
  localStorage.setItem('sck-fluency-name',participantSelect.value);
});

const nextBtn=$('#nextBtn');
if(nextBtn)nextBtn.style.display='none';
const quizActions=$('#quizCard .quiz-actions');
if(quizActions)quizActions.style.justifyContent='flex-start';

$('#heroStart').onclick=()=>$('#assessment').scrollIntoView({behavior:'smooth'});
$('#heroTeam').onclick=()=>$('#teamBoard').scrollIntoView({behavior:'smooth'});
$('#beginBtn').onclick=()=>{
  participant=participantSelect.value;
  experienceAnswers={};answers=Array(questions.length).fill(null);current=0;advancing=false;submitting=false;
  $('#namePanel').classList.add('hidden');
  $('#experienceCard').classList.remove('hidden');
  renderExperience();updateProgress('활용 경험');
};

$('#experienceNext').onclick=()=>{
  if(Object.keys(experienceAnswers).length!==experienceQuestions.length)return;
  openTransitionModal();
};

$('#transitionStart')?.addEventListener('click',()=>{
  closeTransitionModal();
  $('#experienceCard').classList.add('hidden');
  $('#quizCard').classList.remove('hidden');
  current=0;
  renderQuestion();
  setTimeout(()=>$('#quizCard').scrollIntoView({behavior:'smooth',block:'center'}),80);
});

$('#transitionBack')?.addEventListener('click',()=>{
  closeTransitionModal();
  $('#experienceCard').scrollIntoView({behavior:'smooth',block:'center'});
});

$('#prevBtn').onclick=()=>{
  if(advancing||submitting)return;
  if(current>0){current--;renderQuestion()}
  else{$('#quizCard').classList.add('hidden');$('#experienceCard').classList.remove('hidden');updateProgress('활용 경험')}
};

$('#retakeBtn').onclick=()=>resetAssessmentUI(true);
$('#resetDataBtn')?.addEventListener('click',resetTeamData);

function openTransitionModal(){
  const modal=$('#transitionModal');
  if(!modal)return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  setTimeout(()=>$('#transitionStart')?.focus(),80);
}

function closeTransitionModal(){
  const modal=$('#transitionModal');
  if(!modal)return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

function resetAssessmentUI(scroll=true){
  closeTransitionModal();
  participant='';
  experienceAnswers={};
  answers=Array(questions.length).fill(null);
  current=0;advancing=false;submitting=false;
  participantSelect.value='';
  localStorage.removeItem('sck-fluency-name');
  $('#beginBtn').disabled=true;
  $('#personalResult').classList.add('hidden');
  $('#quizCard').classList.add('hidden');
  $('#experienceCard').classList.add('hidden');
  $('#namePanel').classList.remove('hidden');
  updateProgress('준비');
  if(scroll)setTimeout(()=>$('#assessment').scrollIntoView({behavior:'smooth',block:'start'}),80);
}

function renderExperience(){
  $('#experienceGrid').innerHTML=experienceQuestions.map((item,i)=>`<div class="experience-item"><label>${i+1}. ${item.label}</label><select data-key="${item.key}"><option value="">선택해주세요</option>${item.options.map(([label,value])=>`<option value="${value}" ${String(experienceAnswers[item.key])===String(value)?'selected':''}>${label}</option>`).join('')}</select><span class="experience-help">${item.help}</span></div>`).join('');
  $('#experienceGrid').querySelectorAll('select').forEach(select=>select.addEventListener('change',()=>{
    if(select.value==='')delete experienceAnswers[select.dataset.key];
    else experienceAnswers[select.dataset.key]=Number(select.value);
    $('#experienceNext').disabled=Object.keys(experienceAnswers).length!==experienceQuestions.length;
  }));
  $('#experienceNext').disabled=Object.keys(experienceAnswers).length!==experienceQuestions.length;
}

function renderQuestion(){
  advancing=false;
  const item=questions[current],d=dimensions[item.d];
  $('#dimensionBadge').textContent=`${d.code} · ${d.label}`;
  $('#quizIndex').textContent=`${String(current+1).padStart(2,'0')} / ${questions.length}`;
  $('#questionText').textContent=item.q;
  $('#scaleOptions').innerHTML=scale.map(([label,value])=>`<button type="button" class="${answers[current]===value?'active':''}" data-value="${value}">${label}<small>${value}</small></button>`).join('');
  $('#scaleOptions').querySelectorAll('button').forEach(btn=>btn.onclick=()=>selectAnswer(btn));
  updateProgress(`${current+1} / ${questions.length}`);
}

function selectAnswer(btn){
  if(advancing||submitting)return;
  advancing=true;
  answers[current]=Number(btn.dataset.value);
  const buttons=[...$('#scaleOptions').querySelectorAll('button')];
  buttons.forEach(option=>{
    option.classList.toggle('active',option===btn);
    option.disabled=true;
  });
  setTimeout(()=>{
    if(current<questions.length-1){
      current++;
      renderQuestion();
    }else{
      submitResult();
    }
  },150);
}

function updateProgress(label){
  $('#questionCount').textContent=label;
  const pct=typeof label==='string'&&label.includes('/')?((current+1)/questions.length)*100:(label==='활용 경험'?8:0);
  $('#questionProgress').style.width=`${pct}%`;
}

function scoreAnswers(){
  const grouped={delegation:[],description:[],discernment:[],diligence:[]};
  questions.forEach((q,i)=>grouped[q.d].push(answers[i]));
  const scores={};
  Object.keys(grouped).forEach(k=>{const avg=grouped[k].reduce((a,b)=>a+b,0)/grouped[k].length;scores[k]=Math.round(((avg-1)/4)*100)});
  scores.total=Math.round((scores.delegation+scores.description+scores.discernment+scores.diligence)/4);
  return scores;
}

function scoreUtilization(){
  const vals=experienceQuestions.map(q=>Number(experienceAnswers[q.key]||0));
  return Math.round((vals.reduce((a,b)=>a+b,0)/(experienceQuestions.length*4))*100);
}

async function submitResult(){
  if(submitting||answers.some(v=>v==null))return;
  submitting=true;
  const s=scoreAnswers();
  const utilization=scoreUtilization();
  const payload={workshop_id:WORKSHOP,participant_name:participant,delegation:s.delegation,description:s.description,discernment:s.discernment,diligence:s.diligence,total_score:s.total,utilization_score:utilization,answers,experience_answers:experienceAnswers,updated_at:new Date().toISOString()};

  renderPersonal(payload);
  $('#quizCard').classList.add('hidden');
  $('#personalResult').classList.remove('hidden');
  $('#personalResult').scrollIntoView({behavior:'smooth'});

  const {error}=await supabase.from('sck_tf_ai_fluency_results').upsert(payload,{onConflict:'workshop_id,participant_name'});
  submitting=false;
  if(error){toast('개인 결과는 확인할 수 있지만 TF 공유 저장에 실패했습니다.');console.error(error);return}
  toast('결과가 TF 보드에 공유되었습니다.');
  await loadTeam();
}

function renderPersonal(r){
  $('#resultName').textContent=r.participant_name;
  $('#totalScore').textContent=r.total_score;
  $('#utilScore').textContent=r.utilization_score??0;
  $('#utilBar').style.width=`${r.utilization_score??0}%`;
  const vals={delegation:r.delegation,description:r.description,discernment:r.discernment,diligence:r.diligence};
  drawRadar($('#radar'),vals,false);
  $('#dimensionResults').innerHTML=Object.entries(dimensions).map(([k,d])=>`<article class="dim-card"><span>${d.code} · ${d.label}</span><strong>${vals[k]}</strong><p>${d.desc}</p></article>`).join('');
  const sorted=Object.entries(vals).sort((a,b)=>b[1]-a[1]);
  const [topKey,topVal]=sorted[0],lowKey=sorted[sorted.length-1][0];
  const top=dimensions[topKey],low=dimensions[lowKey];
  $('#profileKicker').textContent=`나의 강점 · ${top.code} ${top.label}`;
  $('#profileTitle').textContent=`${top.label}이 가장 자연스러운 강점으로 보여요.`;
  $('#profileDesc').textContent=`AI 협업 역량은 ${r.total_score}점, 실제 업무 활용도는 ${r.utilization_score}점입니다. ${top.label}이 ${topVal}점으로 가장 높고, 상대적으로 낮은 ${low.label}은 TF 동료의 방식을 참고해 확장해볼 수 있습니다.`;
  $('#talkPrompt').textContent=`나는 ${top.label}을 실제 업무에서 어떻게 하고 있나요? 그리고 활용도 ${r.utilization_score}점을 만든 경험 중 동료와 공유하고 싶은 것은 무엇인가요?`;
}

async function loadTeam(){
  const {data,error}=await supabase.from('sck_tf_ai_fluency_results').select('*').eq('workshop_id',WORKSHOP).order('updated_at',{ascending:false});
  if(error){$('#liveLabel').textContent='팀 결과 연결 확인 필요';return}
  results=data||[];
  $('#liveLabel').textContent='팀 결과 실시간 연결';
  renderTeam();
}

function renderTeam(){
  $('#teamCount').textContent=results.length;
  if(!results.length){
    $('#teamTotalAvg').textContent='0';$('#teamUtilAvg').textContent='0';
    drawRadar($('#teamRadar'),{delegation:0,description:0,discernment:0,diligence:0},true);
    $('#teamBars').innerHTML='';
    $('#peopleGrid').innerHTML='<div class="empty-state">아직 제출된 결과가 없습니다. 위에서 이름을 선택하고 새 테스트를 시작할 수 있습니다.</div>';
    return;
  }
  const avg={};
  Object.keys(dimensions).forEach(k=>avg[k]=Math.round(results.reduce((sum,r)=>sum+Number(r[k]||0),0)/results.length));
  const totalAvg=Math.round(results.reduce((s,r)=>s+Number(r.total_score||0),0)/results.length);
  const utilVals=results.filter(r=>r.utilization_score!=null);
  const utilAvg=utilVals.length?Math.round(utilVals.reduce((s,r)=>s+Number(r.utilization_score||0),0)/utilVals.length):0;
  $('#teamTotalAvg').textContent=totalAvg;
  $('#teamUtilAvg').textContent=utilAvg;
  drawRadar($('#teamRadar'),avg,true);
  $('#teamBars').innerHTML=Object.entries(dimensions).map(([k,d])=>`<div class="team-bar-item"><div class="team-bar-head"><b>${d.code} · ${d.label}</b><span>${avg[k]}</span></div><div class="bar-track"><i style="width:${avg[k]}%"></i></div><p class="team-bar-desc">${d.desc}</p></div>`).join('');
  $('#peopleGrid').innerHTML=results.map(r=>`<article class="person-card"><div class="person-top"><div class="person-name"><span class="avatar">${r.participant_name.slice(-2)}</span><span>${escapeHtml(r.participant_name)}</span></div><span class="person-total">${r.total_score}</span></div><div style="margin-top:10px;font-size:12px;color:#777">협업 역량 ${r.total_score} · 업무 활용도 ${r.utilization_score??'-'}</div><div class="mini-bars">${Object.entries(dimensions).map(([k,d])=>`<div><i style="--v:${r[k]}%"></i>${d.code}<br>${r[k]}</div>`).join('')}</div></article>`).join('');
}

async function resetTeamData(){
  if(!confirm('TF 결과 데이터를 모두 초기화할까요?'))return;
  if(!confirm('정말 삭제할까요? 이 작업은 되돌릴 수 없습니다.'))return;
  const btn=$('#resetDataBtn');
  if(btn){btn.disabled=true;btn.textContent='초기화 중...'}
  const {error}=await supabase.from('sck_tf_ai_fluency_results').delete().eq('workshop_id',WORKSHOP);
  if(btn){btn.disabled=false;btn.textContent='데이터 초기화'}
  if(error){toast('데이터 초기화에 실패했습니다.');return}
  results=[];
  renderTeam();
  resetAssessmentUI(false);
  toast('데이터를 초기화했습니다. 새 테스트를 시작할 수 있습니다.');
  setTimeout(()=>$('#assessment').scrollIntoView({behavior:'smooth',block:'start'}),180);
}

function drawRadar(svg,vals,isTeam){
  const cx=210,cy=210,maxR=142,keys=['delegation','description','discernment','diligence'],angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
  const point=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
  let html='';
  [25,50,75,100].forEach(level=>{const pts=angles.map(a=>point(a,maxR*level/100).join(',')).join(' ');html+=`<polygon class="radar-grid" points="${pts}"/>`});
  angles.forEach(a=>{const [x,y]=point(a,maxR);html+=`<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`});
  const shape=angles.map((a,i)=>point(a,maxR*(Number(vals[keys[i]])||0)/100).join(',')).join(' ');
  html+=`<polygon class="radar-shape" points="${shape}"/>`;
  angles.forEach((a,i)=>{const [x,y]=point(a,maxR+35);const d=dimensions[keys[i]];html+=`<text class="radar-label" x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle">${d.code} ${d.label}</text>`});
  if(isTeam)html+=`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" style="font:800 14px 'DM Sans','Noto Sans KR',sans-serif;fill:#555">TF 평균</text>`;
  svg.innerHTML=html;
}

function toast(msg){
  const el=$('#toast');el.textContent=msg;el.classList.add('show');
  clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2300);
}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

loadTeam();
supabase.channel('sck-ai-fluency-live').on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_ai_fluency_results'},()=>loadTeam()).subscribe();