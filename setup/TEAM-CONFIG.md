# Team Config - チーム設定リファレンス

## 設定ファイル形式

チーム設定はJSONCフォーマット（コメント付きJSON）で記述します。

## 基本構造

```jsonc
{
  "team": {
    "id": "team-id",
    "name": "チーム名",
    "description": "チームの説明"
  },
  "colors": {
    "primary": "#FF0000",
    "secondary": "#FF3333",
    "accent": "#FF6600",
    "accentLight": "#FF9933"
  },
  "features": {
    "missions": true,
    "ranking": true,
    "achievements": true
  },
  "site": {
    "url": "https://example.com",
    "email": "support@example.com"
  }
}
```

## フィールド説明

### team
- `id`: チームID（英数字、ハイフン可）
- `name`: チーム名
- `description`: チームの説明（オプション）

### colors
- `primary`: プライマリカラー（HEX形式）
- `secondary`: セカンダリカラー（自動生成可）
- `accent`: アクセントカラー（自動生成可）
- `accentLight`: アクセントライトカラー（自動生成可）

### features
- `missions`: ミッション機能の有効/無効
- `ranking`: ランキング機能の有効/無効
- `achievements`: 達成機能の有効/無効

### site
- `url`: サイトURL（オプション）
- `email`: サポートメール（オプション）

## サンプル設定

### チーム東京
```jsonc
{
  "team": {
    "id": "tokyo",
    "name": "チーム東京",
    "description": "東京の未来を創る"
  },
  "colors": {
    "primary": "#E60012"
  }
}
```

### チーム大阪
```jsonc
{
  "team": {
    "id": "osaka",
    "name": "チーム大阪",
    "description": "大阪から日本を元気に"
  },
  "colors": {
    "primary": "#FFC107"
  }
}
```
