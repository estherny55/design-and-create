const SUPABASE_URL = 'https://ogpujsqdvvwrhvbqzhmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MPpEh3NEhqg9KDoPAK7p6w_K8TCK3Wv';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function db(table, options={}) {
  let q = sb.from(table);
  if (options.select) q = q.select(options.select);
  if (options.eq) for (const [k,v] of Object.entries(options.eq)) q = q.eq(k,v);
  if (options.order) q = q.order(options.order.column, {ascending: options.order.ascending !== false});
  if (options.limit) q = q.limit(options.limit);
  if (options.insert) return await q.insert(options.insert);
  return await q;
}

let mineTimer=null,mineSeconds=0,mineStarted=false,mineWon=false,mineCells=[],mineOpened=0;
function newMines(){
  clearInterval(mineTimer); mineSeconds=0; mineStarted=false; mineWon=false; mineOpened=0;
  document.getElementById('mineTime').textContent=0;
  const grid=document.getElementById('mineGrid'); grid.innerHTML=''; mineCells=[];
  let mines=new Set(); while(mines.size<10) mines.add(Math.floor(Math.random()*64));
  for(let i=0;i<64;i++){
    let b=document.createElement('button'); b.dataset.mine=mines.has(i); b.onclick=()=>openMine(b,i,mines); grid.appendChild(b); mineCells.push(b);
  }
  document.getElementById('mineCount').textContent=10;
}
function mineNumber(i,mines){
  let r=Math.floor(i/8),c=i%8,n=0;
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
    let rr=r+dr,cc=c+dc; if(rr>=0&&rr<8&&cc>=0&&cc<8&&mines.has(rr*8+cc)) n++;
  }
  return n;
}
function revealMineArea(start,mines){
  const queue=[start],seen=new Set([start]);
  while(queue.length){
    const i=queue.shift(), b=mineCells[i];
    if(!b || b.classList.contains('open') || b.dataset.mine==='true') continue;
    const n=mineNumber(i,mines); b.classList.add('open'); b.textContent=n||''; mineOpened++;
    if(n===0){
      const r=Math.floor(i/8),c=i%8;
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
        const rr=r+dr,cc=c+dc, ni=rr*8+cc;
        if(rr>=0&&rr<8&&cc>=0&&cc<8&&!seen.has(ni)&&!mines.has(ni)){seen.add(ni);queue.push(ni)}
      }
    }
  }
}
function openMine(b,i,mines){
  if(!mineStarted){
    mineStarted=true;
    mineTimer=setInterval(()=>{mineSeconds++;document.getElementById('mineTime').textContent=mineSeconds},1000);
  }
  if(b.classList.contains('open') || mineWon) return;
  if(mines.has(i)){
    b.classList.add('mine');b.textContent='×';mineCells.forEach(x=>{if(x.dataset.mine==='true'){x.classList.add('mine');x.textContent='×'}});clearInterval(mineTimer);return;
  }
  revealMineArea(i,mines);
  if(mineOpened >= 64 - mines.size){
    mineWon=true;
    clearInterval(mineTimer);
    document.getElementById('mineMessage').textContent='CLEARED! You found all the safe squares.';
    mineCells.forEach(x=>{ if(x.dataset.mine==='true'){ x.classList.add('flagged'); x.textContent='⚑'; } });
  }
}



let memoryCards=[],memoryFlipped=[],memoryMatched=0,memoryMoves=0,memoryLock=false;
const memorySymbols=['✦','●','▲','◆','★','■','☀','☘'];
function newMemoryGame(){
  const grid=document.getElementById('memoryGrid');
  if(!grid)return;
  memoryCards=[...memorySymbols,...memorySymbols].sort(()=>Math.random()-0.5);
  memoryFlipped=[];memoryMatched=0;memoryMoves=0;memoryLock=false;
  document.getElementById('memoryPairs').textContent='0 / 8';
  document.getElementById('memoryMoves').textContent='0';
  document.getElementById('memoryMessage').textContent='';
  grid.innerHTML=memoryCards.map((symbol,i)=>`<button class="memory-card" data-index="${i}" onclick="flipMemory(${i})"><span>${symbol}</span></button>`).join('');
}
function flipMemory(i){
  if(memoryLock||memoryFlipped.includes(i))return;
  const card=document.querySelector(`.memory-card[data-index="${i}"]`);
  if(!card||card.classList.contains('matched'))return;
  card.classList.add('flipped');memoryFlipped.push(i);
  if(memoryFlipped.length<2)return;
  memoryMoves++;document.getElementById('memoryMoves').textContent=memoryMoves;
  const [a,b]=memoryFlipped;
  if(memoryCards[a]===memoryCards[b]){
    document.querySelector(`.memory-card[data-index="${a}"]`).classList.add('matched');
    document.querySelector(`.memory-card[data-index="${b}"]`).classList.add('matched');
    memoryMatched++;document.getElementById('memoryPairs').textContent=`${memoryMatched} / 8`;memoryFlipped=[];
    if(memoryMatched===8)document.getElementById('memoryMessage').textContent='CLEARED! You matched every pair.';
  }else{
    memoryLock=true;
    setTimeout(()=>{
      [a,b].forEach(n=>document.querySelector(`.memory-card[data-index="${n}"]`)?.classList.remove('flipped'));
      memoryFlipped=[];memoryLock=false;
    },650);
  }
}
let logoClicks=0,logoClickTimer=null;
function secretCommitteeAccess(e){
  e.preventDefault();
  logoClicks++;
  clearTimeout(logoClickTimer);
  logoClickTimer=setTimeout(()=>logoClicks=0,1200);
  if(logoClicks>=3){logoClicks=0;window.location.href='editor.html';}
}

async function loadChallenge(){try{const {data,error}=await db('challenge',{select:'*',order:{column:'updated_at',ascending:false},limit:1});if(error)throw error;const d=data?.[0];if(!d)return;let h=document.querySelector('.challenge h3'),p=document.querySelector('.challenge p');if(h)h.textContent=d.topic;if(p)p.textContent=d.description||'';const stage=Math.max(0,Math.min(3,Number(d.stage||0)));document.querySelectorAll('.step').forEach((x,i)=>x.classList.toggle('active',i===stage));const current=['Think','Design','Create','Present'][stage];const next=stage<3?['Think','Design','Create','Present'][stage+1]:'Complete';let meta=document.querySelectorAll('.challenge-meta strong');if(meta[0])meta[0].textContent=current;if(meta[1])meta[1].textContent=next;const month=document.getElementById('monthLabel');if(month)month.textContent=d.month_label||'MONTH 01';}catch(e){console.warn('Challenge load failed:',e)}}


async function submitArticle(e){
  e.preventDefault();
  const status=document.getElementById('articleStatus');
  const title=document.getElementById('submissionTitle').value.trim();
  const author=document.getElementById('submissionAuthor').value.trim();
  const content=document.getElementById('submissionContent').value.trim();
  const source_url=document.getElementById('submissionUrl').value.trim();
  const category=document.getElementById('submissionType').value;
  status.textContent='Sending…';
  try{
    const {error}=await sb.from('articles').insert({title,author,content,source_url,category,published:false});
    if(error) throw error;
    document.getElementById('submissionTitle').value='';
    document.getElementById('submissionAuthor').value='';
    document.getElementById('submissionContent').value='';
    document.getElementById('submissionUrl').value='';
    status.textContent='Submitted — the committee will review it before publication.';
  }catch(err){
    console.error('Article submission failed:',err);
    status.textContent='Could not submit it. Please try again.';
  }
}

async function loadArticles(){try{const {data,error}=await db('articles',{select:'*',eq:{published:true},order:{column:'created_at',ascending:false}});if(error)throw error;const grid=document.getElementById('articleGrid');if(!grid)return;if(!data?.length){grid.innerHTML='<p class="empty-state">No articles yet.</p>';return}grid.innerHTML=data.map(a=>`<article class="article-card"><span class="tag">${escapeHtml(a.category||'ARTICLE')}</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.content).slice(0,220)}</p>${a.media_url?`<a class=\"resource-link\" href=\"${escapeHtml(a.media_url)}\" target=\"_blank\" rel=\"noopener\">View attachment →</a>`:''}<a class="article-read" href="article.html?id=${encodeURIComponent(a.id)}" target="_blank" rel="noopener">Read article →</a><div class="article-byline">Published by ${escapeHtml(a.author||'Design & Create')}</div></article>`).join('')}catch(e){console.warn('Articles load failed:',e)}}

async function loadResources(){try{const {data,error}=await db('resources',{select:'*',order:{column:'created_at',ascending:false}});if(error)throw error;const grid=document.getElementById('resourceGrid');if(!grid)return;if(!data?.length){grid.innerHTML='<p class="empty-state">No resources yet.</p>';return}grid.innerHTML=data.map(r=>`<article class="resource"><span>RESOURCE</span><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.description||'')}</p>${r.url?`<a class="resource-link" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">Open resource →</a>`:''}${r.media_url?`<a class="resource-link" href="${escapeHtml(r.media_url)}" target="_blank" rel="noopener">View attachment →</a>`:''}</article>`).join('')}catch(e){console.warn('Resources load failed:',e)}}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
document.addEventListener('DOMContentLoaded',()=>{newMines();newMemoryGame();loadChallenge();loadArticles();loadResources();document.querySelector('.brand')?.addEventListener('click',secretCommitteeAccess)});
