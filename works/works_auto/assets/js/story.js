
window.addEventListener("DOMContentLoaded", () => {
  const storyContainer = document.getElementById("story-content");
  const filename = location.pathname.split("/").pop().replace(".html", ".txt");
  const path = `./data/${filename}`;

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error("本文が見つかりません");
      return res.text();
    })
    .then(text => {
      storyContainer.textContent = text;
    })
    .catch(err => {
      storyContainer.textContent = "本文の読み込みに失敗しました。";
      console.error(err);
    });
});
