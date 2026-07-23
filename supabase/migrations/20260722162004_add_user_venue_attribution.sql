-- キャラバン等のオフラインイベントで配布する会場別QRコード付きURL（?cv=会場コード）経由で
-- 登録したユーザーを会場別に計測するためのテーブル（イベント起因のアトリビューション計測）

create table user_venue_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  venue_code text not null check (venue_code ~ '^[a-zA-Z0-9_-]{1,50}$'),
  created_at timestamp with time zone not null default now()
);

comment on table user_venue_attribution is '会場別アトリビューション: どの会場のQRコード/URL（?cv=）経由で登録したかを保持する';
comment on column user_venue_attribution.venue_code is '会場コード（例: sapporo-0730）';

-- 会場別の集計用
create index idx_user_venue_attribution_venue_code on user_venue_attribution (venue_code);

alter table user_venue_attribution enable row level security;

-- 来場情報は本人以外に公開しない（user_referralのような全公開SELECTにはしない）
create policy "Users can SELECT their own venue attribution" on user_venue_attribution
for select
using (auth.uid() = user_id);

-- INSERT/UPDATE/DELETEはサーバー側（service role）のみで行うため、ポリシーは定義しない
