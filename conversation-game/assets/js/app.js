const STORAGE_KEY = "conversation_game_state_v3";

const allData = {
  child: childData,
  filler: fillerData,
  aya: ayaData
};

const defaultState = {
  selectedCharacter: null,
  progress: {
    child: {
      askedCount: {},
      askedOrder: [],
      ended: false
    },
    filler: {
      askedCount: {},
      askedOrder: [],
      ended: false
    },
    aya: {
      askedCount: {},
      askedOrder: [],
      ended: false
    }
  }
};

const characterSelectScreen = document.getElementById("characterSelectScreen");
const conversationScreen = document.getElementById("conversationScreen");
const characterListEl = document.getElementById("characterList");
const characterNameEl = document.getElementById("characterName");
const messageAreaEl = document.getElementById("messageArea");
const questionAreaEl = document.getElementById("questionArea");

const menuBtn = document.getElementById("menuBtn");
const menuSheet = document.getElementById("menuSheet");
const backBtn = document.querySelector("#menuSheet #backBtn") || document.getElementById("backBtn");
const resetBtn = document.querySelector("#menuSheet #resetBtn") || document.getElementById("resetBtn");

let state = loadState();

/* =========================
   画像最適化
========================= */

const imageCache = new Map();

async function createOptimizedImageUrl(src, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 1200,
    type = "image/webp",
    quality = 0.92
  } = options;

  const cacheKey = `${src}__${maxWidth}x${maxHeight}__${type}__${quality}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  const img = await loadImage(src);
  const fitted = fitSize(img.naturalWidth, img.naturalHeight, maxWidth, maxHeight);

  const canvas = document.createElement("canvas");
  canvas.width = fitted.width;
  canvas.height = fitted.height;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return src;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, fitted.width, fitted.height);

  try {
    const blob = await canvasToBlob(canvas, type, quality);
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch (error) {
    console.error("画像最適化失敗:", error);
    return src;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitSize(srcWidth, srcHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1);
  return {
    width: Math.max(1, Math.round(srcWidth * ratio)),
    height: Math.max(1, Math.round(srcHeight * ratio))
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Blob化失敗"));
    }, type, quality);
  });
}

/* =========================
   状態管理
========================= */

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultState();

    const parsed = JSON.parse(raw);

    return {
      selectedCharacter: parsed.selectedCharacter ?? null,
      progress: {
        child: {
          askedCount: parsed.progress?.child?.askedCount ?? {},
          askedOrder: parsed.progress?.child?.askedOrder ?? [],
          ended: parsed.progress?.child?.ended ?? false
        },
        filler: {
          askedCount: parsed.progress?.filler?.askedCount ?? {},
          askedOrder: parsed.progress?.filler?.askedOrder ?? [],
          ended: parsed.progress?.filler?.ended ?? false
        },
        aya: {
          askedCount: parsed.progress?.aya?.askedCount ?? {},
          askedOrder: parsed.progress?.aya?.askedOrder ?? [],
          ended: parsed.progress?.aya?.ended ?? false
        }
      }
    };
  } catch (error) {
    console.error("状態読み込み失敗:", error);
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = cloneDefaultState();
  render();
}

function getCurrentCharacterId() {
  return state.selectedCharacter;
}

function getCharacterConfig(characterId) {
  return characters.find(char => char.id === characterId);
}

function getConversationData(characterId) {
  return allData[characterId];
}

function getProgress(characterId) {
  return state.progress[characterId];
}

/* =========================
   メニュー制御
========================= */

function closeMenu() {
  if (!menuSheet || !menuBtn) return;
  menuSheet.hidden = true;
  menuBtn.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
}

function openMenu() {
  if (!menuSheet || !menuBtn) return;
  menuSheet.hidden = false;
  menuBtn.classList.add("is-open");
  menuBtn.setAttribute("aria-expanded", "true");
}

function toggleMenu(event) {
  if (event) event.stopPropagation();
  if (!menuSheet || !menuBtn) return;

  if (menuSheet.hidden) openMenu();
  else closeMenu();
}

if (menuBtn && menuSheet) {
  closeMenu();

  menuBtn.addEventListener("click", toggleMenu);

  menuSheet.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

/* =========================
   画面表示
========================= */

function showCharacterSelect() {
  if (characterSelectScreen) characterSelectScreen.hidden = false;
  if (conversationScreen) conversationScreen.hidden = true;
  closeMenu();
}

function showConversationScreen() {
  if (characterSelectScreen) characterSelectScreen.hidden = true;
  if (conversationScreen) conversationScreen.hidden = false;
}

async function renderCharacterSelect() {
  if (!characterListEl) return;

  characterListEl.innerHTML = "";

  for (const character of characters) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "characterBtn";

    if (character.status !== "playable") {
      button.classList.add("is-coming-soon");
    }

    button.addEventListener("click", () => {
      selectCharacter(character.id);
    });

    let imageHtml = "";
    if (character.image) {
      let optimizedSrc = character.image;

      try {
        optimizedSrc = await createOptimizedImageUrl(character.image, {
          maxWidth: 360,
          maxHeight: 640,
          type: "image/webp",
          quality: 0.90
        });
      } catch (error) {
        console.error("キャラ画像最適化失敗:", error);
      }

      imageHtml = `
        <img
          src="${optimizedSrc}"
          alt="${character.label}"
          class="characterImage"
          loading="lazy"
          decoding="async"
        >
      `;
    }

    button.innerHTML = `
      <div class="characterVisual">
        ${imageHtml}
      </div>
      <div class="characterInfo">
        <span class="name">${character.label}</span>
        <span class="status">${character.statusLabel}</span>
      </div>
    `;

    characterListEl.appendChild(button);
  }
}

function getCurrentMessage(characterId, progress) {
  const data = getConversationData(characterId);

  if (progress.ended) {
    return data.meta.endingMessage;
  }

  if (progress.askedOrder.length === 0) {
    return data.meta.intro;
  }

  const lastQuestionId = progress.askedOrder[progress.askedOrder.length - 1];
  const question = data.questions.find(q => q.id === lastQuestionId);

  if (!question) {
    return data.meta.intro;
  }

  const askedCount = progress.askedCount[lastQuestionId] || 0;
  const answerIndex = Math.max(0, Math.min(askedCount - 1, question.answers.length - 1));

  return question.answers[answerIndex];
}

function renderQuestions(characterId) {
  const data = getConversationData(characterId);
  const progress = getProgress(characterId);

  if (!questionAreaEl) return;
  questionAreaEl.innerHTML = "";

  if (progress.ended) {
    questionAreaEl.innerHTML = `<div class="emptyState">会話はここで一区切りです。</div>`;
    return;
  }

  if (!data.questions || data.questions.length === 0) {
    questionAreaEl.innerHTML = `<div class="emptyState">表示できる質問がありません。</div>`;
    return;
  }

  data.questions.slice(0, 4).forEach(question => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "questionBtn";
    button.addEventListener("click", () => {
      selectQuestion(characterId, question.id);
    });

    button.innerHTML = `<span class="questionLabel">${question.label}</span>`;
    questionAreaEl.appendChild(button);
  });
}

function renderConversation() {
  const characterId = getCurrentCharacterId();
  if (!characterId) return;

  const characterData = getConversationData(characterId);
  const characterConfig = getCharacterConfig(characterId);
  const progress = getProgress(characterId);

  showConversationScreen();

  if (characterNameEl) {
    characterNameEl.textContent = characterData.meta.displayName;
  }

  if (characterConfig.status !== "playable") {
    if (messageAreaEl) {
      messageAreaEl.textContent = characterData.meta.intro;
    }
    if (questionAreaEl) {
      questionAreaEl.innerHTML = `<div class="emptyState">この会話はまだ実装していません。</div>`;
    }
    return;
  }

  const message = getCurrentMessage(characterId, progress);

  if (messageAreaEl) {
    messageAreaEl.textContent = message;
    requestAnimationFrame(() => {
      messageAreaEl.scrollTop = 0;
    });
  }

  renderQuestions(characterId);
}

/* =========================
   イベント
========================= */

function selectCharacter(characterId) {
  state.selectedCharacter = characterId;
  saveState();
  render();
}

function selectQuestion(characterId, questionId) {
  const data = getConversationData(characterId);
  const progress = getProgress(characterId);
  const question = data.questions.find(q => q.id === questionId);

  if (!question || progress.ended) return;

  const currentCount = progress.askedCount[questionId] || 0;
  progress.askedCount[questionId] = currentCount + 1;
  progress.askedOrder.push(questionId);

  if (checkEnding(characterId)) {
    progress.ended = true;
  }

  saveState();
  renderConversation();
}

function checkEnding(characterId) {
  const data = getConversationData(characterId);
  const progress = getProgress(characterId);
  const uniqueCount = Object.keys(progress.askedCount).length;
  return uniqueCount >= data.meta.endingCondition.minUniqueQuestions;
}

if (backBtn instanceof HTMLElement) {
  backBtn.addEventListener("click", () => {
    state.selectedCharacter = null;
    saveState();
    closeMenu();
    render();
  });
}

if (resetBtn instanceof HTMLElement) {
  resetBtn.addEventListener("click", () => {
    closeMenu();
    resetState();
  });
}

/* =========================
   全体描画
========================= */

async function render() {
  await renderCharacterSelect();

  if (!state.selectedCharacter) {
    showCharacterSelect();
    return;
  }

  renderConversation();
}

render();
