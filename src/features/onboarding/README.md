# オンボーディング機能

期日前投票ミッション専用のオンボーディングモーダル機能です。新規ユーザーにミッション体験を提供します。

## ディレクトリ構造

```
components/onboarding/
├── constants.ts                     # 定数定義
├── types.ts                        # 型定義
├── utils.ts                        # ユーティリティ関数
├── onboarding-modal.tsx            # メインモーダル
├── onboarding-button.tsx           # トリガーボタン
├── hooks/
│   └── useOnboardingState.ts       # 状態管理フック
└── components/
    ├── OnboardingCharacter.tsx     # キャラクター表示
    ├── OnboardingWelcome.tsx       # ウェルカム画面
    └── OnboardingMissionDetails.tsx # ミッション詳細
```

## 使用方法

```tsx
import { OnboardingButton } from "./components/onboarding/onboarding-button";

function Hero() {
  return (
    <OnboardingButton variant="link">
      アクションボードとは？
    </OnboardingButton>
  );
}
```

## 技術仕様

- **UI構造**: DialogOverlay + DialogContent (z-index: 100/110)
- **背景画像**: 2画像の事前読み込み + opacity切り替え
- **スクロール**: ミッション詳細表示時のスムーズスクロール