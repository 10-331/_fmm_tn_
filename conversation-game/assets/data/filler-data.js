const fillerData = {
  meta: {
    characterId: "filler",
    displayName: "フィラー",
    endingMessage: "聞きたいことはそれだけ？　もういいかな。"
  },

  scenes: [
    {
      id: "s001",
      intro: [
        "……何？",
        "よく会うね。偶然？",
        "また来たんだ。/n別に。変な人、って思って"
      ],
      topics: [
        {
          id: "q001",
          label: "神様っていると思う？",
          answers: [
            "……なんで？",
            "……さあ。",
            "信じてたよ。"
          ]
        },
        {
          id: "q002",
          label: "怖いものはある？",
          answers: [
            "貴方が懲りずに話しかけてくることとか？",
            "そんなこと聞いてどうするの？",
            "あるって言ったら、助けてくれるの？"
          ]
        }
      ],
      nextSceneCondition: {
        minTopicsAsked: 1
      },
      outro: "……他には。"
    },

    {
      id: "s002",
      intro: [
        "少しだけ視線が逸れる。",
        "それでも、帰れとは言わない。"
      ],
      topics: [
        {
          id: "q003",
          label: "ちゃんと眠れてる？",
          answers: [
            "生活できる程度にはね",
            "任務が立て込んでるから、眠れない日もあるかな"
          ]
        },
        {
          id: "q004",
          label: "誰かと話すのは嫌い？",
          answers: [
            "くだらない時間だとは思うよ",
            "別に、嫌いではないかな",
            "……貴方と話していて、嫌な気はしてないよ。/nあは、嘘だよ"
          ]
        }
      ],
      nextSceneCondition: {
        minTopicsAsked: 1
      },
      outro: "……そういうこと、聞くんだ。"
    },

    {
      id: "s003",
      intro: [
        "沈黙が落ちる。",
        "けれど、その沈黙はもうさっきほど硬くない。"
      ],
      topics: [
        {
          id: "q005",
          label: "ここに来てよかった？",
          answers: [
            "……別に。",
            "悪くはない。",
            "来なかったら、たぶんもう少し静かだった。"
          ]
        },
        {
          id: "q006",
          label: "また話してもいい？",
          answers: [
            "好きにすれば。",
            "……時間が合えば。",
            "また会えたらいいね"
          ]
        }
      ],
      nextSceneCondition: {
        minTopicsAsked: 1
      },
      outro: "……もういいよ"
    }
  ]
};
