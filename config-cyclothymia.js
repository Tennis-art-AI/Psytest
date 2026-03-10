/* config-cyclothymia.js — конфигурация для диагностики Циклотимии */

const TQ = 16, FQ = 3, MAX = 69, SCORED = 16;
const DOM = { A:[1,5], B:[6,9], C:[10,13], D:[14,16], E:[17,19] };
const DM = { A:25, B:20, C:12, D:12, E:12 };
const LEV = [
  { min:0,  max:13, l:'НОРМА',            c:'#166534', b:'#86efac' },
  { min:14, max:27, l:'СУБКЛИНИЧЕСКАЯ',    c:'#6a7a2a', b:'#c8e070' },
  { min:28, max:41, l:'ЦИКЛОТИМИЯ',        c:'#b45309', b:'#fbbf24' },
  { min:42, max:55, l:'ТЯЖЁЛАЯ',          c:'#c2410c', b:'#f97316' },
  { min:56, max:69, l:'РАССМОТРИТЕ БАР',  c:'#b03a3a', b:'#ef4444' }
];
const DESC = [
  'Колебания настроения в пределах нормы',
  'Заметная цикличность — циклотимический темперамент',
  'Выраженная цикличность — территория циклотимии',
  'Серьёзная цикличность с риском прогрессии',
  'Интенсивность может указывать на БАР-II — пройдите диагностику БАР'
];

function buildC() {
  const t = tot(), a = ans(), hk = Object.keys(HIST).length;
  if (a < 5 && hk === 0) { document.getElementById('conc').style.display = 'none'; return; }
  document.getElementById('conc').style.display = 'block';
  const lev = gL(t);
  let h = '';

  /* БЛОК 1: Общий уровень + доменные комментарии */
  if (a >= 3) {
    h += `<div class="ci"><strong>Общий уровень: ${lev.l} (${t} из ${MAX})</strong>${DESC[LEV.indexOf(lev)]}.</div>`;
    [
      { k:'A', n:'Депрессивный полюс', mx:DM.A, ad:[
        'Спады минимальны.',
        'Заметные спады. Дневник настроения для отслеживания паттерна.',
        'Выраженные депрессивные периоды. Ламотриджин — препарат выбора для профилактики спадов.',
        'Тяжёлые спады. Рассмотрите полную диагностику депрессии — возможен БАР-II.'
      ]},
      { k:'B', n:'Гипоманиакальный полюс', mx:DM.B, ad:[
        'Подъёмы минимальны. Если только спады — скорее дистимия, чем циклотимия.',
        'Заметные подъёмы. Типичная картина циклотимии.',
        'Выраженные подъёмы. Если длятся ≥4 дней — рассмотрите БАР-II.',
        'Сильные подъёмы. Высока вероятность гипомании — пройдите диагностику БАР.'
      ]},
      { k:'C', n:'Цикличность', mx:DM.C, ad:[
        'Цикличность не выражена — скорее нормальные колебания.',
        'Лёгкая цикличность. Дневник настроения + стабилизация режима сна.',
        'Выраженный паттерн. IPSRT (терапия социальных ритмов) — стабилизация цикла через режим.',
        'Высокая цикличность. Стабилизаторы настроения + строгий режим.'
      ]},
      { k:'D', n:'Идентичность и отношения', mx:DM.D, ad:[
        'Идентичность стабильна.',
        'Лёгкое влияние на самоощущение. Психообразование.',
        'Значительное: «кто я настоящий?». КПТ + работа с идентичностью.',
        'Кризис идентичности. Может потребоваться схема-терапия.'
      ]}
    ].forEach(d => {
      const s = dS(d.k);
      if (s === null) return;
      const p = s / d.mx;
      const i = p <= .25 ? 0 : p <= .5 ? 1 : p <= .75 ? 2 : 3;
      h += `<div class="ci"><strong>${d.n}: ${s} из ${d.mx} (${Math.round(p * 100)}%)</strong>${d.ad[i]}</div>`;
    });
  }

  /* БЛОК 2: Domain-ratio дифдиагностика */
  if (a >= 5) {
    const pA = dS('A'), pB = dS('B'), pC = dS('C');
    if (pA !== null && pB !== null && pA / DM.A > .4 && pB / DM.B < .15) {
      h += '<div class="ci" style="border-top:2px solid var(--dA);padding-top:18px;margin-top:8px;"><strong style="color:var(--dA);">Только депрессивный полюс</strong>Спады выражены, подъёмы минимальны. Это больше похоже на дистимию (хроническую депрессию), чем на циклотимию. Рассмотрите диагностику депрессии.</div>';
    }
    if (pB !== null && pB / DM.B > .6) {
      h += '<div class="ci" style="border-top:2px solid var(--dB);padding-top:18px;margin-top:8px;"><strong style="color:var(--dB);">Выраженные подъёмы</strong>Интенсивность подъёмов может указывать на полноценную гипоманию (БАР-II). Ключевой вопрос: длятся ли подъёмы ≥4 дней? Если да — пройдите диагностику БАР.</div>';
    }
    if (pC !== null && pC / DM.C < .2) {
      h += '<div class="ci" style="border-top:2px solid var(--brd);padding-top:18px;margin-top:8px;">Низкая цикличность. Без чёткого паттерна «качелей» диагноз циклотимии маловероятен — DSM-5 требует ≥2 года непрерывного циклирования.</div>';
    }
  }

  /* БЛОК 3: Функционирование */
  if (a >= 3) {
    const dE = dS('E');
    if (dE !== null) {
      const p = dE / DM.E;
      h += `<div class="ci"><strong>Функционирование: ${dE} из ${DM.E}</strong>${p <= .15 ? 'Сохранено. Возможен циклотимический темперамент — вариант нормы.' : p <= .5 ? 'Умеренное нарушение. DSM-5 критерий D выполнен.' : 'Значительное нарушение. Нужна помощь.'}</div>`;
    }
  }

  /* БЛОК 4: История */
  const histKeys = Object.keys(HIST);
  if (histKeys.length > 0) {
    h += '<div class="ci" style="border-top:2px solid var(--brd);padding-top:18px;margin-top:8px;"><strong style="color:var(--pri);">Дифференциальная диагностика и тактика:</strong></div>';
    if (HIST.x1 === 'yes') h += '<div class="ci" style="background:var(--warm-lt);padding:16px;border-radius:10px;"><strong>Были полноценные депрессивные эпизоды.</strong> Это может указывать на БАР-II (если есть подъёмы ≥4 дней) или рекуррентную депрессию (если подъёмов нет). Циклотимия по DSM-5 исключается при наличии полных депрессивных эпизодов.</div>';
    if (HIST.x2 === 'yes') h += '<div class="ci" style="background:var(--warm-lt);padding:16px;border-radius:10px;"><strong>Были эпизоды гипомании ≥4 дней.</strong> Это формально превышает порог для циклотимии → рассмотрите БАР-II. Пройдите диагностику биполярного расстройства.</div>';
    if (HIST.x3 === 'bipolar') h += '<div class="ci"><strong>БАР в семье.</strong> Повышает риск прогрессии циклотимии в БАР. Мониторинг обязателен — дневник настроения + регулярные визиты к психиатру.</div>';
    if (HIST.d1 === 'switch') h += '<div class="ci" style="background:var(--red-lt);padding:16px;border-radius:10px;"><strong style="color:var(--red);">Антидепрессанты вызвали подъём.</strong> Сильнейший аргумент в пользу биполярного спектра. Обсудите с психиатром — возможно, это БАР-II, а не циклотимия.</div>';
    if (HIST.d1 === 'rapid') h += '<div class="ci"><strong>Антидепрессанты ускорили качели.</strong> Типичный паттерн при расстройствах биполярного спектра. Стабилизатор настроения может быть эффективнее антидепрессанта.</div>';
    if (HIST.d2 === 'yes') h += '<div class="ci"><strong>Считали качели «характером».</strong> Это самый частый паттерн при циклотимии — годы без диагноза. Важно понять: это не «какой вы есть», а расстройство, которое лечится. Стабилизация возможна.</div>';
  }
  document.getElementById('concC').innerHTML = h;
}

function setM(m) {
  cM = m;
  document.querySelectorAll('.mode-b').forEach(b => b.classList.remove('act'));
  document.getElementById('btn-' + m).classList.add('act');
  const me = document.getElementById('me');
  if (m === 'life') {
    me.style.display = 'block';
    me.innerHTML = '<strong>Режим «всю жизнь»:</strong> оценивайте типичный паттерн с подросткового возраста. Как обычно выглядят ваши спады? Подъёмы? Как часто переключается? Не пик — «среднее».';
  } else if (m === 'worst') {
    me.style.display = 'block';
    me.innerHTML = '<strong>Режим «самые сильные качели»:</strong> вспомните период, когда амплитуда была максимальной — самый глубокий спад и самый сильный подъём. Отвечайте про ПИКОВЫЕ моменты.';
  } else {
    me.style.display = 'none';
  }
  const k = m === 'worst' ? 'worst' : (m === 'life' ? 'life' : '2w');
  for (let i = 1; i <= TQ + FQ; i++) {
    const el = document.getElementById('qp-' + i);
    if (el && el.dataset[k]) el.textContent = el.dataset[k];
  }
  if (m === '2w') {
    document.getElementById('s1t').textContent = 'Симптомы · последние 2 года';
    document.getElementById('iText').innerHTML = 'Оценивайте свой <strong>типичный паттерн за последние 2 года</strong>. Для вопросов о спадах — как обычно ощущается «низ». Для вопросов о подъёмах — как обычно ощущается «верх».';
  } else if (m === 'life') {
    document.getElementById('s1t').textContent = 'Симптомы · типичный паттерн за жизнь';
    document.getElementById('iText').innerHTML = 'Оценивайте <strong>типичный</strong> уровень качелей за всю жизнь — не самый тяжёлый момент, а «среднее».';
  } else {
    document.getElementById('s1t').textContent = 'Симптомы · самые сильные качели';
    document.getElementById('iText').innerHTML = 'Оценивайте <strong>самую большую амплитуду</strong> — максимальный спад и максимальный подъём.';
  }
  Object.keys(S).forEach(k => delete S[k]);
  document.querySelectorAll('.ao').forEach(o => o.classList.remove('sel', 'sel-w'));
  document.querySelectorAll('input').forEach(r => r.checked = false);
  upd();
  ['A','B','C','D','E'].forEach(k => {
    const b = document.getElementById('bar' + k);
    if (b) b.style.width = '0%';
  });
  document.getElementById('conc').style.display = 'none';
}
