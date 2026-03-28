const STORAGE_KEY = "conversation_game_state_v10";

const characterSelectScreen = document.getElementById("characterSelectScreen");
const conversationScreen = document.getElementById("conversationScreen");
const characterListEl = document.getElementById("characterList");
const characterNameEl = document.getElementById("characterName");
const messageAreaEl = document.getElementById("messageArea");
const questionAreaEl = document.getElementById("questionArea");
const characterSpriteEl = document.getElementById("characterSprite");
const bgAreaEl = document.getElementById("bgArea");

const menuBtn = document.getElementById("menuBtn");
const menuSheet = document.getElementById("menuSheet");
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

const imageCache = new Map();

const state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        selectedCharacter: null,
        conversation: {
          currentSceneIndex: 0,
          askedInScene: [],
          phase: "idle", // idle | intro | choice | answer | outro | ended
          pendingText: "",
          pendingAction: null
        }
      };
    }

    const parsed = JSON.parse(raw);

    return {
      selectedCharacter: parsed.selectedCharacter ?? null,
      conversation: {
        currentSceneIndex: parsed.conversation?.currentSceneIndex ?? 0,
        askedInScene: parsed.conversation?.askedInScene ?? [],
        phase: "idle",
        pendingText: "",
        pendingAction: null
      }
    };
  } catch {
    return {
      selectedCharacter: null,
      conversation: {
        currentSceneIndex: 0,
        askedInScene: [],
        phase: "idle",
        pendingText: "",
        pendingAction: null
      }
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedCharacter: state.selectedCharacter,
    conversation: {
      currentSceneIndex: state.conversation.currentSceneIndex,
      askedInScene: state.conversation.askedInScene
    }
  }));
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state.selectedCharacter = null;
  state.conversation.currentSceneIndex = 0;
  state.conversation.askedInScene = [];
  state.conversation.phase = "idle";
  state.conversation.pendingText = "";
  state.conversation.pendingAction = null;
  render();
}

/* =========================
   メニュー
========================= */

function closeMenu() {
  menuSheet.hidden = true;
  menuBtn.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
}

function openMenu() {
  menuSheet.hidden = false;
  menuBtn.classList.add("is-open");
  menuBtn.setAttribute("aria-expanded", "true");
}

function toggleMenu(event) {
  event.stopPropagation();
  if (menuSheet.hidden) {
    openMenu();
  } else {
    closeMenu();
  }
}

/* =========================
   画像最適化
========================= */

async function loadImage(src) {
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

async function createOptimizedImageUrl(src, options = {}) {
  const {
    maxWidth = 420,
    maxHeight = 720,
    type = "image/webp",
    quality = 0.90
  } = options;

  const cacheKey = `${src}__${maxWidth}x${maxHeight}__${type}__${quality}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
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

    const blob = await canvasToBlob(canvas, type, quality);
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch {
    return src;
  }
}

/* =========================
   画面切り替え
========================= */

function showCharacterSelect() {
  characterSelectScreen.hidden = false;
  conversationScreen.hidden = true;
  closeMenu();
}

function showConversationScreen() {
  characterSelectScreen.hidden = true;
  conversationScreen.hidden = false;
}

/* =========================
   キャラ表示
========================= */

function setConversationVisual(characterId) {
  const spriteMap = {
    filler: "./assets/img/filler-face.png",
    child: "./assets/img/child-face.png",
    aya: "./assets/img/aya-face.png"
  };

  const src = spriteMap[characterId] || "";

  if (characterSpriteEl) {
    characterSpriteEl.src = src;
    characterSpriteEl.alt = characterId || "";
  }

  if (bgAreaEl) {
    bgAreaEl.style.backgroundImage = "";
  }
}

async function renderCharacterSelect() {
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
      const optimizedSrc = await createOptimizedImageUrl(character.image);
      imageHtml = `<img src="${optimizedSrc}" alt="${character.label}" class="characterImage" loading="lazy" decoding="async">`;
    }

    button.innerHTML = `
      <div class="characterVisual">
        ${imageHtml}
      </div>
      <div class="characterInfo">
        <span class="characterNameMini">${character.label}</span>
        <span class="characterStatus">${character.statusLabel}</span>
      </div>
    `;

    characterListEl.appendChild(button);
  }
}

/* =========================
   会話描画
========================= */

function showMessage(text) {
  messageAreaEl.innerHTML = `
    <div class="msg character">
      <span class="msgText">${text}</span>
    </div>
  `;
}

function clearConversationArea() {
  messageAreaEl.innerHTML = "";
  questionAreaEl.innerHTML = "";
}

function getCurrentScene() {
  return fillerData.scenes[state.conversation.currentSceneIndex];
}

function setPending(text, action) {
  state.conversation.pendingText = text || "";
  state.conversation.pendingAction = action || null;
}

function clearPending() {
  state.conversation.pendingText = "";
  state.conversation.pendingAction = null;
}

function showTapPrompt() {
  const msg = messageAreaEl.querySelector(".msg.character");
  if (!msg) return;

  const oldHint = msg.querySelector(".tapHintInline");
  if (oldHint) oldHint.remove();

  const hint = document.createElement("span");
  hint.className = "tapHintInline";
  hint.textContent = "▼";
  msg.appendChild(hint);

  questionAreaEl.innerHTML = "";
}

function startConversation() {
  state.conversation.currentSceneIndex = 0;
  state.conversation.askedInScene = [];
  state.conversation.phase = "intro";
  clearPending();
  saveState();

  showConversationScreen();
  setConversationVisual("filler");
  characterNameEl.textContent = fillerData.meta.displayName;
  clearConversationArea();

  const scene = getCurrentScene();
  if (!scene) {
    state.conversation.phase = "ended";
    questionAreaEl.innerHTML = `<div class="emptyState">${fillerData.meta.endingMessage}</div>`;
    return;
  }

  const introText = scene.intro[0] || "";
  showMessage(introText);
  setPending("", () => {
    state.conversation.phase = "choice";
    renderTopics(scene);
  });
  showTapPrompt();
}

function renderConversation() {
  showConversationScreen();
  setConversationVisual("filler");
  characterNameEl.textContent = fillerData.meta.displayName;

  const scene = getCurrentScene();
  if (!scene) {
    state.conversation.phase = "ended";
    questionAreaEl.innerHTML = `<div class="emptyState">${fillerData.meta.endingMessage}</div>`;
    return;
  }

  if (state.conversation.phase === "choice") {
    renderTopics(scene);
  } else if (state.conversation.phase === "ended") {
    questionAreaEl.innerHTML = `<div class="emptyState">${fillerData.meta.endingMessage}</div>`;
  } else {
    showTapPrompt();
  }
}

function renderTopics(scene) {
  questionAreaEl.innerHTML = "";

  const askedSet = new Set(state.conversation.askedInScene);
  const availableTopics = scene.topics.filter(topic => !askedSet.has(topic.id));

  if (availableTopics.length === 0) {
    proceedScene();
    return;
  }

  availableTopics.slice(0, 4).forEach(topic => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "questionBtn";
    btn.textContent = topic.label;

    btn.addEventListener("click", () => {
      const answer = topic.answers[Math.floor(Math.random() * topic.answers.length)];
      showMessage(answer);

      state.conversation.askedInScene.push(topic.id);
      saveState();

      const minTopicsAsked = scene.nextSceneCondition?.minTopicsAsked ?? 1;
      if (state.conversation.askedInScene.length >= minTopicsAsked) {
        state.conversation.phase = "answer";
        setPending("", () => {
          proceedScene();
        });
        showTapPrompt();
      } else {
        state.conversation.phase = "answer";
        setPending("", () => {
          state.conversation.phase = "choice";
          renderTopics(scene);
        });
        showTapPrompt();
      }
    });

    questionAreaEl.appendChild(btn);
  });
}

function proceedScene() {
  const scene = getCurrentScene();
  questionAreaEl.innerHTML = "";

  if (scene?.outro) {
    showMessage(scene.outro);
    state.conversation.phase = "outro";
    setPending("", () => {
      goNextScene();
    });
    showTapPrompt();
  } else {
    goNextScene();
  }
}

function goNextScene() {
  state.conversation.currentSceneIndex += 1;
  state.conversation.askedInScene = [];
  saveState();

  const nextScene = getCurrentScene();

  if (!nextScene) {
    state.conversation.phase = "ended";
    showMessage(fillerData.meta.endingMessage);
    questionAreaEl.innerHTML = "";
    return;
  }

  const introText = nextScene.intro[0] || "";
  showMessage(introText);
  state.conversation.phase = "intro";
  setPending("", () => {
    state.conversation.phase = "choice";
    renderTopics(nextScene);
  });
  showTapPrompt();
}

function handleAdvance() {
  if (!state.selectedCharacter) return;
  if (state.selectedCharacter !== "filler") return;
  if (!conversationScreen || conversationScreen.hidden) return;
  if (!state.conversation.pendingAction) return;

  const action = state.conversation.pendingAction;
  clearPending();
  action();
}

/* =========================
   イベント
========================= */

function selectCharacter(characterId) {
  state.selectedCharacter = characterId;
  saveState();

  if (characterId === "filler") {
    startConversation();
    return;
  }

  showConversationScreen();
  setConversationVisual(characterId);
  clearConversationArea();

  const selected = characters.find(c => c.id === characterId);
  characterNameEl.textContent = selected?.label ?? "";

  showMessage("……この会話はまだ準備中。");
  state.conversation.phase = "ended";
  questionAreaEl.innerHTML = `<div class="emptyState">現在はフィラーのみ会話できます。</div>`;
}

backBtn.addEventListener("click", () => {
  state.selectedCharacter = null;
  state.conversation.phase = "idle";
  clearPending();
  saveState();
  render();
});

resetBtn.addEventListener("click", () => {
  resetState();
});

menuBtn.addEventListener("click", toggleMenu);
menuSheet.addEventListener("click", (event) => event.stopPropagation());
document.addEventListener("click", () => closeMenu());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

messageAreaEl.addEventListener("click", handleAdvance);
questionAreaEl.addEventListener("click", (event) => {
  // 選択肢ボタンじゃない場所を押した時だけ進行
  if (!event.target.closest(".questionBtn")) {
    handleAdvance();
  }
});

/* =========================
   全体描画
========================= */

async function render() {
  await renderCharacterSelect();

  if (!state.selectedCharacter) {
    showCharacterSelect();
    return;
  }

  if (state.selectedCharacter === "filler") {
    startConversation();
  } else {
    showConversationScreen();
    setConversationVisual(state.selectedCharacter);
  }
}

closeMenu();
render();
