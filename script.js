const stageData={
 stage1:{badge:'01',label:'WEEK 1 · OFFLINE',title:'TF 구성 및 착수',desc:'같은 목표를 보고 출발하기 위한 프로젝트 셋업 단계입니다.',items:['구성원 확정','사업 목적·추진 방향 공유','역할 분담','주요 산출물 확정']},
 stage2:{badge:'02',label:'WEEK 2–3 · ON/OFFLINE',title:'업무 분석 및 AI 설계',desc:'현장의 기록 방식을 해체해 AI가 이해할 수 있는 기준으로 바꾸는 핵심 단계입니다.',items:['사례관리 기록 유형·패턴 분석','AI 판단 기준 정리','보고서 어투·미사용 표현 정리','목적별 프롬프트 설계']},
 stage3:{badge:'03',label:'WEEK 4–5 · ON/OFFLINE',title:'결과 테스트 및 보완',desc:'실제 사례를 통해 오류와 한계를 드러내고 현장 활용성을 검증합니다.',items:['실제 사례로 테스트','오류·한계 분석','현장 활용성 검증','프롬프트·출력 형식 수정/보완']},
 stage4:{badge:'04',label:'WEEK 6 · OFFLINE',title:'최종 평가',desc:'최종 성과물을 공유하고 다음 적용 범위와 개선 과제를 결정합니다.',items:['최종 성과물 공유','개선·보완 과제 도출','향후 확대 적용 방향 논의','다음 운영 제안 정리']}
};

const tabs=document.querySelectorAll('.road-tab');
const badge=document.getElementById('stageBadge');
const label=document.getElementById('stageLabel');
const title=document.getElementById('stageTitle');
const desc=document.getElementById('stageDesc');
const list=document.getElementById('stageList');

tabs.forEach(tab=>tab.addEventListener('click',()=>{
  tabs.forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  const d=stageData[tab.dataset.stage];
  badge.textContent=d.badge;label.textContent=d.label;title.textContent=d.title;desc.textContent=d.desc;
  list.innerHTML=d.items.map(item=>`<li>${item}</li>`).join('');
}));

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const progress=document.getElementById('scrollProgress');
window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  progress.style.width=`${pct}%`;
});

const menuBtn=document.getElementById('menuBtn');
const mobileNav=document.getElementById('mobileNav');
menuBtn.addEventListener('click',()=>{
  const open=mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));

const agreementChecks=[...document.querySelectorAll('.agreement-list input[type="checkbox"]')];
const saved=JSON.parse(localStorage.getItem('sck-tf-agreement')||'[]');
agreementChecks.forEach((box,i)=>{box.checked=Boolean(saved[i]);box.addEventListener('change',saveAgreement)});
function saveAgreement(){
  const state=agreementChecks.map(b=>b.checked);
  localStorage.setItem('sck-tf-agreement',JSON.stringify(state));
  const note=document.getElementById('saveNote');
  note.textContent=state.every(Boolean)?'협업 원칙에 모두 체크했습니다. 이 브라우저에 저장되었습니다.':'체크 상태는 이 브라우저에 자동 저장됩니다.';
}
saveAgreement();
