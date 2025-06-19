-- 新規メンバー招待に最適化されたURLに更新
UPDATE missions 
SET content = REPLACE(
  content, 
  'https://join.slack.com/t/team-mirai-volunteer/shared_invite/zt-36k0jx72s-EUWYKNTYTjbZhUnNjCqduA',
  'https://team-mirai-volunteer.slack.com/ssb/redirect'
)
WHERE content LIKE '%join.slack.com%';