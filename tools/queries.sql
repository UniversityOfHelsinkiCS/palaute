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
