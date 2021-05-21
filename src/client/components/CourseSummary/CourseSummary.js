import React, { Fragment, useState } from 'react'

import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  TableContainer,
  Link,
  makeStyles,
} from '@material-ui/core'

import { setYear, startOfYear, endOfYear } from 'date-fns'
import { orderBy } from 'lodash'
import { Redirect, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useCourseUnitSummaries from '../../hooks/useCourseUnitSummaries'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import VerticalHeading from './VerticalHeading'
import Filters from './Filters'
import CourseRealisationSummary from './CourseRealisationSummary'
import DividerRow from './DividerRow'
import Alert from '../Alert'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  filters: {
    padding: theme.spacing(2),
    width: '450px',
  },
}))

const getSummaryQueryOptions = ({ year }) => {
  const from = startOfYear(setYear(new Date(), year))
  const to = endOfYear(setYear(new Date(), year))

  return {
    from,
    to,
    keepPreviousData: true,
  }
}

const CourseTable = ({ courseUnits, questions, year, onYearChange }) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <>
      <TableContainer>
        <table className={classes.table}>
          <thead>
            <tr>
              <th className={classes.filters}>
                <Filters year={year} onYearChange={onYearChange} />
              </th>
              <th> </th>
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
            {courseUnits.map(
              ({ id, name, courseCode, results, feedbackCount }) => (
                <Fragment key={id}>
                  <ResultsRow
                    key={id}
                    label={
                      <Link
                        component={RouterLink}
                        to={`/courses/${courseCode}/targets`}
                      >
                        {getLanguageValue(name, i18n.language)} ({courseCode})
                      </Link>
                    }
                    results={results}
                    questions={questions}
                    feedbackCount={feedbackCount}
                    accordionEnabled
                  >
                    <CourseRealisationSummary courseUnitId={id} />
                  </ResultsRow>
                  <DividerRow />
                </Fragment>
              ),
            )}
          </tbody>
        </table>
      </TableContainer>
      {courseUnits.length === 0 && (
        <Alert severity="info">{t('courseSummary:noCourses')}</Alert>
      )}
    </>
  )
}

const CourseSummary = () => {
  const { t } = useTranslation()
  const [year, setYear] = useState(new Date().getFullYear())

  const { courseUnitSummaries, isLoading } = useCourseUnitSummaries(
    getSummaryQueryOptions({ year }),
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!courseUnitSummaries) {
    return <Redirect to="/" />
  }

  const { questions, courseUnits } = courseUnitSummaries

  const sortedCourseUnits = orderBy(courseUnits, ['courseCode'])

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <CourseTable
            courseUnits={sortedCourseUnits}
            questions={questions}
            year={year}
            onYearChange={setYear}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default CourseSummary
