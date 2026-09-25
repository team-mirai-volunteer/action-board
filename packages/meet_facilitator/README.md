# @action-board/meet-facilitator

Google Meet 上で意見が A / B に分かれた参加者を、双方が納得できる「プランC」へ導く AI ファシリテーターのプロトタイプです。
「ゆる語りワークショップ」の流れ（投票 → AI インタビュー → 同じ側で共有 → 違う側と対話）を Meet の中で再現し、
会話の文字起こしをもとに Claude が共通点・相違点・次の問い・プランCの叩き台をリアルタイムに提示します。

設計の背景と全体像は [docs/20260925_1429_Google_Meet_AIファシリテーター設計.md](../../docs/20260925_1429_Google_Meet_AIファシリテーター設計.md) を参照してください。

## 構成

```
packages/meet_facilitator/
├── src/
│   ├── core/         # ドメイン（セッション状態機械・投票・文字起こし・ファシリテーションエンジン）
│   ├── llm/          # ファシリテーターの頭脳（Claude アダプタ / オフライン用モック）
│   ├── transcript/   # 音声→文字起こしの供給源（Recall.ai ボット / 台本リプレイ）
│   ├── server/       # HTTP API（Hono）
│   ├── demo/         # デモ用の問い・台本
│   └── demo.ts       # CLI デモ
├── web/              # Meet Add-on の画面（サイドパネル / メインステージ）
└── deployment.json   # Meet Add-on のマニフェスト（雛形）
```

音声の取得は差し替え可能にしてあります。現状は Recall.ai のミーティングボット（Meet に参加者として入室）で文字起こしを受け取る前提で、
Google Meet Media API が一般公開されたら `transcript/` 配下に同じインターフェースで実装を追加します。

## 動かし方

```bash
# 依存関係（リポジトリルートで）
pnpm install

# 1. CLI デモ（Meet もボットも不要。台本の会話を流してファシリテーションを確認する）
pnpm --filter @action-board/meet-facilitator demo

# 2. サーバー + 画面（http://localhost:8787）
pnpm --filter @action-board/meet-facilitator dev
```

`ANTHROPIC_API_KEY` が設定されていれば Claude（既定: `claude-opus-5`）を使い、未設定なら
ルールベースのモックで動きます。モックは画面の流れを確認するためのもので、内容の質は保証しません。

### 環境変数

| 変数 | 用途 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude を使う場合に必須 |
| `FACILITATOR_MODEL` | 使用モデル（既定 `claude-opus-5`） |
| `FACILITATOR_EFFORT` | `low` / `medium`（既定） / `high` / `xhigh` / `max` |
| `FACILITATOR_USE_MOCK` | `1` でモックを強制 |
| `MEET_CLOUD_PROJECT_NUMBER` | Meet Add-on として動かすときの GCP プロジェクト番号 |
| `RECALL_API_KEY` / `RECALL_REGION` | Recall.ai ボットを使う場合 |
| `PUBLIC_URL` | 本サーバーの公開 URL（Recall.ai の Webhook 先） |
| `PORT` | 待ち受けポート（既定 8787） |

### ローカルで画面を確認する

1. `pnpm --filter @action-board/meet-facilitator dev`
2. http://localhost:8787/sidepanel.html を開き、「デモの問いで作成」→ 名前を入れて参加
3. 「次のフェーズへ」で `投票` に進めて A/B を選ぶ → `AIインタビュー` に進めてチャットに答える
4. `違う意見の人と対話` まで進めたら「デモの会話を流す」を押す。台本の会話が流れ、AI ファシリテーションが自動で更新される
5. 「別タブでメインステージを開く」で全員向けの画面を確認する

## API

| メソッド | パス | 内容 |
| --- | --- | --- |
| POST | `/api/sessions` | セッション作成（`question: {title, optionA, optionB, context?}`、`id?`） |
| GET | `/api/sessions/:id?since=version` | 集約ビュー。`version` が変わっていなければ 304 |
| POST | `/api/sessions/:id/participants` | 参加（`name`） |
| POST | `/api/sessions/:id/votes` | 投票（`participantId`, `side`） |
| POST | `/api/sessions/:id/phase` | フェーズ遷移（`phase` 省略で次へ） |
| POST | `/api/sessions/:id/transcript` | 文字起こしを手動投入（`speakerName`, `text`） |
| POST | `/api/sessions/:id/facilitate` | AI ファシリテーションを手動実行 |
| POST | `/api/sessions/:id/interview/:participantId` | AI インタビューを 1 ステップ進める（`answer?`） |
| POST | `/api/sessions/:id/replay` | デモ台本を流す（`speed`: 0 なら即時） |
| POST | `/api/sessions/:id/bot` | Recall.ai ボットを Meet に参加させる（`meetingUrl`） |
| POST | `/webhooks/recall` | Recall.ai のリアルタイム文字起こし Webhook |

文字起こしが追加されると、`share` / `cross` / `plan_c` フェーズでは
「前回から 200 文字以上増えた」または「45 秒以上経過して新しい発言がある」ときに AI ファシリテーションが自動で再実行されます
（`FacilitationEngine` の `autoPolicy`）。

## Meet Add-on として動かす

1. GCP プロジェクトで Google Workspace Marketplace SDK を有効化し、`deployment.json` の `YOUR_HOST` を本サーバーの公開 HTTPS ホストに置き換えて HTTP デプロイとして登録する
2. `MEET_CLOUD_PROJECT_NUMBER` にプロジェクト番号を設定してサーバーを起動する
3. Meet でアドオンを開くと、同じ会議の参加者は `meetingCode` をキーに自動で同じセッションを共有する
4. サイドパネルの「メインステージに表示」で、全員の画面にメインステージが開く（`startActivity`）
5. 音声は「Meet にボットを参加させる」から Recall.ai ボットを入室させて取得する

Meet Add-on は音声にアクセスできないため、文字起こしはボット（または将来の Meet Media API）経由になります。
録音と AI 分析を行うため、参加者への事前説明と同意は必ず行ってください。

## テスト

リポジトリルートの Jest がこのパッケージのテストも拾います。

```bash
pnpm run test:unit -- packages/meet_facilitator
pnpm --filter @action-board/meet-facilitator typecheck
```
