# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

日本語で話すこと。

## 開発コマンド

### 基本開発フロー
- `flutter run` - アプリケーションを実行（デバッグモード）
- `flutter run --release` - リリースモードで実行
- `flutter run -d chrome` - Chromeでウェブ版を実行
- `dart run build_runner build` - コード生成を実行（Freezed、Riverpod、JSON等）
- `dart run build_runner build --delete-conflicting-outputs` - 競合ファイルを削除してコード生成
- `dart run build_runner watch` - ファイル変更を監視して自動コード生成

### テストとコード品質
- `flutter test` - 全テストを実行
- `flutter test test/path/to/test_file.dart` - 特定のテストファイルを実行
- `flutter test --coverage` - カバレッジ付きでテストを実行
- `flutter analyze` - 静的解析を実行（lintルールはanalysis_options.yamlで定義）
- `dart format .` - コードフォーマット
- `dart fix --apply` - 自動修正可能なlintエラーを修正

### ビルド
- `flutter build apk` - Android APKビルド
- `flutter build apk --split-per-abi` - ABI別にAPKを分割ビルド
- `flutter build ios` - iOS ビルド（macOSのみ）
- `flutter build web` - Webビルド
- `flutter build web --web-renderer html` - HTML レンダラーでWebビルド（パフォーマンス向上）

### デバッグとトラブルシューティング
- `flutter doctor` - Flutter環境の診断
- `flutter clean` - ビルドキャッシュをクリア
- `flutter pub get` - 依存関係を取得
- `flutter pub upgrade` - 依存関係をアップグレード
- `flutter logs` - デバイスログを表示

## プロジェクトアーキテクチャ

### 全体設計哲学
このプロジェクトは**Clean Architecture**と**Feature-First Approach**を採用したFlutterアプリケーションです。各機能は独立したディレクトリに整理され、依存関係の方向が明確に定義されています。

### ディレクトリ構造
```
lib/
├── core/               # 横断的関心事
│   ├── config/        # アプリ設定（Supabase設定等）
│   ├── errors/        # 共通エラー型（Failures）
│   ├── routing/       # GoRouterによるアプリルーティング
│   └── utils/         # 共通ユーティリティ
├── features/          # 機能別ディレクトリ
│   └── auth/          # 認証機能
│       ├── data/      # データレイヤー
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/ # Repository実装
│       ├── domain/    # ドメインレイヤー
│       │   ├── entities/     # Freezedエンティティ
│       │   ├── repositories/ # Repository抽象化
│       │   └── usecases/
│       └── presentation/     # プレゼンテーションレイヤー
│           ├── pages/        # 画面ウィジェット
│           ├── widgets/      # UIコンポーネント
│           └── providers/    # Riverpodプロバイダー
├── shared/            # 共有コンポーネント
└── main.dart
```

### 技術スタック

#### 状態管理 - Riverpod
- **Riverpod Annotation**: `@riverpod`アノテーションでプロバイダーを定義
- **コード生成**: `riverpod_generator`による`*.g.dart`ファイル生成
- **状態管理**: `AuthNotifier extends _$AuthNotifier`パターンを使用

#### データモデリング - Freezed
- **Union Types**: `AuthState`で状態の型安全な表現
- **Immutable Classes**: `AuthUser`等のエンティティ
- **JSON Serialization**: `json_annotation`との組み合わせ

#### ルーティング - GoRouter
- **宣言的ルーティング**: `@riverpod GoRouter appRouter(Ref ref)`
- **認証ガード**: 認証状態に基づく自動リダイレクト
- **ネストされたナビゲーション**: 機能別ルート構成

#### バックエンド - Supabase
- **認証**: Email/Password認証
- **リアルタイム**: `authStateChanges`ストリーム
- **型安全性**: 生成されたSupabaseクライアント

### 認証アーキテクチャ

#### 認証状態管理
```dart
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthStateInitial;
  const factory AuthState.loading() = AuthStateLoading;
  const factory AuthState.authenticated({required AuthUser user}) = AuthStateAuthenticated;
  const factory AuthState.unauthenticated() = AuthStateUnauthenticated;
  const factory AuthState.error({required String message}) = AuthStateError;
}
```

#### Repository パターン
- **抽象化**: `AuthRepository`インターフェース
- **実装**: `SupabaseAuthRepository`でSupabase Auth API統合
- **依存性注入**: Riverpodによる`authRepositoryProvider`

#### 認証フロー
1. アプリ起動時に`SupabaseConfig.initialize()`でSupabase初期化
2. `AuthNotifier`が現在の認証状態をチェック
3. `GoRouter`が認証状態に基づいてルーティング制御
4. リアルタイムで認証状態変更を監視

### コード生成ワークフロー

#### 必須の生成プロセス
新しいFreezedクラス、Riverpodプロバイダー、JSON モデルを追加した際は必ず実行：
```bash
dart run build_runner build --delete-conflicting-outputs
```

#### 生成されるファイル
- `*.freezed.dart` - Freezedクラス（Union types、copyWith等）
- `*.g.dart` - JSON serialization、Riverpodプロバイダー
- `app_router.g.dart` - GoRouterルート定義

### エラーハンドリング戦略

#### 型安全なエラー処理
```dart
@freezed
class Failure with _$Failure {
  const factory Failure.server({required String message, String? code}) = ServerFailure;
  const factory Failure.network({required String message}) = NetworkFailure;
  const factory Failure.auth({required String message, String? code}) = AuthFailure;
  // ...
}
```

#### UI でのエラー表示
- `AuthState.error`でエラー状態を管理
- `ScaffoldMessenger`でユーザーにエラー通知
- 例外は`Exception`でスローし、プロバイダーで`AuthState.error`に変換

### 開発ガイドライン

#### Import 規則
- 絶対パス import を使用: `package:mobile_flutter/...`
- `analysis_options.yaml`で`directives_ordering: true`を設定
- 依存関係は`pubspec.yaml`でアルファベット順にソート

#### 新機能追加時の手順
1. `features/`に新しい機能ディレクトリを作成
2. `domain/entities/`にFreezedエンティティを定義
3. `domain/repositories/`にRepository抽象化を作成
4. `data/repositories/`にRepository実装を作成
5. `presentation/providers/`にRiverpodプロバイダーを作成
6. `presentation/pages/`にUI実装
7. `core/routing/app_router.dart`にルートを追加
8. コード生成を実行

#### 環境設定
- `.env`ファイルでSupabase設定を管理
- `SUPABASE_URL`と`SUPABASE_ANON_KEY`が必須
- `flutter_dotenv`で環境変数をロード

### UIガイドライン
- **UI_GUIDELINES.md**を参照して一貫性のあるUIを実装
- フォームの最大幅: 320px
- 一般コンテンツの最大幅: 342px
- ボタンの高さ: 44px
- プライマリカラー: #089781

## 主要な技術パターン

### Feature-First Architecture
各機能は以下の3層構造で整理：
1. **Data Layer** (`data/`) - API通信とデータ永続化
   - `datasources/` - 外部データソース（API、ローカルストレージ）
   - `models/` - データ転送オブジェクト（DTO）
   - `repositories/` - Repository実装

2. **Domain Layer** (`domain/`) - ビジネスロジック
   - `entities/` - ビジネスエンティティ（Freezedで定義）
   - `repositories/` - Repository抽象化（インターフェース）
   - `usecases/` - ユースケース（必要に応じて）

3. **Presentation Layer** (`presentation/`) - UI
   - `pages/` - 画面ウィジェット
   - `widgets/` - 再利用可能なUIコンポーネント
   - `providers/` - Riverpodプロバイダー（状態管理）

### Riverpod パターン
```dart
// Notifierパターン（推奨）
@riverpod
class FeatureNotifier extends _$FeatureNotifier {
  @override
  FeatureState build() => const FeatureState.initial();
  
  Future<void> someAction() async {
    state = const FeatureState.loading();
    // ビジネスロジック
  }
}

// Provider生成（自動生成される）
final featureNotifierProvider = ...;
```

### エラーハンドリング
- `Failure`型で統一的にエラーを表現
- `try-catch`でキャッチした例外は`Failure`に変換
- UIレイヤーでは`state.whenOrNull`でエラー状態を処理

### ルーティング管理
- `GoRouter`の`redirect`で認証状態に基づく自動遷移
- `CustomTransitionPage`でページ遷移アニメーションを統一
- パスパラメータは`state.pathParameters['id']`で取得

## テスト戦略

### ユニットテスト
- `test/`ディレクトリにミラー構造でテストファイルを配置
- Freezedエンティティのequality testは自動生成されるため不要
- Repositoryはモック化してプロバイダーをテスト

### ウィジェットテスト
```dart
testWidgets('description', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        // プロバイダーのオーバーライド
      ],
      child: MaterialApp(home: TargetWidget()),
    ),
  );
});
```

### 統合テスト
- `integration_test/`ディレクトリに配置
- 実際のSupabaseインスタンスを使用する場合は環境変数で切り替え

## よくある開発パターン

### 新しい画面を追加する場合
1. `features/機能名/`ディレクトリを作成
2. エンティティとRepositoryインターフェースを`domain/`に定義
3. Repository実装を`data/`に作成
4. Riverpodプロバイダーを`presentation/providers/`に作成
5. UIを`presentation/pages/`に実装
6. `app_router.dart`にルートを追加
7. `dart run build_runner build --delete-conflicting-outputs`を実行

### 既存機能を拡張する場合
1. 必要に応じてエンティティを更新（Freezedの再生成が必要）
2. Repositoryメソッドを追加
3. プロバイダーに新しいアクションを追加
4. UIを更新

### Supabaseテーブルを追加する場合
1. Supabaseダッシュボードでテーブル作成
2. 対応するFreezedエンティティを作成
3. Repository抽象化とSupabase実装を作成
4. RLSポリシーを適切に設定

## 注意事項

### コード生成
- **必ず実行**: Freezed、Riverpod、JSONシリアライゼーションを使用する際
- 生成ファイル（`*.g.dart`, `*.freezed.dart`）はgitにコミットする
- `build_runner watch`は開発中便利だが、時々再起動が必要

### パフォーマンス
- `const`コンストラクタを積極的に使用（lintルールで強制）
- 大きなリストには`ListView.builder`を使用
- 画像は適切なサイズにリサイズしてから表示

### セキュリティ
- 環境変数は`.env`ファイルで管理（gitignoreに追加済み）
- Supabaseの`anon key`はクライアントで使用可、`service role key`は絶対に含めない
- RLSポリシーで適切にデータアクセスを制限