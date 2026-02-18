import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Alert, Paper } from '@mui/material'
import { useInView } from 'react-intersection-observer'

import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
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
import useFeedbackTargetId from '../../useFeedbackTargetId'

const NotEnoughFeedbacks = ({ t }) => (
  <Box mb={2}>
    <Alert severity="warning" data-cy="notEnoughFeedbacks">
      {t('feedbackTargetResults:notEnoughFeedbacksInfo')}
    </Alert>
  </Box>
)

const NotEnoughStudents = ({ t }) => (
  <Box my={2}>
    <Alert severity="warning" data-cy="notEnoughStudents">
      {t('feedbackTargetResults:notEnoughStudentsInfo', { count: FEEDBACK_HIDDEN_STUDENT_COUNT })}
    </Alert>
  </Box>
)

const SmallCourseInfo = ({ t }) => (
  <Box sx={{ marginTop: '16px', marginBottom: '40px' }}>
    <Alert severity="warning" data-cy="smallCourseInfo">
      {t('feedbackTargetResults:smallCourseInfo', { count: FEEDBACK_HIDDEN_STUDENT_COUNT })}
    </Alert>
  </Box>
)

const FeedbackNotVisibleAlert = ({ enoughStudents, enoughFeedbacks }) => {
  const { t } = useTranslation()

  if (!enoughFeedbacks) return <NotEnoughFeedbacks t={t} />
  if (!enoughStudents) return <NotEnoughStudents t={t} />

  return null
}

const OnlyTeacherAccess = ({ t }) => (
  <Box mt={2}>
    <Alert severity="info">{t('feedbackTargetResults:teacherAccessInfo')}</Alert>
  </Box>
)

/**
 * Get the groups for the feedback target
 * If the feedback target has a grouping question, use the options from that question
 * Otherwise use the groups from the feedback target
 */
const getGroups = feedbackTarget => {
  const groupQuestion = feedbackTarget.surveys.teacherSurvey?.questions?.find(q => q.secondaryType === 'GROUPING')

  if (groupQuestion) {
    return groupQuestion.data.options.map(opt => ({
      id: opt.id,
      name: opt.label,
      teachers: feedbackTarget.groups?.find(g => g.id === opt.id)?.teachers,
      // It would be nice to have studentCount here as well. Atm it's not available when using grouping question
    }))
  }

  return feedbackTarget.groups ?? []
}

const FilterSection = ({ isLoading, groupId, setGroupId, feedbackResults, exportRef }) => {
  const { ref, inView } = useInView({ initialInView: true })

  const { feedbackTarget } = useFeedbackTargetContext()

  const { studentCount } = feedbackTarget

  const groups = getGroups(feedbackTarget)

  const hasMultipleGroups = groups?.length > 1

  const feedbacks = feedbackResults?.feedbacks
  const groupsAvailable = feedbackResults?.groupsAvailable

  const isSticky = hasMultipleGroups && groupsAvailable
  const isStuckTop = !inView && isSticky

  return (
    <Box
      sx={{
        position: isSticky ? 'sticky' : 'initial',
        top: '-1px',
        zIndex: 100,
      }}
    >
      <Box h="1px" ref={ref} />
      <Paper
        sx={{
          p: '1rem',
          justifyContent: 'space-between',
          backgroundColor: isStuckTop ? 'white' : 'transparent',
          display: 'flex',
        }}
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
  const exportRef = useRef(null)
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
    summary,
    opensAt,
    closesAt,
    feedbackReminderLastSentAt,
  } = feedbackTarget

  const feedbackCount = summary?.data?.feedbackCount ?? 0
  const studentCount = summary?.data?.studentCount ?? 0

  const isOpen = feedbackTargetIsOpen(feedbackTarget)

  const enoughFeedbacks = feedbackCount > 0
  const enoughStudents = !FEEDBACK_HIDDEN_STUDENT_COUNT || studentCount >= FEEDBACK_HIDDEN_STUDENT_COUNT

  const feedbackHasStarted = new Date(feedbackTarget.opensAt) < new Date()
  const filtersVisible = isOrganisationReader || isResponsibleTeacher

  const feedbacks = feedbackTargetData?.feedbacks ?? []
  const groupFeedbackCount = feedbacks.length
  const groupStudentCount = feedbackTargetData?.studentCount ?? 0

  const showFeedback = enoughFeedbacks && (enoughStudents || (feedbacks.length > 0 && isResponsibleTeacher))

  return (
    <Box id="feedback-target-tab-content">
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
        {feedbackHasStarted && !isOpen && enoughFeedbacks && <FeedbackResponse feedbackTarget={feedbackTarget} />}

        {isOpen && feedback && (
          <Alert data-cy="feedback-target-results-thank-you" severity="info" sx={{ mb: 2 }}>
            {t('feedbackTargetResults:thankYouMessage')}
          </Alert>
        )}

        {showFeedback && studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT && <SmallCourseInfo t={t} />}

        {!isMobile && showFeedback && (
          <FeedbackChart
            feedbacks={feedbacks}
            studentCount={groupStudentCount}
            opensAt={opensAt}
            closesAt={closesAt}
            feedbackReminderLastSentAt={feedbackReminderLastSentAt}
            t={t}
          />
        )}

        {showFeedback ? (
          <QuestionResults
            publicityConfigurableQuestionIds={publicityConfigurableQuestionIds}
            publicQuestionIds={publicQuestionIds ?? []}
            questions={questions}
            questionOrder={questionOrder}
            feedbacks={feedbacks}
            isResponsibleTeacher={isResponsibleTeacher}
            isOrganisationUser={isOrganisationReader}
            isOpen={isOpen}
            feedbackCount={groupFeedbackCount}
            feedbackTargetId={id}
          />
        ) : (
          <FeedbackNotVisibleAlert enoughStudents={enoughStudents} enoughFeedbacks={enoughFeedbacks} />
        )}
      </Box>
    </Box>
  )
}

export default Results
