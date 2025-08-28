export interface OnboardingDialogue {
  id: number;
  text: string;
  isWelcome: boolean;
  showMissionCard?: boolean;
  showMissionDetails?: boolean;
}

export const onboardingDialogues: OnboardingDialogue[] = [
  {
    id: 1,
    text: "",
    isWelcome: true,
  },
  {
    id: 2,
    text: "ここは、アクションボード。\nチームはやまを応援する者たちが集いし場所。\n\nわしは、このアクションボードの主、アクション仙人じゃ。",
    isWelcome: false,
  },
  {
    id: 3,
    text: "このアプリではの、チラシ配り、イベント手伝い、ポスター貼り… あらゆる「応援のカタチ」を、気軽に、楽しく、こなせるようになっとる。",
    isWelcome: false,
  },
  {
    id: 4,
    text: "何をすればええか分からん？心配いらん。ちょいとした気軽なアクションも揃えとるから、初めてでも心配いらんぞい。",
    isWelcome: false,
  },
  {
    id: 5,
    text: "ではさっそく、初めてのミッションじゃぞ。\nまずは、チームはやまの公式サイトを見て、わしらの活動について学ぶんじゃ。",
    isWelcome: false,
  },
  {
    id: 6,
    text: "「チームはやま公式サイトを見てみよう！」\n\nこのミッションでは、ボタンを押すだけで自動的にミッションクリアじゃ！\n\n下のボタンから挑戦してみるとええ！",
    isWelcome: false,
    showMissionDetails: true,
  },
  {
    id: 7,
    text: "うむ、上出来じゃ！\n\n実際のミッションでは、提出すると経験値がもらえて、レベルアップもできるぞい。\nさあ、アクションボードでみらいを切り開くのじゃ！",
    isWelcome: false,
  },
];
