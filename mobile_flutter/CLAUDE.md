# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

### 基本開発フロー
- `flutter run` - アプリケーションを実行（デバッグモード）
- `flutter run --release` - リリースモードで実行
- `dart run build_runner build` - コード生成を実行（Freezed、Riverpod、JSON等）
- `dart run build_runner build --delete-conflicting-outputs` - 競合ファイルを削除してコード生成
- `dart run build_runner watch` - ファイル変更を監視して自動コード生成

### テストとコード品質
- `flutter test` - 全テストを実行
- `flutter analyze` - 静的解析を実行
- `dart format .` - コードフォーマット

### ビルド
- `flutter build apk` - Android APKビルド
- `flutter build ios` - iOS ビルド（macOSのみ）
- `flutter build web` - Webビルド

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