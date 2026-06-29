// ── Kanji Quiz Overlay – main logic ──

// --- Mode detection ---
//   controller — hidden background pywebview, runs IRC + timer, spawns popup
//   popup      — visible quiz window, user interacts here
const urlMode = new URL(window.location.href).searchParams.get('mode');
const IS_CONTROLLER = urlMode === 'controller';
const IS_POPUP      = urlMode === 'popup';

// --- DOM references ---
const quizContainer  = document.getElementById('quiz-container');
const progressFill   = document.getElementById('progress-fill');
const progressText   = document.getElementById('progress-text');
const kanjiDisplay   = document.getElementById('kanji-display');
const readingHint    = document.getElementById('reading-hint');
const choiceBtns     = document.querySelectorAll('.choice-btn');
const feedback       = document.getElementById('feedback');
const feedbackIcon   = document.getElementById('feedback-icon');
const feedbackText   = document.getElementById('feedback-text');
const resultsScreen  = document.getElementById('results-screen');
const scoreDisplay   = document.getElementById('score-display');
const resultsList    = document.getElementById('results-list');
const countdownEl    = document.getElementById('countdown');

// --- Mastered words (correctly answered — skip in future quizzes) ---
const MASTERED_KEY = 'kanji_quiz_mastered';
let masteredWords = new Set(JSON.parse(localStorage.getItem(MASTERED_KEY) || '[]'));

function saveMastered() {
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...masteredWords]));
}

// --- Quiz state ---
let questions = [];
let currentIdx = 0;
let score = 0;
let results = []; // { kanji, correct, correctAnswer, chosenAnswer }
let isAnswering = false;

const TOTAL_QUESTIONS = 10;
const FEEDBACK_DELAY = 1200;   // ms to show correct/wrong before next question
const RESULTS_TIMEOUT = 5000;  // ms before overlay self-closes

function callPywebview(method) {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api[method]();
  }
}

// --- Start quiz ---
async function startQuiz() {
  // Show immediately with loading state
  resultsScreen.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  quizContainer.classList.remove('fade-out');
  kanjiDisplay.textContent = '...';
  readingHint.textContent = 'Loading quiz...';
  choiceBtns.forEach(btn => { btn.textContent = ''; btn.classList.add('disabled'); });

  const apiQuiz = await loadQuizFromRenshuu();
  if (apiQuiz) {
    questions = apiQuiz;
  } else {
    questions = generateQuiz(TOTAL_QUESTIONS);
  }

  currentIdx = 0;
  score = 0;
  results = [];
  isAnswering = false;

  showQuestion();
}

// --- Render current question ---
function showQuestion() {
  const q = questions[currentIdx];
  kanjiDisplay.textContent = q.kanji;
  readingHint.textContent = '';

  progressFill.style.width = ((currentIdx + 1) / TOTAL_QUESTIONS * 100) + '%';
  progressText.textContent = (currentIdx + 1) + ' / ' + TOTAL_QUESTIONS;

  choiceBtns.forEach((btn, i) => {
    btn.textContent = q.choices[i];
    btn.className = 'choice-btn';
  });

  feedback.classList.add('hidden');
  feedback.className = 'hidden';

  isAnswering = true;
}

// --- Handle answer ---
function handleAnswer(chosenIndex) {
  if (!isAnswering) return;
  isAnswering = false;

  const q = questions[currentIdx];
  const chosen = q.choices[chosenIndex];
  const isCorrect = chosen === q.correctAnswer;

  if (isCorrect) score++;

  results.push({
    kanji: q.kanji,
    correct: isCorrect,
    correctAnswer: q.correctAnswer,
    chosenAnswer: chosen,
  });

  choiceBtns.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (q.choices[i] === q.correctAnswer) {
      btn.classList.add(isCorrect ? 'correct' : 'reveal-correct');
    }
    if (i === chosenIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  readingHint.textContent = q.reading;

  setTimeout(() => {
    currentIdx++;
    if (currentIdx < TOTAL_QUESTIONS) {
      showQuestion();
    } else {
      showResults();
    }
  }, FEEDBACK_DELAY);
}

// --- Results screen ---
function showResults() {
  quizContainer.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
  resultsScreen.classList.remove('fade-out');

  const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
  scoreDisplay.textContent = score + ' / ' + TOTAL_QUESTIONS + '  (' + pct + '%)';
  scoreDisplay.className = '';
  if (pct === 100)     scoreDisplay.classList.add('perfect');
  else if (pct >= 70)  scoreDisplay.classList.add('great');
  else if (pct >= 40)  scoreDisplay.classList.add('ok');
  else                 scoreDisplay.classList.add('bad');

  // Persist newly mastered words
  results.forEach(r => { if (r.correct) masteredWords.add(r.kanji); });
  saveMastered();

  resultsList.innerHTML = '';
  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML =
      '<span class="r-icon">' + (r.correct ? '✓' : '✗') + '</span>' +
      '<span class="r-kanji">' + r.kanji + '</span>' +
      '<span>' + r.correctAnswer + '</span>';
    resultsList.appendChild(div);
  });

  let remaining = RESULTS_TIMEOUT / 1000;
  countdownEl.textContent = remaining;
  const timer = setInterval(() => {
    remaining--;
    countdownEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      closeOverlay();
    }
  }, 1000);
}

// --- Close overlay ---
function closeOverlay() {
  // Small delay so the JS call returns before Python hides the window
  setTimeout(() => { callPywebview('close_quiz'); }, 50);
}

// --- Reset and start a fresh quiz (called by pywebview on show) ---
function resetAndStartQuiz() {
  // Clear all previous state visually
  quizContainer.classList.add('hidden');
  resultsScreen.classList.add('hidden');
  resultsScreen.classList.remove('fade-out');
  feedback.classList.add('hidden');
  feedback.className = 'hidden';
  feedbackIcon.textContent = '';
  feedbackText.textContent = '';
  choiceBtns.forEach(btn => {
    btn.className = 'choice-btn';
    btn.textContent = '';
  });
  startQuiz();
}

// --- Wire up choice buttons (popup only) ---
choiceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (IS_POPUP) handleAnswer(Number(btn.dataset.index));
  });
});

// ═══════════════════════════════════════════════════════════════
// POPUP MODE — quiz window
// User interacts here. Quiz starts when Python calls resetAndStartQuiz().
// ═══════════════════════════════════════════════════════════════
if (IS_POPUP) {
  console.log('[Mode] Popup (quiz window — pre-loaded, waiting for trigger)');
}
