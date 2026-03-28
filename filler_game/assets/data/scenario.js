const scenario = [
  {
    id: "s001",
    bg: "./assets/img/room_morning.jpg",
    name: "",
    text: "目が覚めた時、部屋はまだ白んだばかりだった。\n端末の通知ランプだけが、先に起きている。",
    next: "s002",
    notice: ""
  },
  {
    id: "s002",
    bg: "./assets/img/room_morning.jpg",
    name: "フィラー",
    text: "……朝。",
    next: "s003"
  },
  {
    id: "s003",
    bg: "./assets/img/room_morning.jpg",
    name: "",
    text: "枕元に置いた端末が、遅れて短く震えた。",
    next: null,
    notice: "新規依頼を受信しました",
    choices: [
      { label: "通知を開く", next: "s010" },
      { label: "先に顔を洗う", next: "s004" }
    ]
  },
  {
    id: "s004",
    bg: "./assets/img/room_morning.jpg",
    name: "フィラー",
    text: "今じゃなくても、消えるものでもない。",
    next: "s005"
  },
  {
    id: "s005",
    bg: "./assets/img/room_morning.jpg",
    name: "",
    text: "洗面台の鏡は、寝起きの顔をそのまま返してくる。\n見慣れているはずなのに、ときどき少しだけ遠い。",
    next: "s010"
  },
  {
    id: "s010",
    bg: "./assets/img/device.jpg",
    name: "SYSTEM",
    text: "対象個体の所在を確認。\n回収、または処理を実施してください。\n詳細ログを添付します。",
    next: null,
    choices: [
      { label: "詳細ログを確認する", next: "s011" },
      { label: "端末を閉じる", next: "s012" }
    ]
  },
  {
    id: "s011",
    bg: "./assets/img/device.jpg",
    name: "SYSTEM",
    text: "対象は市街地外れの空き施設に滞在中。\n外観は人間と大差なし。\n接触時は記録を推奨。",
    next: "s020"
  },
  {
    id: "s012",
    bg: "./assets/img/device.jpg",
    name: "フィラー",
    text: "……見なくても、やることは同じ。",
    next: "s020"
  },
  {
    id: "s020",
    bg: "./assets/img/street_evening.jpg",
    name: "",
    text: "現地へ向かう途中、風の音に混じって、何かが鳴った気がした。\n鈴のような、乾いた音だった。",
    next: null,
    choices: [
      { label: "気のせいとして歩く", next: "s021a" },
      { label: "少しだけ立ち止まる", next: "s021b" }
    ]
  },
  {
    id: "s021a",
    bg: "./assets/img/street_evening.jpg",
    name: "フィラー",
    text: "そんなものに意味はない。",
    next: "s030"
  },
  {
    id: "s021b",
    bg: "./assets/img/street_evening.jpg",
    name: "",
    text: "振り返っても、そこには誰もいなかった。\nただ、胸の奥だけが妙にざわついている。",
    next: "s030"
  },
  {
    id: "s030",
    bg: "./assets/img/street_evening.jpg",
    name: "対象個体",
    text: "……あなた、S局の人でしょう。",
    next: null,
    choices: [
      { label: "肯定する", next: "s031a" },
      { label: "答えない", next: "s031b" }
    ]
  },
  {
    id: "s031a",
    bg: "./assets/img/street_evening.jpg",
    name: "フィラー",
    text: "そう。確認が終われば、すぐ終わる。",
    next: "s040"
  },
  {
    id: "s031b",
    bg: "./assets/img/street_evening.jpg",
    name: "",
    text: "答えないまま近づくと、対象はそれだけで理解したようだった。",
    next: "s040"
  },
  {
    id: "s040",
    bg: "./assets/img/street_evening.jpg",
    name: "対象個体",
    text: "痛いですか。",
    next: null,
    choices: [
      { label: "すぐ終わるとだけ言う", next: "s041a" },
      { label: "何も言わない", next: "s041b" }
    ]
  },
  {
    id: "s041a",
    bg: "./assets/img/street_evening.jpg",
    name: "フィラー",
    text: "……すぐ終わる。",
    next: "s050"
  },
  {
    id: "s041b",
    bg: "./assets/img/street_evening.jpg",
    name: "",
    text: "沈黙のまま、端末のログだけが進んでいく。",
    next: "s050"
  },
  {
    id: "s050",
    bg: "./assets/img/room_night.jpg",
    name: "",
    text: "帰宅した部屋は、朝と同じ形をしていた。\n違うのは、端末の通知が消えていることだけだった。",
    next: "s051",
    notice: "任務報告を送信しました"
  },
  {
    id: "s051",
    bg: "./assets/img/room_night.jpg",
    name: "フィラー",
    text: "……寝れば、終わる。",
    next: "s052"
  },
  {
    id: "s052",
    bg: "./assets/img/room_night.jpg",
    name: "",
    text: "灯りを落としたあとで、もう一度だけ、鈴の音がした気がした。",
    next: null
  }
];