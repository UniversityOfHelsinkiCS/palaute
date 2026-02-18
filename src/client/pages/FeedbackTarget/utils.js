import { useTranslation } from 'react-i18next'
import { getSafeCourseCode } from '../../util/courseIdentifiers'

export const copyLink = link => {
  navigator.clipboard.writeText(link)
}

export const getCourseUnitSummaryPath = feedbackTarget => {
  const safeCourseCode = getSafeCourseCode({ courseCode: feedbackTarget?.courseUnit?.courseCode })

  const summaryPath = `/course-summary/course-unit/${safeCourseCode}`

  return summaryPath
}

export const getActiveTabName = ({ currentPath, feedbackGiven, isOpen, isStudent, feedbackResponseEmailSent }) => {
  const { t } = useTranslation()
  const feedbackTabName = () => {
    if (feedbackGiven && isOpen) return t('feedbackTargetView:editFeedbackTab')

    if (isStudent) return t('feedbackTargetView:surveyTab')

    return t('common:preview')
  }

  const tab = currentPath.split('/').slice(-1)[0]

  const tabNames = {
    feedback: feedbackTabName(),
    edit: t('feedbackTargetView:surveyQuestionsTab'),
    'edit-feedback-response': feedbackResponseEmailSent
      ? t('feedbackTargetView:editFeedbackResponseTab')
      : t('feedbackTargetView:giveFeedbackResponseTab'),
    share: t('feedbackTargetView:shareTab'),
    'continuous-feedback': t('feedbackTargetView:continuousFeedbackTab'),
    'interim-feedback': t('feedbackTargetView:interimFeedbackTab'),
    results: t('feedbackTargetView:feedbacksTab'),
    'students-with-feedback': t('feedbackTargetView:studentsWithFeedbackTab'),
    togen: 'Togen',
    logs: 'Logs',
  }

  return tabNames[tab]
}
