UPDATE "public"."missions"
SET 
    "event_date" = null,
    "updated_at" = NOW()
WHERE 
    "slug" = 'x-repost';