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
  <div class="ans ans-dual" data-q="1" data-part="a">
    <label class="ao">...</label> <!-- 6 вариантов, value 0-5 -->
  </div>
  <div class="qp">(b) Как часто бывают такие тяжёлые дни?</div>
  <div class="ans ans-dual" data-q="1" data-part="b">
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
  <div class="ans ans-multi" data-q="7">
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

## 15. НОВЫЕ CSS-КЛАССЫ (добавить inline в HTML)

```css
/* Двухчастные вопросы */
.qc-dual .qp { font-weight: 600; }
.ans-dual { border-top: 1px solid var(--brd-lt); }

/* Multiple-select чеклисты */
.ans-multi .ao { cursor: pointer; }
.ans-multi .ao.sel { background: var(--pri-lt); }
.ans-multi .ach { border-radius: 4px; } /* квадрат вместо круга */
```

---

## 16. НОВЫЕ JS-ОБЪЕКТЫ (inline в HTML)

```javascript
const DUAL = {};  // {q: {a: val, b: val}}
const CHK = {};   // {q: ['val1','val2',...]}

/* Обработчик dual */
document.querySelectorAll('.ans-dual').forEach(g => {
  const q = parseInt(g.dataset.q), part = g.dataset.part;
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      g.querySelectorAll('.ao').forEach(x => x.classList.remove('sel'));
      o.classList.add('sel');
      if (!DUAL[q]) DUAL[q] = {};
      DUAL[q][part] = parseInt(o.querySelector('input').value);
      if (DUAL[q].a !== undefined && DUAL[q].b !== undefined) {
        S[q] = Math.round((DUAL[q].a + DUAL[q].b) / 2);
        upd();
      }
    });
  });
});

/* Обработчик multi */
document.querySelectorAll('.ans-multi').forEach(g => {
  const q = g.dataset.q;
  g.querySelectorAll('.ao').forEach(o => {
    o.addEventListener('click', () => {
      o.classList.toggle('sel');
      CHK[q] = [...g.querySelectorAll('.ao.sel')].map(el => el.dataset.val);
      // S[q] остаётся undefined — чеклисты вне scored
      buildC();
    });
  });
});
```
