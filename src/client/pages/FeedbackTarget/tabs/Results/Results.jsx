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
import TabHeading from '../../TabHeading'
import useFeedbackTargetId from '../../useFeedbackTargetId'
import { getQuestions } from '../FeedbackView/utils'
import ChartTableToggle, { useShowTable } from './ChartTableToggle'
import ExportFeedbacksMenu from './ExportFeedbacksMenu'
import FeedbackResponse from './FeedbackResponse'
import GroupSelector from './GroupSelector'
import OrderedQuestionResults from './OrderedQuestionResults'
import { MAX_WIDTH } from './OrderedQuestionResults/layout'
import QuestionResults from './QuestionResults'
import FeedbackChart from './QuestionResults/FeedbackChart'
import useChartConfig from './QuestionResults/useChartConfig'
import ResultsButtons from './ResultsButtons'
import ResultsLayoutSwitch, { useOrderedLayout } from './ResultsLayoutSwitch'
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

const FilterSection = ({ groupId, setGroupId, groups, groupsAvailable, studentCount }) => {
  const { ref, inView } = useInView({ initialInView: true })

  const isSticky = groupsAvailable
  const isStuckTop = !inView && isSticky

  return (
    <Box
      sx={{
        position: isSticky ? 'sticky' : 'initial',
        top: '-1px',
        zIndex: 100,
        mb: 2,
      }}
    >
      <Box h="1px" ref={ref} />
      <Paper
        sx={{
          p: '1rem',
          backgroundColor: isStuckTop ? 'white' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        elevation={isStuckTop ? 4 : 0}
      >
        <GroupSelector
          groupId={groupId}
          setGroupId={setGroupId}
          groups={groups}
          groupsAvailable={groupsAvailable}
          studentCount={studentCount}
        />
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
  const [ordered, setOrdered] = useOrderedLayout()

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
  // Does not depend on the selected group, so that the group selector stays when a group has no feedback
  const feedbackCanBeShown = enoughFeedbacks && (enoughStudents || isResponsibleTeacher)
  const filtersVisible = (isOrganisationReader || isResponsibleTeacher) && feedbackCanBeShown

  const feedbacks = feedbackTargetData?.feedbacks ?? []
  const groupFeedbackCount = feedbacks.length
  const groupStudentCount = feedbackTargetData?.studentCount ?? 0

  const showFeedback = enoughFeedbacks && (enoughStudents || (feedbacks.length > 0 && isResponsibleTeacher))

  const questionResultsProps = {
    publicityConfigurableQuestionIds,
    publicQuestionIds: publicQuestionIds ?? [],
    questions,
    questionOrder,
    feedbacks,
    isResponsibleTeacher,
    isOrganisationUser: isOrganisationReader,
    isOpen,
    feedbackCount: groupFeedbackCount,
    savePublicQuestionIds: publicityMutation.mutateAsync,
    openAnswerActions,
    showTable,
  }

  // The order in which the students answered the questions, which can differ from that of the editor
  const surveyOrder = getQuestions(feedbackTarget).map(question => question.id)

  const groups = getGroups(feedbackTarget)
  const groupSelectorVisible = filtersVisible && !isLoading && groups.length > 1

  const toolbar = (showFeedback || filtersVisible) && (
    <ResultsButtons sx={{ '@media print': { display: 'none' } }}>
      {showFeedback && <ChartTableToggle showTable={showTable} setShowTable={setShowTable} color="secondary" />}
      {filtersVisible && (
        <ExportFeedbacksMenu
          questions={questions}
          feedbacks={feedbackTargetData?.feedbacks}
          filename={getExportFilename(feedbackTarget)}
          componentRef={exportRef}
        />
      )}
    </ResultsButtons>
  )

  return (
    <Box id="feedback-target-tab-content" sx={ordered ? { maxWidth: MAX_WIDTH } : undefined}>
      <TabHeading actions={toolbar}>{t('feedbackTargetView:feedbacksTab')}</TabHeading>

      {isOpen && feedback && (
        <Alert data-cy="feedback-target-results-thank-you" severity="info" sx={{ mb: 4 }}>
          {t('feedbackTargetResults:thankYouMessage')}
        </Alert>
      )}

      {showFeedback && studentCount < FEEDBACK_HIDDEN_STUDENT_COUNT && <SmallCourseInfo t={t} />}

      <Box ref={exportRef}>
        {feedbackHasStarted && !isOpen && enoughFeedbacks && (
          <FeedbackResponse feedbackTarget={feedbackTarget} inTabPanel />
        )}

        <Box sx={{ display: 'contents', '@media print': { display: 'none' } }}>
          {groupSelectorVisible && (
            <FilterSection
              groupId={groupId}
              setGroupId={setGroupId}
              groups={groups}
              groupsAvailable={feedbackTargetData?.groupsAvailable}
              studentCount={feedbackTarget.studentCount}
            />
          )}

          {isTeacher && !isResponsibleTeacher && <OnlyTeacherAccess t={t} />}
        </Box>

        {showFeedback && (
          <FeedbackChart
            feedbacks={feedbacks}
            studentCount={groupStudentCount}
            opensAt={opensAt}
            closesAt={closesAt}
            feedbackReminderLastSentAt={feedbackReminderLastSentAt}
            t={t}
            showTable={showTable}
            inTabPanel
            fullWidth={ordered}
          />
        )}

        {showFeedback && <ResultsLayoutSwitch ordered={ordered} setOrdered={setOrdered} />}

        {showFeedback && ordered && (
          <OrderedQuestionResults
            {...questionResultsProps}
            questionOrder={surveyOrder.length > 0 ? surveyOrder : questionOrder}
            // Under the h3 of the tab and level with the h4s of the sections above
            baseHeadingLevel={4}
          />
        )}

        {showFeedback && !ordered && <QuestionResults {...questionResultsProps} inTabPanel />}

        {!showFeedback && <FeedbackNotVisibleAlert enoughStudents={enoughStudents} enoughFeedbacks={enoughFeedbacks} />}
      </Box>
    </Box>
  )
}

export default Results
