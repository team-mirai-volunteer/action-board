-- badge icons
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'badge_icons',           -- 新規バケット名
  'badge_icons',           -- 表示名も同じ
  true, -- パブリックアクセス可能に変更
  false, -- avif自動検出無効
  5242880, -- ファイルサイズ制限 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- 許可するMIMEタイプ
);