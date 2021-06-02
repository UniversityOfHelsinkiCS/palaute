import React, { Fragment } from 'react'
import { lightFormat } from 'date-fns'
import { CircularProgress, Box, Link } from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'

const getLabel = (courseRealisation) => {
  const { startDate, endDate, feedbackTargetId } = courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const label = `${formattedStartDate} - ${formattedEndDate}`

  return feedbackTargetId ? (
    <Link component={RouterLink} to={`/targets/${feedbackTargetId}/results`}>
      {label}
    </Link>
  ) : (
    label
  )
}

const CourseRealisationSummary = ({ courseUnitId }) => {
  const {
    courseRealisationSummaries,
    isLoading,
  } = useCourseRealisationSummaries(courseUnitId)

  if (isLoading) {
    return (
      <tr>
        <Box component="td" p={2}>
          <CircularProgress />
        </Box>
      </tr>
    )
  }

  if (!courseRealisationSummaries) {
    return null
  }

  const { questions, courseRealisations } = courseRealisationSummaries

  return (
    <>
      <DividerRow />
      {courseRealisations.map((courseRealisation, i) => (
        <Fragment key={courseRealisation.id}>
          <ResultsRow
            key={courseRealisation.id}
            label={getLabel(courseRealisation)}
            results={courseRealisation.results}
            questions={questions}
            feedbackCount={courseRealisation.feedbackCount}
            feedbackResponseGiven={Boolean(
              courseRealisation.feedbackResponseGiven,
            )}
            level={2}
          />
          {i < courseRealisations.length - 1 && <DividerRow />}
        </Fragment>
      ))}
    </>
  )
}

export default CourseRealisationSummary
