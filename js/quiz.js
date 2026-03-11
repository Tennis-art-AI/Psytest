/* === QUIZ.JS — K-6 Kessler Psychological Distress Scale === */
/* Kessler et al. (2002), Harvard/WHO. Free to use, no license required. */

const K6_DATA = {
  questions: [
    { id: 'nervous', text: 'Как часто за последний месяц вы чувствовали нервозность, от которой ничего не помогало?' },
    { id: 'hopeless', text: 'Как часто вы чувствовали безнадёжность — что ничего не улучшится?' },
    { id: 'restless', text: 'Как часто вы были беспокойными или не могли усидеть на месте?' },
    { id: 'depressed', text: 'Как часто вы чувствовали такую подавленность, что ничто не могло вас приободрить?' },
    { id: 'effort', text: 'Как часто вам казалось, что всё даётся с огромным трудом — каждое действие требует усилия?' },
    { id: 'worthless', text: 'Как часто вы чувствовали себя бесполезным, никчёмным?' }
  ],
  answers: [
    { text: 'Ни разу', value: 0 },
    { text: 'Изредка', value: 1 },
    { text: 'Иногда', value: 2 },
    { text: 'Часто', value: 3 },
    { text: 'Постоянно', value: 4 }
  ],
  levels: [
    { max: 4, label: 'Низкий уровень дистресса', color: '#4a8a60', desc: 'Ваши ответы не указывают на выраженный психологический дистресс. Если что-то всё же беспокоит — консультация специалиста не помешает.' },
    { max: 12, label: 'Умеренный дистресс', color: '#c0a040', desc: 'Есть признаки психологического напряжения. Рекомендуем пройти углублённый скрининг, чтобы понять, что именно вас беспокоит.' },
    { max: 24, label: 'Выраженный дистресс', color: '#c05050', desc: 'Уровень дистресса высокий. Углублённый скрининг поможет разобраться, а результат — подготовиться к разговору со специалистом.' }
  ],
  screeningMap: {
    nervous: { name: 'Тревога (ГТР)', slug: 'anxiety', ready: true },
    hopeless: { name: 'Депрессия (БДР)', slug: 'depression', ready: true },
    restless: { name: 'СДВГ', slug: 'adhd', ready: false },
    depressed: { name: 'Депрессия (БДР)', slug: 'depression', ready: true },
    effort: { name: 'Депрессия (БДР)', slug: 'depression', ready: true },
    worthless: { name: 'Депрессия (БДР)', slug: 'depression', ready: true }
  }
};

let quizState = { step: -1, answers: {} };

function initQuiz() {
  const overlay = document.querySelector('.quiz-overlay');
  if (!overlay) return;

  document.querySelectorAll('[data-start-quiz]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      quizState = { step: -1, answers: {} };
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderQuiz();
    });
  });

  overlay.querySelector('.quiz-close').addEventListener('click', closeQuiz);

  function closeQuiz() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderQuiz() {
    const body = overlay.querySelector('.quiz-body');
    const progress = overlay.querySelector('.quiz-progress-fill');
    const stepEl = overlay.querySelector('.quiz-step');

    if (quizState.step === -1) {
      if (progress) progress.style.width = '0%';
      if (stepEl) stepEl.textContent = '';
      body.innerHTML = renderIntro();
      body.querySelector('.quiz-start-btn').addEventListener('click', () => {
        quizState.step = 0;
        renderQuiz();
      });
      return;
    }

    if (quizState.step >= K6_DATA.questions.length) {
      if (progress) progress.style.width = '100%';
      if (stepEl) stepEl.textContent = 'Результат';
      body.innerHTML = renderResult();
      body.querySelector('.quiz-close-result')?.addEventListener('click', closeQuiz);
      return;
    }

    const q = K6_DATA.questions[quizState.step];
    const pct = ((quizState.step + 1) / K6_DATA.questions.length * 100).toFixed(0);
    if (progress) progress.style.width = pct + '%';
    if (stepEl) stepEl.textContent = (quizState.step + 1) + ' / ' + K6_DATA.questions.length;

    body.innerHTML = renderQuestion(q, quizState.step);

    body.querySelectorAll('.quiz-answer').forEach(a => {
      a.addEventListener('click', () => {
        quizState.answers[q.id] = parseInt(a.dataset.value);
        a.classList.add('selected');
        setTimeout(() => { quizState.step++; renderQuiz(); }, 300);
      });
    });

    const backBtn = body.querySelector('.quiz-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        quizState.step = Math.max(-1, quizState.step - 1);
        renderQuiz();
      });
    }
  }

  function renderIntro() {
    return '<div class="quiz-intro quiz-slide">' +
      '<span class="badge badge-accent" style="margin-bottom:16px">K-6 · Kessler · WHO</span>' +
      '<h2>Международный тест психологического дистресса</h2>' +
      '<p>Шкала K-6 (Kessler, 2002) — валидированный инструмент, используемый ВОЗ и в эпидемиологических исследованиях по всему миру. 6 вопросов, менее 2 минут.</p>' +
      '<p class="text-small text-muted" style="margin-bottom:24px">Результат покажет общий уровень психологического дистресса и подскажет, какой углублённый скрининг пройти.</p>' +
      '<button class="btn btn-primary quiz-start-btn">Начать тест K-6 &rarr;</button>' +
      '</div>';
  }

  function renderQuestion(q, i) {
    let html = '<div class="quiz-slide">';
    if (i > 0) html += '<button class="quiz-back">&larr; Назад</button>';
    html += '<p class="quiz-question">' + q.text + '</p>';
    html += '<div class="quiz-answers">';
    K6_DATA.answers.forEach(a => {
      html += '<div class="quiz-answer" data-value="' + a.value + '">' + a.text + '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderResult() {
    const ans = quizState.answers;
    const total = Object.values(ans).reduce((s, v) => s + v, 0);

    // Find level
    let level = K6_DATA.levels[0];
    for (const l of K6_DATA.levels) {
      if (total <= l.max) { level = l; break; }
    }

    // Find highest single item for screening recommendation
    let maxItem = null, maxVal = -1;
    for (const [k, v] of Object.entries(ans)) {
      if (v > maxVal) { maxVal = v; maxItem = k; }
    }

    let html = '<div class="quiz-result quiz-slide">';
    html += '<h2>Результат K-6</h2>';

    // Score display
    html += '<div style="margin:24px 0">';
    html += '<div style="font-size:48px;font-weight:700;color:' + level.color + '">' + total + '</div>';
    html += '<div style="font-size:14px;color:var(--ink3)">из 24 баллов</div>';
    html += '<div style="margin-top:8px;font-size:18px;font-weight:600;color:' + level.color + '">' + level.label + '</div>';
    html += '</div>';

    // Bar visualization
    html += '<div style="width:100%;height:8px;background:var(--brd);border-radius:4px;margin:16px 0 24px;overflow:hidden">';
    html += '<div style="width:' + (total / 24 * 100) + '%;height:100%;background:' + level.color + ';border-radius:4px;transition:width 1s ease"></div>';
    html += '</div>';

    // Description
    html += '<p class="text-muted" style="margin-bottom:24px">' + level.desc + '</p>';

    // Item breakdown
    html += '<div style="text-align:left;margin-bottom:24px">';
    K6_DATA.questions.forEach(q => {
      const v = ans[q.id] || 0;
      const pct = (v / 4 * 100);
      const barColor = v <= 1 ? '#4a8a60' : v <= 2 ? '#c0a040' : '#c05050';
      html += '<div style="margin-bottom:10px">';
      html += '<div style="font-size:12px;color:var(--ink3);margin-bottom:4px">' + q.text.replace(/Как часто за последний месяц вы /, '').replace(/Как часто вы /, '').replace(/Как часто вам /, '') + '</div>';
      html += '<div style="display:flex;align-items:center;gap:8px">';
      html += '<div style="flex:1;height:6px;background:var(--brd);border-radius:3px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + barColor + ';border-radius:3px"></div></div>';
      html += '<span style="font-size:12px;color:var(--ink3);width:20px;text-align:right">' + v + '</span>';
      html += '</div></div>';
    });
    html += '</div>';

    // Screening recommendation
    if (total >= 5 && maxItem) {
      const scr = K6_DATA.screeningMap[maxItem];
      html += '<div class="quiz-rec">';
      html += '<h3>Рекомендация</h3>';
      html += '<p>На основе ваших ответов рекомендуем пройти углублённый скрининг:</p>';
      if (scr.ready) {
        html += '<a href="/screening/' + scr.slug + '/" class="btn btn-primary btn-sm">Скрининг: ' + scr.name + ' &rarr;</a>';
      } else {
        html += '<span class="badge badge-soon">Скрининг &laquo;' + scr.name + '&raquo; в разработке</span>';
      }
      // Also suggest anxiety if nervous/restless are high
      if ((ans.nervous >= 3 || ans.restless >= 3) && scr.slug !== 'anxiety') {
        html += '<a href="/screening/anxiety/" class="btn btn-secondary btn-sm" style="margin-left:8px">Также: Тревога (ГТР) &rarr;</a>';
      }
      html += '</div>';
    }

    html += '<p class="quiz-disclaimer">Шкала K-6 (Kessler et al., 2002) — скрининговый инструмент, не диагностика. Результат не заменяет консультацию специалиста.</p>';
    html += '<button class="btn btn-secondary btn-sm mt-3 quiz-close-result">Закрыть</button>';
    html += '</div>';
    return html;
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);
