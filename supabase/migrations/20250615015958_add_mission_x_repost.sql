INSERT INTO "public"."missions"(
    "id",
    "title",
    "icon_url",
    "content",
    "difficulty",
    "event_date",
    "required_artifact_type",
    "max_achievement_count",
    "created_at",
    "updated_at",
    "ogp_image_url",
    "artifact_label",
    "is_featured",
    "is_hidden"
)
VALUES(
    gen_random_uuid(),
    'Xでチームはやまの投稿をリポストしよう',
    '/img/mission_fallback.svg',
    'Xでチームはやまの投稿をリポストしてみましょう！チームはやまが目指す社会を、もっと多くの人へ届けませんか？',
    2,
    '2025-06-15',
    'LINK',
    null,
    '2025-06-15 01:57:01+00',
    '2025-06-15 01:57:03+00',
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//19_x_repost.png',
    'リポストした投稿のURL',
    false,
    false
)
;