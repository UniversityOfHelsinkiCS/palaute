import React from 'react'
import { Link, useParams, Redirect } from 'react-router-dom'
import { Box, Typography, Divider, makeStyles, Button } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import useProgrammeOpenQuestions from '../../hooks/useProgrammeOpenQuestions'
import useOrganisation from '../../hooks/useOrganisation'
import { filterCoursesWithNoResponses, formateDates } from './utils'
import { LoadingProgress } from '../LoadingProgress'

const useStyles = makeStyles(() => ({
  courseTitle: {
    textDecoration: 'none',
    color: '#1077A1',
  },
  realisationTitle: {
    textDecoration: 'none',
    color: '#0084bb',
    fontSize: 'large',
  },
  realisationContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    '@media print': {
      display: 'none',
    },
  },
  response: {
    margin: 5,
  },
  questionTitle: {
    fontWeight: 500,
  },
  dates: {
    color: '#646464',
    marginBottom: 5,
  },
}))

const RealisationItem = ({ realisation, language, classes }) => {
  const url = `/targets/${realisation.id}/results`

  const realisationDates = formateDates(realisation)

  return (
    <Box key={realisation.id} className={classes.realisationContainer}>
      <Link to={url} className={classes.realisationTitle} replace>
        {realisation.name[language]}
      </Link>
      <Typography variant="body2" component="p" className={classes.dates}>
        {realisationDates}
      </Typography>
      {realisation.questions.map(({ question, responses }) => (
        <Box key={`${realisation.id}-${question.id}`}>
          <Typography
            variant="body1"
            component="p"
            className={classes.questionTitle}
          >
            {question.data.label[language]}
          </Typography>
          <Box my={1}>
            {responses.map((r, index) => (
              <div key={index}>
                <Typography
                  variant="body2"
                  component="p"
                  className={classes.response}
                >
                  {r}
                </Typography>
                <Divider style={{ margin: 2 }} />
              </div>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const ProgrammeOpenQuestions = () => {
  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { language } = i18n
  const classes = useStyles()

  const { codesWithIds, isLoading } = useProgrammeOpenQuestions(code)
  const { organisation, isLoading: isOrganisationLoading } =
    useOrganisation(code)

  if (isLoading || isOrganisationLoading) {
    return <LoadingProgress />
  }

  if (!organisation.access.admin) {
    return <Redirect to={`/organisations/${code}/settings`} />
  }

  const filteredCourses = filterCoursesWithNoResponses(codesWithIds)

  return (
    <Box>
      <div className={classes.buttonContainer}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => window.print()}
        >
          {t('feedbackTargetResults:exportPdf')}
        </Button>
      </div>
      {filteredCourses.map((course) => (
        <Box key={course.code}>
          <Typography component="h6" variant="h6">
            <Link
              to={`/course-summary/${course.code}`}
              className={classes.courseTitle}
              replace
            >{`${course.code} - ${course.name[language]}`}</Link>
          </Typography>
          {course.realisations.map((realisation) => (
            <RealisationItem
              key={realisation.id}
              realisation={realisation}
              language={language}
              classes={classes}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default ProgrammeOpenQuestions
