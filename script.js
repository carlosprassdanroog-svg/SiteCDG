// ======= CONFIG =======
const UNLOCK_TIME = 100; // 1m40s
const OFFER_MINUTES = 60; // 1 hora
const STORAGE_UNLOCK = 'cdg_ctaUnlocked_v1';
const STORAGE_DEADLINE = 'cdg_offerDeadline_v1';
const DEBUG_UNLOCK = new URLSearchParams(location.search).has('unlock');

// ======= ELEMENTOS =======
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const btnBigPlay = document.getElementById('btnBigPlay');
const btnPlay = document.getElementById('btnPlay');
const btnMute = document.getElementById('btnMute');
const btnFull = document.getElementById('btnFull');
const bar = document.getElementById('bar');
const cta = document.getElementById('cta');
const hint = document.getElementById('hint');
const timer = document.getElementById('timer');

// ======= UTILS =======
const fmt = n => n.toString().padStart(2,'0');
function setCTAEnabled(v){ v ? (cta.removeAttribute('disabled'), cta.style.pointerEvents='auto') : (cta.setAttribute('disabled',''), cta.style.pointerEvents='none'); }
function unlockProgress(){ localStorage.setItem(STORAGE_UNLOCK, '1'); }
function hasProgress(){ return localStorage.getItem(STORAGE_UNLOCK) === '1' || DEBUG_UNLOCK; }
function updateBar(){ const p = Math.min(1, video.currentTime / Math.max(UNLOCK_TIME, video.duration || UNLOCK_TIME)); bar.style.inset = `0 ${100 - p*100}% 0 0`; }

// ======= COUNTDOWN (persistente por aba) =======
function getDeadline(){
  let dl = parseInt(localStorage.getItem(STORAGE_DEADLINE)||'0',10);
  const now = Date.now();
  if(!dl || dl < now){ dl = now + OFFER_MINUTES*60*1000; localStorage.setItem(STORAGE_DEADLINE, String(dl)); }
  return dl;
}
function tickCountdown(){
  const left = getDeadline() - Date.now();
  if(left <= 0){
    timer.textContent = '00:00';
    timer.classList.add('expired');
    setCTAEnabled(false);
    hint.textContent='Oferta expirada. Atualize a página quando houver nova disponibilidade.';
    return;
  }
  const m = Math.floor(left/60000), s = Math.floor((left%60000)/1000);
  timer.textContent = `${fmt(m)}:${fmt(s)}`;
  if(left < 5*60*1000) timer.classList.add('expireSoon');
  requestAnimationFrame(()=> setTimeout(tickCountdown, 250));
}
function reevaluateCTA(){ const timeOk = (getDeadline() - Date.now()) > 0; const progressOk = hasProgress() || video.currentTime >= UNLOCK_TIME; setCTAEnabled(timeOk && progressOk); }

// ======= PLAYER =======
function tryAutoplay(){
  video.play().then(()=>{ overlay.style.display='none'; }).catch(()=>{ overlay.style.display='grid'; });
}
video.addEventListener('loadedmetadata', tryAutoplay, { once:true });
overlay.addEventListener('click', ()=>{ overlay.style.display='none'; video.muted=false; video.play(); });
btnBigPlay?.addEventListener('click', (e)=>{ e.stopPropagation(); overlay.style.display='none'; video.muted=false; video.play(); });
btnPlay.addEventListener('click', ()=>{ video.paused ? video.play() : video.pause(); });
btnMute.addEventListener('click', ()=>{ video.muted = !video.muted; btnMute.textContent = video.muted ? '🔇' : '🔈'; });
btnFull.addEventListener('click', ()=>{ const el = document.getElementById('player'); if(document.fullscreenElement){ document.exitFullscreen(); } else { el.requestFullscreen?.(); }});

video.addEventListener('timeupdate', ()=>{ updateBar(); if(video.currentTime >= UNLOCK_TIME && !hasProgress()){ unlockProgress(); } reevaluateCTA(); });
video.addEventListener('ended', ()=>{ unlockProgress(); reevaluateCTA(); });
video.addEventListener('play', ()=>{ btnPlay.textContent = '⏸'; });
video.addEventListener('pause', ()=>{ btnPlay.textContent = '⏯'; });

// ======= FEEDBACKS 5★ =======
const FEEDBACK = [
  {n:'Ana Paula — SP', t:'Aplicando os passos, fechei meus primeiros cortes pagos. Conteúdo direto e prático.'},
  {n:'João Vitor — RJ', t:'Didática excelente. Consegui monetizar com clientes locais rapidamente.'},
  {n:'Mariana — PR', t:'Montei pacote mensal e bati minha primeira meta do mês.'},
  {n:'Carlos — MG', t:'Templates e checklists aceleram demais. Recuperei o investimento.'},
  {n:'Bianca — BA', t:'Comecei com ferramentas na nuvem e funcionou de boa. Recomendo.'},
  {n:'Rafael — DF', t:'As estratégias de prospecção do material funcionam.'},
  {n:'Letícia — SC', t:'Renda extra nos fins de semana, seguindo o passo a passo.'},
  {n:'Pedro — PE', t:'Material prático e pé no chão, sem enrolação.'}
];
function renderFeedback(){ const grid = document.getElementById('feedGrid'); grid.innerHTML=''; FEEDBACK.forEach(({n,t})=>{ const card=document.createElement('div'); card.className='feed'; card.innerHTML=`<div class="stars">${'★'.repeat(5)}</div><div>${t}</div><div class="who">— ${n}</div>`; grid.appendChild(card); }); }

// ======= START =======
document.getElementById('year').textContent = new Date().getFullYear();
tickCountdown();
reevaluateCTA();
renderFeedback();