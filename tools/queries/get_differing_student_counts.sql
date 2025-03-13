with acual_student_counts as (
    select 
    ufbt.feedback_target_id as id,
    COUNT(*) as sc,
    MAX(ufbt.created_at) as d

    from user_feedback_targets ufbt 
    where ufbt.access_status = 'STUDENT'
    group by ufbt.feedback_target_id
)

select 
sc.id,
sc.d,
s.data->>'studentCount',
sc.sc
from summaries s 
inner join acual_student_counts sc
  on sc.id = s.feedback_target_id

where sc.sc != (s.data->>'studentCount')::integer