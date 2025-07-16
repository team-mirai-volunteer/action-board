# オンボーディング機能

新規ユーザーに対してアプリケーションの基本的な使い方を説明し、実際にミッションを体験してもらうためのモーダル機能です。

## ディレクトリ構造

```
components/onboarding/
├── constants.ts                      # 定数定義
├── types.ts                         # 型定義
├── utils.ts                         # ユーティリティ関数
├── OnboardingModalRefactored.tsx    # メインコンポーネント
├── hooks/
│   └── useOnboardingState.ts        # 状態管理フック
└── components/
    ├── OnboardingCharacter.tsx      # キャラクター表示
    ├── OnboardingWelcome.tsx        # ウェルカム画面
    └── OnboardingMissionDetails.tsx # ミッション詳細
```

## 使用方法

```tsx
import { OnboardingModal } from "./components/onboarding/OnboardingModalRefactored";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <OnboardingModal
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  );
}
```

## カスタマイズ

### テキストの変更
`constants.ts`の`ONBOARDING_TEXTS`オブジェクトを編集してください。

### アニメーション時間の調整
`constants.ts`の`ANIMATION_DURATION`オブジェクトを編集してください。