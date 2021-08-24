import React from 'react'

import {
  Route,
  Switch,
  useRouteMatch,
  useParams,
  Redirect,
  Link,
} from 'react-router-dom'

import {
  Box,
  CircularProgress,
  Typography,
  Tab,
  Button,
} from '@material-ui/core'

import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'

import EditFeedbackTarget from '../EditFeedbackTarget'
import FeedbackTargetResults from '../FeedbackTargetResults'
import FeedbackView from '../FeedbackView'
import StudentsWithFeedback from '../StudentsWithFeedback'
import FeedbackResponse from '../FeedbackResponse'
import useFeedbackTarget from '../../hooks/useFeedbackTarget'
import RouterTabs from '../RouterTabs'
import { getLanguageValue } from '../../util/languageUtils'
import feedbackTargetIsEnded from '../../util/feedbackTargetIsEnded'
import feedbackTargetIsOpen from '../../util/feedbackTargetIsOpen'
import { getCoursePeriod, feedbackTargetIsDisabled, copyLink } from './utils'

const FeedbackTargetView = () => {
  const { path, url } = useRouteMatch()
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget, isLoading } = useFeedbackTarget(id)

  if (isLoading) {
    return (
      <Box my={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  if (!feedbackTarget) {
    return <Redirect to="/" />
  }

  const {
    accessStatus,
    courseRealisation,
    opensAt,
    feedback,
    studentListVisible,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const isEnded = feedbackTargetIsEnded(feedbackTarget)
  const isStarted = new Date() >= new Date(opensAt)
  const isTeacher = accessStatus === 'TEACHER'
  const isDisabled = feedbackTargetIsDisabled(feedbackTarget)
  const showFeedbacksTab = (isTeacher && isStarted) || feedback || isEnded

  const showEditSurveyTab = isTeacher && !isOpen && !isEnded
  const showFeedbackResponseTab = isTeacher && isEnded
  const showStudentsWithFeedbackTab = isTeacher && studentListVisible && isEnded

  const handleCopyLink = () => {
    copyLink(feedbackTarget)
    enqueueSnackbar(t('feedbackTargetView:linkCopied'), { variant: 'info' })
  }

  if (isDisabled && !isTeacher) {
    enqueueSnackbar(t('feedbackTargetView:feedbackDisabled'), {
      variant: 'error',
    })

    return <Redirect to="/" />
  }

  const coursePeriod = getCoursePeriod(courseRealisation)

  const courseRealisationName = getLanguageValue(
    courseRealisation?.name,
    i18n.language,
  )

  return (
    <>
      <Box mb={2}>
        <Box display="flex">
          <Box flexGrow={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              {courseRealisationName}
            </Typography>

            <Typography color="textSecondary" variant="body2">
              {coursePeriod}
            </Typography>
          </Box>

          {isTeacher && (
            <Box flexGrow={0} pl={2}>
              <Button
                startIcon={<CopyIcon />}
                color="primary"
                onClick={handleCopyLink}
              >
                {t('feedbackTargetView:copyLink')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box mb={2}>
        <RouterTabs
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              feedback && isOpen
                ? t('feedbackTargetView:editFeedbackTab')
                : t('feedbackTargetView:surveyTab')
            }
            component={Link}
            to={`${url}/feedback`}
          />

          {showFeedbacksTab && (
            <Tab
              label={t('feedbackTargetView:feedbacksTab')}
              component={Link}
              to={`${url}/results`}
            />
          )}

          {showFeedbackResponseTab && (
            <Tab
              label={t('feedbackTargetView:feedbackResponseTab')}
              component={Link}
              to={`${url}/feedback-response`}
            />
          )}

          {showEditSurveyTab && (
            <Tab
              label={t('feedbackTargetView:editSurveyTab')}
              component={Link}
              to={`${url}/edit`}
            />
          )}

          {showStudentsWithFeedbackTab && (
            <Tab
              label={t('feedbackTargetView:studentsWithFeedbackTab')}
              component={Link}
              to={`${url}/students-with-feedback`}
            />
          )}
        </RouterTabs>
      </Box>

      <Switch>
        <Route path={`${path}/edit`} component={EditFeedbackTarget} />
        <Route path={`${path}/results`} component={FeedbackTargetResults} />
        <Route path={`${path}/feedback`} component={FeedbackView} />
        <Route
          path={`${path}/students-with-feedback`}
          component={StudentsWithFeedback}
        />
        <Route
          path={`${path}/feedback-response`}
          component={FeedbackResponse}
        />
        <Redirect to={`${path}/feedback`} />
      </Switch>
    </>
  )
}

export default FeedbackTargetView
