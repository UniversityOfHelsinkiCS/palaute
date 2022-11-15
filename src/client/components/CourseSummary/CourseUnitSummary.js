import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'
import { getFeedbackResponseGiven } from './utils'
import { CourseUnitLabel } from './Labels'
import CensoredCount from './CensoredCount'

const CourseUnitSummary = ({ courseUnits, questions, access }) => {
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
            currentFeedbackTargetId,
            closesAt,
            hiddenCount,
          },
          index,
        ) => {
          const feedbackResponseStatus = getFeedbackResponseGiven(
            feedbackResponseGiven,
            closesAt,
          )

          return (
            <Fragment key={courseCode}>
              <ResultsRow
                link={`/course-summary/${courseCode}`}
                label={
                  <CourseUnitLabel
                    name={getLanguageValue(name, i18n.language)}
                    code={courseCode}
                  />
                }
                level={1}
                index={index}
                results={results}
                questions={questions}
                feedbackCount={feedbackCount}
                studentCount={studentCount}
                feedbackResponseGiven={feedbackResponseStatus}
                currentFeedbackTargetId={currentFeedbackTargetId}
                cellsAfter={
                  access?.admin &&
                  !!hiddenCount && (
                    <>
                      <td />
                      <td>
                        <CensoredCount count={hiddenCount} />
                      </td>
                    </>
                  )
                }
              />
              {index < courseUnits.length - 1 && <DividerRow />}
            </Fragment>
          )
        },
      )}
    </>
  )
}

export default CourseUnitSummary
