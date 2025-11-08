// works/main/story.js
async function loadStory() {
  const storyText = document.getElementById("story-text");
  const title = document.getElementById("chapter-title");

  // URLからファイル名を取得（例：story3.html → story3.txt）
  const match = window.location.pathname.match(/story(\d)\.html$/);
  const index = match ? match[1] : "1";
  const txtFile = `data/story${index}.txt`;

  try {
    const res = await fetch(txtFile);
    if (!res.ok) throw new Error("本文ファイルが見つかりません");
    const text = await res.text();

    title.textContent = `第${index}話`;
    storyText.innerHTML = text
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .concat("</p>");
  } catch (err) {
    storyText.innerHTML = `<p style="color:#999;">${err.message}</p>`;
  }

  // 前後話ボタン
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const num = parseInt(index);

  if (num > 1) prev.onclick = () => (location.href = `story${num - 1}.html`);
  else prev.style.display = "none";

  if (num < 5) next.onclick = () => (location.href = `story${num + 1}.html`);
  else next.onclick = () => (location.href = "../../works/select.html");
}

document.addEventListener("DOMContentLoaded", loadStory);
