document.addEventListener("DOMContentLoaded", () => {
  fetch("../main/common.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("common").innerHTML = data;
      const menuBtn = document.getElementById("menu-btn");
      const menu = document.getElementById("menu");
      if (menuBtn && menu) {
        menuBtn.addEventListener("click", () => {
          menu.classList.toggle("show");
        });
      }
    });
});
