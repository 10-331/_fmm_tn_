// assets/js/menu.js
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.createElement("div");
  menu.id = "global-menu";
  menu.innerHTML = `
    <button id="menu-toggle">☰</button>
    <div id="menu-content">
      <a href="/_fmm_tn_/index.html">🏠 トップへ戻る</a>
      <a href="/_fmm_tn_/ssi.html">📘 詳細設定へ</a>
      <a href="/_fmm_tn_/works/select.html">📖 小説一覧へ</a>
      <div id="menu-divider"></div>
      <a href="#" id="exit-reading" style="display:none;">🚪 読むのをやめる</a>
    </div>
  `;
  document.body.appendChild(menu);

  const toggle = document.getElementById("menu-toggle");
  const content = document.getElementById("menu-content");
  const exitBtn = document.getElementById("exit-reading");

  toggle.addEventListener("click", () => {
    content.classList.toggle("open");
  });

  // ページ階層を自動判定して「読むのをやめる」表示切替
  const path = window.location.pathname;
  if (path.includes("/works/")) {
    exitBtn.style.display = "block";
    exitBtn.addEventListener("click", () => {
      window.location.href = "/_fmm_tn_/works/select.html";
    });
  }
});
