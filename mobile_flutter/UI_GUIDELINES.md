# UIガイドライン

このドキュメントは、mobile_flutter プロジェクトのUI設計における共通ルールと規約を定義します。

## レイアウト

### コンテンツ幅

#### フォーム・入力画面
- **最大幅**: 320px
- **適用対象**: サインイン、サインアップ、パスワードリセット、アカウント設定
- **実装例**:
```dart
Container(
  constraints: const BoxConstraints(maxWidth: 320),
  child: Form(
    // フォームコンテンツ
  ),
)
```

#### 一般コンテンツ
- **最大幅**: 342px
- **適用対象**: アカウント画面、ミッションカード、その他の一般的なコンテンツ
- **実装例**:
```dart
Container(
  constraints: const BoxConstraints(maxWidth: 342),
  child: Column(
    // コンテンツ
  ),
)
```

### パディング
- **水平パディング**: 24px（画面の両端）
- **垂直パディング**: 
  - セクション間: 30-40px
  - 要素間: 16-24px
  - 小要素間: 8px

## ボタン

### プライマリボタン
- **背景色**: `AppColors.primary` (#089781)
- **文字色**: 白
- **高さ**: 44px
- **幅**: 
  - フォーム内: 300px（固定）
  - 一般コンテンツ: 親要素の幅に合わせる
- **角丸**: 150px（完全な丸角）
- **フォントウェイト**: 700（bold）

```dart
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: AppColors.primary,
    minimumSize: const Size(double.infinity, 44),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(150),
    ),
  ),
  child: Text(
    'ボタンテキスト',
    style: Theme.of(context).textTheme.titleMedium?.copyWith(
      color: Colors.white,
      fontWeight: FontWeight.w700,
    ),
  ),
)
```

### セカンダリボタン（アウトライン）
- **背景色**: 白または透明
- **ボーダー**: 1px solid #E4E4E7
- **文字色**: `AppColors.textPrimary`
- **その他のスタイル**: プライマリボタンと同じ

### サブトルボタン（テキストボタン）
- **背景色**: #F1F5F9
- **文字色**: `AppColors.textPrimary`
- **パディング**: horizontal: 30px, vertical: 8px
- **フォントウェイト**: 500（medium）

## 入力フィールド

### 基本スタイル
- **ボーダー**: 1px solid #CBD5E1
- **角丸**: 6px
- **パディング**: horizontal: 12px, vertical: 8px
- **フォーカス時のボーダー**: 2px solid `AppColors.primary`

### 読み取り専用フィールド
- **背景色**: #F9F9F9
- **ボーダー**: 1px solid #E2E8F0
- **文字色**: #292524

### ラベル
- **フォントウェイト**: 700（bold）
- **色**: `AppColors.textPrimary`
- **間隔**: ラベルと入力フィールドの間は6px

### サフィックスラベル（バッジ）
- **ボーダー**: 1px solid #E4E4E4
- **角丸**: 150px
- **パディング**: horizontal: 10px
- **文字色**: #52525B
- **フォントサイズ**: bodySmall

## 色の定義

主要な色は `AppColors` クラスで定義されています：

```dart
class AppColors {
  static const Color primary = Color(0xFF089781);
  static const Color textPrimary = Color(0xFF18181B);
  static const Color textSecondary = Color(0xFF52525B);
  static const Color divider = Color(0xFFEBEBEB);
  // その他の色定義
}
```

### 特定用途の色
- **エラー**: #EF4444
- **成功**: #089781（primary）
- **警告**: #F59E0B
- **情報**: #3B82F6
- **無効化**: rgba(0, 0, 0, 0.38)

## タイポグラフィ

フォントはGoogleFontsのNoto Sans JPを使用し、Flutterのテーマシステムで管理：

```dart
Text(
  'テキスト',
  style: Theme.of(context).textTheme.titleMedium?.copyWith(
    color: AppColors.textPrimary,
    fontWeight: FontWeight.w700,
  ),
)
```

### フォントウェイト
- **通常**: 400
- **中**: 500
- **太字**: 700

## アイコン

### アバター画像
- **サイズ**: 
  - 大: 140x140px（アカウント画面）
  - 中: 40x40px（AppBar）
- **形状**: 円形
- **デフォルトアイコン**: Icons.person
- **背景色**: #E5E5E5

## シャドウ

### カードシャドウ
```dart
boxShadow: [
  BoxShadow(
    color: Colors.black.withValues(alpha: 0.1),
    blurRadius: 8,
    offset: const Offset(0, 2),
  ),
]
```

### 内側シャドウ（アバター画像用）
```dart
boxShadow: [
  BoxShadow(
    color: Colors.black.withValues(alpha: 0.25),
    blurRadius: 4,
    offset: const Offset(0, 0),
    blurStyle: BlurStyle.inner,
  ),
]
```

## 実装時の注意事項

1. **テーマの活用**: 直接色やスタイルを指定するのではなく、可能な限りTheme.of(context)を使用
2. **レスポンシブ対応**: maxWidthを設定して大画面でも適切に表示されるようにする
3. **一貫性**: 同じ用途の要素には同じスタイルを適用する
4. **アクセシビリティ**: 適切なコントラスト比を保ち、タップ領域は最小44x44pxを確保