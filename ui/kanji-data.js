// Kanji quiz question bank
// Each entry: { kanji, reading (hiragana), meaning (English), distractors (3 wrong meanings) }
const KANJI_BANK = [
  { kanji: '山', reading: 'やま', meaning: 'Mountain', distractors: ['River', 'Forest', 'Sky'] },
  { kanji: '川', reading: 'かわ', meaning: 'River', distractors: ['Mountain', 'Ocean', 'Lake'] },
  { kanji: '火', reading: 'ひ', meaning: 'Fire', distractors: ['Water', 'Wind', 'Earth'] },
  { kanji: '水', reading: 'みず', meaning: 'Water', distractors: ['Fire', 'Ice', 'Rain'] },
  { kanji: '木', reading: 'き', meaning: 'Tree', distractors: ['Flower', 'Grass', 'Leaf'] },
  { kanji: '金', reading: 'かね', meaning: 'Gold / Money', distractors: ['Silver', 'Iron', 'Stone'] },
  { kanji: '土', reading: 'つち', meaning: 'Earth / Soil', distractors: ['Sky', 'Sand', 'Rock'] },
  { kanji: '日', reading: 'ひ', meaning: 'Day / Sun', distractors: ['Moon', 'Star', 'Night'] },
  { kanji: '月', reading: 'つき', meaning: 'Moon / Month', distractors: ['Sun', 'Star', 'Year'] },
  { kanji: '人', reading: 'ひと', meaning: 'Person', distractors: ['Animal', 'Child', 'Woman'] },
  { kanji: '大', reading: 'おお', meaning: 'Big', distractors: ['Small', 'Medium', 'Tall'] },
  { kanji: '小', reading: 'ちい', meaning: 'Small', distractors: ['Big', 'Short', 'Thin'] },
  { kanji: '上', reading: 'うえ', meaning: 'Above / Up', distractors: ['Below', 'Left', 'Right'] },
  { kanji: '下', reading: 'した', meaning: 'Below / Down', distractors: ['Above', 'Left', 'Right'] },
  { kanji: '中', reading: 'なか', meaning: 'Middle / Inside', distractors: ['Outside', 'Above', 'Edge'] },
  { kanji: '右', reading: 'みぎ', meaning: 'Right', distractors: ['Left', 'Above', 'Below'] },
  { kanji: '左', reading: 'ひだり', meaning: 'Left', distractors: ['Right', 'Above', 'Below'] },
  { kanji: '目', reading: 'め', meaning: 'Eye', distractors: ['Ear', 'Nose', 'Mouth'] },
  { kanji: '口', reading: 'くち', meaning: 'Mouth', distractors: ['Eye', 'Ear', 'Hand'] },
  { kanji: '手', reading: 'て', meaning: 'Hand', distractors: ['Foot', 'Arm', 'Finger'] },
  { kanji: '足', reading: 'あし', meaning: 'Foot / Leg', distractors: ['Hand', 'Arm', 'Head'] },
  { kanji: '耳', reading: 'みみ', meaning: 'Ear', distractors: ['Eye', 'Nose', 'Mouth'] },
  { kanji: '力', reading: 'ちから', meaning: 'Power / Strength', distractors: ['Weakness', 'Speed', 'Skill'] },
  { kanji: '男', reading: 'おとこ', meaning: 'Man', distractors: ['Woman', 'Child', 'Elder'] },
  { kanji: '女', reading: 'おんな', meaning: 'Woman', distractors: ['Man', 'Child', 'Elder'] },
  { kanji: '子', reading: 'こ', meaning: 'Child', distractors: ['Adult', 'Parent', 'Elder'] },
  { kanji: '学', reading: 'がく', meaning: 'Study / Learning', distractors: ['Teaching', 'Playing', 'Writing'] },
  { kanji: '校', reading: 'こう', meaning: 'School', distractors: ['Temple', 'House', 'Office'] },
  { kanji: '先', reading: 'さき', meaning: 'Before / Ahead', distractors: ['After', 'Behind', 'Between'] },
  { kanji: '生', reading: 'せい', meaning: 'Life / Birth', distractors: ['Death', 'Sleep', 'Dream'] },
  { kanji: '年', reading: 'とし', meaning: 'Year', distractors: ['Month', 'Week', 'Day'] },
  { kanji: '本', reading: 'ほん', meaning: 'Book / Origin', distractors: ['Paper', 'Pen', 'Letter'] },
  { kanji: '名', reading: 'な', meaning: 'Name', distractors: ['Voice', 'Face', 'Word'] },
  { kanji: '白', reading: 'しろ', meaning: 'White', distractors: ['Black', 'Red', 'Blue'] },
  { kanji: '百', reading: 'ひゃく', meaning: 'Hundred', distractors: ['Thousand', 'Ten', 'Million'] },
  { kanji: '千', reading: 'せん', meaning: 'Thousand', distractors: ['Hundred', 'Ten', 'Million'] },
  { kanji: '万', reading: 'まん', meaning: 'Ten Thousand', distractors: ['Hundred', 'Thousand', 'Million'] },
  { kanji: '円', reading: 'えん', meaning: 'Circle / Yen', distractors: ['Square', 'Dollar', 'Triangle'] },
  { kanji: '天', reading: 'てん', meaning: 'Heaven / Sky', distractors: ['Earth', 'Hell', 'Sea'] },
  { kanji: '気', reading: 'き', meaning: 'Spirit / Energy', distractors: ['Body', 'Mind', 'Soul'] },
  { kanji: '空', reading: 'そら', meaning: 'Sky / Empty', distractors: ['Ground', 'Full', 'Cloud'] },
  { kanji: '雨', reading: 'あめ', meaning: 'Rain', distractors: ['Snow', 'Wind', 'Thunder'] },
  { kanji: '花', reading: 'はな', meaning: 'Flower', distractors: ['Tree', 'Grass', 'Seed'] },
  { kanji: '草', reading: 'くさ', meaning: 'Grass', distractors: ['Flower', 'Tree', 'Leaf'] },
  { kanji: '虫', reading: 'むし', meaning: 'Insect / Bug', distractors: ['Bird', 'Fish', 'Animal'] },
  { kanji: '犬', reading: 'いぬ', meaning: 'Dog', distractors: ['Cat', 'Bird', 'Horse'] },
  { kanji: '猫', reading: 'ねこ', meaning: 'Cat', distractors: ['Dog', 'Rabbit', 'Mouse'] },
  { kanji: '鳥', reading: 'とり', meaning: 'Bird', distractors: ['Fish', 'Dog', 'Insect'] },
  { kanji: '魚', reading: 'さかな', meaning: 'Fish', distractors: ['Bird', 'Whale', 'Shrimp'] },
  { kanji: '車', reading: 'くるま', meaning: 'Car / Vehicle', distractors: ['Train', 'Boat', 'Plane'] },
  { kanji: '門', reading: 'もん', meaning: 'Gate', distractors: ['Door', 'Window', 'Wall'] },
  { kanji: '石', reading: 'いし', meaning: 'Stone', distractors: ['Sand', 'Metal', 'Wood'] },
  { kanji: '竹', reading: 'たけ', meaning: 'Bamboo', distractors: ['Pine', 'Cherry', 'Maple'] },
  { kanji: '糸', reading: 'いと', meaning: 'Thread', distractors: ['Rope', 'Cloth', 'Needle'] },
  { kanji: '貝', reading: 'かい', meaning: 'Shell', distractors: ['Stone', 'Pearl', 'Sand'] },
  { kanji: '村', reading: 'むら', meaning: 'Village', distractors: ['Town', 'City', 'Country'] },
  { kanji: '町', reading: 'まち', meaning: 'Town', distractors: ['Village', 'City', 'Road'] },
  { kanji: '森', reading: 'もり', meaning: 'Forest', distractors: ['Mountain', 'Field', 'Garden'] },
  { kanji: '林', reading: 'はやし', meaning: 'Grove / Woods', distractors: ['Forest', 'Field', 'River'] },
  { kanji: '田', reading: 'た', meaning: 'Rice Field', distractors: ['Garden', 'Farm', 'Pond'] },
];

// Utility: pick N random unique items from an array
function pickRandom(arr, n) {
  const copy = arr.slice();
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

// Generate a quiz of `count` questions from the bank, skipping mastered words
function generateQuiz(count = 10) {
  const mastered = (typeof masteredWords !== 'undefined') ? masteredWords : new Set();
  let pool = KANJI_BANK.filter(e => !mastered.has(e.kanji));
  if (pool.length < count) {
    // Not enough unmastered words — reset and use the full bank for a fresh cycle
    if (typeof masteredWords !== 'undefined') masteredWords.clear();
    if (typeof saveMastered === 'function') saveMastered();
    pool = KANJI_BANK;
  }
  const selected = pickRandom(pool, Math.min(count, pool.length));
  return selected.map(entry => {
    const choices = shuffleArray([entry.meaning, ...entry.distractors]);
    return {
      kanji: entry.kanji,
      reading: entry.reading,
      correctAnswer: entry.meaning,
      choices,
    };
  });
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
