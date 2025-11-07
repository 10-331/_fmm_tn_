let currentEpisode = 0;
const totalEpisodes = 5;

const params = new URLSearchParams(window.location.search);
if (params.has("ep")) {
  currentEpisode = Math.max(0, parseInt(params.get("ep"), 10) - 1);
}

const pathParts = window.location.pathname.split("/");
const route = pathParts.includes("if") ? "if" : "main";

function setTitle() {
  const titleEl = document.getElementById("chapter-title");
  if (route === "if") {
    document.body.classList.add("if-mode");
    titleEl.textContent = "IF ─ ダミー章";
  } else {
    titleEl.textContent = "第1章　ダミー";
  }
}

function loadEpisode(index) {
  const fileBase = route === "if" ? "if" : "episode";
  fetch(`data/${fileBase}${index + 1}.txt`)
    .then(res => {
      if (!res.ok) throw new Error("ファイルが見つかりません");
      return res.text();
    })
    .then(text => {
      const textBox = document.getElementById("story-text");
      textBox.style.opacity = 0;
      setTimeout(() => {
        const heading = route === "if" ? `IF-第${index + 1}話` : `第${index + 1}話`;
        textBox.innerHTML = `<h2>${heading}</h2><div class="episode-text">${text}</div>`;
        textBox.style.opacity = 1;
      }, 180);
      document.getElementById("prev").disabled = index === 0;
      document.getElementById("next").disabled = index === totalEpisodes - 1;
      currentEpisode = index;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("story-text").innerHTML = "<p>本文を読み込めませんでした。</p>";
    });
}

document.getElementById("prev").addEventListener("click", () => loadEpisode(currentEpisode - 1));
document.getElementById("next").addEventListener("click", () => loadEpisode(currentEpisode + 1));

window.addEventListener("DOMContentLoaded", () => {
  setTitle();
  loadEpisode(currentEpisode);
});
