// ── renshuu.org API integration ──
// Fetches the user's studied vocabulary and builds quiz questions from them.
// API key is read from localStorage first, then URL query param as fallback.

const RENSHUU_BASE = 'https://api.renshuu.org/v1';

function getRenshuuKey() {
  return localStorage.getItem('renshuu_api_key')
    || new URL(window.location.href).searchParams.get('renshuu_key')
    || '';
}

// Fetch a single page of studied vocab
async function fetchVocabPage(apiKey, page = 1) {
  const res = await fetch(RENSHUU_BASE + '/list/all/vocab?pg=' + page, {
    headers: { 'Authorization': 'Bearer ' + apiKey },
  });
  if (!res.ok) throw new Error('renshuu API error: ' + res.status);
  return res.json();
}

// Fetch ALL pages of studied vocab
async function fetchAllStudiedVocab(apiKey) {
  const first = await fetchVocabPage(apiKey, 1);
  const contents = first.contents;
  let allTerms = contents.terms || [];
  const totalPages = contents.total_pg || 1;

  for (let pg = 2; pg <= totalPages; pg++) {
    const page = await fetchVocabPage(apiKey, pg);
    allTerms = allTerms.concat(page.contents.terms || []);
  }
  return allTerms;
}

// Convert renshuu vocab data into our quiz-friendly format
function renshuuToQuizBank(wordList) {
  return wordList
    .filter(w => w.kanji_full && w.def && w.def.length > 0)
    .map(w => ({
      kanji: w.kanji_full,
      reading: w.hiragana_full || '',
      meaning: w.def[0],
    }));
}

// Generate quiz from renshuu data, skipping mastered words
function generateQuizFromAPI(bank, count = 10) {
  const mastered = (typeof masteredWords !== 'undefined') ? masteredWords : new Set();
  let pool = bank.filter(w => !mastered.has(w.kanji));
  if (pool.length < count) {
    // Not enough unmastered words — reset and use the full bank for a fresh cycle
    if (typeof masteredWords !== 'undefined') masteredWords.clear();
    if (typeof saveMastered === 'function') saveMastered();
    pool = bank;
  }
  if (pool.length < 4) {
    console.warn('Not enough words studied for a quiz (need at least 4).');
    return null;
  }

  const selected = pickRandom(pool, Math.min(count, pool.length));
  return selected.map(entry => {
    // Pick 3 distractors from different words in the full bank
    const others = bank.filter(w => w.kanji !== entry.kanji);
    const distractors = pickRandom(others, 3).map(w => w.meaning);
    const choices = shuffleArray([entry.meaning, ...distractors]);
    return {
      kanji: entry.kanji,
      reading: entry.reading,
      correctAnswer: entry.meaning,
      choices,
    };
  });
}

// Main: try to load quiz from renshuu, return null if it fails
async function loadQuizFromRenshuu() {
  const apiKey = getRenshuuKey();
  if (!apiKey) {
    console.log('No renshuu_key — using local kanji bank.');
    return null;
  }

  try {
    console.log('Fetching vocabulary from renshuu.org…');
    const wordList = await fetchAllStudiedVocab(apiKey);
    console.log('Fetched ' + wordList.length + ' words from renshuu.');
    const bank = renshuuToQuizBank(wordList);
    if (bank.length < 4) return null;
    return generateQuizFromAPI(bank);
  } catch (err) {
    console.error('renshuu API failed, falling back to local bank:', err);
    return null;
  }
}
