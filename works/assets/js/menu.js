document.addEventListener("DOMContentLoaded", () => {
  fetch("common.html")
    .then(res => res.text())
    .then(data => {
      const commonEl = document.getElementById("common");
      if (commonEl) commonEl.innerHTML = data;

      const btn = document.getElementById("menu-btn");
      const menu = document.getElementById("menu");
      if (btn && menu) {
        btn.addEventListener("click", () => {
          menu.classList.toggle("show");
        });
      }
    })
    .catch(err => console.error("menu.js error:", err));
});
