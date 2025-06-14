-- イベント運営ミッションを追加

INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
('95188747-5529-2515-b30c-2c1d21313247', 'イベント運営を手伝おう', '/img/mission_fallback.svg', 'チームみらいでは、サポーターの皆さんと一緒に、イベントや街頭演説をつくりあげています。イベント会場の調整や当日のスタッフ対応、街頭演説での運営補助など、さまざまなかたちで運営を支えてくれる方を<a href="https://www.notion.so/team-mirai/20af6f56bae180db8f5cc80612bf359a?source=copy_link">募集</a>しています！ <br />成果物として、イベント内で公開されるイベントコードを入力ください。', 4, NULL, 'TEXT', NULL, 'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//13_event_support.png', 'イベントコード');