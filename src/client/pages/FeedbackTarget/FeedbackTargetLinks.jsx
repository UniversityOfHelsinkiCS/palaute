import React from 'react'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'

import { Stack, Typography } from '@mui/material'
import CopyIcon from '@mui/icons-material/FileCopyOutlined'

import { useFeedbackTargetContext } from './FeedbackTargetContext'
import { useInterimFeedbackParent } from './tabs/InterimFeedback/useInterimFeedbacks'
import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'

import LinkButton from '../../components/common/LinkButton'
import { NorButton } from '../../components/common/NorButton'

import { getLanguageValue } from '../../util/languageUtils'
import { getPrimaryCourseName } from '../../util/courseIdentifiers'

import { getCourseUnitSummaryPath, copyLink } from './utils'

const FeedbackTargetLinks = ({ isInterimFeedback = false }) => {
  const { i18n, t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const { feedbackTarget, organisation, isTeacher, isAdmin } = useFeedbackTargetContext()
  const { courseRealisationSummaries } = useCourseRealisationSummaries(feedbackTarget.courseUnit.courseCode, {
    enabled: isTeacher,
  })
  const { parentFeedback, isLoading: isParentFeedbackLoading } = useInterimFeedbackParent(
    feedbackTarget.id,
    isInterimFeedback
  )

  const { courseRealisation, userCreated } = feedbackTarget

  const parentCourseName = parentFeedback
    ? getLanguageValue(
        getPrimaryCourseName(parentFeedback?.courseUnit, parentFeedback?.courseRealisation, parentFeedback),
        i18n.language
      )
    : ''

  const dataCyPrefix = isInterimFeedback ? 'interim-' : ''

  const coursePageUrl = isTeacher
    ? `${t('links:courseUnitPage', { courseUnitId: feedbackTarget.courseUnit?.id })}`
    : `${t('links:courseUnitPageStudent', { courseUnitId: feedbackTarget.courseUnit?.id })}`
  const realisationPageUrl = `${t('links:courseRealisationPage', { sisuId: courseRealisation.id })}`
  const courseSummaryPath = getCourseUnitSummaryPath(feedbackTarget)
  const showCourseSummaryLink = courseRealisationSummaries?.feedbackTargets?.length > 0 && !userCreated

  const handleCopyLink = () => {
    const link = `https://${window.location.host}/targets/${feedbackTarget.id}/feedback`
    copyLink(link)
    enqueueSnackbar(`${t('feedbackTargetView:linkCopied')}: ${link}`, {
      variant: 'info',
    })
  }

  return (
    <Stack direction="column" spacing={2} sx={{ alignItems: 'baseline' }}>
      {isTeacher && (
        <NorButton
          color="secondary"
          data-cy={`${dataCyPrefix}feedback-target-copy-student-link`}
          onClick={handleCopyLink}
          icon={<CopyIcon />}
        >
          {t('feedbackTargetView:copyLink')}
        </NorButton>
      )}
      <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
        {organisation && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-organisation-link`}
            to={`/organisations/${organisation.code}`}
            title={getLanguageValue(organisation.name, i18n.language)}
          />
        )}
        {isTeacher && showCourseSummaryLink && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-course-summary-link`}
            to={courseSummaryPath}
            title={t('feedbackTargetView:courseSummary')}
          />
        )}
        {!userCreated && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-course-page-link`}
            to={coursePageUrl}
            title={t('feedbackTargetView:coursePage')}
            external
          />
        )}
        {isTeacher && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-wiki-link`}
            to={t('links:wikiTeacherHelp')}
            title={t('footer:wikiLink')}
            external
          />
        )}
        {isAdmin && !userCreated && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-sisu-page-link`}
            to={realisationPageUrl}
            title={t('feedbackTargetView:courseRealisationPage')}
            external
          />
        )}
        {isInterimFeedback && !isParentFeedbackLoading && (
          <LinkButton
            data-cy={`${dataCyPrefix}feedback-target-interim-feedback-parent-link`}
            to={`/targets/${parentFeedback?.id}/interim-feedback`}
            title={parentCourseName}
          />
        )}
      </Stack>
    </Stack>
  )
}

export default FeedbackTargetLinks
