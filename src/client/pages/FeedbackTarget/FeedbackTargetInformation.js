import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'
import { Box, Button, Typography } from '@mui/material'
import CopyIcon from '@mui/icons-material/FileCopyOutlined'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import useCourseRealisationSummaries from '../../hooks/useCourseRealisationSummaries'
import { copyLink, getCourseUnitSummaryPath } from './utils'
import LinkButton from '../../components/common/LinkButton'
import Dates from './Dates/Dates'
import PercentageCell from '../CourseSummary/PercentageCell'
import { getLanguageValue } from '../../util/languageUtils'
import { getCourseCode, getPrimaryCourseName, getSecondaryCourseName } from '../../util/courseIdentifiers'
import { TagChip } from '../../components/common/TagChip'
import TeacherList from './TeacherList/TeacherList'
import { useInterimFeedbackParent } from './tabs/InterimFeedback/useInterimFeedbacks'

const FeedbackTargetInformation = () => {
  const { feedbackTarget, organisation, isStudent, isTeacher, isAdmin } = useFeedbackTargetContext()
  const { i18n, t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()

  const isInterimFeedback =
    feedbackTarget.userCreated &&
    !(feedbackTarget.courseUnit.userCreated && feedbackTarget.courseRealisation.userCreated)

  const { parentFeedback, isLoading: isParentFeedbackLoading } = useInterimFeedbackParent(
    feedbackTarget.id,
    isInterimFeedback
  )
  const { courseRealisationSummaries } = useCourseRealisationSummaries(feedbackTarget.courseUnit.courseCode, {
    enabled: isTeacher,
  })

  if (isInterimFeedback && isParentFeedbackLoading) return null

  const {
    courseUnit,
    courseRealisation,
    administrativePersons,
    responsibleTeachers,
    teachers,
    feedbackCount,
    studentCount,
    userCreated,
  } = feedbackTarget

  const parentCourseName = parentFeedback
    ? getLanguageValue(
        getPrimaryCourseName(parentFeedback?.courseUnit, parentFeedback?.courseRealisation, parentFeedback),
        i18n.language
      )
    : ''

  const primaryCourseName = getLanguageValue(
    getPrimaryCourseName(courseUnit, courseRealisation, feedbackTarget),
    i18n.language
  )
  const secondaryCourseName = getLanguageValue(
    getSecondaryCourseName(courseRealisation, courseUnit, feedbackTarget),
    i18n.language
  )
  const courseCode = getCourseCode(courseUnit)
  // Show course code only if it is not already in the course name
  const visibleCourseCode = primaryCourseName.indexOf(courseCode) > -1 ? '' : courseCode
  const coursePageUrl = `${t('links:courseRealisationPage')}${courseRealisation.id}`
  const sisuPageUrl = `${t('links:courseSisuPage', { sisuId: courseRealisation.id })}`
  const courseSummaryPath = getCourseUnitSummaryPath(feedbackTarget)
  const showTags = !isStudent && feedbackTarget?.tags?.length > 0
  const showCourseSummaryLink = courseRealisationSummaries?.courseRealisations?.length > 0 && !userCreated

  const handleCopyLink = () => {
    const link = `https://${window.location.host}/targets/${feedbackTarget.id}/feedback`
    copyLink(link)
    enqueueSnackbar(`${t('feedbackTargetView:linkCopied')}: ${link}`, {
      variant: 'info',
    })
  }

  return (
    <Box mb="1rem">
      <Box display="flex">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Box display="flex" flexDirection="column" gap="1rem">
            <Box display="flex" flexWrap="wrap" alignItems="end" columnGap="1rem" rowGap="0.3rem">
              <Typography variant="h4" component="h1">
                {primaryCourseName}
              </Typography>
              <Typography variant="h5" color="textSecondary">
                {visibleCourseCode}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center">
              <Typography variant="body1" component="h2" sx={{ mr: '1rem' }}>
                {secondaryCourseName}
              </Typography>
              {showTags && feedbackTarget.tags.map(tag => <TagChip key={tag.id} tag={tag} language={i18n.language} />)}
            </Box>
          </Box>

          <Box
            display="flex"
            mt="1rem"
            rowGap="1rem"
            sx={theme => ({ [theme.breakpoints.down('md')]: { flexDirection: 'column' } })}
          >
            <Box
              sx={{
                pb: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                rowGap: '1rem',
                columnGap: '0.7rem',
                flexGrow: 0,
              }}
            >
              <Dates />

              {isTeacher && (
                <Box display="flex" gap="1rem" alignItems="center">
                  <Typography color="textSecondary">{t('feedbackTargetView:studentsWithFeedbackTab')}:</Typography>
                  <PercentageCell
                    label={`${feedbackCount}/${studentCount}`}
                    percent={(feedbackCount / studentCount) * 100}
                  />
                </Box>
              )}
            </Box>

            <Box
              sx={theme => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                [theme.breakpoints.up('md')]: {
                  ml: 'auto',
                  pr: '2rem',
                  alignItems: 'normal',
                },
              })}
            >
              {!!responsibleTeachers?.length && (
                <TeacherList
                  title={t('feedbackTargetView:responsibleTeachers')}
                  teachers={responsibleTeachers}
                  open={responsibleTeachers.length < 8}
                />
              )}
              {!!teachers?.length && <TeacherList teachers={teachers} title={t('feedbackTargetView:teachers')} />}

              {!isStudent && !!administrativePersons?.length && (
                <TeacherList teachers={administrativePersons} title={t('feedbackTargetView:administrativePersons')} />
              )}
            </Box>

            <Box
              sx={{
                pb: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                rowGap: '0.4rem',
                alignItems: 'start',
                '@media print': {
                  display: 'none',
                },
              }}
            >
              {isTeacher && (
                <Button sx={{ px: '0.3rem' }} onClick={handleCopyLink} endIcon={<CopyIcon />}>
                  {t('feedbackTargetView:copyLink')}
                </Button>
              )}

              {organisation && (
                <LinkButton
                  to={`/organisations/${organisation.code}`}
                  title={getLanguageValue(organisation.name, i18n.language)}
                />
              )}

              {isTeacher && showCourseSummaryLink && (
                <LinkButton to={courseSummaryPath} title={t('feedbackTargetView:courseSummary')} />
              )}

              {!userCreated && <LinkButton to={coursePageUrl} title={t('feedbackTargetView:coursePage')} external />}

              {isTeacher && <LinkButton to={t('links:wikiTeacherHelp')} title={t('footer:wikiLink')} external />}

              {isAdmin && !userCreated && (
                <LinkButton to={sisuPageUrl} title={t('feedbackTargetView:courseSisuPage')} external />
              )}
              {isInterimFeedback && (
                <LinkButton to={`/targets/${parentFeedback?.id}/interim-feedback`} title={parentCourseName} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default FeedbackTargetInformation
