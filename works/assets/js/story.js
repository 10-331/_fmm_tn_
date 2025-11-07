let currentEpisode = 0;
const totalEpisodes = 5;

// 指定話数のテキストを読み込む
function loadEpisode(index) {
  fetch(`data/episode${index + 1}.txt`)
    .then(res => {
      if (!res.ok) throw new Error("ファイルが見つかりません");
      return res.text();
    })
    .then(text => {
      const textBox = document.getElementById("story-text");
      textBox.style.opacity = 0;

      setTimeout(() => {
        textBox.innerHTML = `<h2>第${index + 1}話</h2><div class="episode-text">${text}</div>`;
        textBox.style.opacity = 1;
      }, 200);

      document.getElementById("prev").disabled = index === 0;
      document.getElementById("next").disabled = index === totalEpisodes - 1;
      currentEpisode = index;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("story-text").innerHTML =
        "<p>本文を読み込めませんでした。</p>";
    });
}

document.getElementById("prev").addEventListener("click", () => loadEpisode(currentEpisode - 1));
document.getElementById("next").addEventListener("click", () => loadEpisode(currentEpisode + 1));

window.addEventListener("DOMContentLoaded", () => loadEpisode(0));
