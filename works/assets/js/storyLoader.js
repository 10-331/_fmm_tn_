const totalStories = 5;
let currentStory = 1;

function loadStory(num) {
  fetch(`../data/story${num}.txt`) // ← /main/ → /data/
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(text => {
      document.getElementById("story-title").textContent = `第${num}話`;
      document.getElementById("story-content").textContent = text;

      document.getElementById("prev-btn").style.display = (num === 1) ? "none" : "inline-block";
      document.getElementById("next-btn").style.display = (num === totalStories) ? "none" : "inline-block";
    })
    .catch(err => {
      document.getElementById("story-content").textContent = "本文を読み込めませんでした。";
      console.error("読み込みエラー:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadStory(currentStory);

  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentStory > 1) loadStory(--currentStory);
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentStory < totalStories) loadStory(++currentStory);
  });
});
