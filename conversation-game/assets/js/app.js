const messageArea = document.getElementById("messageArea");
const questionArea = document.getElementById("questionArea");

const state = {
  currentSceneIndex: 0,
  askedInScene: new Set(),
  isLocked: false
};

// ===== ユーティリティ =====
function appendMessage(text, type = "system") {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.textContent = text;
  messageArea.appendChild(div);

  messageArea.scrollTop = messageArea.scrollHeight;
}

function clearChoices() {
  questionArea.innerHTML = "";
}

function createChoiceButton(text, onClick) {
  const btn = document.createElement("button");
  btn.className = "questionBtn";
  btn.textContent = text;
  btn.onclick = onClick;
  return btn;
}

function randomAnswer(answers) {
  return answers[Math.floor(Math.random() * answers.length)];
}

// ===== 進行 =====
function startConversation(data) {
  state.currentSceneIndex = 0;
  loadScene(data);
}

function loadScene(data) {
  const scene = data.scenes[state.currentSceneIndex];

  state.askedInScene.clear();
  clearChoices();

  // intro表示
  scene.intro.forEach(line => appendMessage(line, "character"));

  // 選択肢表示
  renderTopics(scene, data);
}

function renderTopics(scene, data) {
  clearChoices();

  scene.topics.forEach(topic => {
    if (state.askedInScene.has(topic.id)) return;

    const btn = createChoiceButton(topic.label, () => {
      if (state.isLocked) return;
      state.isLocked = true;

      appendMessage(topic.label, "user");

      const answer = randomAnswer(topic.answers);
      appendMessage(answer, "character");

      state.askedInScene.add(topic.id);

      setTimeout(() => {
        state.isLocked = false;

        // 次シーン条件チェック
        if (
          state.askedInScene.size >=
          (scene.nextSceneCondition?.minTopicsAsked || 1)
        ) {
          proceedScene(data);
        } else {
          renderTopics(scene, data);
        }
      }, 300);
    });

    questionArea.appendChild(btn);
  });
}

function proceedScene(data) {
  const scene = data.scenes[state.currentSceneIndex];

  clearChoices();

  if (scene.outro) {
    appendMessage(scene.outro, "character");
  }

  state.currentSceneIndex++;

  setTimeout(() => {
    if (state.currentSceneIndex >= data.scenes.length) {
      endConversation(data);
    } else {
      loadScene(data);
    }
  }, 500);
}

function endConversation(data) {
  clearChoices();
  appendMessage(data.meta.endingMessage, "character");
}

// ===== 起動 =====
startConversation(fillerData);
