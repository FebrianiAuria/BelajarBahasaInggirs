// ================= AUDIO & SFX =================
let currentSessionData = [];

const sfxCorrect = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
);
const sfxWrong = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/3149/3149-preview.mp3",
);

function playSound(type) {
  if (type === "correct") {
    sfxCorrect.currentTime = 0;
    sfxCorrect.play().catch(() => {});
  } else if (type === "wrong") {
    sfxWrong.currentTime = 0;
    sfxWrong.play().catch(() => {});
  }
}

// ================= STATS PLAYER =================
let savedXP = parseInt(localStorage.getItem("userXP"));
let userXP = isNaN(savedXP) ? 0 : savedXP;

let savedHearts = parseInt(localStorage.getItem("userHearts"));
let userHearts = isNaN(savedHearts) ? 5 : savedHearts;

const MAX_HEARTS = 10;

function addHeart(amount = 1) {
  userHearts = Math.min(userHearts + amount, MAX_HEARTS);
  updateStatsUI();
}

function updateMainStatsUI() {
  localStorage.setItem("userXP", userXP);
  localStorage.setItem("userHearts", userHearts);

  const heartIds = [
    "ui-hearts",
    "fc-hearts",
    "ls-hearts",
    "gr-hearts",
    "sp-hearts",
    "cv-hearts",
    "tr-hearts",
    "spl-hearts",
  ];
  heartIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = userHearts;
  });

  const xpEl = document.getElementById("ui-xp");
  if (xpEl) xpEl.innerText = userXP;
}

function updateStatsUI() {
  try {
    updateMainStatsUI();
  } catch (e) {}
}

// ================= DOM SELECTORS =================
const homeScreen = document.getElementById("home-screen");
const storyScreen = document.getElementById("story-screen");
const flashcardScreen = document.getElementById("flashcard-screen");
const listeningScreen = document.getElementById("listening-screen");
const grammarScreen = document.getElementById("grammar-screen");
const speakingScreen = document.getElementById("speaking-screen");
const convScreen = document.getElementById("conversation-screen");
const translateScreen = document.getElementById("translate-screen");
const spellingScreen = document.getElementById("spelling-screen");
const dictionaryScreen = document.getElementById("dictionary-screen");
const dictionaryList = document.getElementById("dictionary-list");
const dictionarySearch = document.getElementById("dictionary-search");
const dictionaryInput = document.getElementById("dictionary-input");
const dictionaryResult = document.getElementById("dictionary-result");

// Elemen Spelling
let currentSpellingIndex = 0;
let currentSpellingTurn = 0;
let spellingCanSubmit = false;
const splTitle = document.getElementById("spl-title");
const splChatContainer = document.getElementById("spl-chat-container");
const splProgress = document.getElementById("spl-progress");
const splInput = document.getElementById("spl-input");
const splInstruction = document.getElementById("spl-instruction");
const splSendBtn = document.getElementById("spl-send-btn");

// Elemen Cerita
const storyTitleEl = document.getElementById("story-title");
const storyContentEl = document.getElementById("story-content");

// Elemen Tooltip
const tooltip = document.getElementById("translation-tooltip");
const tooltipWord = document.getElementById("tooltip-word");
const tooltipMeaning = document.getElementById("tooltip-meaning");

// Elemen Flashcard
let currentVocabIndex = 0;
const fcEn = document.getElementById("fc-en");
const fcId = document.getElementById("fc-id");
const flashcardItem = document.getElementById("flashcard");
const vocabProgress = document.getElementById("vocab-progress");

// Elemen Listening
let currentListeningIndex = 0;
const lsOptions = document.getElementById("listening-options");
const lsProgress = document.getElementById("listening-progress");

// Elemen Grammar
let currentGrammarIndex = 0;
const grQuestionId = document.getElementById("gr-question-id");
const grSelectedZone = document.getElementById("gr-selected-zone");
const grAvailableZone = document.getElementById("gr-available-zone");
const grProgress = document.getElementById("grammar-progress");
const grHintBtn = document.getElementById("gr-hint-btn");
const grAnswerBtn = document.getElementById("gr-answer-btn");
const grHintText = document.getElementById("gr-hint-text");

// Elemen Speaking
let currentSpeakingIndex = 0;
const spPhrase = document.getElementById("sp-phrase");
const spTranslate = document.getElementById("sp-translate");
const spProgress = document.getElementById("speaking-progress");
const micBtn = document.getElementById("btn-mic");
const spStatus = document.getElementById("sp-status");
const spResult = document.getElementById("sp-result");

// Elemen Conversation
let currentConvIndex = 0;
let currentTurnIndex = 0;
const convBoard = document.getElementById("conv-board");
const convTitle = document.getElementById("conv-title");
const convChatContainer = document.getElementById("conv-chat-container");
const convInstruction = document.getElementById("conv-instruction");
const convMicBtn = document.getElementById("btn-conv-mic");
const convStatus = document.getElementById("conv-status");
const convProgress = document.getElementById("conv-progress");

// Elemen Translate
let currentTranslateIndex = 0;
let currentTranslateData = [];

// ================= WEB SPEECH API =================
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

// FIX BUG #5: Helper untuk stop recognition dengan aman sebelum memulai baru
function safeStopRecognition() {
  if (recognition) {
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onspeechend = null;
      recognition.stop();
    } catch (e) {}
  }
}

// ================= INIT =================
updateStatsUI();

// ================= HELPER FUNCTIONS =================
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/%/g, " percent")
    .replace(/[.,!?'"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function numberToIndonesianWords(num) {
  num = parseInt(num);
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
  ];
  if (num < 10) return satuan[num];
  if (num === 10) return "sepuluh";
  if (num === 11) return "sebelas";
  if (num < 20) return satuan[num - 10] + " belas";
  if (num < 100)
    return (
      satuan[Math.floor(num / 10)] +
      " puluh " +
      numberToIndonesianWords(num % 10)
    ).trim();
  if (num < 1000) {
    if (num < 200)
      return ("seratus " + numberToIndonesianWords(num - 100)).trim();
    return (
      satuan[Math.floor(num / 100)] +
      " ratus " +
      numberToIndonesianWords(num % 100)
    ).trim();
  }
  if (num < 1000000) {
    if (num < 2000)
      return ("seribu " + numberToIndonesianWords(num - 1000)).trim();
    return (
      numberToIndonesianWords(Math.floor(num / 1000)) +
      " ribu " +
      numberToIndonesianWords(num % 1000)
    ).trim();
  }
  if (num < 1000000000) {
    return (
      numberToIndonesianWords(Math.floor(num / 1000000)) +
      " juta " +
      numberToIndonesianWords(num % 1000000)
    ).trim();
  }
  return String(num);
}

function normalizeNumbersToWords(text) {
  return text.replace(/\d+/g, (match) => numberToIndonesianWords(match));
}

function normalizeNumbersAdvanced(text) {
  let result = text.toLowerCase();
  result = result.replace(
    /(\d+)\.(\d+)/g,
    (_, a, b) =>
      numberToIndonesianWords(a) + " point " + numberToIndonesianWords(b),
  );
  result = result.replace(
    /(\d+),(\d+)/g,
    (_, a, b) =>
      numberToIndonesianWords(a) + " point " + numberToIndonesianWords(b),
  );
  result = result.replace(/\b\d+\b/g, (num) => numberToIndonesianWords(num));
  return result;
}

function normalizeNumberAndPercent(text) {
  let result = text.toLowerCase();
  result = result.replace(
    /(\d+)[,.](\d+)%/g,
    (_, main, decimal) =>
      numberToIndonesianWords(main) +
      " koma " +
      numberToIndonesianWords(decimal) +
      " persen",
  );
  result = result.replace(
    /(\d+)%/g,
    (_, num) => numberToIndonesianWords(num) + " persen",
  );
  return result;
}

function normalizeMoneyText(text) {
  let result = text.toLowerCase();
  result = result.replace(/(\d+)[,.](\d+)\s*juta/g, (_, main, decimal) => {
    if (main === "2" && decimal === "5")
      return "dua juta lima ratus ribu rupiah";
    if (main === "1" && decimal === "5")
      return "satu juta lima ratus ribu rupiah";
    if (main === "3" && decimal === "5")
      return "tiga juta lima ratus ribu rupiah";
    return `${main} koma ${decimal} juta`;
  });
  result = result.replace(/\b1\s*juta\b/g, "satu juta rupiah");
  result = result.replace(/\b2\s*juta\b/g, "dua juta rupiah");
  result = result.replace(/\b3\s*juta\b/g, "tiga juta rupiah");
  result = result.replace(/\b4\s*juta\b/g, "empat juta rupiah");
  result = result.replace(/\b5\s*juta\b/g, "lima juta rupiah");
  result = result.replace(/harganya/g, "harga");
  return result;
}

function getRandomQuestions(data, count, storageKey) {
  if (!data || data.length === 0) return [];
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomQuestionsNoRepeat(data, count, storageKey) {
  if (!data || data.length === 0) return [];

  let recent = JSON.parse(localStorage.getItem(storageKey) || "[]");
  let available = data.filter((item) => {
    const key = JSON.stringify(
      item.en || item.idText || item.audioText || item.title || item.word,
    );
    return !recent.includes(key);
  });

  if (available.length < count) {
    available = [...data];
    recent = [];
  }

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const selectedKeys = selected.map((item) =>
    JSON.stringify(
      item.en || item.idText || item.audioText || item.title || item.word,
    ),
  );
  const newRecent = [...recent, ...selectedKeys].slice(-30);
  localStorage.setItem(storageKey, JSON.stringify(newRecent));

  return selected;
}

function calculatePronunciationScore(spoken, target) {
  spoken = cleanText(spoken);
  target = cleanText(target);
  if (spoken === target) return 100;
  const spokenNoSpace = spoken.replace(/\s+/g, "");
  const targetNoSpace = target.replace(/\s+/g, "");
  if (spokenNoSpace === targetNoSpace) return 100;
  if (
    spokenNoSpace.includes(targetNoSpace) ||
    targetNoSpace.includes(spokenNoSpace)
  )
    return 85;
  let sameLetters = 0;
  const minLength = Math.min(spokenNoSpace.length, targetNoSpace.length);
  for (let i = 0; i < minLength; i++) {
    if (spokenNoSpace[i] === targetNoSpace[i]) sameLetters++;
  }
  return Math.round((sameLetters / targetNoSpace.length) * 100);
}

// ================= NAVIGASI =================
function hideAllScreens() {
  [
    homeScreen,
    storyScreen,
    flashcardScreen,
    listeningScreen,
    grammarScreen,
    speakingScreen,
    convScreen,
    translateScreen,
    spellingScreen,
    dictionaryScreen,
  ].forEach((s) => s && s.classList.remove("active"));
}

function switchScreen(hideScreen, showScreenObj) {
  if (hideScreen) hideScreen.classList.remove("active");
  setTimeout(() => {
    if (showScreenObj) showScreenObj.classList.add("active");
  }, 100);
}

function goHome() {
  hideAllScreens();
  // FIX BUG #1 & #5: Stop speech dan recognition sebelum kembali ke home
  window.speechSynthesis.cancel();
  safeStopRecognition();
  setTimeout(() => homeScreen.classList.add("active"), 100);
  hideTooltip();
}

// ================= TOOLTIP =================
function showTooltip(element, wordResult, meaningResult) {
  tooltipWord.innerText = wordResult.toLowerCase();
  tooltipMeaning.innerText = meaningResult;
  tooltip.classList.remove("hidden");

  const rect = element.getBoundingClientRect();
  const ttRect = tooltip.getBoundingClientRect();
  const appRect = document.getElementById("app").getBoundingClientRect();

  let topPos = rect.top - appRect.top - ttRect.height - 10;
  let leftPos = rect.left - appRect.left + rect.width / 2 - ttRect.width / 2;
  if (leftPos < 10) leftPos = 10;

  tooltip.style.top = `${topPos}px`;
  tooltip.style.left = `${leftPos}px`;
}

function hideTooltip() {
  if (tooltip) tooltip.classList.add("hidden");
  document
    .querySelectorAll(".clickable-word")
    .forEach((w) => w.classList.remove("active"));
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("clickable-word")) {
    event.stopPropagation();
    document
      .querySelectorAll(".clickable-word")
      .forEach((w) => w.classList.remove("active"));
    event.target.classList.add("active");
    showTooltip(
      event.target,
      event.target.innerText,
      event.target.getAttribute("data-meaning"),
    );
  } else {
    hideTooltip();
  }
});

// ================= INTERACTIVE STORY =================
const FILLER_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "am",
  "are",
  "was",
  "were",
  "be",
  "been",
  "in",
  "on",
  "at",
  "to",
  "from",
  "of",
  "for",
  "and",
  "or",
  "but",
  "he",
  "she",
  "it",
  "they",
  "you",
  "i",
  "we",
  "me",
  "him",
  "her",
  "us",
  "them",
  "this",
  "that",
  "these",
  "those",
  "my",
  "your",
  "his",
  "its",
  "our",
  "their",
  "as",
  "by",
  "with",
  "about",
  "after",
  "before",
  "during",
  "above",
  "below",
  "through",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "can",
  "could",
  "should",
  "may",
  "might",
  "must",
  "said",
  "says",
  "say",
]);

function getStoryHintKeys(storyData) {
  const dictionary = storyData.dictionary || {};
  const manualHints = Array.isArray(storyData.hintWords)
    ? storyData.hintWords
    : Array.isArray(storyData.hintKeys)
      ? storyData.hintKeys
      : null;

  if (manualHints && manualHints.length > 0)
    return manualHints.filter((key) =>
      Object.prototype.hasOwnProperty.call(dictionary, key),
    );

  const storyText = String(storyData.text || "");
  const entries = Object.keys(dictionary).filter((k) => k && k.trim());
  const estimatedHints = Math.round(entries.length * 0.5);
  const targetHints =
    entries.length <= 8
      ? Math.max(1, estimatedHints)
      : Math.min(12, Math.max(8, estimatedHints));

  const wordSpans = [];
  const wordRegex = /\b\w+[\w'-]*\b/g;
  let wm;
  while ((wm = wordRegex.exec(storyText)) !== null)
    wordSpans.push({
      word: wm[0],
      start: wm.index,
      end: wm.index + wm[0].length,
    });

  const findKeySpan = (key) => {
    const regex = new RegExp(
      `\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    const match = regex.exec(storyText);
    if (!match) return null;
    const start = match.index,
      end = start + match[0].length;
    let si = -1,
      ei = -1;
    wordSpans.forEach((span, idx) => {
      if (span.start === start && si === -1) si = idx;
      if (span.end <= end && span.start >= start) {
        if (si === -1) si = idx;
        ei = idx;
      }
    });
    return si === -1 || ei === -1
      ? null
      : { start, end, startWordIndex: si, endWordIndex: ei };
  };

  const matches = entries
    .map((key) => ({
      key,
      index: storyText.toLowerCase().indexOf(key.toLowerCase()),
      isPhrase: key.includes(" "),
      span: findKeySpan(key),
    }))
    .filter((item) => item.index >= 0 && item.span)
    .sort(
      (a, b) =>
        a.span.startWordIndex - b.span.startWordIndex ||
        Number(b.isPhrase) - Number(a.isPhrase) ||
        b.key.length - a.key.length,
    );

  const selected = [],
    seen = new Set();
  let lastEnd = -1;

  matches.forEach((item) => {
    if (selected.length >= targetHints || seen.has(item.key)) return;
    const gap = item.span.startWordIndex - lastEnd - 1;
    if (lastEnd === -1 || (gap >= 1 && gap <= 3)) {
      seen.add(item.key);
      selected.push(item.key);
      lastEnd = item.span.endWordIndex;
    }
  });

  return selected;
}

function loadStory(storyData) {
  currentSessionData = [storyData];
  storyTitleEl.innerText = storyData.title;

  let rawText = storyData.text;
  let dictionary = storyData.dictionary || {};
  let dictKeys = getStoryHintKeys(storyData).sort(
    (a, b) => b.length - a.length,
  );

  dictKeys.forEach((phrase) => {
    const regex = new RegExp(`\\b(${phrase})\\b`, "gi");
    rawText = rawText.replace(
      regex,
      `<span class="clickable-word" data-meaning="${dictionary[phrase]}">$1</span>`,
    );
  });

  storyContentEl.innerHTML = rawText;

  const transContainer = document.getElementById("story-translation");
  if (transContainer) {
    transContainer.classList.add("hidden");
    transContainer.setAttribute("data-hint-shown", "false");
  }

  const btn = document.querySelector("button[onclick='translateStory()']");
  if (btn) {
    btn.textContent = "Terjemahkan (-50 XP)";
    btn.classList.remove("secondary-btn");
    btn.classList.add("primary-btn");
  }
}

function getHintTranslation(text, dictionary) {
  const filteredDict = {};
  Object.entries(dictionary).forEach(([key, value]) => {
    const words = key.split(" ");
    if (!words.every((w) => FILLER_WORDS.has(w.toLowerCase())))
      filteredDict[key] = value;
  });
  const keys = Object.keys(filteredDict).sort((a, b) => b.length - a.length);
  let hinted = text;
  keys.forEach((k) => {
    try {
      const re = new RegExp(
        "\\b(" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b",
        "gi",
      );
      hinted = hinted.replace(re, () => filteredDict[k]);
    } catch (e) {}
  });
  return hinted;
}

function translateStory() {
  if (!currentSessionData || currentSessionData.length === 0) {
    showAlert("Tidak ada cerita yang sedang dibuka.", "warning");
    return;
  }
  const container = document.getElementById("story-translation");
  if (!container) return;

  const story = currentSessionData[0];
  const text = story.text || "";
  const dictionary = story.dictionary || {};
  const isHintMode = container.getAttribute("data-hint-shown") === "true";

  if (!isHintMode) {
    const hinted = getHintTranslation(text, dictionary);
    container.innerHTML = `<div class="hint-badge">💡 PETUNJUK TERJEMAHAN</div>
      <p style="line-height:1.6;">${hinted}</p>
      <p style="color:var(--muted);font-size:0.85em;margin-top:15px;font-style:italic;">Beberapa kata masih tersembunyi. Coba tebak terlebih dahulu! 🤔</p>`;
    container.setAttribute("data-hint-shown", "true");
    container.classList.remove("hidden");
    container.scrollIntoView({ behavior: "smooth", block: "center" });

    const btn = document.querySelector("button[onclick='translateStory()']");
    if (btn) {
      btn.textContent = "Lihat Terjemahan Lengkap (-50 XP)";
      btn.classList.add("secondary-btn");
      btn.classList.remove("primary-btn");
    }
  } else {
    if (userXP < 50) {
      showAlert(
        "Kamu butuh 50 XP untuk melihat terjemahan lengkap.",
        "warning",
        "💸",
        "XP Kurang!",
      );
      return;
    }
    userXP -= 50;
    updateStatsUI();

    const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    let translated = text;
    keys.forEach((k) => {
      try {
        const re = new RegExp(
          "\\b(" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b",
          "gi",
        );
        translated = translated.replace(re, () => dictionary[k]);
      } catch (e) {}
    });

    container.innerHTML = `<div class="xp-cost">-50 XP</div>
      <p><strong>✓ Terjemahan Lengkap (100%):</strong></p>
      <p style="line-height:1.6;">${translated}</p>
      <p style="color:var(--muted);font-size:0.85em;margin-top:15px;">Gunakan ini untuk mengoreksi tebakan kamu! 📝</p>`;
    container.classList.remove("hidden");
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    container.setAttribute("data-hint-shown", "false");

    const btn = document.querySelector("button[onclick='translateStory()']");
    if (btn) {
      btn.textContent = "Terjemahkan (-50 XP)";
      btn.classList.remove("secondary-btn");
      btn.classList.add("primary-btn");
    }
  }
}

function openStory() {
  let randomStory = getRandomQuestions(
    appDatabase.stories,
    1,
    "recent_story",
  )[0];
  loadStory(randomStory);
  switchScreen(homeScreen, storyScreen);
}

function readStoryAloud() {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentSessionData[0].text);
  utterance.lang = "en-US";
  utterance.rate = 0.8;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

// FIX BUG #1: finishStory — cancel speech synthesis dulu, baru jalankan
// urutan yang benar: cancel speech → play sound → tambah XP → alert → goHome
async function finishStory() {
  window.speechSynthesis.cancel(); // hentikan audio yang mungkin masih berjalan
  playSound("correct");
  userXP += 50;
  updateStatsUI();
  await showXPAlert("Cerita selesai dibaca! Kamu keren!", 50, "success");
  goHome();
}

// ================= FLASHCARD =================
function openVocab() {
  currentVocabIndex = 0;
  currentSessionData = getRandomQuestionsNoRepeat(
    appDatabase.vocabularies,
    appDatabase.vocabularies.length,
    "recent_vocab",
  );
  updateStatsUI();
  loadFlashcard(0);
  switchScreen(homeScreen, flashcardScreen);
}

function autoSyllableSplit(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/([aeiouy]+)/g, "$1-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .join(" - ");
}

function getPronunciationBreakdown(word) {
  const map = {
    rechargeable: "re - charge - a - ble",
    comfortable: "com - fort - a - ble",
    vegetable: "veg - e - ta - ble",
    communication: "com - mu - ni - ca - tion",
    pronunciation: "pro - nun - ci - a - tion",
    specification: "spe - ci - fi - ca - tion",
    compatibility: "com - pa - ti - bi - li - ty",
    recommendation: "re - com - men - da - tion",
    implementation: "im - ple - men - ta - tion",
  };
  return map[word.toLowerCase()] || autoSyllableSplit(word);
}

async function loadFlashcard(index) {
  if (index >= currentSessionData.length) {
    playSound("correct");
    userXP += 20;
    updateStatsUI();
    await showXPAlert("Satu set kosakata selesai!", 20, "success");
    goHome();
    return;
  }

  flashcardItem.classList.remove("flipped");
  const vocabData = currentSessionData[index];
  fcEn.innerText = vocabData.en;
  fcId.innerText = vocabData.id;

  const breakdownBox = document.getElementById("vocab-breakdown-box");
  if (breakdownBox) {
    breakdownBox.innerHTML = `<div class="pronunciation-box">
      <p>Teknik penyebutan:</p>
      <div class="break-word">${getPronunciationBreakdown(vocabData.en)}</div>
      <button class="action-btn secondary-btn" onclick="speakSlowly('${vocabData.en.replace(/'/g, "\\'")}')">🔊 Dengar Perlahan</button>
      <button class="action-btn primary-btn" onclick="speakPerSyllable('${vocabData.en.replace(/'/g, "\\'")}')">🔊 Dengar Per Ejaan</button>
    </div>`;
  }

  const practiceBox = document.getElementById("vocab-pronunciation-box");
  if (practiceBox) {
    practiceBox.innerHTML = `<button class="action-btn primary-btn" onclick="startVocabPronunciation()">🎤 Latih Pengucapan</button>
      <p id="vocab-pronunciation-result" class="instruction-text">Ucapkan kata: <strong>${vocabData.en}</strong></p>`;
  }

  const percent = (index / currentSessionData.length) * 100;
  vocabProgress.style.width = percent + "%";
}

function startVocabPronunciation() {
  if (!recognition) {
    showAlert(
      "Browser tidak mendukung mikrofon.\nGunakan Google Chrome ya!",
      "warning",
      "🎙️",
      "Mikrofon Tidak Tersedia",
    );
    return;
  }
  const vocabData = currentSessionData[currentVocabIndex];

  // FIX BUG #5: stop recognition lama sebelum mulai baru
  safeStopRecognition();

  recognition.lang = "en-US";
  recognition.start();
  const resultEl = document.getElementById("vocab-pronunciation-result");
  resultEl.innerText = "Mendengarkan pengucapanmu...";

  recognition.onresult = function (event) {
    const spokenOriginal = event.results[0][0].transcript;
    let spoken = normalizeNumbersAdvanced(cleanText(spokenOriginal));
    let target = normalizeNumbersAdvanced(cleanText(vocabData.en));
    const score = calculatePronunciationScore(spoken, target);
    resultEl.innerHTML = `Suaramu terbaca: <strong>${spokenOriginal}</strong><br>
      Nilai pengucapan: <strong>${score}/100</strong><br>
      Cara benar: <strong>${vocabData.en}</strong><br>
      <button class="action-btn secondary-btn" onclick="speakDictionaryWord('${vocabData.en.replace(/'/g, "\\'")}')">🔊 Dengarkan Cara Benar</button>`;
    if (score >= 80) {
      userXP += 5;
      playSound("correct");
    } else {
      playSound("wrong");
    }
    updateStatsUI();
  };
  recognition.onerror = function () {
    resultEl.innerText = "Suara tidak terdengar. Coba ulangi.";
  };
}

function speakSlowly(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.55;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function speakPerSyllable(word) {
  window.speechSynthesis.cancel();
  const parts = getPronunciationBreakdown(word).split(" - ");
  let index = 0;
  function speakNext() {
    if (index >= parts.length) return;
    const u = new SpeechSynthesisUtterance(parts[index]);
    u.lang = "en-US";
    u.rate = 0.65;
    u.onend = function () {
      index++;
      setTimeout(speakNext, 350);
    };
    window.speechSynthesis.speak(u);
  }
  speakNext();
}

function flipCard() {
  flashcardItem.classList.toggle("flipped");
  if (flashcardItem.classList.contains("flipped")) {
    const u = new SpeechSynthesisUtterance(
      currentSessionData[currentVocabIndex].en,
    );
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }
}

async function nextCard(isRemembered) {
  if (!isRemembered) {
    playSound("wrong");
    userHearts--;
    updateStatsUI();
    if (userHearts <= 0) {
      userHearts = 5;
      updateStatsUI();
      await showHeartAlert("Yah, nyawamu habis di Flashcard!");
      goHome();
      return;
    }
  } else {
    playSound("correct");
    userXP += 5;
    addHeart(1);
  }
  currentVocabIndex++;
  loadFlashcard(currentVocabIndex);
}

// ================= LISTENING =================
function openListening() {
  currentListeningIndex = 0;
  currentSessionData = getRandomQuestionsNoRepeat(
    appDatabase.listening,
    5,
    "recent_listening",
  );
  updateStatsUI();
  loadListening(0);
  switchScreen(homeScreen, listeningScreen);
}

async function loadListening(index) {
  if (index >= currentSessionData.length) {
    playSound("correct");
    userXP += 30;
    updateStatsUI();
    await showXPAlert(
      "Sesi Listening selesai! Telingamu tajam!",
      30,
      "success",
    );
    goHome();
    return;
  }
  lsProgress.style.width = (index / currentSessionData.length) * 100 + "%";
  const data = currentSessionData[index];
  lsOptions.innerHTML = "";
  data.options.forEach((optText, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = optText;
    btn.onclick = () => checkListeningAnswer(i, data.answer);
    lsOptions.appendChild(btn);
  });
  playListeningAudio();
}

function playListeningAudio() {
  const data = currentSessionData[currentListeningIndex];
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(data.audioText);
  u.lang = "en-US";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

async function checkListeningAnswer(selectedIndex, correctIndex) {
  if (selectedIndex === correctIndex) {
    playSound("correct");
    userXP += currentSessionData[currentListeningIndex].poin || 10;
    addHeart(1);
    currentListeningIndex++;
    loadListening(currentListeningIndex);
  } else {
    playSound("wrong");
    userHearts--;
    updateStatsUI();
    await showAlert(
      "Jawaban yang benar: " +
        currentSessionData[currentListeningIndex].options[correctIndex],
      "wrong",
      "❌",
      "Oops, Salah!",
    );
    if (userHearts <= 0) {
      userHearts = 5;
      updateStatsUI();
      await showHeartAlert();
      goHome();
    }
  }
}

// ================= GRAMMAR =================
let grSelectedWordsArr = [];
let grAvailableWordsArr = [];

function openGrammar() {
  currentGrammarIndex = 0;
  currentSessionData = getRandomQuestionsNoRepeat(
    appDatabase.grammar,
    5,
    "recent_grammar",
  );
  updateStatsUI();
  loadGrammar(0);
  switchScreen(homeScreen, grammarScreen);
}

async function loadGrammar(index) {
  if (index >= currentSessionData.length) {
    playSound("correct");
    userXP += 40;
    updateStatsUI();
    await showXPAlert("Kamu makin jago susun kalimat Inggris!", 40, "success");
    goHome();
    return;
  }
  grProgress.style.width = (index / currentSessionData.length) * 100 + "%";
  const data = currentSessionData[index];
  grQuestionId.innerText = data.idText;
  grSelectedWordsArr = [];
  grHintText.classList.add("hidden");
  grHintText.classList.remove("answer-mode");
  grHintText.innerText = "";

  // FIX BUG #4: Selalu reset tampilan tombol hint dan answer
  if (grHintBtn) grHintBtn.style.display = "inline-block";
  if (grAnswerBtn) grAnswerBtn.style.display = "inline-block";

  grAvailableWordsArr = [...data.jumbled].sort(() => Math.random() - 0.5);
  renderGrammarUI();
}

function renderGrammarUI() {
  grSelectedZone.innerHTML = "";
  grAvailableZone.innerHTML = "";
  grSelectedWordsArr.forEach((word, idx) => {
    const span = document.createElement("span");
    span.className = "word-pill";
    span.innerText = word;
    span.onclick = () => returnWordToBank(idx);
    grSelectedZone.appendChild(span);
  });
  grAvailableWordsArr.forEach((word, idx) => {
    const span = document.createElement("span");
    span.className = "word-pill";
    span.innerText = word;
    span.onclick = () => pickWord(idx);
    grAvailableZone.appendChild(span);
  });
}

function pickWord(index) {
  grSelectedWordsArr.push(grAvailableWordsArr.splice(index, 1)[0]);
  renderGrammarUI();
}

function returnWordToBank(index) {
  grAvailableWordsArr.push(grSelectedWordsArr.splice(index, 1)[0]);
  renderGrammarUI();
}

async function showGrammarHint() {
  const data = currentSessionData[currentGrammarIndex];
  if (userXP >= 50) {
    userXP -= 50;
    updateStatsUI();
    grHintText.innerText =
      data.hint || "Coba susun Subjek, Kata Kerja, lalu Objek/Keterangan.";
    grHintText.classList.remove("hidden");
    if (grHintBtn) grHintBtn.style.display = "none";
  } else {
    showAlert(
      "Kamu butuh minimal 50 XP untuk membuka bantuan.",
      "warning",
      "💡",
      "XP Kurang!",
    );
  }
}

async function showGrammarAnswer() {
  const data = currentSessionData[currentGrammarIndex];
  if (userXP >= 100) {
    userXP -= 100;
    updateStatsUI();
    grHintText.innerHTML = `<strong>Kunci Jawaban:</strong> ${data.enCorrect.join(" ")}`;
    grHintText.classList.add("answer-mode");
    grHintText.classList.remove("hidden");
    if (grHintBtn) grHintBtn.style.display = "none";
    if (grAnswerBtn) grAnswerBtn.style.display = "none";
  } else {
    showAlert(
      "Kamu butuh minimal 100 XP untuk melihat jawaban.",
      "warning",
      "🔑",
      "XP Kurang!",
    );
  }
}

async function checkGrammarAnswer() {
  const data = currentSessionData[currentGrammarIndex];
  if (grSelectedWordsArr.join(" ") === data.enCorrect.join(" ")) {
    playSound("correct");
    userXP += data.poin || 15;
    addHeart(1);
    currentGrammarIndex++;
    loadGrammar(currentGrammarIndex);
  } else {
    playSound("wrong");
    userHearts--;
    updateStatsUI();
    if (userHearts <= 0) {
      userHearts = 5;
      updateStatsUI();
      await showHeartAlert();
      goHome();
      return;
    }
    await showAlert("Coba susun ulang ya!", "wrong", "🧩", "Belum Tepat!");
  }
}

// ================= SPEAKING =================
function openSpeaking() {
  if (!SpeechRecognition) {
    showAlert(
      "Browser ini tidak mendukung Voice Recognition.\nGunakan Google Chrome ya!",
      "warning",
      "🎙️",
      "Mikrofon Tidak Tersedia",
    );
    return;
  }
  currentSpeakingIndex = 0;
  currentSessionData = getRandomQuestionsNoRepeat(
    appDatabase.speaking,
    5,
    "recent_speaking",
  );
  updateStatsUI();
  loadSpeaking(0);
  switchScreen(homeScreen, speakingScreen);
}

async function loadSpeaking(index) {
  if (index >= currentSessionData.length) {
    playSound("correct");
    userXP += 50;
    updateStatsUI();
    await showXPAlert("Pengucapanmu keren banget!", 50, "success");
    goHome();
    return;
  }
  spProgress.style.width = (index / currentSessionData.length) * 100 + "%";
  const data = currentSessionData[index];
  spPhrase.innerText = data.en;
  spTranslate.innerText = data.id;
  spResult.innerText = "";
  spResult.className = "sp-result";
  spStatus.innerText = "Tekan mic untuk bicara";
  micBtn.classList.remove("recording");
}

async function startSpeaking() {
  if (!recognition) return;

  // FIX BUG #5: stop recognition lama sebelum mulai baru
  safeStopRecognition();

  recognition.lang = "en-US";
  recognition.start();
  micBtn.classList.add("recording");
  spStatus.innerText = "Mendengarkan... Ucapkan sekarang!";
  spResult.innerText = "";

  recognition.onresult = function (event) {
    const transcript = cleanText(event.results[0][0].transcript);
    const targetText = cleanText(currentSessionData[currentSpeakingIndex].en);
    if (transcript === targetText) {
      playSound("correct");
      spResult.innerText = "MANTAP! Benar sekali.";
      spResult.className = "sp-result text-correct";
      userXP += currentSessionData[currentSpeakingIndex].poin || 20;
      addHeart(1);
      setTimeout(() => {
        currentSpeakingIndex++;
        loadSpeaking(currentSpeakingIndex);
      }, 1500);
    } else {
      playSound("wrong");
      spResult.innerText = `Hmm, terdengar seperti: "${event.results[0][0].transcript}". Coba lagi!`;
      spResult.className = "sp-result text-wrong";
      userHearts--;
      updateStatsUI();
      if (userHearts <= 0) {
        setTimeout(async () => {
          userHearts = 5;
          updateStatsUI();
          await showHeartAlert();
          goHome();
        }, 1000);
      }
    }
  };
  recognition.onspeechend = function () {
    recognition.stop();
    micBtn.classList.remove("recording");
  };
  recognition.onerror = function () {
    micBtn.classList.remove("recording");
    spStatus.innerText = "Error. Tekan mic lagi.";
    playSound("wrong");
  };
}

// ================= CONVERSATION ROLEPLAY =================
async function openConversation() {
  if (!SpeechRecognition) {
    showAlert(
      "Browser ini tidak mendukung mikrofon.\nGunakan Google Chrome ya!",
      "warning",
      "🎙️",
      "Mikrofon Tidak Tersedia",
    );
    return;
  }
  if (userHearts <= 0) {
    showAlert(
      "Yah, nyawamu habis! Istirahat dulu.",
      "error",
      "💔",
      "Nyawa Habis!",
    );
    return;
  }

  currentConvIndex = 0;
  currentTurnIndex = 0;
  currentSessionData = getRandomQuestionsNoRepeat(
    appDatabase.conversations,
    5,
    "recent_conversation",
  );
  switchScreen(homeScreen, convScreen);
  loadConversationScreen();
}

function loadConversationScreen() {
  const convData = currentSessionData[currentConvIndex];
  convTitle.innerText = convData.title;
  convChatContainer.innerHTML = "";
  convProgress.style.width = "0%";
  currentTurnIndex = 0;

  const infoDiv = document.createElement("div");
  infoDiv.style.cssText =
    "text-align:center;color:var(--gray);font-style:italic;margin-bottom:10px;";
  infoDiv.innerText = convData.desc;
  convChatContainer.appendChild(infoDiv);

  convMicBtn.disabled = true;
  convInstruction.innerText = "Tunggu giliranmu...";
  setTimeout(playTurn, 1000);
}

async function playTurn() {
  const convData = currentSessionData[currentConvIndex];

  if (currentTurnIndex >= convData.turns.length) {
    currentConvIndex++;
    if (currentConvIndex >= currentSessionData.length) {
      playSound("correct");
      userXP += 80;
      addHeart(1);
      updateStatsUI();
      await showXPAlert(
        "Kamu menyelesaikan 5 percakapan! Luar biasa!",
        80,
        "success",
      );
      goHome();
      return;
    }
    currentTurnIndex = 0;
    loadConversationScreen();
    return;
  }

  convProgress.style.width =
    (currentTurnIndex / convData.turns.length) * 100 + "%";
  const currentLine = convData.turns[currentTurnIndex];

  if (currentLine.speaker === "bot") {
    convMicBtn.disabled = true;
    convMicBtn.style.opacity = "0.5";
    convInstruction.innerText = "Dengarkan lawan bicaramu...";
    convStatus.innerText = "Robot sedang bicara";

    const botDiv = document.createElement("div");
    botDiv.className = "message-bubble msg-bot";
    botDiv.innerHTML = `<strong>Lawan Bicara:</strong> ${currentLine.text}<div class="msg-translation">${currentLine.id_translation}</div>`;
    convChatContainer.appendChild(botDiv);
    convBoard.scrollTop = convBoard.scrollHeight;

    const u = new SpeechSynthesisUtterance(currentLine.text);
    u.lang = "en-US";
    u.rate = 0.9;
    u.onend = function () {
      currentTurnIndex++;
      setTimeout(playTurn, 600);
    };
    window.speechSynthesis.speak(u);
  } else {
    convMicBtn.disabled = false;
    convMicBtn.style.opacity = "1";
    convStatus.innerText = "Tekan mic saat siap bicara";
    convInstruction.innerHTML = `<span style="font-size:0.9rem;">Katakan ini dengan bahasa Inggris:</span><br>
      <strong style="color:var(--primary);font-size:1.2rem;">"${currentLine.expected}"</strong><br>
      <em style="color:#666;font-size:0.85rem;">(${currentLine.id_translation})</em>`;
  }
}

async function startConvSpeaking() {
  if (!recognition) return;

  // FIX BUG #5: stop recognition lama sebelum mulai baru
  safeStopRecognition();

  recognition.lang = "en-US";
  recognition.start();
  convMicBtn.classList.add("listening");
  convStatus.innerText = "Mendengarkan...";
  convMicBtn.innerText = "🔴";

  recognition.onresult = async function (event) {
    const transcript = cleanText(event.results[0][0].transcript);
    const currentLine =
      currentSessionData[currentConvIndex].turns[currentTurnIndex];
    const expectedArray = currentLine.expected_options || [
      currentLine.expected,
    ];
    const isCorrect = expectedArray.some((opt) => {
      const t = cleanText(opt);
      return transcript === t || transcript.includes(t);
    });

    if (isCorrect) {
      playSound("correct");
      userXP += 10;
      addHeart(1);
      const userDiv = document.createElement("div");
      userDiv.className = "message-bubble msg-user";
      userDiv.innerHTML = `<strong>Kamu:</strong> ${event.results[0][0].transcript}<div class="msg-translation">${currentLine.id_translation}</div>`;
      convChatContainer.appendChild(userDiv);
      convBoard.scrollTop = convBoard.scrollHeight;
      currentTurnIndex++;
      setTimeout(playTurn, 800);
    } else {
      playSound("wrong");
      userHearts--;
      updateStatsUI();
      const correctAnswer = currentLine.expected;
      await showWrongAlert(event.results[0][0].transcript, correctAnswer);
      speakCorrectPronunciation(correctAnswer);
      if (userHearts <= 0) {
        userHearts = 5;
        updateStatsUI();
        await showHeartAlert("Game Over! Nyawa habis di percakapan.");
        goHome();
      }
    }
  };
  recognition.onspeechend = function () {
    recognition.stop();
    convMicBtn.classList.remove("listening");
    convMicBtn.innerText = "🎤";
    convStatus.innerText = "Tekan mic saat siap bicara";
  };
  recognition.onerror = function (event) {
    convMicBtn.classList.remove("listening");
    convMicBtn.innerText = "🎤";
    convStatus.innerText =
      event.error === "no-speech"
        ? "Suara tidak terdengar, coba lagi."
        : "Gagal membaca suara.";
  };
}

function speakCorrectPronunciation(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.75;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

async function skipConversationTurn() {
  const skipOk = await showConfirm(
    "Lewatkan percakapan ini?\nKamu akan kehilangan 1 hati. 💔",
    "danger",
    "⚠️",
    "Lewatkan?",
  );
  if (!skipOk) return;
  userHearts--;
  updateStatsUI();
  if (userHearts <= 0) {
    userHearts = 5;
    updateStatsUI();
    await showHeartAlert();
    goHome();
    return;
  }
  window.speechSynthesis.cancel();
  currentConvIndex++;
  if (currentConvIndex >= currentSessionData.length) {
    await showAlert(
      "Semua percakapan selesai! Kamu hebat.",
      "success",
      "🎉",
      "Selesai!",
    );
    goHome();
    return;
  }
  currentTurnIndex = 0;
  loadConversationScreen();
}

// ================= SPELLING =================
async function openSpelling() {
  if (userHearts <= 0) {
    showAlert(
      "Yah, nyawamu habis! Istirahat dulu ya.",
      "error",
      "💔",
      "Nyawa Habis!",
    );
    return;
  }
  currentSpellingIndex = 0;
  currentSpellingTurn = 0;

  if (!appDatabase.spellingChats || appDatabase.spellingChats.length === 0) {
    showAlert("Data spelling belum tersedia.", "warning");
    return;
  }

  currentSessionData = getRandomQuestions(
    appDatabase.spellingChats,
    1,
    "recent_spelling",
  );
  switchScreen(homeScreen, spellingScreen);
  loadSpellingScreen();
}

function loadSpellingScreen() {
  const splData = currentSessionData[currentSpellingIndex];
  splTitle.innerText = splData.title;
  splChatContainer.innerHTML = "";
  splProgress.style.width = "0%";
  currentSpellingTurn = 0;
  spellingCanSubmit = false;

  const infoDiv = document.createElement("div");
  infoDiv.style.cssText =
    "text-align:center;color:var(--muted);font-style:italic;margin-bottom:10px;";
  infoDiv.innerText = splData.desc;
  splChatContainer.appendChild(infoDiv);

  splInput.disabled = false;
  splSendBtn.disabled = true;
  splInput.value = "";
  splInstruction.innerText = "Bersiap...";
  splInput.focus();
  setTimeout(playSpellingTurn, 1000);
}

async function playSpellingTurn() {
  const splData = currentSessionData[currentSpellingIndex];
  if (currentSpellingTurn >= splData.turns.length) {
    playSound("correct");
    userXP += 80;
    updateStatsUI();
    await showXPAlert(
      "Latihan ejaan selesai! Ejaanmu makin mantap!",
      80,
      "success",
    );
    goHome();
    return;
  }

  splProgress.style.width =
    (currentSpellingTurn / splData.turns.length) * 100 + "%";
  const currentLine = splData.turns[currentSpellingTurn];

  spellingCanSubmit = false;
  splSendBtn.disabled = true;
  splInstruction.innerText = "Dengarkan audio bot...";

  const botDiv = document.createElement("div");
  botDiv.className = "message-bubble msg-bot";
  botDiv.innerHTML = `<strong>Bot:</strong> 🔊 <i>Audio diputar...</i>
    <div class="msg-translation" style="margin-top:5px;color:var(--muted);font-size:0.85em;">Arti: ${currentLine.id_text}</div>`;
  splChatContainer.appendChild(botDiv);
  splChatContainer.scrollTop = splChatContainer.scrollHeight;

  const tts = new SpeechSynthesisUtterance(currentLine.en_text);
  tts.lang = "en-US";
  tts.rate = 0.85;

  const enableTyping = () => {
    spellingCanSubmit = true;
    splSendBtn.disabled = false;
    splInput.focus();
    splInstruction.innerText = "Ketik jawabanmu dalam bahasa Inggris!";
  };
  const fallback = setTimeout(enableTyping, 3500);

  // FIX BUG #2: Hilangkan kutip ganda ekstra ('') di akhir string onclick
  tts.onend = () => {
    clearTimeout(fallback);
    botDiv.innerHTML = `<strong>Bot:</strong> 🔊 ✅ Dengarkan lalu ketik.
      <div class="msg-translation" style="margin-top:5px;color:var(--muted);font-size:0.85em;">Arti: ${currentLine.id_text}</div>
      <button onclick="playBotAudio('${currentLine.en_text.replace(/'/g, "\\'")})" style="cursor:pointer;background:var(--blue-soft);color:var(--blue-dark);font-weight:800;border:none;padding:6px 12px;border-radius:12px;margin-top:8px;">Ulang Audio 🔊</button>`;
    enableTyping();
  };
  tts.onerror = () => {
    clearTimeout(fallback);
    enableTyping();
  };
  window.speechSynthesis.speak(tts);
}

function playBotAudio(text) {
  const tts = new SpeechSynthesisUtterance(text);
  tts.lang = "en-US";
  tts.rate = 0.85;
  window.speechSynthesis.speak(tts);
}

async function checkSpelling() {
  if (!spellingCanSubmit) return;
  const splData = currentSessionData[currentSpellingIndex];
  const currentLine = splData.turns[currentSpellingTurn];
  const userInput = splInput.value.trim().toLowerCase();
  const expected = currentLine.en_text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const sanitized = userInput.replace(/[^a-z0-9 ]/g, "");
  if (sanitized === "") return;

  if (sanitized === expected) {
    playSound("correct");
    userXP += 15;
    addHeart(1);
    const userDiv = document.createElement("div");
    userDiv.className = "message-bubble msg-user";
    userDiv.innerHTML = `<strong>Kamu:</strong> ${splInput.value}`;
    splChatContainer.appendChild(userDiv);
    splChatContainer.scrollTop = splChatContainer.scrollHeight;
    splInput.value = "";
    currentSpellingTurn++;
    setTimeout(playSpellingTurn, 1000);
  } else {
    playSound("wrong");
    userHearts--;
    updateStatsUI();
    splInstruction.innerText = "Salah! Coba dengar lagi dan ketik ulang.";
    splInstruction.style.color = "var(--red)";
    setTimeout(() => {
      splInstruction.innerText = "Ketik jawabanmu dalam bahasa Inggris!";
      splInstruction.style.color = "inherit";
    }, 2000);
    if (userHearts <= 0) {
      userHearts = 5;
      updateStatsUI();
      await showHeartAlert();
      goHome();
    }
  }
}

if (splInput) {
  splInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      checkSpelling();
    }
  });
}

// ================= TRANSLATE SPEAKING =================
async function openTranslateStory() {
  if (!SpeechRecognition) {
    showAlert(
      "Browser ini tidak mendukung voice recognition.\nGunakan Google Chrome ya!",
      "warning",
      "🎙️",
      "Mikrofon Tidak Tersedia",
    );
    return;
  }
  if (!translateScreen) {
    showAlert("Halaman translate-screen belum ada.", "warning");
    return;
  }
  if (
    !appDatabase.translateStories ||
    appDatabase.translateStories.length === 0
  ) {
    showAlert("Data translate belum tersedia.", "warning");
    return;
  }

  currentTranslateIndex = 0;
  let allSentences = [];
  appDatabase.translateStories.forEach((story) => {
    allSentences = allSentences.concat(story.sentences);
  });
  currentTranslateData = getRandomQuestionsNoRepeat(
    allSentences,
    5,
    "recent_translate",
  );

  switchScreen(homeScreen, translateScreen);
  loadTranslateSentence();
}

async function loadTranslateSentence() {
  if (currentTranslateIndex >= currentTranslateData.length) {
    playSound("correct");
    addHeart(1);
    userXP += 30;
    updateStatsUI();
    await showXPAlert(
      "Latihan translate selesai! Kamu jago banget!",
      30,
      "success",
    );
    goHome();
    return;
  }
  const data = currentTranslateData[currentTranslateIndex];
  document.getElementById("tr-english-sentence").innerText = data.en;
  document.getElementById("tr-user-answer").innerText = "Belum ada jawaban.";
  document.getElementById("tr-status").innerText =
    "Tekan mic lalu terjemahkan kalimatnya.";
  document.getElementById("tr-result").classList.add("hidden");
  document.getElementById("tr-answer-box").classList.add("hidden");
  document.getElementById("tr-answer-text").innerText = "";

  let clickableText = data.en;
  const dictionary = data.dictionary || {};
  Object.keys(dictionary)
    .sort((a, b) => b.length - a.length)
    .forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      clickableText = clickableText.replace(
        regex,
        `<span class="clickable-word" data-meaning="${dictionary[word]}">$1</span>`,
      );
    });
  document.getElementById("tr-clickable-words").innerHTML = clickableText;
  document.getElementById("translate-progress").style.width =
    (currentTranslateIndex / currentTranslateData.length) * 100 + "%";
}

function showTranslateAnswer() {
  const data = currentTranslateData[currentTranslateIndex];
  if (userXP < 300) {
    showAlert(
      "Kamu butuh 300 XP untuk membuka kunci jawaban.",
      "warning",
      "🔐",
      "XP Kurang!",
    );
    return;
  }
  userXP -= 300;
  updateStatsUI();
  document.getElementById("tr-answer-box").classList.remove("hidden");
  document.getElementById("tr-answer-text").innerText = data.id;
}

function playTranslateSentence() {
  const data = currentTranslateData[currentTranslateIndex];
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(data.en);
  u.lang = "en-US";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

function startTranslateSpeaking() {
  if (!recognition) return;

  // FIX BUG #5: stop recognition lama sebelum mulai baru
  safeStopRecognition();

  recognition.lang = "id-ID";
  recognition.start();
  document.getElementById("btn-translate-mic").classList.add("recording");
  document.getElementById("tr-status").innerText =
    "Mendengarkan terjemahanmu...";

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase().trim();
    document.getElementById("tr-user-answer").innerText = transcript;
    checkTranslationAnswer(transcript);
  };
  recognition.onspeechend = function () {
    recognition.stop();
    document.getElementById("btn-translate-mic").classList.remove("recording");
  };
  recognition.onerror = function () {
    document.getElementById("btn-translate-mic").classList.remove("recording");
    document.getElementById("tr-status").innerText =
      "Suara tidak terdengar. Coba lagi.";
  };
}

async function checkTranslationAnswer(userAnswer) {
  const data = currentTranslateData[currentTranslateIndex];
  let cleaned = cleanText(userAnswer);
  cleaned = normalizeNumberAndPercent(cleaned);
  cleaned = normalizeMoneyText(cleaned);
  cleaned = normalizeNumbersToWords(cleaned);
  cleaned = normalizeNumbersToWords(cleaned);

  const keywords = data.keywords;
  let correctCount = 0,
    missingWords = [];
  keywords.forEach((keyword) => {
    if (cleaned.includes(cleanText(keyword))) correctCount++;
    else missingWords.push(keyword);
  });

  const score = Math.round((correctCount / keywords.length) * 100);
  const xpReward = calculateTranslateXP(score);
  userXP += xpReward;
  if (score < 40) {
    userHearts--;
    playSound("wrong");
  } else {
    playSound("correct");
  }
  updateStatsUI();

  document.getElementById("tr-result").classList.remove("hidden");
  document.getElementById("tr-score").innerText = `Nilai: ${score}/100`;
  document.getElementById("tr-feedback").innerText =
    missingWords.length === 0
      ? "Bagus! Terjemahan kamu sudah sangat sesuai."
      : "Kata penting yang belum terdeteksi: " + missingWords.join(", ");
  document.getElementById("tr-xp-result").innerText =
    `XP didapat: +${xpReward}`;

  if (userHearts <= 0) {
    userHearts = 5;
    updateStatsUI();
    await showHeartAlert("Nyawa habis di latihan translate!");
    goHome();
  }
}

function calculateTranslateXP(score) {
  if (score < 40) return 2;
  if (score < 60) return 5;
  if (score < 80) return 10;
  if (score < 90) return 15;
  return 20;
}

function nextTranslateSentence() {
  currentTranslateIndex++;
  loadTranslateSentence();
}

// ================= DICTIONARY =================
function openDictionary() {
  if (!dictionaryScreen) {
    showAlert("Halaman kamus belum tersedia.", "warning");
    return;
  }
  renderDictionaryList();
  switchScreen(homeScreen, dictionaryScreen);
}

function makeExampleSentence(word) {
  const lw = word.toLowerCase();
  const exampleMap = {
    apple: "I eat an apple every morning.",
    book: "I read a book before sleeping.",
    school: "She goes to school by bus.",
    teacher: "The teacher explains the lesson clearly.",
    student: "The student studies English every day.",
    friend: "My friend helps me study English.",
    family: "I love my family very much.",
    mother: "My mother cooks rice in the kitchen.",
    father: "My father goes to work every morning.",
    water: "I drink water after exercise.",
    food: "This food tastes delicious.",
    house: "My house is near the school.",
    market: "She buys vegetables at the market.",
    restaurant: "We eat dinner at the restaurant.",
    cashier: "The cashier gives me the receipt.",
    receipt: "I keep the receipt in my bag.",
    price: "What is the price of this book?",
    money: "I save my money every week.",
    pay: "I pay for my groceries at the cashier.",
    buy: "I want to buy a new bag.",
    sell: "They sell fresh fruit in the market.",
    read: "I read English stories every night.",
    write: "She writes a sentence in her notebook.",
    listen: "I listen to English songs.",
    speak: "I speak English with my friend.",
    study: "We study together after school.",
    learn: "I learn new words every day.",
    practice: "I practice speaking English every morning.",
    translate: "I translate the sentence into Indonesian.",
    grammar: "Grammar helps me make correct sentences.",
    vocabulary: "Vocabulary helps me understand English better.",
  };
  return exampleMap[lw] || `I use the word "${word}" in my English lesson.`;
}

function renderDictionaryList() {
  if (!dictionaryList) return;
  const keyword = dictionarySearch
    ? dictionarySearch.value.toLowerCase().trim()
    : "";
  const words = appDatabase.dictionary || appDatabase.vocabularies || [];
  const filtered = words.filter(
    (item) =>
      item.en.toLowerCase().includes(keyword) ||
      item.id.toLowerCase().includes(keyword),
  );

  dictionaryList.innerHTML = "";
  if (filtered.length === 0) {
    dictionaryList.innerHTML = `<div class="empty-dictionary">Kata tidak ditemukan.</div>`;
    return;
  }

  filtered.forEach((item) => {
    const example = makeExampleSentence(item.en);
    const row = document.createElement("div");
    row.className = "dictionary-row dictionary-row-full";
    row.innerHTML = `<div class="dict-main-row">
      <div class="dict-word-left"><strong>${item.en}</strong>
        <button onclick="speakDictionaryWord('${item.en.replace(/'/g, "\\'")}')">🔊</button></div>
      <div class="dict-word-right">${item.id}</div></div>
      <div class="dict-example-box"><span>Contoh kalimat:</span><p>${example}</p>
        <button onclick="speakDictionaryWord('${example.replace(/'/g, "\\'")}')">🔊 Dengarkan contoh</button></div>`;
    dictionaryList.appendChild(row);
  });
}

function speakDictionaryWord(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.85;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}

function translateDictionaryWord() {
  const word = dictionaryInput.value.trim();
  if (word === "") {
    showAlert(
      "Masukkan kata bahasa Inggris terlebih dahulu!",
      "warning",
      "📚",
      "Input Kosong",
    );
    return;
  }
  if (userXP < 10) {
    showAlert(
      "Butuh 10 XP untuk menerjemahkan kata.",
      "warning",
      "💸",
      "XP Kurang!",
    );
    return;
  }

  userXP -= 10;
  updateStatsUI();
  const words = appDatabase.dictionary || appDatabase.vocabularies || [];
  const localResult = words.find(
    (item) => item.en.toLowerCase() === word.toLowerCase(),
  );
  dictionaryResult.classList.remove("hidden");

  if (localResult) {
    dictionaryResult.innerHTML = `<div class="xp-cost">-10 XP</div>
      <h3>${localResult.en}</h3><p>${localResult.id}</p>
      <button onclick="speakDictionaryWord('${localResult.en.replace(/'/g, "\\'")}')">🔊 Dengarkan</button>`;
  } else {
    const googleUrl = `https://translate.google.com/?sl=en&tl=id&text=${encodeURIComponent(word)}&op=translate`;
    dictionaryResult.innerHTML = `<div class="xp-cost">-10 XP</div>
      <h3>${word}</h3><p>Kata ini belum ada di kamus lokal.</p>
      <a href="${googleUrl}" target="_blank" class="google-translate-link">Terjemahkan dengan Google Translate / AI</a>`;
  }
}
