const DB_NAME = 'heightComparisonDB';
const STORE_NAME = 'characters';
const DB_VERSION = 1;

const form = document.getElementById('characterForm');
const nameInput = document.getElementById('name');
const heightInput = document.getElementById('height');
const colorInput = document.getElementById('labelColor');
const imageInput = document.getElementById('image');
const sortModeInput = document.getElementById('sortMode');
const maxScaleInput = document.getElementById('maxScale');
const stage = document.getElementById('comparisonStage');
const list = document.getElementById('characterList');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const clearBtn = document.getElementById('clearBtn');
const characterItemTemplate = document.getElementById('characterItemTemplate');

let db;
let characters = [];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(storeMode = 'readonly') {
  return db.transaction(STORE_NAME, storeMode).objectStore(STORE_NAME);
}

function getAllCharacters() {
  return new Promise((resolve, reject) => {
    const request = tx().getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function saveCharacter(character) {
  return new Promise((resolve, reject) => {
    const request = tx('readwrite').put(character);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteCharacter(id) {
  return new Promise((resolve, reject) => {
    const request = tx('readwrite').delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearCharacters() {
  return new Promise((resolve, reject) => {
    const request = tx('readwrite').clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function sortCharacters(items) {
  const mode = sortModeInput.value;
  const copied = [...items];

  if (mode === 'heightAsc') {
    copied.sort((a, b) => a.height - b.height || a.createdAt - b.createdAt);
  } else if (mode === 'heightDesc') {
    copied.sort((a, b) => b.height - a.height || a.createdAt - b.createdAt);
  } else {
    copied.sort((a, b) => a.createdAt - b.createdAt);
  }

  return copied;
}

function renderScale() {
  const maxScale = Number(maxScaleInput.value);
  const groundOffset = 48;
  const stageHeight = stage.clientHeight;
  const usableHeight = stageHeight - groundOffset - 20;

  stage.innerHTML = '';

  for (let cm = 0; cm <= maxScale; cm += 10) {
    const ratio = cm / maxScale;
    const y = stageHeight - groundOffset - usableHeight * ratio;

    const line = document.createElement('div');
    line.className = `scale-line${cm % 50 === 0 ? ' major' : ''}`;
    line.style.top = `${y}px`;

    const label = document.createElement('div');
    label.className = 'scale-label';
    label.style.top = `${y}px`;
    label.textContent = `${cm}`;

    stage.appendChild(line);
    stage.appendChild(label);
  }

  const ground = document.createElement('div');
  ground.className = 'ground-line';
  stage.appendChild(ground);

  return { maxScale, usableHeight };
}

function renderCharacters() {
  const { maxScale, usableHeight } = renderScale();
  const ordered = sortCharacters(characters);
  const row = document.createElement('div');
  row.className = 'sprite-row';

  ordered.forEach((character) => {
    const figure = document.createElement('div');
    figure.className = 'character-figure';

    const img = document.createElement('img');
    img.src = character.imageData;
    img.alt = character.name;
    const pxHeight = Math.max(40, Math.round((character.height / maxScale) * usableHeight));
    img.style.height = `${pxHeight}px`;

    const tag = document.createElement('div');
    tag.className = 'height-tag';
    tag.style.background = character.labelColor;
    tag.innerHTML = `<strong>${character.height}cm</strong><span>${character.name}</span>`;

    const nameLabel = document.createElement('div');
    nameLabel.className = 'name-label';
    nameLabel.textContent = character.name;

    figure.appendChild(tag);
    figure.appendChild(img);
    figure.appendChild(nameLabel);
    row.appendChild(figure);
  });

  stage.appendChild(row);
}

function renderList() {
  if (!characters.length) {
    list.className = 'character-list empty';
    list.textContent = 'まだ登録されていません。';
    return;
  }

  list.className = 'character-list';
  list.innerHTML = '';

  sortCharacters(characters).forEach((character) => {
    const fragment = characterItemTemplate.content.cloneNode(true);
    const item = fragment.querySelector('.character-item');
    const chip = fragment.querySelector('.chip');
    const sub = fragment.querySelector('.meta-sub');
    const removeBtn = fragment.querySelector('.remove-btn');

    chip.textContent = character.name;
    chip.style.setProperty('--chip-color', character.labelColor);
    sub.textContent = `${character.height}cm`;
    removeBtn.addEventListener('click', async () => {
      await deleteCharacter(character.id);
      await refresh();
    });

    list.appendChild(item);
    item.replaceWith(fragment);
  });
}

async function refresh() {
  characters = await getAllCharacters();
  renderCharacters();
  renderList();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const file = imageInput.files[0];
  if (!file) {
    alert('画像を選んでください。');
    return;
  }

  const imageData = await fileToDataURL(file);
  const character = {
    id: crypto.randomUUID(),
    name: nameInput.value.trim(),
    height: Number(heightInput.value),
    labelColor: colorInput.value,
    imageData,
    createdAt: Date.now(),
  };

  await saveCharacter(character);
  form.reset();
  colorInput.value = '#7cc8ff';
  await refresh();
});

maxScaleInput.addEventListener('change', renderCharacters);
sortModeInput.addEventListener('change', () => {
  renderCharacters();
  renderList();
});

exportBtn.addEventListener('click', async () => {
  const data = await getAllCharacters();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'height-comparison-data.json';
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) {
      throw new Error('JSONの形式が不正です。');
    }

    for (const item of imported) {
      if (!item.id) item.id = crypto.randomUUID();
      if (!item.createdAt) item.createdAt = Date.now();
      await saveCharacter(item);
    }

    await refresh();
    importInput.value = '';
  } catch (error) {
    console.error(error);
    alert('JSONの読み込みに失敗しました。形式を確認してください。');
  }
});

clearBtn.addEventListener('click', async () => {
  const ok = confirm('登録したキャラを全部削除します。よければOK。');
  if (!ok) return;
  await clearCharacters();
  await refresh();
});

window.addEventListener('resize', renderCharacters);

(async function init() {
  db = await openDB();
  await refresh();
})();
