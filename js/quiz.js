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
  screenings: [
    { slug: 'depression', name: 'Депрессия (БДР)', items: ['hopeless','depressed','effort','worthless'], ready: true, why: 'Безнадёжность, подавленность, потеря энергии и самооценки — ключевые признаки депрессии.' },
    { slug: 'anxiety', name: 'Тревога (ГТР)', items: ['nervous','restless'], ready: true, why: 'Нервозность и беспокойство, которые трудно контролировать — признаки тревожного расстройства.' },
    { slug: 'bipolar', name: 'Биполярное расстройство', items: ['hopeless','depressed','restless'], ready: true, why: 'Сочетание подавленности и беспокойства может указывать на чередование фаз.' },
    { slug: 'adhd', name: 'СДВГ', items: ['restless','effort'], ready: false, why: 'Беспокойство и ощущение, что всё даётся с трудом — могут быть связаны с дефицитом внимания.' },
    { slug: 'ocd', name: 'ОКР', items: ['nervous','effort'], ready: true, why: 'Постоянная нервозность и ощущение усилия могут быть связаны с навязчивыми состояниями.' }
  ]
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

    let level = K6_DATA.levels[0];
    for (const l of K6_DATA.levels) {
      if (total <= l.max) { level = l; break; }
    }

    // Score screenings by relevance
    const recs = [];
    K6_DATA.screenings.forEach(scr => {
      let score = 0;
      scr.items.forEach(item => { score += (ans[item] || 0); });
      const avg = score / scr.items.length;
      if (avg >= 1.5) recs.push({ ...scr, score: avg });
    });
    recs.sort((a, b) => b.score - a.score);

    let html = '<div class="quiz-result quiz-slide" style="max-width:520px;width:100%">';

    // === SCORE — compact ===
    html += '<div class="card" style="text-align:center;margin-bottom:24px;padding:32px;border-color:' + level.color + '40">';
    html += '<div style="font-size:14px;color:var(--ink3);margin-bottom:8px">Ваш результат K-6</div>';
    html += '<div style="font-size:56px;font-weight:700;color:' + level.color + ';line-height:1">' + total + '<span style="font-size:20px;color:var(--ink3);font-weight:400"> / 24</span></div>';
    html += '<div style="margin:12px auto;width:80%;height:6px;background:var(--brd);border-radius:3px;overflow:hidden">';
    html += '<div style="width:' + (total / 24 * 100) + '%;height:100%;background:' + level.color + ';border-radius:3px"></div></div>';
    html += '<div style="font-size:18px;font-weight:600;color:' + level.color + '">' + level.label + '</div>';
    html += '</div>';

    // === RECOMMENDATIONS — the main event ===
    if (recs.length > 0) {
      html += '<div style="margin-bottom:24px">';
      html += '<div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;text-align:center">Рекомендуем пройти</div>';
      
      recs.slice(0, 3).forEach((scr, i) => {
        const isPrimary = i === 0;
        html += '<div class="card" style="margin-bottom:12px;' + (isPrimary ? 'border-color:var(--accent);' : '') + 'padding:20px 24px">';
        html += '<div style="font-size:' + (isPrimary ? '18px' : '16px') + ';font-weight:600;margin-bottom:6px">';
        if (isPrimary) html += '<span style="color:var(--accent)">&#9733; </span>';
        html += scr.name + '</div>';
        html += '<div style="font-size:13px;color:var(--ink2);margin-bottom:14px;line-height:1.6">' + scr.why + '</div>';
        if (scr.ready) {
          html += '<a href="/screening/' + scr.slug + '/" class="btn ' + (isPrimary ? 'btn-primary' : 'btn-secondary') + ' btn-block btn-sm">Пройти скрининг &rarr;</a>';
        } else {
          html += '<div style="text-align:center"><span class="badge badge-soon">В разработке</span></div>';
        }
        html += '</div>';
      });
      html += '</div>';
    } else if (total >= 3) {
      html += '<div class="card" style="margin-bottom:24px;padding:24px;text-align:center">';
      html += '<div style="font-size:15px;margin-bottom:16px;color:var(--ink2)">Уровень дистресса невысокий. Если что-то беспокоит — выберите скрининг:</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">';
      html += '<a href="/screening/depression/" class="btn btn-secondary btn-sm">Депрессия</a>';
      html += '<a href="/screening/anxiety/" class="btn btn-secondary btn-sm">Тревога</a>';
      html += '<a href="/screening/bipolar/" class="btn btn-secondary btn-sm">БАР</a>';
      html += '<a href="/screening/ocd/" class="btn btn-secondary btn-sm">ОКР</a>';
      html += '</div></div>';
    } else {
      html += '<div class="card" style="margin-bottom:24px;padding:24px;text-align:center">';
      html += '<div style="font-size:15px;color:var(--ink2)">Скрининг не выявил выраженного дистресса. Если что-то всё же беспокоит — <a href="/#screenings">выберите скрининг</a> по конкретному направлению.</div>';
      html += '</div>';
    }

    // === BOTTOM BUTTONS ===
    html += '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">';
    html += '<a href="/" class="btn btn-secondary btn-sm">На главную</a>';
    html += '<button class="btn btn-secondary btn-sm quiz-close-result">Закрыть</button>';
    html += '</div>';

    // === DISCLAIMER ===
    html += '<p style="font-size:11px;color:var(--ink3);margin-top:20px;text-align:center;line-height:1.6">K-6 (Kessler et al., 2002) — скрининговый инструмент, не диагностика.</p>';

    html += '</div>';
    return html;
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);
