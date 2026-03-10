/* config-bar.js — полная конфигурация + движок для БАР */
/* БАР не использует engine.js — слишком много кастомной логики (sub-module BI, sel-w, updP) */

const S = {}, HIST = {};
const TQ = 18, MAX = 78, SCORED = 18;
const DOM = { A:[1,5], B:[6,10], C:[11,14], D:[15,18], E:[19,21] };
const DM = { A:25, B:25, C:12, D:16, E:12 };
const BI_Q = [22,23,24], BI_MAX = 9;

const LEV = [
  { min:0,  max:15, l:'НЕТ ПРИЗНАКОВ',  c:'#166534', b:'#86efac' },
  { min:16, max:31, l:'ЛЁГКОЕ',          c:'#6a7a2a', b:'#c8e070' },
  { min:32, max:47, l:'УМЕРЕННОЕ',       c:'#b45309', b:'#fbbf24' },
  { min:48, max:62, l:'ТЯЖЁЛОЕ',         c:'#c2410c', b:'#f97316' },
  { min:63, max:78, l:'КРАЙНЕ ТЯЖЁЛОЕ',  c:'#b03a3a', b:'#ef4444' }
];
const DESC = [
  'Симптомы в пределах нормы — цикличность не выражена.',
  'Симптомы ощутимы, жизнь функционирует. Диагноз может быть не поставлен.',
  'Цикличность мешает жить — территория расстройства.',
  'Серьёзные нарушения — обе фазы значительно влияют на жизнь.',
  'Парализующее расстройство — требуется срочная помощь.'
];
const BI_LEV = [
  { min:0, max:2, l:'МАРКЕРЫ БАР-I ОТСУТСТВУЮТ', c:'#5a7a3a', desc:'Подъёмы ближе к гипомании (БАР-II): инсайт сохранён, функционирование не нарушено, психоза нет. Это не означает, что страдание меньше — при БАР-II депрессия часто тяжелее.' },
  { min:3, max:5, l:'ВОЗМОЖЕН БАР-I',             c:'#b45309', desc:'Часть маркеров полной мании присутствует. Важно обсудить с психиатром — разграничение БАР-I и II меняет выбор препарата.' },
  { min:6, max:7, l:'ВЕРОЯТЕН БАР-I',             c:'#c2410c', desc:'Выраженные маркеры мании: сниженный инсайт, нарушение функционирования в подъёме. Нужна консультация психиатра для уточнения диагноза.' },
  { min:8, max:9, l:'ВЫСОКАЯ ВЕРОЯТНОСТЬ БАР-I',  c:'#b03a3a', desc:'Маркеры полной мании явно выражены — особенно если были психотические симптомы. Срочная консультация психиатра.' }
];

function gL(t) { return LEV.find(l => t >= l.min && t <= l.max) || LEV[0]; }
function gBI(t) { return BI_LEV.find(l => t >= l.min && t <= l.max) || BI_LEV[0]; }

function tot() {
  let s = 0;
  for (let i = 1; i <= SCORED; i++) if (S[i] !== undefined) s += S[i];
  return s;
}
function ans() {
  let c = 0;
  for (let i = 1; i <= 24; i++) if (S[i] !== undefined) c++;
  return c;
}
function dS(k) {
  const [s, e] = DOM[k]; let sum = 0, cnt = 0;
  for (let i = s; i <= e; i++) if (S[i] !== undefined) { sum += S[i]; cnt++; }
  return cnt > 0 ? sum : null;
}
function biS() {
  let s = 0, cnt = 0;
  BI_Q.forEach(q => { if (S[q] !== undefined) { s += S[q]; cnt++; } });
  return cnt > 0 ? s : null;
}
function biAns() { return BI_Q.filter(q => S[q] !== undefined).length; }

function updB() {
  ['A','B','C','D','E'].forEach(k => {
    const s = dS(k), b = document.getElementById('bar' + k);
    if (b) b.style.width = s !== null ? Math.max((s / DM[k]) * 100, 3) + '%' : '0%';
  });
  const bi = biS(), bBI = document.getElementById('barBI');
  if (bBI) bBI.style.width = bi !== null ? Math.max((bi / BI_MAX) * 100, 3) + '%' : '0%';
}

function buildBI() {
  const bi = biS(), ba = biAns();
  const block = document.getElementById('biBlock');
  if (bi === null || ba < 2) { block.style.display = 'none'; return; }
  block.style.display = 'block';
  const lev = gBI(bi);
  document.getElementById('biNum').textContent = bi;
  document.getElementById('biLabel').textContent = lev.l;
  document.getElementById('biLabel').style.color = lev.c;
  document.getElementById('biBF').style.width = (bi / BI_MAX * 100) + '%';
  document.getElementById('biBF').style.background = lev.c;
  document.getElementById('biDesc').textContent = lev.desc;
  let extra = '';
  if (HIST.x2 === 'week') extra += ' Длительность подъёма ≥7 дней дополнительно указывает на БАР-I.';
  if (HIST.d2 === 'induced') extra += ' Антидепрессант-индуцированная мания — прямой критерий БАР-I по DSM-5.';
  if (extra) document.getElementById('biDesc').textContent = lev.desc + extra;
}

function buildC() {
  const t = tot(), a = ans(), hk = Object.keys(HIST).length;
  if (a < 3 && hk === 0) { document.getElementById('conc').style.display = 'none'; return; }
  document.getElementById('conc').style.display = 'block';
  const lev = gL(t); let h = '';

  if (a >= 3) {
    h += `<div class="ci"><strong>Общий уровень: ${lev.l} (${t} из ${MAX})</strong>${DESC[LEV.indexOf(lev)]}</div>`;

    const domData = [
      { k:'A', n:'Депрессивная фаза', mx:DM.A, ad:[
        'Депрессивные симптомы минимальны.',
        'Депрессия ощутима — важно отличить от БДР: при БАР есть подъёмы.',
        'Выраженная депрессивная фаза. Ламотриджин эффективен при преобладании депрессии при БАР.',
        'Тяжёлая депрессия. Без стабилизатора антидепрессанты опасны. Психиатр срочно.'
      ]},
      { k:'B', n:'Мания / гипомания', mx:DM.B, ad:[
        'Маниакальные симптомы минимальны — возможна только депрессивная фаза.',
        'Лёгкие гипоманиакальные признаки. Важно отследить длительность и влияние на жизнь.',
        'Выраженная гипомания или мания. Стабилизатор настроения обязателен.',
        'Тяжёлая мания. Вальпроат / литий + атипичный антипсихотик. Госпитализация.'
      ]},
      { k:'C', n:'Цикличность', mx:DM.C, ad:[
        'Цикличность минимальна.',
        'Заметная цикличность — паттерн смены фаз установлен.',
        'Выраженная цикличность. IPSRT (социальная ритмотерапия) снижает частоту эпизодов.',
        'Экстремальная цикличность. При быстрой (≥4 эпизодов/год) — вальпроат предпочтительнее лития.'
      ]},
      { k:'D', n:'Поведенческий', mx:DM.D, ad:[
        'Поведение стабильно.',
        'Умеренное: финансы и режим частично затронуты.',
        'Значительные поведенческие последствия обеих фаз. Нужен конкретный план управления кризисом.',
        'Тяжёлые последствия. Финансовый опекун, кризисный план, доверенное лицо — обсудите с психиатром.'
      ]}
    ];
    domData.forEach(d => {
      const s = dS(d.k); if (s === null) return;
      const p = s / d.mx, i = p <= .25 ? 0 : p <= .5 ? 1 : p <= .75 ? 2 : 3;
      h += `<div class="ci"><strong>${d.n}: ${s} из ${d.mx} (${Math.round(p * 100)}%)</strong>${d.ad[i]}</div>`;
    });

    const dE = dS('E');
    if (dE !== null) {
      const p = dE / DM.E;
      h += `<div class="ci"><strong>Функционирование: ${dE} из ${DM.E}</strong>${p <= .15 ? 'Сохранено. Критерий DSM-5 формально может быть не выполнен.' : p <= .5 ? 'Умеренное нарушение. Критерий DSM-5 выполнен.' : 'Значительное нарушение в обеих фазах. Нужна помощь.'}</div>`;
    }
  }

  if (biAns() >= 2) {
    const bi = biS(), bilev = gBI(bi);
    h += `<div class="ci" style="border-top:2px solid var(--dBI);padding-top:18px;margin-top:8px;"><strong style="color:var(--dBI);">Индикатор БАР-I/II: ${bilev.l}</strong>${bilev.desc}</div>`;
  }

  if (a >= 5) {
    const pA = dS('A'), pB = dS('B');
    if (pA !== null && pB !== null) {
      if (pA / DM.A > .5 && pB / DM.B < .2)
        h += '<div class="ci" style="border-top:2px solid var(--dA);padding-top:18px;margin-top:8px;"><strong style="color:var(--dA);">Высокая депрессия при низкой гипомании</strong>Картина ближе к БДР (большой депрессии), чем к БАР. Важно: при БДР антидепрессанты безопасны; при БАР — нет. Нужен тщательный расспрос о прошлых подъёмах.</div>';
      if (pB / DM.B > .5 && pA / DM.A < .2)
        h += '<div class="ci" style="border-top:2px solid var(--dB);padding-top:18px;margin-top:8px;"><strong style="color:var(--dB);">Выраженная мания при минимальной депрессии</strong>Редкий паттерн — возможна маниакальная фаза без депрессии. Это не исключает БАР-I. Обсудите с психиатром.</div>';
    }
  }

  if (a >= 3 && cM === 'life' && t >= 32) {
    h += '<div class="ci" style="border-top:2px solid var(--brd);padding-top:18px;margin-top:8px;"><strong style="color:var(--pri);">Хронический паттерн</strong>Вы оценили симптомы как характерные для всей жизни, и уровень ≥ умеренного. БАР — хроническое расстройство: без терапии фазы возвращаются. Золотой стандарт профилактики — стабилизаторы настроения (литий, ламотриджин, вальпроат).</div>';
  }
  if (a >= 3 && cM === 'worst') {
    h += '<div class="ci" style="border-top:2px solid var(--brd);padding-top:18px;margin-top:8px;"><strong style="color:var(--warm-dk);">Оценка пикового состояния</strong>Этот балл отражает самый тяжёлый период, а не текущее состояние. Для актуальной оценки переключитесь в режим «Последние месяцы».</div>';
  }

  if (Object.keys(HIST).length > 0) {
    h += '<div class="ci" style="border-top:2px solid var(--brd);padding-top:18px;margin-top:8px;"><strong style="color:var(--pri);">Тактика лечения (на основе истории):</strong></div>';
    if (HIST.x1 === 'lt1')    h += '<div class="ci">Паттерн замечен менее года. Раннее вмешательство даёт наилучший прогноз. Важно начать стабилизатор до формирования устойчивых нейронных циклов.</div>';
    if (HIST.x1 === '1-3')    h += '<div class="ci">БАР 1–3 года. Паттерны ещё формируются — хороший момент для начала терапии.</div>';
    if (HIST.x1 === '3-10')   h += '<div class="ci">БАР 3–10 лет. Устоявшиеся паттерны, но терапия эффективна. IPSRT помогает стабилизировать циркадные ритмы.</div>';
    if (HIST.x1 === '10plus') h += '<div class="ci"><strong>Длительное течение (10+ лет).</strong> Нейронные паттерны устойчивы. Литий даёт наилучший профилактический эффект при длительном течении — и снижает риск суицида.</div>';
    if (HIST.x2 === 'hours')  h += '<div class="ci">Подъёмы длятся часы — это ниже порога гипомании по DSM-5 (≥4 дней). Рассмотрите циклотимию или эмоциональную дисрегуляцию.</div>';
    if (HIST.x2 === '2-3days')h += '<div class="ci">Подъёмы 2–3 дня — ниже порога DSM-5 для гипомании (≥4 дней). Возможна циклотимия или субпороговый БАР-II.</div>';
    if (HIST.x2 === '4-6days')h += '<div class="ci">Подъёмы 4–6 дней соответствуют критерию гипомании (≥4 дней). Это указывает на <strong>БАР-II</strong>.</div>';
    if (HIST.x2 === 'week')   h += '<div class="ci"><strong>Подъёмы ≥7 дней — критерий мании по DSM-5.</strong> Это прямо указывает на <strong>БАР-I</strong>. Литий или вальпроат + консультация психиатра срочно.</div>';
    if (HIST.x3 === 'yes')    h += '<div class="ci"><strong>Быстрая цикличность (≥4 эпизодов/год).</strong> Литий менее эффективен. Предпочтительны: вальпроат, ламотриджин, атипичные антипсихотики (кветиапин). Антидепрессанты могут усугублять.</div>';
    if (HIST.d1 === 'dep')    h += '<div class="ci">Преобладает депрессия. Ламотриджин — препарат выбора при биполярной депрессии. Монотерапия антидепрессантами противопоказана без стабилизатора.</div>';
    if (HIST.d1 === 'manic')  h += '<div class="ci">Преобладают подъёмы. Вальпроат или литий. При частых эпизодах — кветиапин как профилактика.</div>';
    if (HIST.d1 === 'mixed')  h += '<div class="ci"><strong>Смешанные состояния.</strong> Самый высокий суицидальный риск при БАР. Антидепрессанты противопоказаны. Вальпроат или атипичные антипсихотики.</div>';
    if (HIST.d2 === 'alone')  h += '<div class="ci"><strong>Антидепрессант без стабилизатора.</strong> При БАР это риск инверсии фазы. Обсудите с психиатром добавление стабилизатора или замену схемы.</div>';
    if (HIST.d2 === 'induced')h += '<div class="ci"><strong>Антидепрессант-индуцированная мания — прямой критерий БАР по DSM-5.</strong> Это подтверждает диагноз. Антидепрессант следует отменить или снизить под контролем психиатра.</div>';
    if (HIST.d3 === 'bipolar')h += '<div class="ci">Семейный анамнез БАР. Наследуемость ~70–80% — биологическая основа очевидна. Это не «слабость характера».</div>';
  }

  document.getElementById('concC').innerHTML = h;
}

function upd() {
  const t = tot(), a = ans(), lev = gL(t);
  document.getElementById('pf').style.width = (a / 24 * 100) + '%';
  document.getElementById('pl').textContent = a + ' из 24';
  const sf = document.getElementById('sf');
  if (a >= TQ) sf.classList.add('vis'); else sf.classList.remove('vis');
  document.getElementById('sfn').textContent = t;
  document.getElementById('sfv').textContent = a > 0 ? lev.l : '—';
  document.getElementById('rn').textContent = t;
  document.getElementById('rl').textContent = a > 0 ? lev.l : '—';
  document.getElementById('rl').style.color = a > 0 ? lev.c : '#8a8a8a';
  document.getElementById('rb').style.width = (t / MAX * 100) + '%';
  document.getElementById('rb').style.background = a > 0 ? lev.b : '#ddd';
  document.getElementById('rd').textContent = a > 0 ? DESC[LEV.indexOf(lev)] : 'Заполните вопросы';
  document.querySelectorAll('#stbl tbody tr').forEach(tr => {
    const [mn, mx] = tr.dataset.r.split(',').map(Number);
    tr.classList.toggle('act', a > 0 && t >= mn && t <= mx);
  });
  if (a > 0) {
    document.getElementById('domBlock').style.display = 'block';
    ['A','B','C','D','E'].forEach(k => { document.getElementById('d' + k).textContent = dS(k) ?? '–'; });
    document.getElementById('dBI').textContent = biS() ?? '–';
    updB(); buildBI(); buildC();
  }
}

/* Обработчики вопросов */
document.querySelectorAll('.ans').forEach(g => {
  const q = parseInt(g.dataset.q);
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      o.querySelector('input').checked = true;
      S[q] = parseInt(o.querySelector('input').value);
      g.querySelectorAll('.ao').forEach(x => x.classList.remove('sel', 'sel-w'));
      o.classList.add(q === 5 && S[q] >= 4 ? 'sel-w' : 'sel');
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
    if (ne) { if (n) { ne.style.display = 'block'; ne.textContent = n; } else ne.style.display = 'none'; }
    const ok = document.getElementById('ok-' + g);
    if (ok) ok.classList.add('show');
    buildBI(); buildC();
  });
});

/* Режимы */
let cM = '2w';
function setM(m) {
  cM = m;
  document.querySelectorAll('.mode-b').forEach(b => b.classList.remove('act'));
  document.getElementById('btn-' + m).classList.add('act');
  const ys = document.getElementById('ys'), me = document.getElementById('me');
  if (m === 'worst') {
    ys.style.display = 'flex'; me.style.display = 'block'; updP();
  } else {
    ys.style.display = 'none';
    if (m === 'life') {
      me.style.display = 'block';
      me.innerHTML = '<strong>Режим «типичный паттерн»:</strong> оценивайте то, как обычно — не лучший и не худший период, а характерное среднее за всю жизнь.';
      document.getElementById('s1t').textContent = 'Симптомы · типичный паттерн';
      document.getElementById('iText').innerHTML = 'Оценивайте <strong>типичную, характерную</strong> картину — не пик и не лучший период, а «среднее» за жизнь.';
    } else {
      me.style.display = 'none';
      document.getElementById('s1t').textContent = 'Симптомы · последние месяцы';
      document.getElementById('iText').innerHTML = 'Вспомните <strong>последние несколько месяцев</strong>. Для депрессивных вопросов — как было в недавних спадах. Для маниакальных — как было в недавних подъёмах.';
    }
  }
  const k = m === 'worst' ? 'worst' : (m === 'life' ? 'life' : '2w');
  for (let i = 1; i <= 24; i++) {
    const el = document.getElementById('qp-' + i);
    if (el && el.dataset[k]) el.textContent = el.dataset[k];
  }
  Object.keys(S).forEach(k => delete S[k]);
  document.querySelectorAll('.ao').forEach(o => o.classList.remove('sel', 'sel-w'));
  document.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
  ['A','B','C','D','E'].forEach(k => { const b = document.getElementById('bar' + k); if (b) b.style.width = '0%'; });
  document.getElementById('barBI').style.width = '0%';
  document.getElementById('domBlock').style.display = 'none';
  document.getElementById('biBlock').style.display = 'none';
  document.getElementById('conc').style.display = 'none';
  document.getElementById('sf').classList.remove('vis');
  upd();
}

function updP() {
  const v = document.getElementById('yr').value;
  const lb = v === '0' ? 'всю жизнь' : `последние ${v} ${v === '3' ? 'года' : 'лет'}`;
  document.getElementById('s1t').textContent = 'Симптомы · худший период за ' + lb;
  document.getElementById('iText').innerHTML = 'Вспомните <strong>самый тяжёлый период за ' + lb + '</strong>. Для депрессии — пик спада, для мании — пик подъёма.';
  document.getElementById('me').innerHTML = '<strong>Режим «самый тяжёлый эпизод»:</strong> оцените ПИК. Крайние варианты здесь уместны, если вы их пережили.';
}

upd();
