/* engine.js — общий движок для всех диагностик PsyTest */
/* Требует: config-{name}.js загружен ДО engine.js */
/* Config определяет: TQ, FQ, MAX, SCORED, DOM, DM, LEV, DESC, buildC(), setM() */

const S = {};
const HIST = {};

function gL(t) { return LEV.find(l => t >= l.min && t <= l.max) || LEV[0]; }
function tot() { let s = 0; for (let i = 1; i <= SCORED; i++) if (S[i] !== undefined) s += S[i]; return s; }
function ans() { let c = 0; for (let i = 1; i <= TQ + FQ; i++) if (S[i] !== undefined) c++; return c; }
function dS(k) { const [s, e] = DOM[k]; let sum = 0, cnt = 0; for (let i = s; i <= e; i++) if (S[i] !== undefined) { sum += S[i]; cnt++; } return cnt > 0 ? sum : null; }
function updB() {
  ['A','B','C','D','E'].forEach(k => {
    const s = dS(k), b = document.getElementById('bar' + k);
    if (b) b.style.width = s !== null ? Math.max((s / DM[k]) * 100, 3) + '%' : '0%';
  });
}

function upd() {
  const t = tot(), a = ans(), lev = gL(t);
  document.getElementById('pf').style.width = (a / (TQ + FQ) * 100) + '%';
  document.getElementById('pl').textContent = a + ' из ' + (TQ + FQ);
  const sf = document.querySelector('.sf');
  if (a >= TQ + (typeof FQ !== 'undefined' ? FQ : 0)) {
    sf.classList.add('vis');
    document.getElementById('sfn').textContent = t;
    document.getElementById('sfv').textContent = lev.l;
  } else {
    sf.classList.remove('vis');
  }
  if (a >= 5) {
    document.getElementById('rn').textContent = t;
    document.getElementById('rl').textContent = lev.l;
    document.getElementById('rl').style.color = lev.c;
    document.getElementById('rb').style.width = (t / MAX * 100) + '%';
    document.getElementById('rb').style.background = lev.b;
    document.getElementById('rd').textContent = DESC[LEV.indexOf(lev)];
    document.querySelectorAll('#stbl tbody tr').forEach(tr => {
      const [mn, mx] = tr.dataset.r.split(',').map(Number);
      tr.classList.toggle('act', t >= mn && t <= mx);
    });
    document.getElementById('domBlock').style.display = 'block';
    ['A','B','C','D','E'].forEach(k => {
      document.getElementById('d' + k).textContent = dS(k) ?? '–';
    });
    updB();
    buildC();
  } else {
    document.getElementById('rn').textContent = '—';
    document.getElementById('rl').textContent = '';
    document.getElementById('rb').style.width = '0%';
    document.getElementById('rd').textContent = 'Ответьте минимум на 5 вопросов для предварительных результатов';
  }
}

/* Обработчики вопросов */
document.querySelectorAll('.ans').forEach(g => {
  const q = parseInt(g.dataset.q);
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      o.querySelector('input').checked = true;
      S[q] = parseInt(o.querySelector('input').value);
      g.querySelectorAll('.ao').forEach(x => x.classList.remove('sel'));
      o.classList.add('sel');
      upd();
    });
  });
});

/* Обработчики истории */
document.querySelectorAll('.hcb').forEach(o => {
  o.addEventListener('click', () => {
    const g = o.dataset.g, v = o.dataset.v;
    document.querySelectorAll(`[data-g="${g}"]`).forEach(x => x.classList.remove('sel'));
    o.classList.add('sel');
    HIST[g] = v;
    const n = o.dataset.note, ne = document.getElementById('note-' + g);
    if (ne) {
      if (n) { ne.style.display = 'block'; ne.textContent = n; }
      else ne.style.display = 'none';
    }
    const ok = document.getElementById('ok-' + g);
    if (ok) { ok.classList.add('show'); }
    buildC();
  });
});

/* Инициализация */
let cM = '2w';
upd();
