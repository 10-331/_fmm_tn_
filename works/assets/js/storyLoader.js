const totalStories = 5;
let currentStory = 1;

function loadStory(num) {
fetch("../../data/story${num}.txt")   // ← texts → data に変更
    .then(res => res.text())
    .then(text => {
      document.getElementById("story-title").textContent = `第${num}話`;
      document.getElementById("story-content").textContent = text;

      document.getElementById("prev-btn").style.display = (num === 1) ? "none" : "inline-block";
      document.getElementById("next-btn").style.display = (num === totalStories) ? "none" : "inline-block";
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

