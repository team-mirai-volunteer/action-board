INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    'Slackのプロフィールを設定しよう',
    '/img/mission_fallback.svg',
    'Slackのプロフィールを設定しよう！<br>顔画像アイコンをデフォルトのものから変更しましょう（任意）。<br>表示名（Display name）は任意ですが、氏名（Fullname）はローマ字記載でお願いします（メンションしやすくするため）。',
    1,
    NULL,
    'TEXT',
    NULL,
    '', -- TODO
    'プロフィールに設定した表示名/氏名（例: 安野たかひろ/Anno Takahiro）'
  ),
  (
    gen_random_uuid(),
    'Slackで自己紹介しよう',
    '/img/mission_fallback.svg',
    'Slackの <a href="https://team-mirai-volunteer.slack.com/archives/C08SF0HARU6" target="_blank" rel="noopener noreferrer">#9_自己紹介</a> チャンネルで自己紹介しよう！<br>自己紹介をして、チームメンバーに自分のことを知ってもらいましょう。<a href="https://team-mirai-volunteer.slack.com/archives/C08SF0HARU6/p1747362904724769" target="_blank" rel="noopener noreferrer">チャンネル内にピン留めされたテンプレート</a>に沿って自己紹介してください。',
    1,
    NULL,
    'LINK',
    NULL,
    '', -- TODO
    '投稿した自己紹介のリンク（例: https://team-mirai-volunteer.slack.com/archives/C08SF0HARU6/p1747563247933219）' -- TODO (必須)が正しくないフォントで表示されている
  ),
  (
    gen_random_uuid(),
    'Slackで興味があるチャンネルに入ろう',
    '/img/mission_fallback.svg',
    'Slackの<a href="https://app.slack.com/client/T08R1043FPY/channels" target="_blank" rel="noopener noreferrer">各チャンネルの説明</a>を読んで、興味があるチャンネルに入ろう！<br>Slackの各チャンネルは、オープンで誰でも参加・閲覧できるようになっています。もし「動画編集がメインだが、画像デザインもできるよ！」などあれば、興味がある別チャンネルにも参加いただいてもOKです！情報共有・様子見のROM専ももちろん◎です。',
    1,
    NULL,
    'TEXT',
    NULL,
    '', -- TODO
    '入ったチャンネル名（例: #0_初心者部屋）'
  );