select 
org.name->>'fi' as organisation,
cu.course_code, 
replace(cur.name->>'fi', ',', ';') as course_name, 
string_agg(users.email, '; ') as teachers

from user_feedback_targets ufbt

inner join feedback_targets fbt on ufbt.feedback_target_id = fbt.id
inner join course_realisations cur on fbt.course_realisation_id = cur.id
inner join course_units cu on fbt.course_unit_id = cu.id
inner join users on users.id = ufbt.user_id
inner join course_realisations_organisations curo on curo.course_realisation_id = cur.id
inner join organisations org on org.id = curo.organisation_id

where ufbt.access_status = 'TEACHER'
and not fbt.hidden
and cur.start_date >= DATE('2023-01-01')
and cur.start_date < DATE('2023-03-13')

group by org.name->>'fi', cu.course_code, cur.name->>'fi'
