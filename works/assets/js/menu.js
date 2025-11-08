document.addEventListener("DOMContentLoaded", () => {
  let prefix = "";

  const path = window.location.pathname;

  if (path.includes("/works/main/")) {
    prefix = "../";
  }
  else if (path.includes("/works/")) {
    prefix = "./";
  }

  fetch(`${prefix}main/common.html`)
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
