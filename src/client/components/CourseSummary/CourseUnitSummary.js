import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'
import { getFeedbackResponseGiven } from './utils'

const CourseUnitSummary = ({ courseUnits, questions }) => {
  const { i18n } = useTranslation()

  return (
    <>
      <DividerRow />
      {courseUnits.map(
        (
          {
            courseCode,
            name,
            results,
            feedbackCount,
            studentCount,
            feedbackResponseGiven,
            closesAt,
          },
          i,
        ) => {
          const feedbackResponseStatus = getFeedbackResponseGiven(
            feedbackResponseGiven,
            closesAt,
          )

          return (
            <Fragment key={courseCode}>
              <ResultsRow
                link={`/course-summary/${courseCode}`}
                label={`${getLanguageValue(
                  name,
                  i18n.language,
                )} (${courseCode})`}
                level={1}
                results={results}
                questions={questions}
                feedbackCount={feedbackCount}
                studentCount={studentCount}
                feedbackResponseGiven={feedbackResponseStatus}
              />
              {i < courseUnits.length - 1 && <DividerRow />}
            </Fragment>
          )
        },
      )}
    </>
  )
}

export default CourseUnitSummary
