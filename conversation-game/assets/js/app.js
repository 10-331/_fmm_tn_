/* =========================
   メニュー制御（修正版）
========================= */

const menuBtn = document.getElementById("menuBtn");
const menuSheet = document.getElementById("menuSheet");

function closeMenu() {
  if (!menuSheet || !menuBtn) return;
  menuSheet.hidden = true;
  menuBtn.classList.remove("is-open");
}

function openMenu() {
  if (!menuSheet || !menuBtn) return;
  menuSheet.hidden = false;
  menuBtn.classList.add("is-open");
}

function toggleMenu(e) {
  e.stopPropagation();

  if (menuSheet.hidden) {
    openMenu();
  } else {
    closeMenu();
  }
}

if (menuBtn && menuSheet) {
  closeMenu(); // 初期状態を確実に閉じる

  menuBtn.addEventListener("click", toggleMenu);

  menuSheet.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeMenu();
  });
}

/* =========================
   選択肢UI（簡略化）
========================= */

function renderQuestions(characterId) {
  const data = getConversationData(characterId);
  const progress = getProgress(characterId);

  questionAreaEl.innerHTML = "";

  if (progress.ended) {
    questionAreaEl.innerHTML = `
      <div class="emptyState">
        会話はここで一区切りです。
      </div>
    `;
    return;
  }

  data.questions.forEach(question => {
    const button = document.createElement("button");
    button.className = "questionBtn";

    button.onclick = () => {
      selectQuestion(characterId, question.id);
    };

    button.innerHTML = `
      <span class="questionLabel">${question.label}</span>
    `;

    questionAreaEl.appendChild(button);
  });
}

/* =========================
   会話描画（安定化）
========================= */

function renderConversation() {
  const characterId = getCurrentCharacterId();
  const characterData = getConversationData(characterId);
  const progress = getProgress(characterId);

  showConversationScreen();

  characterNameEl.textContent = characterData.meta.displayName;

  const message = getCurrentMessage(characterId, progress);

  messageAreaEl.textContent = message;

  renderQuestions(characterId);
}

/* =========================
   ボタン連携
========================= */

backBtn.addEventListener("click", () => {
  state.selectedCharacter = null;
  saveState();
  closeMenu();
  render();
});

resetBtn.addEventListener("click", () => {
  closeMenu();
  resetState();
});
