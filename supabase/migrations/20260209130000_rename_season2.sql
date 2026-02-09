-- Season 2 のタイトルを変更
UPDATE seasons
SET name = '~2026衆院選',
    updated_at = now()
WHERE slug = 'season2';
