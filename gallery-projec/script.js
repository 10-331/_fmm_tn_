fetch('./images/gallery/data.json')
  .then(res => res.json())
  .then(data => {
    const gallery = document.getElementById("gallery");

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="./images/gallery/${item.file}">
        <div class="meta">
          <div>${item.title}</div>
          <div>${item.text}</div>
        </div>
      `;

      gallery.appendChild(card);
    });
  });