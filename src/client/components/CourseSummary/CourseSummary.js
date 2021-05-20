import React, { Fragment } from 'react'

import {
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  makeStyles,
} from '@material-ui/core'

import { Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import useCourseUnitSummaries from '../../hooks/useCourseUnitSummaries'
import { getLanguageValue } from '../../util/languageUtils'
import ResultItem from './ResultItem'
import QuestionHeading from './QuestionHeading'

const useStyles = makeStyles((theme) => ({
  table: {
    borderSpacing: '2px',
  },
  spacer: {
    display: 'block',
    height: theme.spacing(1),
  },
  resultCell: {
    padding: theme.spacing(1),
  },
  courseNameCell: {
    maxWidth: '400px',
    padding: theme.spacing(2),
  },
}))

const getQuestionLabel = (questions, questionId, language) => {
  const question = questions.find((q) => q.id === questionId)

  const label = getLanguageValue(question?.data?.label, language)

  return label
}

const CourseSummary = () => {
  const classes = useStyles()
  const { t, i18n } = useTranslation()
  const { courseUnitSummaries, isLoading } = useCourseUnitSummaries()

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
          <table className={classes.table}>
            <thead>
              <tr>
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
                  <tr key={id}>
                    <td className={classes.courseNameCell}>
                      {getLanguageValue(name, i18n.language)}
                    </td>
                    {results.map(({ questionId, mean }) => (
                      <ResultItem
                        key={questionId}
                        mean={mean}
                        questionLabel={getQuestionLabel(
                          questions,
                          questionId,
                          i18n.language,
                        )}
                        className={classes.resultCell}
                      />
                    ))}
                  </tr>
                  <tr className={classes.spacer} />
                </Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  )
}

export default CourseSummary
