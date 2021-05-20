import React, { Fragment } from 'react'
import { lightFormat } from 'date-fns'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'

const CourseRealisationSummary = ({ courseUnitId }) => {
  const {
    courseRealisationSummaries,
    isLoading,
  } = useCourseRealisationSummaries(courseUnitId)

  if (isLoading) {
    return null
  }

  if (!courseRealisationSummaries) {
    return null
  }

  const { questions, courseRealisations } = courseRealisationSummaries

  return (
    <>
      <DividerRow />
      {courseRealisations.map(({ id, startDate, endDate, results }, i) => (
        <Fragment key={id}>
          <ResultsRow
            key={id}
            label={`${lightFormat(
              new Date(startDate),
              'd.M.yyyy',
            )} - ${lightFormat(new Date(endDate), 'd.M.yyyy')}`}
            results={results}
            questions={questions}
            level={1}
          />
          {i < courseRealisations.length - 1 && <DividerRow />}
        </Fragment>
      ))}
    </>
  )
}

export default CourseRealisationSummary
