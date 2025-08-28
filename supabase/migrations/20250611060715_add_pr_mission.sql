INSERT INTO missions (id, title, icon_url, content, difficulty, event_date, required_artifact_type, max_achievement_count, ogp_image_url, artifact_label)
VALUES
  (
    gen_random_uuid(),
    '開発者向け: Githubでプルリクエストを出そう',
    '/img/mission_fallback.svg',
    'チームはやまのプロジェクトでプルリクエストを出そう！チームはやまでは、アクションボードやファクトチェッカー、AIあんのなど様々なオープンソースプロジェクトの開発を、多くのサポーターが参加して進めています。まずは<a href="https://join.slack.com/t/team-mirai-volunteer/shared_invite/zt-36k0jx72s-EUWYKNTYTjbZhUnNjCqduA" target="_blank" rel="noopener noreferrer">チームはやまのSlack</a>に参加して、気になるプロジェクトを探してみてください！',
    2,
    NULL,
    'LINK',
    NULL,
    'https://tibsocpjqvxxipszbwui.supabase.co/storage/v1/object/public/ogp//14_github_pull_request.png',
    'あなたが作成したプルリクエストのURL'
  )