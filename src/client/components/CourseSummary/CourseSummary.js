import React, { Fragment, useState } from 'react'

import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  TableContainer,
  makeStyles,
} from '@material-ui/core'

import { setYear, startOfYear, endOfYear } from 'date-fns'

import { Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useCourseUnitSummaries from '../../hooks/useCourseUnitSummaries'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import QuestionHeading from './QuestionHeading'
import Filters from './Filters'
import CourseRealisationSummary from './CourseRealisationSummary'
import DividerRow from './DividerRow'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  filters: {
    padding: theme.spacing(2),
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

const CourseSummary = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const classes = useStyles()
  const { t, i18n } = useTranslation()

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

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <TableContainer>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={classes.filters}>
                    <Filters year={year} onYearChange={setYear} />
                  </th>
                  <th> </th>
                  {questions.map(({ id, data }) => (
                    <QuestionHeading key={id}>
                      {getLanguageValue(data?.label, i18n.language)}
                    </QuestionHeading>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseUnits.map(({ id, name, results }) => (
                  <Fragment key={id}>
                    <ResultsRow
                      key={id}
                      label={getLanguageValue(name, i18n.language)}
                      results={results}
                      questions={questions}
                      accordionEnabled
                    >
                      <CourseRealisationSummary courseUnitId={id} />
                    </ResultsRow>
                    <DividerRow />
                  </Fragment>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  )
}

export default CourseSummary
