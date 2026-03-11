/* === QUIZ.JS — бесплатный тест 7 вопросов === */

const QUIZ_DATA = {
  questions: [
    { cluster: 'mood_down', text: 'В последнее время мне трудно чувствовать радость или интерес к тому, что раньше нравилось' },
    { cluster: 'anxiety', text: 'Я часто беспокоюсь о вещах, которые ещё не произошли, и мне трудно это остановить' },
    { cluster: 'mood_up', text: 'Бывают периоды необычного подъёма энергии — сплю меньше, идей слишком много, чувствую, что могу всё' },
    { cluster: 'obsessions', text: 'В голову приходят повторяющиеся мысли или образы, от которых трудно избавиться' },
    { cluster: 'attention', text: 'Мне трудно довести дело до конца — переключаюсь между задачами, теряю фокус, забываю' },
    { cluster: 'sleep', text: 'У меня проблемы со сном: трудно заснуть, просыпаюсь среди ночи, или сон не приносит отдыха' },
    { cluster: 'relations', text: 'Мои отношения с людьми нестабильны: резкие сближения и разрывы, страх отвержения или избегание' }
  ],
  answers: [
    { text: 'Никогда или очень редко', value: 0 },
    { text: 'Иногда', value: 1 },
    { text: 'Часто', value: 2 },
    { text: 'Почти всегда', value: 3 }
  ],
  clusters: {
    mood_down:  { name: 'Настроение ↓', screenings: ['depression', 'mixed'] },
    anxiety:    { name: 'Тревога', screenings: ['anxiety', 'panic'] },
    mood_up:    { name: 'Настроение ↑', screenings: ['bipolar', 'cyclothymia'] },
    obsessions: { name: 'Навязчивости', screenings: ['ocd'] },
    attention:  { name: 'Внимание', screenings: ['adhd'] },
    sleep:      { name: 'Сон', screenings: ['insomnia'] },
    relations:  { name: 'Отношения', screenings: ['bpd', 'avoidant', 'narcissistic'] }
  },
  screeningNames: {
    depression: 'Депрессия (БДР)',
    anxiety: 'Тревога (ГТР)',
    bipolar: 'Биполярное расстройство',
    cyclothymia: 'Циклотимия',
    ocd: 'ОКР',
    adhd: 'СДВГ',
    panic: 'Паническое расстройство',
    bpd: 'ПРЛ',
    narcissistic: 'Нарциссическое РЛ',
    insomnia: 'Бессонница',
    avoidant: 'Избегающее РЛ',
    mixed: 'Смешанное тревожно-депрессивное',
    'social-anxiety': 'Социальная тревога'
  },
  readyScreenings: ['depression', 'anxiety', 'bipolar', 'cyclothymia', 'ocd']
};

let quizState = { step: -1, answers: {} };

function initQuiz() {
  const overlay = document.querySelector('.quiz-overlay');
  if (!overlay) return;

  // Открытие
  document.querySelectorAll('[data-start-quiz]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      quizState = { step: -1, answers: {} };
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderQuiz();
    });
  });

  // Закрытие
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
      // Интро
      if (progress) progress.style.width = '0%';
      if (stepEl) stepEl.textContent = '';
      body.innerHTML = renderIntro();
      body.querySelector('.quiz-start-btn').addEventListener('click', () => {
        quizState.step = 0;
        renderQuiz();
      });
      return;
    }

    if (quizState.step >= QUIZ_DATA.questions.length) {
      // Результат
      if (progress) progress.style.width = '100%';
      if (stepEl) stepEl.textContent = 'Результат';
      body.innerHTML = renderResult();
      body.querySelector('.quiz-close-result')?.addEventListener('click', closeQuiz);
      return;
    }

    // Вопрос
    const q = QUIZ_DATA.questions[quizState.step];
    const pct = ((quizState.step + 1) / QUIZ_DATA.questions.length * 100).toFixed(0);
    if (progress) progress.style.width = pct + '%';
    if (stepEl) stepEl.textContent = (quizState.step + 1) + ' / ' + QUIZ_DATA.questions.length;

    body.innerHTML = renderQuestion(q, quizState.step);

    body.querySelectorAll('.quiz-answer').forEach(a => {
      a.addEventListener('click', () => {
        quizState.answers[q.cluster] = parseInt(a.dataset.value);
        a.classList.add('selected');
        setTimeout(() => {
          quizState.step++;
          renderQuiz();
        }, 300);
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
      '<h2>Экспресс-тест: 7 вопросов</h2>' +
      '<p>Это не диагностика — это навигатор. Результат покажет, на что обратить внимание и какой скрининг пройти первым.</p>' +
      '<p class="text-small text-muted" style="margin-bottom:24px">Отвечайте так, как вы чувствуете себя в последнее время.</p>' +
      '<button class="btn btn-primary quiz-start-btn">Начать →</button>' +
      '</div>';
  }

  function renderQuestion(q, i) {
    let html = '<div class="quiz-slide">';
    if (i > 0) html += '<button class="quiz-back">← Назад</button>';
    html += '<p class="quiz-question">' + q.text + '</p>';
    html += '<div class="quiz-answers">';
    QUIZ_DATA.answers.forEach(a => {
      html += '<div class="quiz-answer" data-value="' + a.value + '">' + a.text + '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderResult() {
    const ans = quizState.answers;
    let maxCluster = null, maxVal = -1;

    let html = '<div class="quiz-result quiz-slide">';
    html += '<h2>Ваша карта ментального здоровья</h2>';
    html += '<div class="cluster-grid">';

    Object.keys(QUIZ_DATA.clusters).forEach(key => {
      const c = QUIZ_DATA.clusters[key];
      const val = ans[key] || 0;
      if (val > maxVal) { maxVal = val; maxCluster = key; }
      html += '<div class="cluster-item">';
      html += '<div class="cluster-circle level-' + val + '">' + val + '</div>';
      html += '<div class="cluster-name">' + c.name + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Рекомендация
    if (maxCluster && maxVal >= 1) {
      const c = QUIZ_DATA.clusters[maxCluster];
      const scr = c.screenings[0];
      const name = QUIZ_DATA.screeningNames[scr] || scr;
      const isReady = QUIZ_DATA.readyScreenings.includes(scr);

      html += '<div class="quiz-rec">';
      html += '<h3>Наша рекомендация</h3>';
      html += '<p>Ваши ответы указывают на наиболее выраженные признаки в области «' + c.name + '». ';
      html += 'Углублённый скрининг поможет разобраться детальнее.</p>';
      if (isReady) {
        html += '<a href="/screening/' + scr + '/" class="btn btn-primary btn-sm">Пройти скрининг: ' + name + ' →</a>';
      } else {
        html += '<span class="badge badge-soon">Скрининг «' + name + '» в разработке</span>';
      }
      html += '</div>';
    } else {
      html += '<div class="quiz-rec"><p>Скрининг не выявил выраженных признаков. Если что-то беспокоит — консультация специалиста не помешает.</p></div>';
    }

    html += '<p class="quiz-disclaimer">Это экспресс-навигатор, не диагностика. Результат помогает выбрать подходящий скрининг.</p>';
    html += '<button class="btn btn-secondary btn-sm mt-3 quiz-close-result">Закрыть</button>';
    html += '</div>';
    return html;
  }
}

document.addEventListener('DOMContentLoaded', initQuiz);
