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

    const recs = [];
    K6_DATA.screenings.forEach(scr => {
      let score = 0;
      scr.items.forEach(item => { score += (ans[item] || 0); });
      const avg = score / scr.items.length;
      if (avg >= 1.5) recs.push({ ...scr, score: avg });
    });
    recs.sort((a, b) => b.score - a.score);

    let h = '<div class="quiz-result quiz-slide" style="width:100%;max-width:460px">';

    // Score — compact inline
    h += '<div style="text-align:center;margin-bottom:28px">';
    h += '<div style="display:inline-flex;align-items:baseline;gap:6px;margin-bottom:8px">';
    h += '<span style="font-size:42px;font-weight:700;color:'+level.color+'">'+total+'</span>';
    h += '<span style="font-size:16px;color:var(--ink3)">/24</span></div>';
    h += '<div style="width:60%;height:4px;background:var(--brd);border-radius:2px;margin:0 auto 10px;overflow:hidden">';
    h += '<div style="width:'+(total/24*100)+'%;height:100%;background:'+level.color+';border-radius:2px"></div></div>';
    h += '<div style="font-size:15px;font-weight:600;color:'+level.color+'">'+level.label+'</div>';
    h += '</div>';

    // Recommendations
    if (recs.length > 0) {
      h += '<div style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">Рекомендуемые скрининги</div>';
      recs.slice(0,3).forEach((scr,i) => {
        const first = i===0;
        h += '<a href="'+(scr.ready?'/screening/'+scr.slug+'/':'#')+'" style="display:block;padding:14px 16px;border-radius:var(--radius);border:1px solid '+(first?'var(--accent)':'var(--brd)')+';margin-bottom:8px;text-decoration:none;color:var(--ink);transition:border-color .2s'+(scr.ready?'':';pointer-events:none;opacity:.5')+'">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center">';
        h += '<div>';
        h += '<div style="font-size:15px;font-weight:600">'+(first?'<span style=color:var(--accent)>&#9733;</span> ':'')+scr.name+'</div>';
        h += '<div style="font-size:12px;color:var(--ink3);margin-top:2px">'+scr.why.split('.')[0]+'</div>';
        h += '</div>';
        h += '<span style="font-size:12px;color:var(--accent);white-space:nowrap">'+(scr.ready?'&rarr;':'&#9203;')+'</span>';
        h += '</div></a>';
      });
    } else if (total >= 3) {
      h += '<div style="font-size:14px;color:var(--ink2);text-align:center;margin-bottom:16px">Дистресс невысокий. Если что-то беспокоит:</div>';
      h += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">';
      h += '<a href="/screening/depression/" class="btn btn-secondary btn-sm">Депрессия</a>';
      h += '<a href="/screening/anxiety/" class="btn btn-secondary btn-sm">Тревога</a>';
      h += '<a href="/screening/bipolar/" class="btn btn-secondary btn-sm">БАР</a>';
      h += '<a href="/screening/ocd/" class="btn btn-secondary btn-sm">ОКР</a>';
      h += '</div>';
    } else {
      h += '<div style="font-size:14px;color:var(--ink2);text-align:center">Выраженного дистресса не обнаружено.</div>';
    }

    // Buttons
    h += '<div style="display:flex;gap:10px;justify-content:center;margin-top:24px">';
    h += '<a href="/" class="btn btn-secondary btn-sm">На главную</a>';
    h += '<a href="/#screenings" class="btn btn-primary btn-sm">Все скрининги</a>';
    h += '</div>';

    h += '<div style="font-size:10px;color:var(--ink3);text-align:center;margin-top:16px">K-6 (Kessler, 2002) — скрининг, не диагностика</div>';
    h += '</div>';
    return h;
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);
