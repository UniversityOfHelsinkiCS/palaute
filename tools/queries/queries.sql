-- Put big queries which could be helpful as a reference in the future here


------- Find out answer distributions of the four university level questions -----------
WITH question_results as (
    SELECT CAST(data->0->>'data' as INTEGER) as result, 6 as question_id from feedbacks UNION ALL
    SELECT CAST(data->1->>'data' as INTEGER) as result, 7 as question_id from feedbacks UNION ALL
    SELECT CAST(data->2->>'data' as INTEGER) as result, 8 as question_id from feedbacks UNION ALL
    SELECT CAST(data->3->>'data' as INTEGER) as result, 9 as question_id from feedbacks
),
feedback_count as (SELECT COUNT(*) as n FROM feedbacks)
-- result | question_id 
-- -------+-------------
-- 4      |           6
SELECT 
    questions.data->'label'->>'fi' as kysymys,
    CASE WHEN question_results.result = 0 then 'EOS' else CAST(question_results.result as VARCHAR) end as vastaus, 
    COUNT(question_results.question_id) as lkm,
    CAST( 100.0 * COUNT(question_results.question_id) / feedback_count.n as INTEGER) as prosenttia

FROM question_results, questions, feedback_count
WHERE questions.id = question_id 
GROUP BY result, questions.id, feedback_count.n
ORDER BY questions.id, result ASC;



------- Count how many feedbacks a course unit has ever received based on feedbackTargetId -----------
-------  This seems pretty slow with all those subqueries, if someone can optimize that would be great
SELECT COUNT(user_feedback_targets.feedback_id) AS feedback_count
FROM user_feedback_targets, feedback_targets
WHERE user_feedback_targets.feedback_target_id = feedback_targets.id

AND feedback_targets.course_unit_id IN (
  SELECT cu.id as ids
  FROM course_units as cu, feedback_targets as fbt 
  WHERE fbt.id = 11747471 ----- <--- There is the feedbackTargetId

  AND cu.course_code IN (
    SELECT course_code FROM course_units WHERE id = fbt.course_unit_id
  )
)
AND user_feedback_targets.access_status = 'STUDENT';
