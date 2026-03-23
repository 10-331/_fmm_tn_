fetch('./images/gallery/data.json')
  .then(res => res.json())
  .then(data => {
    const gallery = document.getElementById("gallery");

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const title = item.title || item.file;
      const text = item.text || "";

      card.innerHTML = `
        <img src="./images/gallery/${item.file}" alt="${title}">
        <div class="meta">
          <div>${title}</div>
          <div>${text}</div>
        </div>
      `;

      gallery.appendChild(card);
    });
  })
  .catch(err => {
    console.error("JSON読み込みエラー:", err);
  });