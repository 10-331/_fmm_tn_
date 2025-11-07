let currentEpisode = 0;
let storyData = {};

async function loadStory() {
  const res = await fetch("../data/story.json");
  storyData = await res.json();
  document.getElementById("chapter-title").textContent = storyData.chapterTitle;
  showEpisode(0);
}

function showEpisode(index) {
  const textBox = document.getElementById("story-text");
  const episode = storyData.episodes[index];
  if (!episode) return;

  textBox.style.opacity = 0;
  setTimeout(() => {
    textBox.innerHTML = `<h2>${episode.title}</h2><p>${episode.text.replace(/\n/g, "<br>")}</p>`;
    textBox.style.opacity = 1;
  }, 200);

  document.getElementById("prev").disabled = index === 0;
  document.getElementById("next").disabled = index === storyData.episodes.length - 1;
  currentEpisode = index;
}

document.getElementById("prev").addEventListener("click", () => showEpisode(currentEpisode - 1));
document.getElementById("next").addEventListener("click", () => showEpisode(currentEpisode + 1));

loadStory();
