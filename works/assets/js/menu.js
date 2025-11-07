// menu.js
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.createElement("div");
  menu.innerHTML = `
    <div id="menu-button">☰</div>
    <div id="menu-panel">
      <a href="../select.html">作品選択に戻る</a>
      <a href="../../index.html">最初の画面へ</a>
    </div>
  `;
  document.body.appendChild(menu);

  const btn = document.getElementById("menu-button");
  const panel = document.getElementById("menu-panel");

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
});