import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL='https://tedbkobhltarqibjhfhk.supabase.co';
const SUPABASE_KEY='sb_publishable_CS5rpk5S1eYBFxyUzCQ63w_NzPpwOZ2';
const WORKSHOP='sck-ai-tf-2026';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{realtime:{params:{eventsPerSecond:10}}});

const participants=['김홍섭','이영선','최현지','최예린','이호열','서종호','백예원','전현지','이예진','이슬기','김지원','김현주','김자연'];
const dimensions={
  delegation:{code:'D1',label:'Delegation',ko:'위임 판단',desc:'사람과 AI의 역할을 나누고, 어디까지 맡길지 판단합니다.'},
  description:{code:'D2',label:'Description',ko:'의도 전달',desc:'목표·맥락·형식·기준을 구체적으로 설명합니다.'},
  discernment:{code:'D3',label:'Discernment',ko:'결과 판단',desc:'AI 결과의 품질과 한계를 검토하고 더 나은 답을 구별합니다.'},
  diligence:{code:'D4',label:'Diligence',ko:'책임 사용',desc:'보안·투명성·책임을 고려해 AI를 안전하게 활용합니다.'}
};
const questions=[
  {d:'delegation',q:'업무를 시작할 때, 어떤 부분은 내가 직접 판단하고 어떤 부분은 AI에 맡길지 먼저 나눠보는 편이다.'},
  {d:'delegation',q:'AI가 잘할 수 있는 일과 사람이 반드시 확인해야 하는 일을 구분해서 사용하는 편이다.'},
  {d:'delegation',q:'AI를 쓰기 전에 “이 작업에서 내가 최종적으로 책임져야 할 판단은 무엇인가?”를 생각하는 편이다.'},
  {d:'description',q:'AI에게 요청할 때 원하는 결과만 말하기보다 목적과 배경 맥락까지 함께 설명하는 편이다.'},
  {d:'description',q:'원하는 답의 형식·길이·대상·톤을 구체적으로 지정하는 편이다.'},
  {d:'description',q:'첫 답이 아쉬우면 좋은 예시를 주거나 조건을 바꾸며 반복해서 결과를 다듬는 편이다.'},
  {d:'discernment',q:'AI가 사실처럼 말해도 중요한 정보는 다른 자료나 원문을 통해 다시 확인하는 편이다.'},
  {d:'discernment',q:'AI 답변에서 빠진 맥락, 지나친 단순화, 근거가 약한 부분을 찾으려고 하는 편이다.'},
  {d:'discernment',q:'여러 답안 중 무엇이 더 적절한지 내 기준으로 비교하고 선택하는 편이다.'},
  {d:'diligence',q:'개인정보나 민감한 업무정보를 AI에 입력해도 되는지 먼저 확인하는 편이다.'},
  {d:'diligence',q:'AI가 만든 내용을 업무에 활용할 때 필요한 경우 AI 활용 사실과 한계를 설명할 수 있다.'},
  {d:'diligence',q:'AI 결과가 실제 사람이나 의사결정에 영향을 줄 수 있다면, 최종 사용 전에 사람이 반드시 검토해야 한다고 생각한다.'}
];
const scale=[['전혀 아니다',1],['별로 아니다',2],['보통이다',3],['그런 편이다',4],['매우 그렇다',5]];

let answers=Array(questions.length).fill(null),current=0,participant='',results=[];
const $=s=>document.querySelector(s);
const participantSelect=$('#participantSelect');
participants.forEach(name=>participantSelect.insertAdjacentHTML('beforeend',`<option>${name}</option>`));
participantSelect.value=localStorage.getItem('sck-fluency-name')||'';
$('#beginBtn').disabled=!participantSelect.value;
participantSelect.addEventListener('change',()=>{$('#beginBtn').disabled=!participantSelect.value;localStorage.setItem('sck-fluency-name',participantSelect.value)});

$('#heroStart').onclick=()=>$('#assessment').scrollIntoView({behavior:'smooth'});
$('#heroTeam').onclick=()=>$('#teamBoard').scrollIntoView({behavior:'smooth'});
$('#beginBtn').onclick=()=>{participant=participantSelect.value;answers=Array(questions.length).fill(null);current=0;$('#namePanel').classList.add('hidden');$('#quizCard').classList.remove('hidden');renderQuestion();};
$('#prevBtn').onclick=()=>{if(current>0){current--;renderQuestion()}else{$('#quizCard').classList.add('hidden');$('#namePanel').classList.remove('hidden');updateProgress(0)}};
$('#nextBtn').onclick=()=>{if(answers[current]==null)return;if(current<questions.length-1){current++;renderQuestion()}else submitResult();};
$('#retakeBtn').onclick=()=>{participantSelect.value=participant;$('#personalResult').classList.add('hidden');$('#namePanel').classList.remove('hidden');$('#quizCard').classList.add('hidden');answers=Array(questions.length).fill(null);current=0;updateProgress(0);$('#assessment').scrollIntoView({behavior:'smooth'})};

function renderQuestion(){
  const item=questions[current],d=dimensions[item.d];
  $('#dimensionBadge').textContent=`${d.code} · ${d.label}`;
  $('#quizIndex').textContent=`${String(current+1).padStart(2,'0')} / ${questions.length}`;
  $('#questionText').textContent=item.q;
  $('#scaleOptions').innerHTML=scale.map(([label,value])=>`<button type="button" class="${answers[current]===value?'active':''}" data-value="${value}" role="radio" aria-checked="${answers[current]===value}">${label}<small>${value}</small></button>`).join('');
  $('#scaleOptions').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
    answers[current]=Number(btn.dataset.value);
    $('#scaleOptions').querySelectorAll('button').forEach(option=>{
      const selected=option===btn;
      option.classList.toggle('active',selected);
      option.setAttribute('aria-checked',selected?'true':'false');
    });
    $('#nextBtn').disabled=false;
  });
  $('#nextBtn').disabled=answers[current]==null;
  $('#nextBtn').textContent=current===questions.length-1?'결과 보기':'다음';
  $('#prevBtn').textContent=current===0?'이름 선택':'이전';
  updateProgress(current+1);
}
function updateProgress(n){$('#questionCount').textContent=`${n} / ${questions.length}`;$('#questionProgress').style.width=`${(n/questions.length)*100}%`}
function scoreAnswers(){
  const grouped={delegation:[],description:[],discernment:[],diligence:[]};
  questions.forEach((q,i)=>grouped[q.d].push(answers[i]));
  const scores={};
  Object.keys(grouped).forEach(k=>{const avg=grouped[k].reduce((a,b)=>a+b,0)/grouped[k].length;scores[k]=Math.round(((avg-1)/4)*100)});
  scores.total=Math.round((scores.delegation+scores.description+scores.discernment+scores.diligence)/4);
  return scores;
}
async function submitResult(){
  if(answers.some(v=>v==null)){toast('아직 선택하지 않은 문항이 있습니다.');return}
  const s=scoreAnswers();
  const payload={workshop_id:WORKSHOP,participant_name:participant,delegation:s.delegation,description:s.description,discernment:s.discernment,diligence:s.diligence,total_score:s.total,answers,updated_at:new Date().toISOString()};

  // 결과 확인은 네트워크 저장보다 우선합니다.
  renderPersonal(payload);
  $('#quizCard').classList.add('hidden');
  $('#personalResult').classList.remove('hidden');
  $('#personalResult').scrollIntoView({behavior:'smooth'});
  $('#nextBtn').disabled=false;
  $('#nextBtn').textContent='결과 보기';

  const {error}=await supabase.from('sck_tf_ai_fluency_results').upsert(payload,{onConflict:'workshop_id,participant_name'});
  if(error){
    toast('개인 결과는 확인할 수 있지만 TF 공유 저장에 실패했습니다.');
    console.error(error);
    return;
  }
  toast('결과가 TF 보드에 공유되었습니다.');
  await loadTeam();
}
function renderPersonal(r){
  $('#resultName').textContent=r.participant_name;$('#totalScore').textContent=r.total_score;
  const vals={delegation:r.delegation,description:r.description,discernment:r.discernment,diligence:r.diligence};
  drawRadar($('#radar'),vals,false);
  $('#dimensionResults').innerHTML=Object.entries(dimensions).map(([k,d])=>`<article class="dim-card"><span>${d.code} · ${d.label}</span><strong>${vals[k]}</strong><b>${d.ko}</b><p>${d.desc}</p></article>`).join('');
  const sorted=Object.entries(vals).sort((a,b)=>b[1]-a[1]);const [topKey,topVal]=sorted[0],lowKey=sorted[sorted.length-1][0];const top=dimensions[topKey],low=dimensions[lowKey];
  $('#profileKicker').textContent=`STRONGEST · ${top.code} ${top.label}`;
  $('#profileTitle').textContent=`${top.ko}에서 가장 자연스러운 강점이 보여요.`;
  $('#profileDesc').textContent=`${top.label} ${topVal}점으로 네 영역 중 가장 높습니다. 이 결과는 능력의 우열이 아니라 현재 자주 사용하는 AI 협업 습관을 보여줍니다. 상대적으로 낮은 ${low.label}은 TF 동료의 방식에서 새로운 습관을 얻어볼 수 있는 영역입니다.`;
  $('#talkPrompt').textContent=`나는 ${top.ko}을 실제 업무에서 어떻게 하고 있나요? 그리고 ${low.ko}을 잘하는 동료에게 무엇을 배우고 싶나요?`;
}

async function loadTeam(){
  const {data,error}=await supabase.from('sck_tf_ai_fluency_results').select('*').eq('workshop_id',WORKSHOP).order('updated_at',{ascending:false});
  if(error){$('#liveLabel').textContent='팀 결과 연결 확인 필요';return}
  results=data||[];$('#liveLabel').textContent='팀 결과 실시간 연결';renderTeam();
}
function renderTeam(){
  $('#teamCount').textContent=results.length;
  if(!results.length){drawRadar($('#teamRadar'),{delegation:0,description:0,discernment:0,diligence:0},true);$('#teamBars').innerHTML='';$('#peopleGrid').innerHTML='<div class="empty-state">아직 제출된 결과가 없습니다. 첫 번째 프로필을 남겨보세요.</div>';return}
  const avg={};Object.keys(dimensions).forEach(k=>avg[k]=Math.round(results.reduce((sum,r)=>sum+Number(r[k]||0),0)/results.length));
  drawRadar($('#teamRadar'),avg,true);
  $('#teamBars').innerHTML=Object.entries(dimensions).map(([k,d])=>`<div><div class="team-bar-head"><b>${d.code} · ${d.label} <small> ${d.ko}</small></b><span>${avg[k]}</span></div><div class="bar-track"><i style="width:${avg[k]}%"></i></div></div>`).join('');
  $('#peopleGrid').innerHTML=results.map(r=>`<article class="person-card"><div class="person-top"><div class="person-name"><span class="avatar">${r.participant_name.slice(-2)}</span><span>${escapeHtml(r.participant_name)}</span></div><span class="person-total">${r.total_score}</span></div><div class="mini-bars">${Object.entries(dimensions).map(([k,d])=>`<div><i style="--v:${r[k]}%"></i>${d.code}<br>${r[k]}</div>`).join('')}</div></article>`).join('');
}
function drawRadar(svg,vals,isTeam){
  const cx=210,cy=210,maxR=142,keys=['delegation','description','discernment','diligence'],angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
  const point=(a,r)=>[cx+Math.cos(a)*r,cy+Math.sin(a)*r];
  let html='';
  [25,50,75,100].forEach(level=>{const pts=angles.map(a=>point(a,maxR*level/100).join(',')).join(' ');html+=`<polygon class="radar-grid" points="${pts}"/>`});
  angles.forEach(a=>{const [x,y]=point(a,maxR);html+=`<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`});
  const shape=angles.map((a,i)=>point(a,maxR*(Number(vals[keys[i]])||0)/100).join(',')).join(' ');html+=`<polygon class="radar-shape" points="${shape}"/>`;
  angles.forEach((a,i)=>{const [x,y]=point(a,maxR+35);const d=dimensions[keys[i]];html+=`<text class="radar-label" x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle">${d.code} ${d.label}</text>`});
  if(isTeam)html+=`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" style="font:800 14px Manrope,sans-serif;fill:#555">TF AVG</text>`;
  svg.innerHTML=html;
}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),2300)}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

loadTeam();
supabase.channel('sck-ai-fluency-live').on('postgres_changes',{event:'*',schema:'public',table:'sck_tf_ai_fluency_results'},()=>loadTeam()).subscribe();
