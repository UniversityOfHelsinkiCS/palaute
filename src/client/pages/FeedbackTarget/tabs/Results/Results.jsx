import { Box, Alert, Paper } from '@mui/material'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'

import useFeedbackTargetFeedbacks from '../../../../hooks/useFeedbackTargetFeedbacks'
import useOpenAnswerActions from '../../../../hooks/useOpenAnswerActions'
import useQuestionPublicityMutation from '../../../../hooks/useQuestionPublicityMutation'
import { FEEDBACK_HIDDEN_STUDENT_COUNT } from '../../../../util/common'
import { getSafeCourseCode } from '../../../../util/courseIdentifiers'
import feedbackTargetIsOpen from '../../../../util/feedbackTargetIsOpen'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import ChartTableToggle, { useShowTable } from './ChartTableToggle'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'
import FeedbackResponse from './FeedbackResponse'
import GroupSelector from './GroupSelector'
import QuestionResults from './QuestionResults'
import FeedbackChart from './QuestionResults/FeedbackChart'
import useChartConfig from './QuestionResults/useChartConfig'
import { getCourseStartDate } from './utils'

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

const getExportFilename = feedbackTarget => {
  const safeCourseCode = getSafeCourseCode({
    courseCode: feedbackTarget?.courseUnit?.courseCode,
    forUrl: false,
  })

  return `${safeCourseCode}_${getCourseStartDate(feedbackTarget)}`
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
          <ExportFeedbacksMenu
            questions={feedbackTarget.questions}
            feedbacks={feedbacks}
            filename={getExportFilename(feedbackTarget)}
            componentRef={exportRef}
          />
        </Box>
      </Paper>
    </Box>
  )
}

const Results = () => {
  const id = useFeedbackTargetId()

  const { t } = useTranslation()
  const exportRef = useRef(null)
  const [groupId, setGroupId] = React.useState('ALL')
  const [showTable, setShowTable] = useShowTable()

  useChartConfig()

  const { feedbackTarget, isOrganisationReader, isResponsibleTeacher, isTeacher, isOrganisationAdmin, isAdmin } =
    useFeedbackTargetContext()
  const { feedbackTargetData, isLoading } = useFeedbackTargetFeedbacks(id, groupId)
  const publicityMutation = useQuestionPublicityMutation({ resource: 'feedbackTarget', resourceId: id })
  const openAnswerActions = useOpenAnswerActions({
    hidePath: `/feedback-targets/${feedbackTarget.id}/hide-feedback`,
    deletePath: `/feedback-targets/${feedbackTarget.id}/delete-feedback`,
    queryKey: ['feedbackTargetFeedbacks', String(feedbackTarget.id)],
    canHide: isTeacher || isOrganisationAdmin,
    canDelete: isAdmin,
  })

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

        {showFeedback && <ChartTableToggle showTable={showTable} setShowTable={setShowTable} />}

        {showFeedback && (
          <FeedbackChart
            feedbacks={feedbacks}
            studentCount={groupStudentCount}
            opensAt={opensAt}
            closesAt={closesAt}
            feedbackReminderLastSentAt={feedbackReminderLastSentAt}
            t={t}
            showTable={showTable}
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
            savePublicQuestionIds={publicityMutation.mutateAsync}
            openAnswerActions={openAnswerActions}
            showTable={showTable}
          />
        ) : (
          <FeedbackNotVisibleAlert enoughStudents={enoughStudents} enoughFeedbacks={enoughFeedbacks} />
        )}
      </Box>
    </Box>
  )
}

export default Results
