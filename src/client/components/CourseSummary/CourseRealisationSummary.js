import React, { Fragment } from 'react'
import { lightFormat } from 'date-fns'
import { Link as RouterLink, Redirect, useParams } from 'react-router-dom'

import {
  Link,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  TableContainer,
  makeStyles,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'

import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import ResultsRow from './ResultsRow'
import DividerRow from './DividerRow'
import { getLanguageValue } from '../../util/languageUtils'
import VerticalHeading from './VerticalHeading'

import { getFeedbackResponseGiven } from './utils'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  realisationHeading: {
    textAlign: 'left',
    verticalAlign: 'Bottom',
    padding: theme.spacing(2),
    fontWeight: theme.typography.fontWeightBold,
  },
}))

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

const CourseRealisationTable = ({ courseRealisations, questions }) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <TableContainer>
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.realisationHeading}>
              {t('courseSummary:courseRealisation')}
            </th>
            {questions.map(({ id, data }) => (
              <VerticalHeading key={id}>
                {getLanguageValue(data?.label, i18n.language)}
              </VerticalHeading>
            ))}
            <VerticalHeading>
              {t('courseSummary:feedbackCount')}
            </VerticalHeading>
            <VerticalHeading>
              {t('courseSummary:feedbackResponse')}
            </VerticalHeading>
          </tr>
        </thead>
        <tbody>
          {courseRealisations.map((courseRealisation) => {
            const feedbackResponseGiven = getFeedbackResponseGiven(
              courseRealisation.feedbackResponseGiven,
              courseRealisation.closesAt,
            )

            return (
              <Fragment key={courseRealisation.id}>
                <ResultsRow
                  key={courseRealisation.id}
                  label={getLabel(courseRealisation)}
                  results={courseRealisation.results}
                  questions={questions}
                  feedbackCount={courseRealisation.feedbackCount}
                  feedbackResponseGiven={feedbackResponseGiven}
                  accordionCellEnabled={false}
                />
                <DividerRow />
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </TableContainer>
  )
}

const CourseRealisationSummary = () => {
  const { code } = useParams()
  const { i18n } = useTranslation()

  const {
    courseRealisationSummaries,
    isLoading,
  } = useCourseRealisationSummaries(code)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!courseRealisationSummaries) {
    return <Redirect to="/" />
  }

  const {
    questions,
    courseRealisations,
    courseUnit,
  } = courseRealisationSummaries

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(courseUnit.name, i18n.language)}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <CourseRealisationTable
            courseRealisations={courseRealisations}
            questions={questions}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default CourseRealisationSummary
