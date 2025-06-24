-- Update mission_category_view to include max_daily_achievement_count
DROP VIEW IF EXISTS mission_category_view;

create view mission_category_view as
select
  c.id                   as category_id,
  c.category_title       as category_title,
  c.category_kbn         as category_kbn,
  c.sort_no              as category_sort_no,
  m.id                   as mission_id,
  m.title                as title,                    
  m.icon_url             as icon_url,                 
  m.difficulty           as difficulty,               
  m.content              as content,                  
  m.created_at           as created_at,               
  m.artifact_label       as artifact_label,           
  m.max_achievement_count as max_achievement_count,
  m.max_daily_achievement_count as max_daily_achievement_count,
  m.event_date           as event_date,               
  m.is_featured          as is_featured,              
  m.updated_at           as updated_at,      
  m.is_hidden            as is_hidden,
  m.ogp_image_url        as ogp_image_url,
  m.required_artifact_type as required_artifact_type,
  l.sort_no              as link_sort_no
from
  mission_category c
  inner join mission_category_link l on c.id = l.category_id
  inner join missions m on l.mission_id = m.id
where
  c.del_flg = false
  and l.del_flg = false
  and m.is_hidden = false;