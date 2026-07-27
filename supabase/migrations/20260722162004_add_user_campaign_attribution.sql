-- キャンペーンコード付きURL（?cv=コード）経由で登録したユーザーを流入元別に計測するためのテーブル
-- （イベント起因のアトリビューション計測。初回用途は全国キャラバン2026の会場別QR。オンラインイベント等でも使う）

create table user_campaign_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  campaign_code text not null check (campaign_code ~ '^[a-zA-Z0-9_-]{1,50}$'),
  created_at timestamp with time zone not null default now()
);

comment on table user_campaign_attribution is 'キャンペーン別アトリビューション: どのキャンペーン導線（?cv=）経由で登録したかを保持する';
comment on column user_campaign_attribution.campaign_code is 'キャンペーンコード（例: sapporo-0730）';

-- キャンペーン別の集計用
create index idx_user_campaign_attribution_campaign_code on user_campaign_attribution (campaign_code);

alter table user_campaign_attribution enable row level security;

-- 流入元情報は本人以外に公開しない（user_referralのような全公開SELECTにはしない）
create policy "Users can SELECT their own campaign attribution" on user_campaign_attribution
for select
using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETEはサーバー側（service role）のみで行うため、ポリシーは定義しない
