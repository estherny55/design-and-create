const SUPABASE_URL = 'https://ogpujsqdvvwrhvbqzhmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MPpEh3NEhqg9KDoPAK7p6w_K8TCK3Wv';
const API = `${SUPABASE_URL}/rest/v1`;
const headers = {'apikey': SUPABASE_KEY, 'Content-Type':'application/json'};

async function db(path, options={}){
  const r=await fetch(`${API}/${path}`, {...options, headers:{...headers,...(options.headers||{})}});
  if(!r.ok) throw new Error(await r.text());
  const text=await r.text(); return text?JSON.parse(text):null;
}

let mineTimer=null,mineSeconds=0,mineStarted=false,mineCells=[];
function newMines(){clearInterval(mineTimer);mineSeconds=0;mineStarted=false;document.getElementById('mineTime').textContent=0;const grid=document.getElementById('mineGrid');grid.innerHTML='';mineCells=[];let mines=new Set();while(mines.size<10)mines.add(Math.floor(Math.random()*64));for(let i=0;i<64;i++){let b=document.createElement('button');b.dataset.mine=mines.has(i);b.onclick=()=>openMine(b,i,mines);grid.appendChild(b);mineCells.push(b)}document.getElementById('mineCount').textContent=10}
function openMine(b,i,mines){if(!mineStarted){mineStarted=true;mineTimer=setInterval(()=>{mineSeconds++;document.getElementById('mineTime').textContent=mineSeconds},1000)}if(b.classList.contains('open'))return;if(mines.has(i)){b.classList.add('mine');b.textContent='×';mineCells.forEach(x=>{if(x.dataset.mine){x.classList.add('mine');x.textContent='×'}});clearInterval(mineTimer);return}b.classList.add('open');let r=Math.floor(i/8),c=i%8,n=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let rr=r+dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8&&mines.has(rr*8+cc))n++}b.textContent=n||''}

let wordAnswer='CREATE',guess='',row=0;
async function getWord(){try{const today=new Date().toISOString().slice(0,10);const data=await db(`wordle?date=eq.${today}&select=word&limit=1`);if(data?.[0]?.word)wordAnswer=data[0].word.toUpperCase()}catch(e){console.warn(e)}}
async function initWordle(){await getWord();const rows=document.getElementById('wordRows');rows.innerHTML='';for(let r=0;r<6;r++){let rw=document.createElement('div');rw.className='word-row';for(let c=0;c<6;c++){let x=document.createElement('div');x.className='letter';x.id=`w${r}${c}`;rw.appendChild(x)}rows.appendChild(rw)}let keys='QWERTYUIOPASDFGHJKLZXCVBNM';document.getElementById('keyboard').innerHTML=keys.split('').map(k=>`<button class="key" onclick="keyWord('${k}')">${k}</button>`).join('')+`<button class="key" onclick="keyWord('⌫')">⌫</button><button class="key" onclick="submitWord()">ENTER</button>`}
function keyWord(k){if(k==='⌫')guess=guess.slice(0,-1);else if(guess.length<6)guess+=k;drawGuess()}
function drawGuess(){for(let c=0;c<6;c++)document.getElementById(`w${row}${c}`).textContent=guess[c]||''}
function submitWord(){if(guess.length!==6){document.getElementById('wordMessage').textContent='Use 6 letters.';return}let ans=wordAnswer;for(let c=0;c<6;c++){let el=document.getElementById(`w${row}${c}`),ch=guess[c];el.classList.add(ch===ans[c]?'correct':ans.includes(ch)?'present':'absent')}if(guess===ans){document.getElementById('wordMessage').textContent='Solved.';return}row++;guess='';if(row>=6){document.getElementById('wordMessage').textContent='The word was '+ans+'.';return}drawGuess()}

async function submitIdea(e){e.preventDefault();const status=document.getElementById('ideaStatus');status.textContent='Sending…';try{await db('ideas',{method:'POST',headers:{'Prefer':'return=minimal'},body:JSON.stringify({type:document.getElementById('ideaType').value,text:document.getElementById('ideaText').value.trim()})});document.getElementById('ideaText').value='';status.textContent='Thanks — your idea has been sent to the committee.'}catch(err){console.error(err);status.textContent='Could not send the idea. Please try again.'}}
async function loadChallenge(){try{const d=(await db('challenge?select=*&order=updated_at.desc&limit=1'))?.[0];if(!d)return;let h=document.querySelector('.challenge h3'),p=document.querySelector('.challenge p');if(h)h.textContent=d.topic;if(p&&d.description)p.textContent=d.description;document.querySelectorAll('.step').forEach((x,i)=>x.classList.toggle('active',i===Number(d.stage||0)));let s=document.querySelector('.challenge-meta strong:last-child');if(s)s.textContent=['Think','Design','Create','Present'][Number(d.stage||0)];let meta=document.querySelector('.challenge-meta strong:first-child');if(meta)meta.textContent=`0${Number(d.stage||0)+1} / 04`;}catch(e){console.warn(e)}}
async function loadArticles(){try{const data=await db('articles?published=eq.true&select=*&order=created_at.desc');const grid=document.querySelector('.article-grid');if(!grid||!data?.length)return;grid.innerHTML=data.map(a=>`<article class="article-card"><span class="tag">ARTICLE</span><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.content).slice(0,220)}</p><a href="#" onclick="return false">Published by ${escapeHtml(a.author||'Design & Create')}</a></article>`).join('')}catch(e){console.warn(e)}}
function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
document.addEventListener('DOMContentLoaded',()=>{newMines();initWordle();loadChallenge();loadArticles()});
