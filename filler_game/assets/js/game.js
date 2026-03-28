let currentId = "s001";

const bgEl = document.getElementById("bg");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("nextBtn");
const noticeEl = document.getElementById("notice");
const sceneIdEl = document.getElementById("sceneId");
const resetBtn = document.getElementById("resetBtn");

function findScene(id){
  return scenario.find(scene => scene.id === id);
}

function showNotice(message){
  if(!message){
    noticeEl.textContent = "";
    noticeEl.classList.remove("show");
    return;
  }

  noticeEl.textContent = message;
  noticeEl.classList.add("show");

  clearTimeout(showNotice._timer);
  showNotice._timer = setTimeout(() => {
    noticeEl.classList.remove("show");
  }, 2600);
}

function setBackground(path){
  if(!path){
    bgEl.style.backgroundImage = "";
    return;
  }
  bgEl.style.backgroundImage = `url("${path}")`;
}

function clearChoices(){
  choicesEl.innerHTML = "";
}

function createChoiceButton(choice){
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choiceBtn";
  button.textContent = choice.label;
  button.addEventListener("click", () => {
    renderScene(choice.next);
  });
  return button;
}

function renderScene(id){
  const scene = findScene(id);
  if(!scene){
    textEl.textContent = "シーンが見つかりません。scenario.js を確認してください。";
    nameEl.textContent = "";
    sceneIdEl.textContent = "";
    nextBtn.hidden = true;
    clearChoices();
    return;
  }

  currentId = scene.id;

  setBackground(scene.bg);
  nameEl.textContent = scene.name || "";
  textEl.textContent = scene.text || "";
  sceneIdEl.textContent = scene.id || "";
  clearChoices();

  showNotice(scene.notice);

  if(scene.choices && scene.choices.length > 0){
    scene.choices.forEach(choice => {
      choicesEl.appendChild(createChoiceButton(choice));
    });
    nextBtn.hidden = true;
  }else if(scene.next){
    nextBtn.hidden = false;
  }else{
    nextBtn.hidden = true;
  }
}

nextBtn.addEventListener("click", () => {
  const scene = findScene(currentId);
  if(scene && scene.next){
    renderScene(scene.next);
  }
});

resetBtn.addEventListener("click", () => {
  renderScene("s001");
});

document.addEventListener("keydown", (event) => {
  if(event.key === "Enter" || event.key === " "){
    const scene = findScene(currentId);
    const hasChoices = scene && scene.choices && scene.choices.length > 0;
    if(!hasChoices && scene && scene.next){
      event.preventDefault();
      renderScene(scene.next);
    }
  }
});

renderScene(currentId);