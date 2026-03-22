const STORAGE_KEY = "height-comparison-tool-v4";
const PX_PER_CM = 4;
const BASE_CHARACTER_WIDTH = 136;

const state = {
  characters: [],
  maxCm: 200
};

const el = {
  nameInput: document.getElementById("nameInput"),
  heightInput: document.getElementById("heightInput"),
  labelColorInput: document.getElementById("labelColorInput"),
  imageInput: document.getElementById("imageInput"),
  insertModeInput: document.getElementById("insertModeInput"),
  addButton: document.getElementById("addButton"),
  saveImageButton: document.getElementById("saveImageButton"),
  exportButton: document.getElementById("exportButton"),
  importInput: document.getElementById("importInput"),
  clearButton: document.getElementById("clearButton"),
  characterList: document.getElementById("characterList"),
  compareStage: document.getElementById("compareStage"),
  maxCmSelect: document.getElementById("maxCmSelect"),
  countBadge: document.getElementById("countBadge")
};

init();

function init() {
  loadState();
  bindEvents();
  renderAll();
}

function bindEvents() {
  el.addButton.addEventListener("click", handleAddCharacter);
  el.saveImageButton.addEventListener("click", saveStageAsImage);
  el.exportButton.addEventListener("click", exportJson);
  el.importInput.addEventListener("change", importJson);
  el.clearButton.addEventListener("click", clearAll);
  el.maxCmSelect.addEventListener("change", () => {
    state.maxCm = Number(el.maxCmSelect.value);
    saveState();
    renderStage();
  });
}

async function handleAddCharacter() {
  const name = el.nameInput.value.trim();
  const height = Number(el.heightInput.value);
  const labelColor = el.labelColorInput.value;
  const file = el.imageInput.files?.[0] || null;
  const insertMode = el.insertModeInput.value;

  if (!name) {
    alert("名前を入力してください。");
    return;
  }

  if (!height || height <= 0) {
    alert("身長を正しく入力してください。");
    return;
  }

  let imageData = "";
  let imageMeta = { width: 0, height: 0 };

  try {
    if (file) {
      const prepared = await prepareImageFile(file);
      imageData = prepared.dataUrl;
      imageMeta = {
        width: prepared.width,
        height: prepared.height
      };
    }

    const character = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name,
      height,
      labelColor,
      imageData,
      imageMeta,
      correction: {
        scale: 1,
        offsetY: 0,
        offsetX: 0
      },
      createdAt: Date.now()
    };

    state.characters.push(character);
    sortCharacters(insertMode);
    saveState();
    renderAll();
    resetForm();
  } catch (error) {
    console.error("画像処理エラー:", error);
    alert(`画像の読み込みに失敗しました: ${error?.message || error}`);
  }
}

function sortCharacters(mode) {
  if (mode === "heightAsc") {
    state.characters.sort((a, b) => a.height - b.height);
  } else if (mode === "heightDesc") {
    state.characters.sort((a, b) => b.height - a.height);
  }
}

function resetForm() {
  el.nameInput.value = "";
  el.heightInput.value = "160";
  el.imageInput.value = "";
}

function renderAll() {
  el.maxCmSelect.value = String(state.maxCm);
  renderStage();
  renderCharacterList();
  renderCount();
}

function renderCount() {
  el.countBadge.textContent = `${state.characters.length}人`;
}

function renderStage() {
  const stageHeight = state.maxCm * PX_PER_CM;
  const baseWidth = Math.max(900, 120 + state.characters.length * (BASE_CHARACTER_WIDTH + 18));

  el.compareStage.innerHTML = "";
  el.compareStage.style.height = `${stageHeight + 44}px`;
  el.compareStage.style.minWidth = `${baseWidth}px`;

  for (let cm = 0; cm <= state.maxCm; cm += 10) {
    const y = stageHeight - cm * PX_PER_CM;

    const line = document.createElement("div");
    line.className = `guide-line ${cm % 50 === 0 ? "major" : ""}`;
    line.style.top = `${y}px`;
    el.compareStage.appendChild(line);

    const label = document.createElement("div");
    label.className = "guide-label";
    label.style.top = `${y}px`;
    label.textContent = `${cm}`;
    el.compareStage.appendChild(label);
  }

  const ground = document.createElement("div");
  ground.className = "ground-line";
  el.compareStage.appendChild(ground);

  const strip = document.createElement("div");
  strip.className = "characters-strip";
  el.compareStage.appendChild(strip);

  state.characters.forEach((character) => {
    strip.appendChild(createCharacterElement(character));
  });
}

function createCharacterElement(character) {
  const wrapper = document.createElement("div");
  wrapper.className = "character";

  const visual = document.createElement("div");
  visual.className = "character-visual";
  visual.style.setProperty("--offset-x", `${character.correction.offsetX || 0}px`);
  visual.style.bottom = `${character.correction.offsetY || 0}px`;

  const label = document.createElement("div");
  label.className = "character-label";
  label.style.background = character.labelColor;

  const { mainTextColor, subTextColor } = getLabelTextColors(character.labelColor);
  label.style.setProperty("--label-text", mainTextColor);
  label.style.setProperty("--label-subtext", subTextColor);

  label.innerHTML = `
    <span class="cm">${escapeHtml(character.height)}cm</span>
    <span class="name">${escapeHtml(character.name)}</span>
  `;

  const scale = Number(character.correction.scale ?? 1);
  const visualHeight = character.height * PX_PER_CM * scale;

  visual.appendChild(label);

  if (character.imageData) {
    const img = document.createElement("img");
    img.src = character.imageData;
    img.alt = character.name;
    img.style.height = `${visualHeight}px`;
    visual.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder-figure";
    placeholder.style.height = `${Math.max(40, visualHeight - 22)}px`;
    visual.appendChild(placeholder);
  }

  wrapper.appendChild(visual);
  return wrapper;
}

function renderCharacterList() {
  el.characterList.innerHTML = "";

  if (state.characters.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "まだキャラが登録されていません。";
    el.characterList.appendChild(empty);
    return;
  }

  state.characters.forEach((character) => {
    const card = document.createElement("div");
    card.className = "char-card";

    const head = document.createElement("div");
    head.className = "char-card-head";

    const titleArea = document.createElement("div");
    const hasImageText = character.imageData ? "画像あり" : "画像なし";
    titleArea.innerHTML = `
      <div class="char-card-title">${escapeHtml(character.name)}</div>
      <div class="char-card-sub">${escapeHtml(character.height)}cm / ${hasImageText}</div>
    `;

    const actions = document.createElement("div");
    actions.className = "char-card-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "mini-btn";
    editBtn.textContent = "修正モード";
    editBtn.addEventListener("click", () => {
      editPanel.classList.toggle("open");
    });

    const upBtn = document.createElement("button");
    upBtn.className = "mini-btn";
    upBtn.textContent = "↑";
    upBtn.addEventListener("click", () => moveCharacter(character.id, -1));

    const downBtn = document.createElement("button");
    downBtn.className = "mini-btn";
    downBtn.textContent = "↓";
    downBtn.addEventListener("click", () => moveCharacter(character.id, 1));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "mini-btn delete";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => removeCharacter(character.id));

    actions.append(editBtn, upBtn, downBtn, deleteBtn);
    head.append(titleArea, actions);

    const editPanel = createEditPanel(character);

    card.append(head, editPanel);
    el.characterList.appendChild(card);
  });
}

function createEditPanel(character) {
  const panel = document.createElement("div");
  panel.className = "edit-panel";

  const editGrid = document.createElement("div");
  editGrid.className = "edit-grid";

  const nameField = document.createElement("label");
  nameField.className = "field";
  nameField.innerHTML = `
    <span>名前</span>
    <input type="text" value="${escapeAttribute(character.name)}" />
  `;
  const nameInput = nameField.querySelector("input");
  nameInput.addEventListener("change", () => {
    updateCharacter(character.id, { name: nameInput.value.trim() || character.name });
  });

  const heightField = document.createElement("label");
  heightField.className = "field";
  heightField.innerHTML = `
    <span>身長(cm)</span>
    <input type="number" min="1" max="300" value="${escapeAttribute(character.height)}" />
  `;
  const heightInput = heightField.querySelector("input");
  heightInput.addEventListener("change", () => {
    const value = Number(heightInput.value);
    if (!value || value <= 0) {
      heightInput.value = String(character.height);
      return;
    }
    updateCharacter(character.id, { height: value });
  });

  const colorField = document.createElement("label");
  colorField.className = "field";
  colorField.innerHTML = `
    <span>ラベル色</span>
    <input type="color" value="${escapeAttribute(character.labelColor || "#f2df9b")}" />
  `;
  const colorInput = colorField.querySelector("input");
  colorInput.addEventListener("input", () => {
    updateCharacter(character.id, { labelColor: colorInput.value });
  });

  const imageRow = document.createElement("div");
  imageRow.className = "edit-image-row";

  const imageLabel = document.createElement("label");
  imageLabel.className = "field";
  imageLabel.innerHTML = `
    <span>画像を追加・変更</span>
    <input type="file" accept="image/*" />
  `;
  const imageInput = imageLabel.querySelector("input");

  const imageStatus = document.createElement("div");
  imageStatus.className = "image-status";
  imageStatus.textContent = character.imageData ? "現在: 画像あり" : "現在: 画像なし";

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    try {
      const prepared = await prepareImageFile(file);
      updateCharacter(character.id, {
        imageData: prepared.dataUrl,
        imageMeta: {
          width: prepared.width,
          height: prepared.height
        }
      });
    } catch (error) {
      console.error("画像差し替えエラー:", error);
      alert(`画像の読み込みに失敗しました: ${error?.message || error}`);
    } finally {
      imageInput.value = "";
    }
  });

  const imageActions = document.createElement("div");
  imageActions.className = "row-actions";

  const removeImageBtn = document.createElement("button");
  removeImageBtn.className = "mini-btn";
  removeImageBtn.textContent = "画像を削除";
  removeImageBtn.addEventListener("click", () => {
    updateCharacter(character.id, {
      imageData: "",
      imageMeta: { width: 0, height: 0 }
    });
  });

  imageActions.append(removeImageBtn);
  imageRow.append(imageLabel, imageStatus, imageActions);

  const scaleValue = Number(character.correction.scale ?? 1).toFixed(2);
  const offsetYValue = Number(character.correction.offsetY ?? 0);
  const offsetXValue = Number(character.correction.offsetX ?? 0);

  const scaleRow = createRangeRow(
    "見た目補正スケール",
    0.7,
    1.3,
    0.01,
    Number(scaleValue),
    (valueEl, input) => {
      valueEl.textContent = Number(input.value).toFixed(2);
      updateCharacterCorrection(character.id, { scale: Number(input.value) });
    }
  );

  const offsetYRow = createRangeRow(
    "足元の上下補正",
    -120,
    120,
    1,
    offsetYValue,
    (valueEl, input) => {
      valueEl.textContent = `${input.value}px`;
      updateCharacterCorrection(character.id, { offsetY: Number(input.value) });
    },
    "px"
  );

  const offsetXRow = createRangeRow(
    "左右位置補正",
    -80,
    80,
    1,
    offsetXValue,
    (valueEl, input) => {
      valueEl.textContent = `${input.value}px`;
      updateCharacterCorrection(character.id, { offsetX: Number(input.value) });
    },
    "px"
  );

  const resetBtn = document.createElement("button");
  resetBtn.className = "mini-btn";
  resetBtn.textContent = "補正をリセット";
  resetBtn.addEventListener("click", () => {
    updateCharacterCorrection(character.id, {
      scale: 1,
      offsetY: 0,
      offsetX: 0
    });
    renderAll();
  });

  const note = document.createElement("div");
  note.className = "note";
  note.textContent = "画像なしでも登録できます。スケールは見た目補正なので、基本は自動トリミングと足元補正を優先するのがおすすめです。";

  editGrid.append(nameField, heightField, colorField);
  panel.append(editGrid, imageRow, scaleRow, offsetYRow, offsetXRow, resetBtn, note);
  return panel;
}

function createRangeRow(labelText, min, max, step, value, onInput, unit = "") {
  const row = document.createElement("div");
  row.className = "range-row";

  const label = document.createElement("label");
  const title = document.createElement("span");
  title.textContent = labelText;

  const valueEl = document.createElement("span");
  valueEl.textContent = unit ? `${value}${unit}` : String(value);

  label.append(title, valueEl);

  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);

  input.addEventListener("input", () => onInput(valueEl, input));

  row.append(label, input);
  return row;
}

function updateCharacter(id, patch) {
  const character = state.characters.find((item) => item.id === id);
  if (!character) return;

  Object.assign(character, patch);
  saveState();
  renderAll();
}

function updateCharacterCorrection(id, patch) {
  const character = state.characters.find((item) => item.id === id);
  if (!character) return;

  character.correction = {
    scale: Number(character.correction.scale ?? 1),
    offsetY: Number(character.correction.offsetY ?? 0),
    offsetX: Number(character.correction.offsetX ?? 0),
    ...patch
  };

  saveState();
  renderStage();
}

function moveCharacter(id, direction) {
  const index = state.characters.findIndex((item) => item.id === id);
  if (index < 0) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= state.characters.length) return;

  const temp = state.characters[index];
  state.characters[index] = state.characters[targetIndex];
  state.characters[targetIndex] = temp;

  saveState();
  renderAll();
}

function removeCharacter(id) {
  state.characters = state.characters.filter((item) => item.id !== id);
  saveState();
  renderAll();
}

function clearAll() {
  if (!confirm("登録キャラをすべて削除します。")) return;
  state.characters = [];
  saveState();
  renderAll();
}

async function saveStageAsImage() {
  if (!state.characters.length) {
    alert("保存するキャラがいません。");
    return;
  }

  if (typeof html2canvas === "undefined") {
    alert("画像保存ライブラリの読み込みに失敗しました。");
    return;
  }

  try {
    const shell = document.createElement("div");
    shell.className = "save-capture-shell";

    const title = document.createElement("div");
    title.className = "save-capture-title";
    title.textContent = "Height Comparison";

    const sub = document.createElement("div");
    sub.className = "save-capture-sub";
    sub.textContent = `Max ${state.maxCm}cm / ${state.characters.length} characters`;

    const stageClone = el.compareStage.cloneNode(true);
    stageClone.style.minWidth = `${el.compareStage.scrollWidth}px`;
    stageClone.style.width = `${el.compareStage.scrollWidth}px`;

    shell.append(title, sub, stageClone);

    shell.style.position = "fixed";
    shell.style.left = "-100000px";
    shell.style.top = "0";
    shell.style.zIndex = "-1";
    document.body.appendChild(shell);

    const canvas = await html2canvas(shell, {
      backgroundColor: "#f9fafc",
      scale: 2,
      useCORS: true
    });

    shell.remove();

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fileName =
      `height-comparison-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.png`;

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("画像の生成に失敗しました。");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("画像保存エラー:", error);
    alert(`画像の保存に失敗しました: ${error?.message || error}`);
  }
}

function exportJson() {
  const dataStr = JSON.stringify(
    {
      version: 4,
      maxCm: state.maxCm,
      characters: state.characters
    },
    null,
    2
  );

  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "height-comparison-data.json";
  a.click();

  URL.revokeObjectURL(url);
}

async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed.characters)) {
      throw new Error("characters がありません");
    }

    state.characters = parsed.characters.map(normalizeCharacter);
    state.maxCm = Number(parsed.maxCm) || 200;
    saveState();
    renderAll();
  } catch (error) {
    console.error(error);
    alert("JSONの読み込みに失敗しました。");
  } finally {
    el.importInput.value = "";
  }
}

function normalizeCharacter(character) {
  return {
    id: character.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    name: character.name || "名称未設定",
    height: Number(character.height) || 160,
    labelColor: character.labelColor || "#f2df9b",
    imageData: character.imageData || "",
    imageMeta: character.imageMeta || { width: 0, height: 0 },
    correction: {
      scale: Number(character.correction?.scale ?? 1),
      offsetY: Number(character.correction?.offsetY ?? 0),
      offsetX: Number(character.correction?.offsetX ?? 0)
    },
    createdAt: character.createdAt || Date.now()
  };
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 4,
      maxCm: state.maxCm,
      characters: state.characters
    })
  );
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    state.maxCm = Number(parsed.maxCm) || 200;
    state.characters = Array.isArray(parsed.characters)
      ? parsed.characters.map(normalizeCharacter)
      : [];
  } catch (error) {
    console.error("保存データの読み込みに失敗:", error);
    state.characters = [];
    state.maxCm = 200;
  }
}

async function prepareImageFile(file) {
  const originalImageData = await fileToDataURL(file);
  const trimmed = await trimTransparentImage(originalImageData);
  return trimmed;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function trimTransparentImage(dataUrl) {
  const img = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  let top = null;
  let bottom = null;
  let left = null;
  let right = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 8) {
        if (top === null) top = y;
        bottom = y;
        if (left === null || x < left) left = x;
        if (right === null || x > right) right = x;
      }
    }
  }

  if (top === null || left === null || right === null || bottom === null) {
    return {
      dataUrl,
      width: img.width,
      height: img.height
    };
  }

  const trimmedWidth = right - left + 1;
  const trimmedHeight = bottom - top + 1;

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;

  const trimmedCtx = trimmedCanvas.getContext("2d");
  trimmedCtx.drawImage(
    canvas,
    left, top, trimmedWidth, trimmedHeight,
    0, 0, trimmedWidth, trimmedHeight
  );

  return {
    dataUrl: trimmedCanvas.toDataURL("image/png"),
    width: trimmedWidth,
    height: trimmedHeight
  };
}

function getLabelTextColors(bgColor) {
  const hex = String(bgColor || "").replace("#", "");

  if (![3, 6].includes(hex.length)) {
    return {
      mainTextColor: "#ffffff",
      subTextColor: "rgba(255,255,255,0.92)"
    };
  }

  const normalized = hex.length === 3
    ? hex.split("").map((c) => c + c).join("")
    : hex;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.72) {
    return {
      mainTextColor: "#4b5568",
      subTextColor: "#6b7486"
    };
  }

  if (luminance > 0.55) {
    return {
      mainTextColor: "#445063",
      subTextColor: "#667388"
    };
  }

  return {
    mainTextColor: "#ffffff",
    subTextColor: "rgba(255,255,255,0.92)"
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
