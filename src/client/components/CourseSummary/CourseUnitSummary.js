import React, { Fragment } from 'react'
import { Link } from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import CourseRealisationSummary from './CourseRealisationSummary'
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
            id,
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
            <Fragment key={id}>
              <ResultsRow
                label={
                  <Link
                    component={RouterLink}
                    to={`/courses/${courseCode}/targets`}
                  >
                    {getLanguageValue(name, i18n.language)} ({courseCode})
                  </Link>
                }
                level={1}
                results={results}
                questions={questions}
                feedbackCount={feedbackCount}
                feedbackResponseGiven={feedbackResponseStatus}
                accordionEnabled
              >
                <CourseRealisationSummary courseUnitId={id} />
              </ResultsRow>
              {i < courseUnits.length - 1 && <DividerRow />}
            </Fragment>
          )
        },
      )}
    </>
  )
}

export default CourseUnitSummary
