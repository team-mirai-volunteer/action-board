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
    text: "ここは、アクションボード。チームみらいを応援する者たちが集いし場所。\n\nわしは、このアクションボードの主、アクション仙人じゃ。",
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
    text: "ではさっそく、初めてのアクションじゃ。\nまずは、街頭演説に参加してチームみらいを盛り上げてみるとええ。",
    isWelcome: false,
  },
  {
    id: 6,
    text: "「街頭演説に参加しよう」\n\nこのミッションでは、チームみらいの街頭演説に参加して、声援を送ることができるぞい。\n参加した場所と日付を報告するだけでミッションクリアじゃ！",
    isWelcome: false,
  },
  {
    id: 7,
    text: "これがミッションカードじゃ。\n\nアイコンやタイトル、難易度などが表示されておる。\nタップすると詳細を見ることができるぞい。",
    isWelcome: false,
    showMissionCard: true,
  },
  {
    id: 8,
    text: "お次は詳細画面じゃ。\n\nここでは、ミッションの内容を確認して、下のボタンから挑戦できるぞい。\n参加した場所と日付を入力するだけでクリアできるから、気軽にタップしてみるとええ！",
    isWelcome: false,
    showMissionDetails: true,
  },
  {
    id: 9,
    text: "うむ、上出来じゃ！\n\n実際のミッションでは、提出すると経験値がもらえて、レベルアップもできるぞい。\nさあ、アクションボードでみらいを切り開くのじゃ！",
    isWelcome: false,
  },
];
