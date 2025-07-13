export interface OnboardingDialogue {
  id: number;
  text: string;
  isWelcome: boolean;
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
    text: "ではさっそく、初めてのアクションじゃ。\nまずは、チームみらいの想いをぎゅっと詰め込んだショート動画を見てみるとええ。",
    isWelcome: false,
  },
];
