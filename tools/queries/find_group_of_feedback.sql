-- This query finds the grouping question choice
-- of a person giving feedback to 83083576,
-- having written "ohjaaja" in the feedback.

with the_group_questions as (
  select q.id
  from surveys s
  inner join questions q on q.id = any(s.question_ids)
  where s.feedback_target_id = 83083576 -- the feedback target we are interested in
  and q.secondary_type = 'GROUPING'
),
the_feedbacks as (
  select data 
  from feedbacks 
  where id in (
    select feedback_id 
    from user_feedback_targets 
    where feedback_target_id = 83083576 -- the feedback target we are interested in
    and feedback_id is not null
  )
  and data::text like '%ohjaaja%' -- this is the text we are looking for
)

select distinct
q.opts->'label'->>'fi' as group
from 

  (select jsonb_array_elements(data) as data from the_feedbacks) as f,
  (select q.id, jsonb_array_elements(q.data->'options') as opts
    from the_group_questions as gq
    inner join questions q on q.id = gq.id
  ) as q
  where f.data->>'questionId' = q.id::text
  and f.data->>'data' = q.opts->>'id'
;