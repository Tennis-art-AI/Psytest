# ШПАРГАЛКА: CSS + HTML + JS паттерны для диагностики ОКР

**Создана:** 14 марта 2026 · **Источники:** config-anxiety.js, config-bar.js, engine.js, common.css, consent.css, screening/anxiety/index.html

---

## 1. АРХИТЕКТУРА: ОКР ИСПОЛЬЗУЕТ engine.js (как ГТР)

ОКР подключает `config-ocd.js` + `engine.js`. НЕ как БАР (standalone).

**Причина:** у ОКР нет режимов (worst/life/2w), и engine.js подходит.
**Адаптация:** новые паттерны (dual, checklist, CHK{}) — через inline JS в HTML, поверх engine.js.

---

## 2. ОБЯЗАТЕЛЬНЫЕ КОНСТАНТЫ (config-ocd.js)

```javascript
const TQ = 23, FQ = 3, MAX = 88, SCORED = 23;
const DOM = { A:[1,9], B:[10,17], C:[18,23], D:[0,-1], E:[0,-1] };
const DM  = { A:34,    B:30,     C:24,      D:0,      E:0      };
```

**Нумерация Q → DOM:**
- Q1–Q9 = домен А (обсессии). Q7 = чеклист, S[7] = undefined → tot()/dS() пропустят
- Q10–Q17 = домен Б (компульсии). Q11 = чеклист, S[11] = undefined
- Q18–Q23 = домен В (избегание)
- Q24–Q26 = К2 функционирование (вне балла, FQ=3)
- К1 (тематика), X1–Д4 (история) → HIST{}, не S[]

**DOM.D и DOM.E = [0,-1]:** dS('D') и dS('E') вернут null. updB() установит barD/barE в 0%. В HTML создать скрытые элементы или не создавать (updB не упадёт если getElementById вернёт null — есть проверка `if (b)`).

---

## 3. HTML-ПАТТЕРН ВОПРОСА (standard single-select)

```html
<div class="qc">
  <div class="qh" style="background:var(--dA);">
    <div class="qn">1</div>
    <div class="qm">
      <div class="qtg">Y-BOCS #1 · DSM-5 B</div>
      <div class="qtl">Заголовок вопроса</div>
      <div class="qd">Подзаголовок / пояснение</div>
    </div>
  </div>
  <div class="qp">Текст вопроса — что именно спрашиваем</div>
  <div class="ans" data-q="1">
    <label class="ao"><span class="al">1</span><span class="ach"></span><span class="at">Текст варианта</span><input type="radio" name="q1" value="0"><span class="as">0</span></label>
    <label class="ao"><span class="al">2</span><span class="ach"></span><span class="at">Текст варианта</span><input type="radio" name="q1" value="1"><span class="as">1</span></label>
    <!-- ... -->
  </div>
</div>
```

**Anti-bias:** al — число (1,2,3...), не буква. value — реальный балл (0-4). Порядок перемешан (0 не первый, max не последний).

**Цвет домена:** `.qh style="background:var(--dA/--dB/--dC)"` — устанавливается inline.

---

## 4. HTML-ПАТТЕРН ДВУХЧАСТНОГО ВОПРОСА (НОВОЕ для ОКР)

```html
<div class="qc qc-dual">
  <div class="qh" style="background:var(--dA);">
    <div class="qn">1</div>
    <div class="qm">
      <div class="qtg">Y-BOCS #1</div>
      <div class="qtl">Время на навязчивые мысли</div>
    </div>
  </div>
  <div class="qp">(a) В самые тяжёлые дни — сколько времени занимают навязчивые мысли?</div>
  <div class="ans-dual" data-q="1" data-part="a">
    <label class="ao">...</label> <!-- 6 вариантов, value 0-5 -->
  </div>
  <div class="qp">(b) Как часто бывают такие тяжёлые дни?</div>
  <div class="ans-dual" data-q="1" data-part="b">
    <label class="ao">...</label> <!-- 5 вариантов, value 0-4 -->
  </div>
</div>
```

**JS обработчик:** при клике на part a или b → сохранить в DUAL{q} = {a: val, b: val}. Когда оба выбраны → S[q] = Math.round((a + b) / 2). Вызвать upd().

---

## 5. HTML-ПАТТЕРН ЧЕКЛИСТА (НОВОЕ для ОКР)

```html
<div class="qc">
  <div class="qh" style="background:var(--dA);">
    <div class="qn">7</div>
    <div class="qm">
      <div class="qtg">DSM-5 A1</div>
      <div class="qtl">Форма навязчивых мыслей</div>
    </div>
  </div>
  <div class="qp">Выберите все формы, которые узнаёте (можно несколько)</div>
  <div class="ans-multi" data-q="7">
    <label class="ao" data-val="thoughts"><span class="ach"></span><span class="at">Мысли — слова...</span></label>
    <label class="ao" data-val="images"><span class="ach"></span><span class="at">Образы...</span></label>
    <label class="ao" data-val="unsure"><span class="ach"></span><span class="at">Не уверен(а)</span></label>
  </div>
</div>
```

**JS обработчик:** toggle .sel на клик. Хранить в CHK{q} = ['thoughts','images',...]. S[q] остаётся undefined — не попадает в tot()/dS(). CHK используется в buildC() для sub-module.

---

## 6. ИСТОРИЯ — HTML-ПАТТЕРН

```html
<div class="hc">
  <div class="hch">
    <span class="hcc">X1</span>
    <div>
      <div class="hcl">Как давно длятся навязчивые мысли?</div>
      <div class="hcd">Среднее время до обращения к специалисту при ОКР — 7–11 лет</div>
    </div>
  </div>
  <div class="hco">
    <span class="hcb" data-g="x1" data-v="<6m">Менее 6 месяцев</span>
    <span class="hcb" data-g="x1" data-v="6m-2y">6 мес. — 2 года</span>
    <span class="hcb" data-g="x1" data-v="2-5y">2–5 лет</span>
    <span class="hcb" data-g="x1" data-v="5y+" data-note="Длительность не означает необратимость">Более 5 лет</span>
    <span class="hcb" data-g="x1" data-v="childhood">С детства</span>
  </div>
  <div class="hcn" id="note-x1"></div>
  <div class="hist-ok" id="ok-x1">✓ Учтено</div>
</div>
```

**data-g** = ключ в HIST{}, **data-v** = значение. **data-note** = подсказка при выборе.
engine.js обработчик сам ставит HIST[g]=v, показывает note, вызывает buildC().

---

## 7. РЕЗУЛЬТАТЫ — HTML-СТРУКТУРА

```html
<div style="..." id="resBlock">
  <div class="res-t">Результаты</div>
  <div class="rbig"><div class="rnum" id="rn">—</div><div class="rmx">/ 88</div></div>
  <div class="rlv" id="rl"></div>
  <div class="rds" id="rd">Ответьте минимум на 5 вопросов</div>
  <div class="rbar"><div class="rbf" id="rb"></div></div>
  <table class="stbl" id="stbl">
    <thead><tr><th>Баллы</th><th>Уровень</th><th>Что это значит</th><th>Рекомендация</th></tr></thead>
    <tbody>
      <tr data-r="0,28"><td>0–28</td><td>СУБКЛИНИЧЕСКОЕ</td><td>...</td><td>...</td></tr>
      <tr data-r="29,46"><td>29–46</td><td>ЛЁГКОЕ</td><td>...</td><td>...</td></tr>
      <tr data-r="47,64"><td>47–64</td><td>УМЕРЕННОЕ</td><td>...</td><td>...</td></tr>
      <tr data-r="65,88"><td>65–88</td><td>ТЯЖЁЛОЕ</td><td>...</td><td>...</td></tr>
    </tbody>
  </table>
  <div id="domBlock" style="display:none;">
    <div class="dgr" style="grid-template-columns:repeat(3,1fr);">
      <div class="dgc" style="border-left:4px solid var(--dA);"><div class="dl">А · Обсессии</div><div class="dv" id="dA">–</div><div class="dm">из 34</div><div class="dmc-bar"><div class="dmc-bf" id="barA" style="background:var(--dA);"></div></div></div>
      <div class="dgc" style="border-left:4px solid var(--dB);"><div class="dl">Б · Компульсии</div><div class="dv" id="dB">–</div><div class="dm">из 30</div><div class="dmc-bar"><div class="dmc-bf" id="barB" style="background:var(--dB);"></div></div></div>
      <div class="dgc" style="border-left:4px solid var(--dC);"><div class="dl">В · Избегание</div><div class="dv" id="dC">–</div><div class="dm">из 24</div><div class="dmc-bar"><div class="dmc-bf" id="barC" style="background:var(--dC);"></div></div></div>
    </div>
  </div>
</div>
<div class="conc" id="conc" style="display:none;">
  <div class="conc-t">Выводы и интерпретация</div>
  <div id="concC"></div>
</div>
```

**4 строки stbl** (не 5). **3 dgc** (не 5). dD, dE, barD, barE не нужны (updB проверяет null).

---

## 8. CONSENT — ПАТТЕРН

```html
<div class="consent-overlay" id="consent">
  <div class="consent-box">
    <h2>Перед началом</h2>
    <p class="consent-sub">6B20 · 300.3 (F42.x) · Обсессивно-компульсивное расстройство</p>
    <ol class="consent-points">
      <li><span class="consent-num">1</span>Это скрининг — не диагноз...</li>
      <li><span class="consent-num">2</span>Не заменяет специалиста...</li>
      <li><span class="consent-num">3</span>Ваши ответы обрабатываются только в вашем браузере...</li>
      <li><span class="consent-num">4</span>80–90% людей иногда испытывают навязчивые мысли — это нормально</li>
    </ol>
    <div class="consent-age">Если вам меньше 18 лет — рекомендуем пройти вместе с родителем или другим взрослым, которому доверяете</div>
    <label class="consent-check-row"><input type="checkbox" id="consentCb"><span>Я понимаю и хочу продолжить</span></label>
    <button class="consent-btn" id="consentBtn" disabled>Начать скрининг</button>
  </div>
</div>
```

**JS:** `consentCb.onchange → consentBtn.disabled = !checked`. `consentBtn.onclick → consent.classList.add('hidden')`.
**Цвет .consent-num:** заменить #4a3270→ОКР-палитра.

---

## 9. КРИЗИСНЫЙ БЛОК — СТАТИЧНЫЙ

```html
<div style="position:fixed;bottom:0;left:0;right:0;z-index:300;background:rgba(176,58,58,.95);color:#fff;padding:10px 20px;text-align:center;font-size:13px;backdrop-filter:blur(8px);">
  Если вам тяжело прямо сейчас — позвоните: <a href="tel:88002000122" style="color:#fff;font-weight:700;text-decoration:underline;">8-800-2000-122</a> (бесплатно, круглосуточно)
</div>
```

---

## 10. ПСИХООБРАЗОВАНИЕ (qnt)

```html
<div class="qnt">
  <strong>Почему этот вопрос важен</strong>
  Текст... Методы терапии допустимы ТОЛЬКО здесь (КПТ, ЭПР как контекст, не рекомендация).
</div>
```

Красный: `.qnt.qnt-red` (для sel-w вопросов).

---

## 11. SEL-W (высокорисковые ответы)

При клике на опасный вариант → `o.classList.add('sel-w')` вместо `'sel'`.
CSS: `.ao.sel-w { background: var(--red-lt); }`
Триггер: рядом с вопросом показать кризисный блок.

---

## 12. CSS-ПЕРЕМЕННЫЕ (inline в HTML)

```css
:root {
  --bg:#faf8f5; --card:#fff; --ink:#1a1a1a; --ink2:#3d3d3d; --ink3:#8a8a8a;
  --pri:#6a4a8a; --pri-lt:#f0ecf6; --pri-dk:#2d1a50; --pri-soft:#8a6aaa;
  --warm:#c4956a; --warm-lt:#fdf6f0; --warm-dk:#8a6040;
  --red:#b03a3a; --red-lt:#fdf0f0;
  --sage:#5a7a5a; --sage-lt:#f0f5f0;
  --brd:#e8e4df; --brd-lt:#f0ece7;
  --dA:#7a2a4a; --dB:#5a2a6a; --dC:#8a5a2a;
  --radius:16px;
}
```

**ОКР-палитра:** фиолетовый (--c-ocd:#b0a0d8 из index.html). dA=обсессии (тёмно-бордовый), dB=компульсии (фиолетовый), dC=избегание (тёплый).

---

## 13. ПОДКЛЮЧЕНИЕ СКРИПТОВ

```html
<script src="/config-ocd.js"></script>
<script src="/engine.js"></script>
<script>
  /* Inline: обработчики dual + multi + consent + crisis */
</script>
```

**config-ocd.js** загружается первым (определяет TQ, MAX, DOM..., buildC).
**engine.js** загружается вторым (использует эти константы).
**Inline JS** — обработчики dual questions, multiple-select checklists, consent, crisis sel-w.

---

## 14. ДИСКЛЕЙМЕР-ФУТЕР

```html
<div class="disc">MentalScreenLab — информационный скрининговый сервис. Не является медицинской услугой. Результат скрининга — не диагноз. Данные обрабатываются только в вашем браузере.</div>
```

---

## 15. CSS: ДВУХЧАСТНЫЕ ВОПРОСЫ (.qc-dual) — задача 1.9

### Проблема
Стандартный .qc содержит один .qp + один .ans. Двухчастный — два .qp + два .ans внутри одного .qc.
Нужно визуально разделить части (a) и (b), показать что это ОДИН вопрос с двумя подвопросами,
и дать индикатор «оба выбраны → балл засчитан».

### CSS (inline в HTML)

```css
/* === ДВУХЧАСТНЫЕ ВОПРОСЫ === */

/* Разделитель между частью (a) и (b) */
.qc-dual .dual-sep {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 28px;
  color: var(--ink3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.qc-dual .dual-sep .ln {
  flex: 1;
  height: 1px;
  background: var(--brd);
}

/* Метка части (a)/(b) в .qp */
.qc-dual .qp {
  position: relative;
  padding-left: 56px;
}
.qc-dual .qp .part-label {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brd);
  color: var(--ink3);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .3s;
}
/* Когда часть выбрана — метка становится зелёной */
.qc-dual .qp .part-label.done {
  background: var(--sage);
  color: #fff;
}

/* Индикатор комбинированного балла */
.dual-score {
  display: none;
  padding: 12px 28px;
  background: var(--sage-lt);
  border-top: 1px solid rgba(90,122,90,.15);
  font-size: 13px;
  color: var(--sage);
  font-weight: 500;
  animation: fadeIn .3s;
}
.dual-score.show { display: block; }

@media(max-width:480px) {
  .qc-dual .qp { padding-left: 46px; }
  .qc-dual .qp .part-label { left: 18px; }
  .dual-score { padding: 10px 18px; font-size: 12px; }
}
```

### HTML-паттерн (финальный)

```html
<div class="qc qc-dual" id="qc-1">
  <div class="qh" style="background:var(--dA);">
    <div class="qn">1</div>
    <div class="qm">
      <div class="qtg">Y-BOCS #1 · DSM-5 B</div>
      <div class="qtl">Время на навязчивые мысли</div>
      <div class="qd">Два подвопроса — интенсивность и частота</div>
    </div>
  </div>
  <div class="qp"><span class="part-label" id="pl-1a">a</span>В самые тяжёлые дни — сколько времени в день занимают навязчивые мысли?</div>
  <div class="ans ans-dual" data-q="1" data-part="a">
    <label class="ao"><span class="al">1</span><span class="ach"></span><span class="at">Не занимают времени</span><input type="radio" name="q1a" value="0"></label>
    <!-- ... 6 вариантов value 0-5 -->
  </div>
  <div class="dual-sep"><span class="ln"></span>часть (b)<span class="ln"></span></div>
  <div class="qp"><span class="part-label" id="pl-1b">b</span>Как часто бывают такие тяжёлые дни?</div>
  <div class="ans ans-dual" data-q="1" data-part="b">
    <label class="ao"><span class="al">1</span><span class="ach"></span><span class="at">Не бывает</span><input type="radio" name="q1b" value="0"></label>
    <!-- ... 5 вариантов value 0-4 -->
  </div>
  <div class="dual-score" id="ds-1">✓ Комбинированный балл: <strong id="dsv-1">—</strong></div>
</div>
```

### JS-обработчик (inline в HTML, после engine.js)

```javascript
const DUAL = {};

document.querySelectorAll('.ans-dual').forEach(g => {
  const q = parseInt(g.dataset.q), part = g.dataset.part;
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      /* radio-поведение внутри одной части */
      o.querySelector('input').checked = true;
      g.querySelectorAll('.ao').forEach(x => x.classList.remove('sel'));
      o.classList.add('sel');

      /* Сохранить значение части */
      if (!DUAL[q]) DUAL[q] = {};
      DUAL[q][part] = parseInt(o.querySelector('input').value);

      /* Обновить метку части */
      const pl = document.getElementById('pl-' + q + part);
      if (pl) pl.classList.add('done');

      /* Если обе части выбраны → рассчитать средний балл */
      if (DUAL[q].a !== undefined && DUAL[q].b !== undefined) {
        S[q] = Math.round((DUAL[q].a + DUAL[q].b) / 2);

        /* Показать комбинированный балл */
        const ds = document.getElementById('ds-' + q);
        const dsv = document.getElementById('dsv-' + q);
        if (ds && dsv) {
          dsv.textContent = S[q] + ' из ' + Math.round((5 + 4) / 2);
          ds.classList.add('show');
        }
        upd();
      }
    });
  });
});
```

### Ключевые решения
- **Два .ans блока в одном .qc:** engine.js обработчик `.ans[data-q]` НЕ ловит `.ans-dual` — разные селекторы. Конфликта нет.
- **name="q1a" / name="q1b":** разные radio-группы, не мешают друг другу.
- **S[q] записывается ТОЛЬКО когда обе части выбраны.** До этого S[q] = undefined → tot()/dS() пропускают.
- **Визуальная обратная связь:** part-label зеленеет → dual-score появляется → пользователь видит что балл засчитан.
- **Math.round((a+b)/2):** max(a)=5, max(b)=4 → max средний = Math.round(9/2) = 5. Это max вклад одного двухчастного вопроса.

---

## 16. CSS/JS: MULTIPLE-SELECT ЧЕКЛИСТЫ (.ans-multi) — задача 1.10

### Проблема
Стандартный .ans — single-select (radio). Чеклист — multiple-select (toggle).
Нужно: квадратный чекбокс вместо круглого, toggle поведение, счётчик выбранных,
и «не уверен(а)» который снимает остальные.

### CSS (inline в HTML)

```css
/* === MULTIPLE-SELECT ЧЕКЛИСТЫ === */

/* Бейдж «можно несколько» */
.multi-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--pri-lt);
  color: var(--pri);
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  margin-left: 12px;
  letter-spacing: .03em;
}

/* Квадратный чекбокс вместо круглого */
.ans-multi .ach {
  border-radius: 4px;
}
.ans-multi .ao.sel .ach {
  border-radius: 4px;
}
/* Галочка вместо точки */
.ans-multi .ach::after {
  content: '✓';
  width: auto;
  height: auto;
  border-radius: 0;
  background: none;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  opacity: 0;
}
.ans-multi .ao.sel .ach::after { opacity: 1; }

/* Счётчик выбранных */
.multi-count {
  padding: 10px 28px;
  font-size: 12px;
  color: var(--ink3);
  border-top: 1px solid var(--brd-lt);
  display: none;
}
.multi-count.show { display: block; }
.multi-count strong { color: var(--pri); }

/* Вариант «не уверен(а)» — визуально отделён */
.ans-multi .ao[data-val="unsure"] {
  border-top: 2px solid var(--brd);
  margin-top: -1px;
  color: var(--ink3);
  font-style: italic;
}

@media(max-width:480px) {
  .multi-count { padding: 8px 18px; }
  .multi-badge { font-size: 10px; padding: 3px 10px; }
}
```

### HTML-паттерн (финальный)

```html
<div class="qc" id="qc-7">
  <div class="qh" style="background:var(--dA);">
    <div class="qn">7</div>
    <div class="qm">
      <div class="qtg">DSM-5 A1 · Rachman 2004</div>
      <div class="qtl">Форма навязчивых мыслей</div>
    </div>
  </div>
  <div class="qp">В какой форме приходят навязчивые мысли? <span class="multi-badge">можно несколько</span></div>
  <div class="ans ans-multi" data-q="7">
    <label class="ao" data-val="thoughts"><span class="ach"></span><span class="at"><strong>Словесные мысли</strong> — фразы, утверждения, вопросы в голове</span></label>
    <label class="ao" data-val="images"><span class="ach"></span><span class="at"><strong>Образы</strong> — картинки, сцены, «видео» в воображении</span></label>
    <label class="ao" data-val="urges"><span class="ach"></span><span class="at"><strong>Побуждения</strong> — импульс сделать что-то (ударить, выкрикнуть, прыгнуть)</span></label>
    <label class="ao" data-val="sensations"><span class="ach"></span><span class="at"><strong>Телесные ощущения</strong> — «грязь на коже», «неправильность» в теле</span></label>
    <label class="ao" data-val="contamination"><span class="ach"></span><span class="at"><strong>Ментальное загрязнение</strong> — чувство «нечистоты» без контакта с чем-то грязным</span></label>
    <label class="ao" data-val="unsure"><span class="ach"></span><span class="at">Не уверен(а) / затрудняюсь определить форму</span></label>
  </div>
  <div class="multi-count" id="mc-7">Выбрано: <strong id="mcv-7">0</strong></div>
</div>
```

### JS-обработчик (inline в HTML, после engine.js)

```javascript
const CHK = {};

document.querySelectorAll('.ans-multi').forEach(g => {
  const q = g.dataset.q;
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      const val = o.dataset.val;

      /* Логика «не уверен(а)» — снимает остальные */
      if (val === 'unsure') {
        const wasSelected = o.classList.contains('sel');
        g.querySelectorAll('.ao').forEach(x => x.classList.remove('sel'));
        if (!wasSelected) o.classList.add('sel');
      } else {
        /* Снять «не уверен(а)» при выборе конкретного варианта */
        const unsure = g.querySelector('.ao[data-val="unsure"]');
        if (unsure) unsure.classList.remove('sel');
        o.classList.toggle('sel');
      }

      /* Обновить CHK */
      CHK[q] = [...g.querySelectorAll('.ao.sel')].map(el => el.dataset.val);

      /* Обновить счётчик */
      const mc = document.getElementById('mc-' + q);
      const mcv = document.getElementById('mcv-' + q);
      if (mc && mcv) {
        const cnt = CHK[q].length;
        mcv.textContent = cnt;
        mc.classList.toggle('show', cnt > 0);
      }

      /* S[q] остаётся undefined — чеклисты вне scored */
      /* Но buildC() использует CHK для sub-module */
      buildC();
    });
  });
});
```

### Ключевые решения
- **Toggle вместо radio:** `.ao.sel` переключается через `classList.toggle`. Нет `<input>`, нет radio-группы.
- **«Не уверен(а)» — exclusive:** выбор «unsure» снимает все остальные. Выбор любого конкретного — снимает «unsure». Это не mutual exclusion группы — это логика «я не знаю» vs «я знаю конкретно».
- **Квадратный чекбокс:** `.ans-multi .ach { border-radius: 4px }` — визуально отличает от radio (круг). Галочка ✓ вместо точки.
- **Счётчик:** показывает сколько выбрано. Помогает пользователю видеть что выбор засчитан.
- **Нет .al (номера):** в чеклистах нет порядковых номеров — это не шкала, а набор.
- **S[q] = undefined:** engine.js `tot()` и `dS()` автоматически пропускают. CHK используется только в buildC().
- **engine.js обработчик `.ans[data-q]` НЕ конфликтует:** он ловит `.ans .ao`, а `.ans-multi .ao` перехватывается раньше нашим inline-обработчиком. Но для надёжности — `.ans-dual` и `.ans-multi` блоки НЕ содержат `<input type="radio">` и не попадут под engine.js обработчик (который проверяет `o.querySelector('input')`). Для dual — input есть, но другой name. Для multi — input нет вообще.

### Конфликт с engine.js — решение
engine.js вешает обработчики на `.ans .ao` (все). `.ans-dual .ao` и `.ans-multi .ao` тоже подпадут.

**Решение:** inline-обработчики ПЕРЕД engine.js не помогут (engine.js добавит свои). Вместо этого:
1. `.ans-dual` и `.ans-multi` используют класс `.ans` (чтобы наследовать CSS), но НЕ содержат `data-q` на `.ans-multi` ИЛИ содержат `data-q` но engine.js обработчик проверяет `.querySelector('input')` — для multi input нет → упадёт молча (querySelector вернёт null, parseInt(null) = NaN, S[q] = NaN → dS() пропустит NaN через `if (S[i] !== undefined)`... NaN !== undefined = true → попадёт в сумму как NaN → всё сломается!

**Правильное решение:** `.ans-multi` НЕ использует класс `.ans`. Использует `.ans-multi` как самостоятельный класс. Тогда engine.js (`.querySelectorAll('.ans')`) его НЕ поймает.

Для `.ans-dual` — содержит `<input>`, engine.js поймает и запишет S[q]. Но мы тоже пишем S[q] в dual-обработчике. **Конфликт:** engine.js запишет S[q] при каждом клике на часть (a) или (b), даже если вторая часть не выбрана. Это сломает средний балл.

**Правильное решение для dual:** `.ans-dual` тоже НЕ использует класс `.ans`. Использует `.ans-dual` как самостоятельный. engine.js его не поймает. CSS наследуется через общие правила (.ao, .ach, .at — они без .ans prefix в common.css).

**ПРОВЕРКА:** в common.css правила `.ao`, `.ach`, `.at` определены БЕЗ `.ans` prefix → работают на любом .ao. Только обработчик engine.js привязан к `.ans`. Значит решение верное: убрать класс `.ans` из dual и multi блоков.

**Финальное HTML:**
- Стандартные вопросы: `<div class="ans" data-q="N">`
- Двухчастные: `<div class="ans-dual" data-q="N" data-part="a/b">`
- Чеклисты: `<div class="ans-multi" data-q="N">`
