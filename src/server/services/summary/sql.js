/*
Recommended how to SQL in Norppa

For example, you want to edit the below query that creates a materialized view that is used in course summary.
1.Install SQLTools extension, follow its instructions to install postgres driver
2.Connect to palaute_db container. 
  Connection url is something like postgres@localhost:5432/postgres
  Make sure the port is exposed in docker compose
3.Once you've connected, create new sql file (recommend doing it from SQLTools tab)
4.Copy the SQL below. You have to replace Sequelize replacements (they start with :) with dummy data.
5.You can run the query from the SQLTools codelens that appears at top of the sql block.
6.In the case of below query, if you want to see what the resulting view is instead of just creating it,
  remove the create materialized view statement and its parenthesis.

Google is your friend for all things postgres. Useful links:
https://www.cybertec-postgresql.com/en/creating-and-refreshing-materialized-views-in-postgresql/
https://www.postgresql.org/docs/current/functions-json.html

Delete this comment if you find something better
*/

const { QueryTypes } = require('sequelize')
const { sequelize } = require('../../db/dbConnection')
const {
  OPEN_UNIVERSITY_ORG_ID,
  WORKLOAD_QUESTION_ID,
  SUMMARY_EXCLUDED_ORG_IDS,
  FEEDBACK_RESPONSE_EMAILS_SINCE_DATE,
} = require('../../util/config')

const SUMMARY_VIEW_QUERY = `
DROP MATERIALIZED VIEW IF EXISTS course_results_view;
CREATE MATERIALIZED VIEW course_results_view AS (
    WITH cur_results AS (
        WITH question_distributions AS (

            WITH course_realisation_results AS (

                WITH answers AS (

                    WITH question_ids AS (
                        SELECT questions.id
                        FROM questions, surveys
                        WHERE questions.id = ANY(surveys.question_ids)
                        AND (surveys.type = 'university' OR surveys.type = 'programme')
                        AND (questions.type = 'LIKERT' OR questions.id = :workloadQuestionId)
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
                    org.organisation_id,
                    course_code,
                    answers.course_realisation_id, 
                    question_id, 
                    answer,
                    COUNT(answer)
                FROM answers 
                INNER JOIN course_units cu ON cu.id = answers.course_unit_id

                INNER JOIN LATERAL (
                    SELECT organisation_id FROM course_realisations_organisations curo WHERE curo.course_realisation_id = answers.course_realisation_id
                    UNION
                    SELECT organisation_id FROM course_units_organisations cuo WHERE cuo.course_unit_id = answers.course_unit_id
                ) org ON TRUE

                WHERE answer != '0'

                GROUP BY org.organisation_id, course_code, answers.course_realisation_id, question_id, answer
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
            FROM course_realisation_results
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
    )

    SELECT 
    DISTINCT ON (curr.organisation_id, curr.course_realisation_id)
      curr.*, 
      (CASE WHEN (org_access.is_open IS NULL) THEN false ELSE true END) as is_open
    FROM cur_results curr
    INNER JOIN course_units cu ON cu.course_code = curr.course_code

    LEFT JOIN LATERAL (
        SELECT true as is_open FROM course_units_organisations cuo 
        WHERE cuo.course_unit_id = cu.id AND organisation_id = :openUniversityOrgId
        --LIMIT 1
        UNION
        SELECT true as is_open FROM course_realisations_organisations curo 
        WHERE curo.course_realisation_id = curr.course_realisation_id AND organisation_id = :openUniversityOrgId
        --LIMIT 1
    ) org_access ON true
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
${SUMMARY_VIEW_QUERY}
REFRESH MATERIALIZED VIEW feedback_target_counts_view;
`

const COURSE_REALISATION_SUMMARY_QUERY = `
SELECT
DISTINCT ON (cur.id)
    cr.course_realisation_id as "courseRealisationId",
    cr.course_code as "courseCode",
    cr.organisation_id as "organisationId",
    cr.is_open as "isOpen",
    cr.question_ids as "questionIds",
    cr.question_distribution as "questionDistribution",
    cur.id as "id",
    fbt.id as "feedbackTargetId",
    fbt.feedback_count as "feedbackCount",
    fbtc.student_count as "studentCount",
    fbt.hidden_count as "hiddenCount",
    LENGTH(fbt.feedback_response) > 3 AND (fbt.feedback_response_email_sent OR fbt.closes_at < :feedbackResponseEmailsSinceDate) as "feedbackResponseGiven",
    fbt.closes_at as "closesAt",
    cur.start_date as "startDate",
    cur.end_date as "endDate",
    cur.name,
    cur.teaching_languages as "teachingLanguages"

FROM course_results_view as cr
INNER JOIN feedback_targets fbt ON fbt.course_realisation_id = cr.course_realisation_id
INNER JOIN course_realisations cur ON cur.id = cr.course_realisation_id
INNER JOIN feedback_target_counts_view fbtc ON fbtc.feedback_target_id = fbt.id
WHERE 
NOT fbt.hidden 
AND course_code = :courseCode
`

const ORGANISATION_SUMMARY_QUERY = `
WITH course_unit_data AS (
  WITH stuffs AS (
    SELECT
      cr.organisation_id as "organisationId",
      cr.course_code as "courseCode",
      cr.question_distribution as "distribution",
      cr.question_ids as "questionIds",
      LENGTH(fbt.feedback_response) > 3 AND (fbt.feedback_response_email_sent OR fbt.closes_at < :feedbackResponseEmailsSinceDate) as "feedbackResponseGiven",
      fbt.id as "feedbackTargetId",
      fbt.closes_at as "closesAt",
      cur.start_date as "startDate",
      fbtc.student_count as "studentCount",
      fbt.feedback_count as "feedbackCount",
      fbt.hidden_count as "hiddenCount",
      cr.is_open as "isOpen",
      cr.course_realisation_id as "id"

    FROM course_results_view as cr
    INNER JOIN feedback_targets fbt ON fbt.course_realisation_id = cr.course_realisation_id
    INNER JOIN course_realisations cur ON cur.id = cr.course_realisation_id
    INNER JOIN feedback_target_counts_view fbtc ON fbtc.feedback_target_id = fbt.id
    WHERE 
    NOT fbt.hidden 
    AND (
      organisation_id IN (:organisationIds)
      OR cr.course_realisation_id IN (:courseRealisationIds)
    )
    AND organisation_id NOT IN (:summaryExcludedOrgIds)
    AND start_date > :startDate
    AND start_date < :endDate
  )

  SELECT
    "organisationId",
    stuffs."courseCode",
    jsonb_agg(row_to_json(stuffs)) as "courseRealisations" -- 'jsonb_agg(row_to_json(x))' is really cool for a lot of things

  FROM 
    stuffs
  WHERE :includeOpenUniCourseUnits OR "isOpen" = ("organisationId" = :openUniversityOrgId)
  GROUP BY "organisationId", stuffs."courseCode"
)

SELECT
DISTINCT ON ("organisationId", "courseCode")
  cu.id as "id",
  "organisationId",
  "courseCode",
  cu.name as "courseUnitName",
  org.name as "organisationName",
  org.code as "organisationCode",
  "courseRealisations"

FROM
  course_unit_data
INNER JOIN course_units cu ON cu.course_code = "courseCode"
INNER JOIN organisations org ON org.id = "organisationId"
`

/**
 * Views must be initialised when database is first created. This can be done in a migration for example.
 */
const initialiseSummaryView = async () => {
  await sequelize.query(SUMMARY_VIEW_QUERY, {
    replacements: { openUniversityOrgId: OPEN_UNIVERSITY_ORG_ID, workloadQuestionId: WORKLOAD_QUESTION_ID },
  })
}

const initialiseCountsView = async () => {
  await sequelize.query(COUNTS_VIEW_QUERY)
}

const runRefreshViewsQuery = async () => {
  await sequelize.query(REFRESH_VIEWS_QUERY, {
    replacements: {
      openUniversityOrgId: OPEN_UNIVERSITY_ORG_ID,
      workloadQuestionId: WORKLOAD_QUESTION_ID,
    },
  })
}

const runCourseRealisationSummaryQuery = async courseCode => {
  const allCuSummaries = await sequelize.query(COURSE_REALISATION_SUMMARY_QUERY, {
    replacements: {
      courseCode,
      feedbackResponseEmailsSinceDate: FEEDBACK_RESPONSE_EMAILS_SINCE_DATE,
    },
    type: QueryTypes.SELECT,
  })
  return allCuSummaries
}

/**
 * @returns rows for each CU with its associated CURs in json
 */
const runOrganisationSummaryQuery = async ({
  organisationIds,
  courseRealisationIds,
  startDate,
  endDate,
  includeOpenUniCourseUnits,
}) => {
  const rows = await sequelize.query(ORGANISATION_SUMMARY_QUERY, {
    replacements: {
      organisationIds: organisationIds.length === 0 ? [''] : organisationIds, // do this for sql reasons
      courseRealisationIds: courseRealisationIds.length === 0 ? [''] : courseRealisationIds,
      startDate,
      endDate,
      includeOpenUniCourseUnits,
      openUniversityOrgId: OPEN_UNIVERSITY_ORG_ID,
      summaryExcludedOrgIds: SUMMARY_EXCLUDED_ORG_IDS,
      feedbackResponseEmailsSinceDate: FEEDBACK_RESPONSE_EMAILS_SINCE_DATE,
    },
    type: sequelize.QueryTypes.SELECT,
  })

  return rows
}

module.exports = {
  initialiseSummaryView,
  initialiseCountsView,
  runRefreshViewsQuery,
  runCourseRealisationSummaryQuery,
  runOrganisationSummaryQuery,
}
