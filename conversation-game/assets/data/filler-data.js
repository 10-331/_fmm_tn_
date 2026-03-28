const fillerData = {
  meta: {
    characterId: "filler",
    displayName: "フィラー",
    intro: "……用件は？",
    endingCondition: {
      minUniqueQuestions: 3
    },
    endingMessage: "……もういいだろ。聞きたいことは、それで全部？"
  },
  questions: [
    {
      id: "q001",
      label: "神様っていると思う？",
      answers: [
        "さあ。いるかどうかで、処理が変わるわけじゃない。",
        "……そういうことを考えるのは、あまり好きじゃない。"
      ]
    },
    {
      id: "q002",
      label: "怖いものはある？",
      answers: [
        "ない。そういうものは、持たない方が楽だから。",
        "……なくはない。でも、言う必要はない。"
      ]
    },
    {
      id: "q003",
      label: "ちゃんと眠れてる？",
      answers: [
        "眠る。必要だから。",
        "……最近は、少し浅いかもな。"
      ]
    },
    {
      id: "q004",
      label: "誰かと話すのは嫌い？",
      answers: [
        "別に。必要なら話す。",
        "……好き嫌いで決めてるわけじゃない。"
      ]
    }
  ]
};