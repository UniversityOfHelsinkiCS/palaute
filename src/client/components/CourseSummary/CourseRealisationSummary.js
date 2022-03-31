import React, { Fragment } from 'react'
import { lightFormat } from 'date-fns'
import { Link as RouterLink, Redirect, useParams } from 'react-router-dom'

import {
  Link,
  Box,
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
import { LoadingProgress } from '../LoadingProgress'
import Title from '../Title'

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

const getLabel = (courseRealisation, t, language) => {
  const { startDate, endDate, feedbackTargetId, teachers, name } =
    courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const datePeriod = `${formattedStartDate} - ${formattedEndDate}`
  const translatedName = getLanguageValue(name, language)

  const link = feedbackTargetId ? (
    <Link component={RouterLink} to={`/targets/${feedbackTargetId}/results`}>
      {translatedName}
    </Link>
  ) : (
    translatedName
  )

  const teachersString = teachers
    .map(({ firstName, lastName }) =>
      [firstName, lastName].filter(Boolean).join(' '),
    )
    .filter(Boolean)
    .join(', ')

  return (
    <>
      {link}
      <Typography color="textSecondary" variant="body2">
        {datePeriod}
      </Typography>
      {teachersString && (
        <Typography color="textSecondary" variant="body2">
          {t('courseSummary:responsibleTeachers')}: {teachersString}
        </Typography>
      )}
    </>
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
                  label={getLabel(courseRealisation, t, i18n.language)}
                  results={courseRealisation.results}
                  questions={questions}
                  feedbackCount={courseRealisation.feedbackCount}
                  studentCount={courseRealisation.studentCount}
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
  const { t, i18n } = useTranslation()

  const { courseRealisationSummaries, isLoading, failureCount } =
    useCourseRealisationSummaries(code)

  if (isLoading) {
    return (
      <LoadingProgress
        isError={failureCount > 1}
        message={t('common:fetchError')}
      />
    )
  }

  if (!courseRealisationSummaries) {
    return <Redirect to="/" />
  }

  const { questions, courseRealisations, courseUnit } =
    courseRealisationSummaries

  return (
    <>
      <Title>{t('courseSummaryPage')}</Title>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {getLanguageValue(courseUnit.name, i18n.language)},{' '}
          {courseUnit.courseCode}
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
