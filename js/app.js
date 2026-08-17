const state = {
  currentChallenge: 0,
  unlockedChallenge: 0,
  score: 0,
  selectedWords: [],
  completed: []
};

const elements = {
  navigation: document.querySelector('#challenge-navigation'),
  title: document.querySelector('#challenge-title'),
  progress: document.querySelector('#progress-bar'),
  progressTrack: document.querySelector('.progress-track'),
  score: document.querySelector('#score-value'),
  question: document.querySelector('#question-title'),
  answerZone: document.querySelector('#answer-zone'),
  wordBank: document.querySelector('#word-bank'),
  submit: document.querySelector('#submit-answer'),
  feedback: document.querySelector('#feedback')
};

function currentChallenge() {
  return window.CHALLENGES[state.currentChallenge];
}

function renderNavigation() {
  elements.navigation.innerHTML = window.CHALLENGES
    .map((_, index) => {
      const isCurrent = index === state.currentChallenge;

      const isLocked = index > state.unlockedChallenge;;

      return `
        <button
          class="challenge-link ${isCurrent ? 'active' : ''}"
          data-challenge="${index}"
          ${isLocked ? 'disabled' : ''}
        >
          <span>${index + 1}</span>
          Desafio
          ${isLocked ? '<i class="bi bi-lock-fill lock-icon" aria-label="Desafio bloqueado"></i>' : ''}
        </button>
      `;
    })
    .join('');
}

function renderAnswerZone() {
  if (state.selectedWords.length === 0) {
    elements.answerZone.innerHTML = `
      <p>Clique nas palavras abaixo para montar a frase</p>
    `;

    return;
  }

  const selectedWordsHtml = state.selectedWords
    .map((word, index) => {
      return `
        <button
          class="selected-word"
          type="button"
          data-remove-word="${index}"
          title="Remover ${word}"
        >
          ${word} <span>×</span>
        </button>
      `;
    })
    .join('');

  elements.answerZone.innerHTML = `
    ${selectedWordsHtml}
  `;
}

function renderWordBank() {
  const words = [...currentChallenge().words];

  state.selectedWords.forEach((word) => {
    const index = words.indexOf(word);

    if (index !== -1) {
      words.splice(index, 1);
    }
  });

  elements.wordBank.innerHTML = words
    .map((word) => {
      return `
        <button
          class="word-button"
          type="button"
          data-word="${word}"
        >
          ${word}
        </button>
      `;
    })
    .join('');

  elements.submit.disabled =
    state.selectedWords.length !== currentChallenge().answer.length;
}

function showDefaultFeedback() {
  elements.feedback.className = 'feedback';

  elements.feedback.innerHTML = `
    <div>
      <strong>Responda para ver o resultado</strong>
      <small>
        Você verá a resposta correta após enviar sua tentativa.
      </small>
    </div>
  `;
}

function renderChallenge() {
  const progress =
    ((state.currentChallenge + 1) / window.CHALLENGES.length) * 100;

  elements.title.textContent =
    `Desafio ${state.currentChallenge + 1}`;

  elements.progress.style.width = `${progress}%`;

  elements.progressTrack.setAttribute(
    'aria-valuenow',
    state.currentChallenge + 1
  );

  elements.score.textContent = state.score;

  elements.question.textContent = currentChallenge().question;

  renderAnswerZone();
  renderWordBank();
  renderNavigation();
  showDefaultFeedback();
}

function submitAnswer() {
  const challenge = currentChallenge();

  const isCorrect =
    state.selectedWords.join(' ') === challenge.answer.join(' ');

  if (isCorrect) {
    const alreadyCompleted = state.completed.includes(
      state.currentChallenge
    );

    if (!alreadyCompleted) {
      state.completed.push(state.currentChallenge);
      state.score++;

      state.unlockedChallenge = Math.min(
        state.currentChallenge + 1,
        window.CHALLENGES.length - 1
      );
    }

    elements.feedback.className = 'feedback success';

    elements.feedback.innerHTML = `
      <div>
        <strong>Resposta correta!</strong>
        <small>
          Excelente observação. O próximo desafio foi liberado.
        </small>
      </div>
    `;

    elements.score.textContent = state.score;

    renderNavigation();

    return;
  }

  elements.feedback.className = 'feedback error';

  elements.feedback.innerHTML = `
    <div>
      <strong>Não foi dessa vez. Tente novamente.</strong>
    </div>
  `;
}

document.addEventListener('click', (event) => {
  const wordButton = event.target.closest('[data-word]');

  const removeButton = event.target.closest('[data-remove-word]');

  const challengeButton = event.target.closest('[data-challenge]');

  if (wordButton) {
    state.selectedWords.push(wordButton.dataset.word);

    renderAnswerZone();
    renderWordBank();
  }

  if (removeButton) {
    const wordIndex = Number(removeButton.dataset.removeWord);

    state.selectedWords.splice(wordIndex, 1);

    renderAnswerZone();
    renderWordBank();
  }

  if (challengeButton && !challengeButton.disabled) {
    state.currentChallenge = Number(
      challengeButton.dataset.challenge
    );

    state.selectedWords = [];

    renderChallenge();
  }
});

elements.submit.addEventListener('click', submitAnswer);

renderChallenge();
