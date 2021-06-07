import React, { Fragment } from 'react'

import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  TableContainer,
  makeStyles,
} from '@material-ui/core'

import { Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useOrganisationSummaries from '../../hooks/useOrganisationSummaries'
import { getLanguageValue } from '../../util/languageUtils'
import ResultsRow from './ResultsRow'
import VerticalHeading from './VerticalHeading'
import CourseUnitSummary from './CourseUnitSummary'
import DividerRow from './DividerRow'
import Alert from '../Alert'

const useStyles = makeStyles({
  table: {
    borderSpacing: '2px',
  },
})

const CourseTable = ({ organisations, questions }) => {
  const { t, i18n } = useTranslation()
  const classes = useStyles()

  return (
    <>
      <TableContainer>
        <table className={classes.table}>
          <thead>
            <tr>
              <th> </th>
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
            {organisations.map(
              ({ code, id, name, results, feedbackCount, courseUnits }) => (
                <Fragment key={id}>
                  <ResultsRow
                    label={
                      <>
                        {getLanguageValue(name, i18n.language)} ({code})
                      </>
                    }
                    results={results}
                    questions={questions}
                    feedbackCount={feedbackCount}
                    accordionEnabled={courseUnits.length > 0}
                  >
                    <CourseUnitSummary
                      courseUnits={courseUnits}
                      questions={questions}
                    />
                  </ResultsRow>
                  <DividerRow />
                </Fragment>
              ),
            )}
          </tbody>
        </table>
      </TableContainer>
      {organisations.length === 0 && (
        <Alert severity="info">{t('courseSummary:noCourses')}</Alert>
      )}
    </>
  )
}

const CourseSummary = () => {
  const { t } = useTranslation()

  const { organisationSummaries, isLoading } = useOrganisationSummaries()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!organisationSummaries) {
    return <Redirect to="/" />
  }

  const { questions, organisations } = organisationSummaries

  return (
    <>
      <Box mb={2}>
        <Typography variant="h4" component="h1">
          {t('courseSummary:heading')}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <CourseTable organisations={organisations} questions={questions} />
        </CardContent>
      </Card>
    </>
  )
}

export default CourseSummary
