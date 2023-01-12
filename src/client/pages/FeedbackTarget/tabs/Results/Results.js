import React, { useRef, forwardRef, useState } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Alert, FormControlLabel, Switch } from '@mui/material'

import useFeedbackTarget from '../../../../hooks/useFeedbackTarget'
import useFeedbackTargetFeedbacks from '../../../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from './QuestionResults'
import FeedbackResponse from './FeedbackResponse'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'
import OldFeedbackTargetResults from '../../../../components/OldFeedbackTargetResults'

import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import FeedbackChart from './QuestionResults/FeedbackChart'
import useIsMobile from '../../../../hooks/useIsMobile'
import useChartConfig from './QuestionResults/useChartConfig'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'

const styles = {
  legacySwitch: {
    '@media print': {
      display: 'none',
    },
  },
}

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning" data-cy="notEnoughFeedbacks">
      {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
    </Alert>
  </Box>
)

const OnlyForEnrolled = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning">{t('feedbackTargetResults:onlyForEnrolledInfo')}</Alert>
  </Box>
)

const OnlyTeacherAccess = ({ t }) => (
  <Box mt={2}>
    <Alert severity="info">{t('feedbackTargetResults:teacherAccessInfo')}</Alert>
  </Box>
)

const ResultsView = forwardRef((_props, ref) => {
  const { t } = useTranslation()
  const { id } = useParams()
  const isMobile = useIsMobile()
  useChartConfig()

  const { feedbackTarget, isOrganisationReader, isResponsibleTeacher, isTeacher } = useFeedbackTargetContext()

  const { feedbackTargetData } = useFeedbackTargetFeedbacks(id)

  const [useLegacy, setUseLegacy] = useState(JSON.parse(localStorage.getItem('legacy')) || false)

  const {
    questions,
    questionOrder,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
    feedback,
    studentCount,
    feedbackCount,
    opensAt,
    closesAt,
    feedbackReminderLastSentAt,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const enoughFeedbacks = feedbackCount > 5

  const saveLegacySetting = value => {
    setUseLegacy(value)
    localStorage.setItem('legacy', JSON.stringify(value))
  }

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()

  return (
    <>
      <Box display="flex" alignItems="flex-end" flexDirection="column">
        {isTeacher && (
          <ExportFeedbacksMenu
            feedbackTarget={feedbackTarget}
            feedbacks={feedbackTargetData?.feedbacks}
            componentRef={ref}
          />
        )}
      </Box>

      {isTeacher && !isResponsibleTeacher && <OnlyTeacherAccess t={t} />}

      <Box ref={ref}>
        {feedbackHasStarted && !isOpen && enoughFeedbacks && (
          <Box mt={4} mb={2}>
            <FeedbackResponse feedbackTarget={feedbackTarget} />
          </Box>
        )}

        {isOpen && feedback && (
          <Box mb={2}>
            <Alert severity="info">{t('feedbackTargetResults:thankYouMessage')}</Alert>
          </Box>
        )}

        {!isMobile && !useLegacy && (
          <Box>
            <FeedbackChart
              feedbacks={feedbackTargetData?.feedbacks ?? []}
              studentCount={studentCount}
              opensAt={opensAt}
              closesAt={closesAt}
              feedbackReminderLastSentAt={feedbackReminderLastSentAt}
              t={t}
            />
          </Box>
        )}

        {!enoughFeedbacks &&
          (feedbackTargetData?.feedbackVisible ? <NotEnoughFeedbacks t={t} /> : <OnlyForEnrolled t={t} />)}

        {enoughFeedbacks &&
          (useLegacy ? (
            <Box my="3rem">
              <OldFeedbackTargetResults />
            </Box>
          ) : (
            <Box>
              <QuestionResults
                publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
                publicQuestionIds={publicQuestionIds ?? []}
                questions={questions}
                questionOrder={questionOrder}
                feedbacks={feedbackTargetData?.feedbacks ?? []}
                isResponsibleTeacher={isResponsibleTeacher}
                isOrganisationUser={isOrganisationReader}
                feedbackCount={feedbackCount}
                feedbackTargetId={id}
              />
            </Box>
          ))}

        {isTeacher && (
          <FormControlLabel
            sx={styles.legacySwitch}
            control={<Switch checked={useLegacy} onClick={() => saveLegacySetting(!useLegacy)} />}
            label={t('feedbackTargetResults:useLegacyVersion')}
          />
        )}
      </Box>
    </>
  )
})

const Results = () => {
  const componentRef = useRef()

  return (
    <Box>
      <ResultsView ref={componentRef} />
    </Box>
  )
}

export default Results
