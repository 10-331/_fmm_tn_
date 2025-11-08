document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  let commonPath = "";

  if (path.includes("/works/main/")) {
    commonPath = "common.html";
  } else if (path.includes("/works/")) {
    commonPath = "main/common.html";
  }

  fetch(commonPath)
    .then(res => res.text())
    .then(data => {
      const commonEl = document.getElementById("common");
      if (commonEl) {
        commonEl.innerHTML = data;
      }

      const menuBtn = document.getElementById("menu-btn");
      const menu = document.getElementById("menu");
      if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
          menu.classList.toggle("show");
        });
      }
    })
    .catch(err => console.error("menu.js error:", err));
});
