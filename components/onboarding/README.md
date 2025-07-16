# オンボーディング機能

新規ユーザーに対してアプリケーションの基本的な使い方を説明し、実際にミッションを体験してもらうためのモーダル機能です。

## 📁 ディレクトリ構造

```
components/onboarding/
├── README.md                         # このファイル
├── constants.ts                      # 定数定義
├── types.ts                         # 型定義
├── utils.ts                         # ユーティリティ関数
├── OnboardingModalRefactored.tsx    # メインコンポーネント（リファクタリング版）
├── onboarding-modal.tsx             # 元のメインコンポーネント
├── onboarding-mission-card.tsx      # ミッションカード（既存）
├── onboarding-button.tsx            # 起動ボタン（既存）
├── hooks/
│   └── useOnboardingState.ts        # 状態管理フック
└── components/
    ├── OnboardingCharacter.tsx      # キャラクター表示
    ├── OnboardingWelcome.tsx        # ウェルカム画面
    └── OnboardingMissionDetails.tsx # ミッション詳細
```

## 🔧 主要コンポーネント

### OnboardingModalRefactored
メインのモーダルコンポーネント。全体の構成を管理し、状態に応じて適切なコンポーネントを表示します。

### OnboardingCharacter
キャラクター画像、コメント、ボタンを表示するコンポーネント。オンボーディングの中核となる部分です。

### OnboardingWelcome
ウェルカム画面のロゴとテキストを表示するコンポーネント。

### OnboardingMissionDetails
ミッション詳細と提出フォームを表示するコンポーネント。異なるミッションタイプに対応しています。

## 🎯 主要機能

### 1. 段階的なガイド
- ID 1: ウェルカム画面
- ID 2-4: アプリケーションの基本説明
- ID 5: 期日前投票の導入
- ID 6: ミッション詳細と体験（ボタンクリックで完了）
- ID 7: 完了画面

### 2. レスポンシブデザイン
- iPhone SE（375px以下）での特別な調整
- 様々な画面サイズに対応したレイアウト

### 3. アニメーション
- 画面遷移時のフェードイン・アウト
- スクロールアニメーション
- ボタンタップアニメーション

## 🔧 技術詳細

### 状態管理
`useOnboardingState`フックで一元管理：
- 現在のダイアログ番号
- アニメーション状態
- フォーム入力内容
- 提出完了状態

### 型安全性
TypeScriptによる厳密な型定義：
- `MissionType`: ミッションタイプ
- `MockMission`: モックミッション
- `OnboardingTexts`: テキスト定義

### ユーティリティ関数
- `sanitizeHtml`: HTMLサニタイズ（wbrタグ対応）
- `getDynamicOnboardingText`: ミッションタイプ別テキスト取得
- `calculateScrollPosition`: スクロール位置計算

## 📝 カスタマイズ

### 新しいミッションタイプの追加
1. `types.ts`で新しいミッションタイプを定義
2. `constants.ts`の`ONBOARDING_TEXTS`に追加
3. 必要に応じて新しいコンポーネントを作成

### テキストの変更
`constants.ts`の`ONBOARDING_TEXTS`オブジェクトを編集してください。

### アニメーション時間の調整
`constants.ts`の`ANIMATION_DURATION`オブジェクトを編集してください。

## 🧪 テスト

### 確認項目
- [ ] 全7画面が正しく表示される
- [ ] アニメーションがスムーズに動作する
- [ ] iPhone SEでの表示が適切
- [ ] ミッション完了フローが正常に動作する
- [ ] wbrタグが正しく改行制御される

### デバッグ
開発者ツールでReactコンポーネントの状態を確認してください。

## 🚀 使用方法

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

## 🔍 リファクタリングのポイント

### レビュワビリティの向上
1. **関心事の分離**: 大きなコンポーネントを機能別に分割
2. **定数の抽出**: マジックナンバーと文字列を定数化
3. **型安全性**: 厳密なTypeScript型定義
4. **コメントの充実**: 複雑なロジックに説明を追加
5. **ファイル分割**: 責務に応じたファイル構成

### 保守性の向上
- 各コンポーネントが単一責任を持つ
- 再利用可能なユーティリティ関数
- 設定変更が容易な定数管理
- 型による実行時エラーの防止

### 可読性の向上
- 意味のある関数名・変数名
- 適切なコメント
- 一貫したコーディングスタイル
- 論理的なディレクトリ構成