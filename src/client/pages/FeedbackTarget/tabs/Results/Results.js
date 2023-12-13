import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Alert, Paper } from '@mui/material'
import { useInView } from 'react-intersection-observer'

import useFeedbackTargetFeedbacks from '../../../../hooks/useFeedbackTargetFeedbacks'
import QuestionResults from './QuestionResults'
import FeedbackResponse from './FeedbackResponse'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'

import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import FeedbackChart from './QuestionResults/FeedbackChart'
import useIsMobile from '../../../../hooks/useIsMobile'
import useChartConfig from './QuestionResults/useChartConfig'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import GroupSelector from './GroupSelector'
import { getGroups } from './utils'
import useFeedbackTargetId from '../../useFeedbackTargetId'

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning" data-cy="notEnoughFeedbacks">
      {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
    </Alert>
  </Box>
)

const OnlyTeacherAccess = ({ t }) => (
  <Box mt={2}>
    <Alert severity="info">{t('feedbackTargetResults:teacherAccessInfo')}</Alert>
  </Box>
)

const FilterSection = ({ isLoading, groupId, setGroupId, feedbackResults, exportRef }) => {
  const { ref, inView } = useInView({ initialInView: true })

  const { feedbackTarget } = useFeedbackTargetContext()
  const { studentCount } = feedbackTarget
  const groups = getGroups(feedbackTarget)
  const hasMultipleGroups = groups?.length > 1
  const groupsAvailable = feedbackResults?.groupsAvailable
  const feedbacks = feedbackResults?.feedbacks

  const isSticky = hasMultipleGroups && groupsAvailable
  const isStuckTop = !inView && isSticky

  return (
    <Box position={isSticky ? 'sticky' : 'initial'} top="-1px" zIndex="100">
      <Box h="1px" ref={ref} />
      <Paper
        sx={{ p: '1rem', display: 'flex', alignItems: 'center', backgroundColor: isStuckTop ? 'white' : 'transparent' }}
        elevation={isStuckTop ? 4 : 0}
      >
        {!isLoading && hasMultipleGroups && (
          <GroupSelector
            groupId={groupId}
            setGroupId={setGroupId}
            groups={groups}
            groupsAvailable={groupsAvailable}
            studentCount={studentCount}
          />
        )}
        <Box ml="auto">
          <ExportFeedbacksMenu feedbackTarget={feedbackTarget} feedbacks={feedbacks} componentRef={exportRef} />
        </Box>
      </Paper>
    </Box>
  )
}

const Results = () => {
  const id = useFeedbackTargetId()

  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const exportRef = useRef()
  const [groupId, setGroupId] = React.useState('ALL')

  useChartConfig()

  const { feedbackTarget, isOrganisationReader, isResponsibleTeacher, isTeacher } = useFeedbackTargetContext()
  const { feedbackTargetData, isLoading } = useFeedbackTargetFeedbacks(id, groupId)

  const {
    questions,
    questionOrder,
    publicQuestionIds,
    publicityConfigurableQuestionIds,
    feedback,
    feedbackCount,
    opensAt,
    closesAt,
    feedbackReminderLastSentAt,
  } = feedbackTarget

  const isOpen = feedbackTargetIsOpen(feedbackTarget)
  const enoughFeedbacks = feedbackCount > 0

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()
  const filtersVisible = isOrganisationReader || isResponsibleTeacher

  const feedbacks = feedbackTargetData?.feedbacks ?? []
  const groupFeedbackCount = feedbacks.length
  const groupStudentCount = feedbackTargetData?.studentCount ?? 0

  return (
    <>
      {filtersVisible && (
        <FilterSection
          isLoading={isLoading}
          feedbackResults={feedbackTargetData}
          groupId={groupId}
          setGroupId={setGroupId}
          exportRef={exportRef}
        />
      )}

      {isTeacher && !isResponsibleTeacher && <OnlyTeacherAccess t={t} />}

      <Box ref={exportRef}>
        {feedbackHasStarted && !isOpen && enoughFeedbacks && (
          <Box mt={4} mb={2}>
            <FeedbackResponse feedbackTarget={feedbackTarget} />
          </Box>
        )}

        {isOpen && feedback && (
          <Box mb={2}>
            <Alert data-cy="feedback-target-results-thank-you" severity="info">
              {t('feedbackTargetResults:thankYouMessage')}
            </Alert>
          </Box>
        )}

        {!isMobile && (
          <Box>
            <FeedbackChart
              feedbacks={feedbacks}
              studentCount={groupStudentCount}
              opensAt={opensAt}
              closesAt={closesAt}
              feedbackReminderLastSentAt={feedbackReminderLastSentAt}
              t={t}
            />
          </Box>
        )}

        {!enoughFeedbacks && <NotEnoughFeedbacks t={t} />}

        {enoughFeedbacks && (
          <QuestionResults
            publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
            publicQuestionIds={publicQuestionIds ?? []}
            questions={questions}
            questionOrder={questionOrder}
            feedbacks={feedbacks}
            isResponsibleTeacher={isResponsibleTeacher}
            isOrganisationUser={isOrganisationReader}
            feedbackCount={groupFeedbackCount}
            feedbackTargetId={id}
          />
        )}
      </Box>
    </>
  )
}

export default Results
