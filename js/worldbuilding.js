// worldbuilding.js

// ========== データ（あとでJSON分離してもOK） ==========
const WORLDS = {
  village: {
    label: "因習村",
    meta: "住民数：360 / 状態：NULL（参照不可）",
    bg: "./assets/bg_village.jpg",
    spots: [
      {
        id: "kamisama",
        title: "かみさまのおうち",
        kicker: "Belief Node",
        x: 62, y: 38, r: 26, // 位置(%), 半径(px)
        tags: ["#桜", "#祠", "#信仰"],
        body: [
          "桜のような大樹。",
          "傍らに小さな祠がそびえる。",
          "村人はここに手を合わせるのが当然だった。"
        ],
        note: "視界が白む。輪郭だけが残る。"
      },
      {
        id: "home",
        title: "■■家",
        kicker: "Home Record",
        x: 28, y: 52, r: 24,
        tags: ["#戸籍", "#実家", "#欠落"],
        body: [
          "本当の実家。",
          "神隠し前は思い出せていた。",
          "今は名前も含め、ほとんどが■■になっている。"
        ],
        note: "参照キーが見つからない。"
      },
      {
        id: "kura",
        title: "蔵",
        kicker: "Correction Facility",
        x: 72, y: 72, r: 22,
        tags: ["#タブー", "#隔離", "#放置"],
        body: [
          "『疑う』ことがタブーだった。",
          "ここは罰というより、疑問を沈めるための隔離。",
          "暗さと匂いと沈黙だけが残る。"
        ],
        note: "音が遠ざかる。"
      }
    ]
  },

  s: {
    label: "S局",
    meta: "回収対象：変異体 / 手続：初期化・再放出 / 例外：破壊",
    bg: "./assets/bg_s.jpg",
    spots: [
      {
        id: "protocol",
        title: "回収プロトコル",
        kicker: "Procedure",
        x: 52, y: 34, r: 26,
        tags: ["#回収", "#初期化", "#再放出"],
        body: [
          "変異体は問答無用で回収対象。",
          "現物回収が推奨される。",
          "人権はない。物として処理される。"
        ],
        note: "ログは淡々と積み上がる。"
      }
      // 必要に応じて増やす
    ]
  },

  hama: {
    label: "HAMA",
    meta: "2054冬〜 / 近未来都市 / 現在は平凡な生活",
    bg: "./assets/bg_hama.jpg",
    spots: [
      {
        id: "cafe",
        title: "カフェ",
        kicker: "Encounter",
        x: 60, y: 58, r: 26,
        tags: ["#焙煎", "#出会い", "#現在"],
        body: [
          "焙煎の香り。",
          "名前も知らないのに、胸がきゅっとする。",
          "記憶は曖昧でも、反応だけが残る。"
        ],
        note: "明るい光が、やけに鮮明だ。"
      }
    ]
  }
};

// ========== 状態 ==========
const state = {
  worldKey: "village",
  openSpotId: null
};

const LS_KEY = "wb_read_spots_v1"; // 既読管理
function loadRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { return {}; }
}
function saveRead(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}
let readMap = loadRead(); // { "village:kamisama": true, ... }

// ========== DOM ==========
const sceneEl = document.getElementById("scene");
const hotspotsEl = document.getElementById("hotspots");
const metaLineEl = document.getElementById("metaLine");
const panelEl = document.getElementById("panel");
const panelKickerEl = document.getElementById("panelKicker");
const panelTitleEl = document.getElementById("panelTitle");
const panelBodyEl = document.getElementById("panelBody");
const panelFootEl = document.getElementById("panelFoot");
const panelCloseEl = document.getElementById("panelClose");

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.world;
    setWorld(key);
  });
});

panelCloseEl.addEventListener("click", () => closePanel());

// ========== 描画 ==========
function setWorld(worldKey) {
  if (!WORLDS[worldKey]) return;

  state.worldKey = worldKey;
  state.openSpotId = null;

  // タブUI
  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("is-active", b.dataset.world === worldKey);
  });

  // スキン
  document.body.classList.remove("skin-village", "skin-s", "skin-hama");
  document.body.classList.add(`skin-${worldKey}`);

  // 背景
  sceneEl.style.setProperty("--bg-url", `url('${WORLDS[worldKey].bg}')`);

  // メタ
  metaLineEl.textContent = WORLDS[worldKey].meta;

  // ホットスポット描画
  renderSpots();

  // パネル初期化
  closePanel(true);
}

function renderSpots() {
  hotspotsEl.innerHTML = "";
  const world = WORLDS[state.worldKey];

  for (const spot of world.spots) {
    const key = `${state.worldKey}:${spot.id}`;
    const isRead = !!readMap[key];

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hotspot" + (isRead ? " is-read" : "");
    btn.style.left = `${spot.x}%`;
    btn.style.top = `${spot.y}%`;
    btn.style.setProperty("--r", `${spot.r}px`);
    btn.setAttribute("aria-label", spot.title);

    btn.addEventListener("click", () => openSpot(spot.id));
    hotspotsEl.appendChild(btn);
  }
}

function openSpot(spotId) {
  const world = WORLDS[state.worldKey];
  const spot = world.spots.find(s => s.id === spotId);
  if (!spot) return;

  state.openSpotId = spotId;

  // 既読
  const key = `${state.worldKey}:${spot.id}`;
  readMap[key] = true;
  saveRead(readMap);

  // 再描画（既読反映）
  renderSpots();

  // パネル表示
  panelKickerEl.textContent = spot.kicker || "";
  panelTitleEl.textContent = spot.title;

  // 本文
  const lines = Array.isArray(spot.body) ? spot.body : [String(spot.body || "")];
  panelBodyEl.innerHTML = lines.map(t => `<p>${escapeHtml(t)}</p>`).join("");

  // タグ・注記
  const tags = (spot.tags || []).join(" ");
  panelFootEl.innerHTML = `
    <div class="tags">${escapeHtml(tags)}</div>
    <div class="note">${escapeHtml(spot.note || "")}</div>
  `.trim();

  panelEl.classList.add("is-open");
}

function closePanel(silent = false) {
  state.openSpotId = null;
  panelEl.classList.remove("is-open");
  if (!silent) {
    panelKickerEl.textContent = "";
    panelTitleEl.textContent = "断片";
    panelBodyEl.innerHTML = `<p class="muted">ホットスポットを選択すると、ここに断片が表示されます。</p>`;
    panelFootEl.innerHTML = "";
  }
}

// XSS対策（最低限）
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// 初期化
setWorld("village");