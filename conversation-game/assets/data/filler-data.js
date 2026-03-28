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
        "来ると思わなかった。"
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
            "ない。そういうものは、持たない方が楽だから。",
            "……なくはない。でも、言う必要はない。"
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
            "お前が来るなら、追い返しはしない。"
          ]
        }
      ],
      nextSceneCondition: {
        minTopicsAsked: 1
      },
      outro: "……もういいだろ。"
    }
  ]
};
