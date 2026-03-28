const STORAGE_KEY = "conversation_game_state_v1";

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
const backBtn = document.getElementById("backBtn");
const resetBtn = document.getElementById("resetBtn");

let state = loadState();

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

function showCharacterSelect() {
  characterSelectScreen.hidden = false;
  conversationScreen.hidden = true;
  backBtn.hidden = true;
}

function showConversationScreen() {
  characterSelectScreen.hidden = true;
  conversationScreen.hidden = false;
  backBtn.hidden = false;
}

function renderCharacterSelect() {
  characterListEl.innerHTML = "";

  characters.forEach(character => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "characterBtn";

    if (character.status !== "playable") {
      button.classList.add("is-coming-soon");
    }

    button.addEventListener("click", () => {
      selectCharacter(character.id);
    });

    const imageHtml = character.image
      ? `<img src="${character.image}" alt="${character.label}" class="characterImage">`
      : "";

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
  });

  trimCharacterImages();
}

function renderConversation() {
  const characterId = getCurrentCharacterId();
  const characterData = getConversationData(characterId);
  const characterConfig = getCharacterConfig(characterId);
  const progress = getProgress(characterId);

  showConversationScreen();

  characterNameEl.textContent = characterData.meta.displayName;

  if (characterConfig.status !== "playable") {
    messageAreaEl.textContent = characterData.meta.intro;
    questionAreaEl.innerHTML = `<div class="emptyState">この会話はまだ実装していません。</div>`;
    return;
  }

  const message = getCurrentMessage(characterId, progress);
  messageAreaEl.textContent = message;

  renderQuestions(characterId);
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

  questionAreaEl.innerHTML = "";

  if (progress.ended) {
    questionAreaEl.innerHTML = `<div class="emptyState">会話はここで一区切りです。別のキャラクターを選ぶか、最初からやり直してください。</div>`;
    return;
  }

  if (!data.questions || data.questions.length === 0) {
    questionAreaEl.innerHTML = `<div class="emptyState">表示できる質問がありません。</div>`;
    return;
  }

  data.questions.forEach(question => {
    const count = progress.askedCount[question.id] || 0;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "questionBtn";
    button.addEventListener("click", () => {
      selectQuestion(characterId, question.id);
    });

    let metaText = "未読";
    if (count === 1) metaText = "1回";
    if (count >= 2) metaText = `${count}回`;

    const label = count >= 1
      ? `${question.label}（もう一度聞く）`
      : question.label;

    button.innerHTML = `
      <span>${label}</span>
      <span class="meta">${metaText}</span>
    `;

    questionAreaEl.appendChild(button);
  });
}

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

function render() {
  renderCharacterSelect();

  if (!state.selectedCharacter) {
    showCharacterSelect();
    return;
  }

  renderConversation();
}

backBtn.addEventListener("click", () => {
  state.selectedCharacter = null;
  saveState();
  render();
});

resetBtn.addEventListener("click", () => {
  resetState();
});

render();

function trimCharacterImages() {
  const images = document.querySelectorAll(".characterImage");

  images.forEach((img) => {
    if (img.dataset.trimmed === "true") return;

    const runTrim = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const w = img.naturalWidth;
        const h = img.naturalHeight;

        if (!w || !h || !ctx) return;

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);

        const { data } = ctx.getImageData(0, 0, w, h);

        let top = h;
        let left = w;
        let right = 0;
        let bottom = 0;
        let found = false;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const alpha = data[(y * w + x) * 4 + 3];
            if (alpha > 0) {
              found = true;
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }

        if (!found) return;

        const trimWidth = right - left + 1;
        const trimHeight = bottom - top + 1;

        const trimCanvas = document.createElement("canvas");
        const trimCtx = trimCanvas.getContext("2d");

        trimCanvas.width = trimWidth;
        trimCanvas.height = trimHeight;

        trimCtx.drawImage(
          canvas,
          left, top, trimWidth, trimHeight,
          0, 0, trimWidth, trimHeight
        );

        img.src = trimCanvas.toDataURL("image/png");
        img.dataset.trimmed = "true";
      } catch (e) {
        console.error("trim failed:", e);
      }
    };

    if (img.complete) {
      runTrim();
    } else {
      img.addEventListener("load", runTrim, { once: true });
    }
  });
}
