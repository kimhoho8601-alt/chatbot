const boardEmojiMap={
  '김홍섭':'🦊','이영선':'🐰','최현지':'🐼','최예린':'🐶','이호열':'🐱','서종호':'🐯','백예원':'🐻',
  '전현지':'🐹','이예진':'🐨','이슬기':'🦁','김지원':'🐧','김현주':'🦄','김자연':'🐬'
};

const style=document.createElement('style');
style.id='board-author-avatar-style';
style.textContent=`
  .alignment-board .author-chip{
    display:inline-flex!important;
    align-items:center;
    gap:7px;
    min-width:0;
    max-width:160px;
    color:#4f5258!important;
    font-weight:700;
    overflow:visible!important;
  }
  .alignment-board .author-chip .board-author-avatar{
    width:28px;
    height:28px;
    flex:0 0 28px;
    border-radius:999px;
    display:inline-grid;
    place-items:center;
    background:linear-gradient(145deg,#fff4f5,#ffe9eb);
    border:1px solid #f0cbd0;
    box-shadow:0 4px 12px rgba(229,27,35,.08);
    font-size:14px;
    line-height:1;
  }
  .alignment-board .author-chip .board-author-name{
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    font-size:11px;
  }
  .alignment-board .board-note:hover .board-author-avatar{
    border-color:#e51b23;
    box-shadow:0 6px 16px rgba(229,27,35,.14);
    transform:translateY(-1px);
  }
  .alignment-board .board-author-avatar{transition:.18s ease}
  .alignment-board.presentation .author-chip{max-width:220px;gap:9px}
  .alignment-board.presentation .author-chip .board-author-avatar{
    width:34px;
    height:34px;
    flex-basis:34px;
    font-size:17px;
  }
  .alignment-board.presentation .author-chip .board-author-name{font-size:13px}
`;
document.head.appendChild(style);

function decorateAuthorChip(chip){
  if(!(chip instanceof HTMLElement)||chip.dataset.avatarReady==='1')return;
  const name=(chip.textContent||'').trim();
  if(!name)return;
  const emoji=boardEmojiMap[name]||'🙂';
  chip.dataset.avatarReady='1';
  chip.setAttribute('title',name);
  chip.innerHTML=`<b class="board-author-avatar" aria-hidden="true">${emoji}</b><span class="board-author-name"></span>`;
  chip.querySelector('.board-author-name').textContent=name;
}

function decorateBoard(root=document){
  root.querySelectorAll?.('.alignment-board .author-chip').forEach(decorateAuthorChip);
}

decorateBoard();

const board=document.getElementById('board');
if(board){
  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      mutation.addedNodes.forEach(node=>{
        if(!(node instanceof HTMLElement))return;
        if(node.matches?.('.author-chip'))decorateAuthorChip(node);
        decorateBoard(node);
      });
    }
  });
  observer.observe(board,{childList:true,subtree:true});
}
