const config = window.DUALITY_CONFIG || {};

// Header and mobile navigation
const header = document.getElementById('siteHeader');
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30));
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Scroll reveals
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Cursor glow
const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

// Animated starfield
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeStars(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length: Math.min(180, Math.floor(innerWidth / 7))}, () => ({
    x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*1.3+.2,
    v: Math.random()*.18+.03, a: Math.random()*.6+.18, hue: Math.random()>.5 ? 215 : 270
  }));
}
function drawStars(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  stars.forEach(s => {
    s.y += s.v; if(s.y>innerHeight+5){s.y=-5;s.x=Math.random()*innerWidth}
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`hsla(${s.hue},90%,78%,${s.a})`;ctx.fill();
  }); requestAnimationFrame(drawStars);
}
resizeStars(); drawStars(); addEventListener('resize', resizeStars);

// Deck checker
const deckInput = document.getElementById('deckList');
const deckResults = document.getElementById('deckResults');
const LAND_HINTS = ['plains','island','swamp','mountain','forest','wastes'];
function parseDeck(text){
  return text.split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s*[xX]?\s+(.+)$/);
    return match ? {count:Number(match[1]), name:match[2].replace(/\s+\(.+\)$/,'').trim()} : null;
  }).filter(Boolean);
}
function looksLikeLand(name){
  const n=name.toLowerCase();
  return LAND_HINTS.includes(n) || /land$/.test(n) || n.includes(' land ');
}
function renderCheck(){
  const rows=parseDeck(deckInput.value);
  const total=rows.reduce((s,r)=>s+r.count,0);
  const duplicates=rows.filter(r=>r.count!==2 && !looksLikeLand(r.name));
  const nonlands=rows.filter(r=>!looksLikeLand(r.name));
  const lands=rows.filter(r=>looksLikeLand(r.name));
  const landCount=lands.reduce((s,r)=>s+r.count,0);
  const nonlandCount=nonlands.reduce((s,r)=>s+r.count,0);
  const uniqueNonlands=nonlands.length;
  const checks=[
    [total===40,`Total cards: ${total}/40`],
    [landCount===10,`Detected lands: ${landCount}/10`],
    [nonlandCount===30,`Detected nonlands: ${nonlandCount}/30`],
    [uniqueNonlands===15,`Unique nonland names: ${uniqueNonlands}/15`],
    [duplicates.length===0,duplicates.length?`Nonland counts must be exactly two: ${duplicates.map(x=>`${x.name} (${x.count})`).join(', ')}`:'Every detected nonland appears exactly twice']
  ];
  const pass=checks.every(c=>c[0]);
  deckResults.innerHTML=`<div class="result-title ${pass?'pass':'fail'}"><span class="result-badge">${pass?'✓':'!'}</span><div><strong>${pass?'Structurally legal':'Needs attention'}</strong><div>${pass?'Ready for a human card-type and Un-card review.':'Fix the highlighted structural issues.'}</div></div></div><div class="result-list">${checks.map(c=>`<div class="result-item ${c[0]?'ok':'bad'}">${c[0]?'✓':'✕'} ${c[1]}</div>`).join('')}</div><p style="color:#777187;font-size:.75rem;margin-top:auto">The browser checker can only recognize basic lands and names containing “land.” Full card-type validation belongs in the AI/API upgrade.</p>`;
}
document.getElementById('checkDeck').addEventListener('click', renderCheck);
document.getElementById('clearDeck').addEventListener('click',()=>{deckInput.value='';deckResults.innerHTML='<div class="empty-state"><span>II</span><p>Your verdict will appear here.</p></div>'});
document.getElementById('loadExample').addEventListener('click',()=>{deckInput.value=`2 Lightning Bolt\n2 Counterspell\n2 Llanowar Elves\n2 Sol Ring\n2 Swords to Plowshares\n2 Dark Ritual\n2 Brainstorm\n2 Goblin Guide\n2 Birds of Paradise\n2 Ponder\n2 Fatal Push\n2 Stoneforge Mystic\n2 Dramatic Reversal\n2 Isochron Scepter\n2 Wild Cantor\n4 Island\n3 Mountain\n3 Forest`;renderCheck()});

// AI modal
const modal=document.getElementById('aiModal');
const messages=document.getElementById('aiMessages');
const aiInput=document.getElementById('aiInput');
const aiForm=document.getElementById('aiForm');
const aiStatus=document.getElementById('aiStatus');
let conversation=[];
function openAI(prompt=''){
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  if(prompt){aiInput.value=prompt;setTimeout(()=>aiForm.requestSubmit(),120)}else setTimeout(()=>aiInput.focus(),80);
}
function closeAI(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
document.querySelectorAll('[data-open-ai]').forEach(b=>b.addEventListener('click',()=>openAI(b.dataset.prompt||'')));
document.querySelectorAll('[data-close-ai]').forEach(b=>b.addEventListener('click',closeAI));
document.querySelectorAll('[data-ai-chip]').forEach(b=>b.addEventListener('click',()=>openAI(b.dataset.aiChip)));
addEventListener('keydown',e=>{if(e.key==='Escape')closeAI()});
function addMessage(role,text,extra=''){
  const div=document.createElement('div');div.className=`message ${role} ${extra}`;div.innerHTML=`<p></p>`;div.querySelector('p').textContent=text;messages.append(div);messages.scrollTop=messages.scrollHeight;return div;
}
const localAnswers = q => {
  const s=q.toLowerCase();
  if(s.includes('resonance')) return 'Resonance can be used once each turn. As you cast a spell, exile another card with the same name from your hand. You may then spend mana as though it were mana of any color to cast that spell. It does not reduce the mana cost.';
  if(s.includes('legal')||s.includes('deck')) return 'A Duality deck has exactly 40 cards: 30 nonlands made from 15 unique names at two copies each, plus exactly 10 lands. Nonbasic lands are limited to two copies. Players start at 20 life, use the London Mulligan, and Un-cards are not allowed.';
  if(s.includes('un-card')||s.includes('uncard')) return 'Un-cards are currently the only excluded cards. Duality otherwise begins with an open card pool and no ban list.';
  return 'The live AI backend is not connected yet. I can still answer the basics: 40 cards, 15 paired nonlands, 10 lands, 20 life, London Mulligan, no ban list, and no Un-cards. Deploy the included Worker and add its URL to config.js for full AI answers.';
};
aiForm.addEventListener('submit',async e=>{
  e.preventDefault();const text=aiInput.value.trim();if(!text)return;aiInput.value='';addMessage('user',text);conversation.push({role:'user',content:text});
  const thinking=addMessage('assistant','Thinking…','thinking');aiStatus.textContent='Contacting Resonance AI…';
  try{
    if(!config.aiEndpoint) throw new Error('No endpoint');
    const res=await fetch(`${config.aiEndpoint.replace(/\/$/,'')}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conversation.slice(-10)})});
    if(!res.ok) throw new Error(`AI request failed: ${res.status}`);
    const data=await res.json();const answer=data.answer||'The AI returned an empty answer, which is impressively unhelpful.';
    thinking.remove();addMessage('assistant',answer);conversation.push({role:'assistant',content:answer});aiStatus.textContent='AI answers may be wrong. Verify tournament-impacting rulings.';
  }catch(err){thinking.remove();const answer=localAnswers(text);addMessage('assistant',answer);conversation.push({role:'assistant',content:answer});aiStatus.textContent=config.aiEndpoint?'AI backend unavailable. Showing built-in rules help.':'Demo mode. Connect the included Worker for full AI.';}
});
aiInput.addEventListener('input',()=>{aiInput.style.height='auto';aiInput.style.height=Math.min(aiInput.scrollHeight,120)+'px'});
