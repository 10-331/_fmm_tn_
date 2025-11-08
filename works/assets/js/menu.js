document.addEventListener("DOMContentLoaded", () => {
  fetch("data/common.html")
    .then(res => {
      if (!res.ok) throw new Error("common.html not found");
      return res.text();
    })
    .then(data => {
      const commonEl = document.getElementById("common");
      if (commonEl) commonEl.innerHTML = data;

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
