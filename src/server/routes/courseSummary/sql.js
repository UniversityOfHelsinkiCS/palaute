const SUMMARY_VIEW_QUERY = `

CREATE MATERIALIZED VIEW IF NOT EXISTS course_results_view AS (

    WITH question_distributions AS (

        WITH course_unit_results AS (

            WITH answers AS (

                WITH question_ids AS (
                    SELECT questions.id
                    FROM questions, surveys
                    WHERE questions.id = ANY(surveys.question_ids)
                    AND surveys.type = 'university'
                    AND (questions.type = 'LIKERT' OR questions.id = 1042)
                ), feedbacks_1 AS (
                    SELECT 
                        (jsonb_array_elements(data)) as data,
                        id
                    FROM feedbacks
                )

                SELECT
                    f.data->>'data' as answer,
                    (f.data->>'questionId')::INT as question_id,
                    ufbt.feedback_target_id,
                    fbt.course_realisation_id,
                    fbt.course_unit_id

                FROM feedbacks_1 as f
                LEFT JOIN user_feedback_targets ufbt ON ufbt.feedback_id = f.id
                INNER JOIN feedback_targets fbt ON fbt.id = ufbt.feedback_target_id
                INNER JOIN questions ON questions.id = (f.data->>'questionId')::INT
                INNER JOIN question_ids ON question_ids.id = questions.id
            )


            SELECT
                organisation_id,
                course_code,
                answers.course_realisation_id, 
                question_id, 
                answer,
                COUNT(answer)
            FROM answers 
            INNER JOIN course_units cu ON cu.id = course_unit_id
            INNER JOIN course_realisations_organisations curo ON curo.course_realisation_id = answers.course_realisation_id

            WHERE answer != '0'

            GROUP BY organisation_id, course_code, answers.course_realisation_id, question_id, answer
        )

        SELECT 
            organisation_id,
            course_code,
            course_realisation_id,
            question_id,
            json_object(
                array_agg(answer)::text[], -- keys
                array_agg(count)::text[] -- values
            ) as distribution -- https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSON-CREATION-TABLE
        FROM course_unit_results
        GROUP BY organisation_id, course_code, course_realisation_id, question_id
    )

    SELECT
        organisation_id,
        course_code,
        course_realisation_id,
        array_agg(distribution) as question_distribution,
        array_agg(question_id) as question_ids

    FROM question_distributions
    GROUP BY organisation_id, course_code, course_realisation_id
);
`

const COUNTS_VIEW_QUERY = `
CREATE MATERIALIZED VIEW IF NOT EXISTS feedback_target_counts_view as (
  SELECT
  feedback_target_id,
  COUNT(*) AS student_count
  --COUNT(feedback_id) AS feedback_count
  FROM
  user_feedback_targets
  WHERE
  user_feedback_targets.access_status = 'STUDENT'
  GROUP BY
  feedback_target_id
);
`

const REFRESH_VIEWS_QUERY = `
REFRESH MATERIALIZED VIEW course_results_view;
REFRESH MATERIALIZED VIEW feedback_target_counts_view;
`

const COURSE_REALISATION_SUMMARY_QUERY = `
SELECT
DISTINCT ON (cur.id)
    cr.*,
    fbt.id as feedback_target_id,
    fbt.feedback_count,
    fbtc.student_count,
    fbt.feedback_response_email_sent as feedback_response_given,
    fbt.closes_at,
    cur.start_date,
    cur.end_date,
    cur.name,
    cur.teaching_languages

FROM course_results_view as cr
INNER JOIN feedback_targets fbt ON fbt.course_realisation_id = cr.course_realisation_id
INNER JOIN course_realisations cur ON cur.id = cr.course_realisation_id
INNER JOIN feedback_target_counts_view fbtc ON fbtc.feedback_target_id = fbt.id
WHERE 
NOT fbt.hidden 
AND course_code = :courseCode
`

module.exports = {
  SUMMARY_VIEW_QUERY,
  COUNTS_VIEW_QUERY,
  REFRESH_VIEWS_QUERY,
  COURSE_REALISATION_SUMMARY_QUERY,
}
