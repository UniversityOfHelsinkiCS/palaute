import { Box, CircularProgress, Link, Tooltip, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useIsFetching } from '@tanstack/react-query'
import { lightFormat } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import Instructions from '../../../components/common/Instructions'
import TeacherChip from '../../../components/common/TeacherChip'
import { getDateRangeString } from '../../../util/getDateRangeString'
import { getLanguageValue, getResolvedShortLabel, getShortLabelValue } from '../../../util/languageUtils'

export const TeacherChips = ({ teachers, responsibleTeachers, administrativePersons }) => {
  const { t } = useTranslation()
  const responsibleTeacher = t('courseSummary:responsibleTeacher')
  const teacher = t('courseSummary:teacher')
  const administrativePerson = t('courseSummary:administrativePerson')

  return (
    <Box display="flex" flexWrap="wrap" maxWidth="100rem">
      {responsibleTeachers.map(t => (
        <TeacherChip key={t.id} user={t} tooltip={responsibleTeacher} outlined sx={{ backgroundColor: grey[300] }} />
      ))}

      {teachers.map(t => (
        <TeacherChip key={t.id} user={t} tooltip={teacher} sx={{ backgroundColor: grey[200] }} />
      ))}

      {administrativePersons.map(t => (
        <TeacherChip key={t.id} user={t} tooltip={administrativePerson} outlined sx={{ backgroundColor: grey[100] }} />
      ))}
    </Box>
  )
}

export const FeedbackTargetLabel = ({ feedbackTarget, language }) => {
  const { startDate, endDate, name } = feedbackTarget.courseRealisation

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')

  const datePeriod = `${formattedStartDate}–${formattedEndDate}`
  const translatedName = getLanguageValue(name, language)

  const link = feedbackTarget ? (
    <Link
      variant="body2"
      component={RouterLink}
      to={`/targets/${feedbackTarget.id}/results`}
      sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      {translatedName}
    </Link>
  ) : (
    translatedName
  )

  const teachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'TEACHER')
    .map(ufbt => ufbt.user)
  const responsibleTeachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)
  const administrativePersons = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)

  return (
    <Box display="flex" flexDirection="column" whiteSpace="nowrap" overflow="hidden">
      <Tooltip textOverflow="ellipsis" overflow="hidden" title={translatedName} arrow>
        {link}
      </Tooltip>
      <Box display="flex" alignItems="center" mb={0.5}>
        <Typography color="textSecondary" variant="body2">
          {datePeriod}
        </Typography>
        <Box mr={2} />
      </Box>
      <TeacherChips
        teachers={teachers}
        responsibleTeachers={responsibleTeachers}
        administrativePersons={administrativePersons}
      />
    </Box>
  )
}

export const CourseUnitLabel = ({ name, code, extras = [] }) => (
  <Box display="flex" flexDirection="column" pl="0.5rem">
    <Box display="flex" gap="1rem" alignItems="center">
      <Typography variant="caption" color="textSecondary">
        {code}
      </Typography>
      {extras.map((extra, idx) => (
        <Typography key={idx} variant="caption" color="textSecondary">
          ({extra})
        </Typography>
      ))}
    </Box>
    <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
      {name}
    </Typography>
  </Box>
)

export const OrganisationLabel = ({ organisation, dates }) => {
  const { i18n } = useTranslation()
  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', organisation?.id],
  })

  return (
    <Box display="flex" flexDirection="column" pl="0.5rem">
      <Typography variant="caption" color="textSecondary">
        {organisation?.code}
      </Typography>
      <Box display="flex" gap="1rem">
        <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
          {getLanguageValue(organisation?.name, i18n.language)}
        </Typography>
        {dates && <Typography variant="caption">({getDateRangeString(dates.startDate, dates.endDate)})</Typography>}
        {Boolean(isFetching) && <CircularProgress size={20} />}
      </Box>
    </Box>
  )
}

// Table headers show a question's shortLabel (when set) instead of its full label, to
// keep the sticky header from growing too tall. This renders a collapsible info box
// listing "short label: full question" for every question that has been shortened.
export const QuestionFullLabels = ({ questions }) => {
  const { t, i18n } = useTranslation()

  const shortenedQuestions = (questions ?? [])
    .map(q => {
      const shortLabel = getResolvedShortLabel(q.data?.shortLabel, i18n.language)
      const usedShortLabel =
        shortLabel && shortLabel === getShortLabelValue(q.data?.shortLabel, q.data?.label, i18n.language)

      return {
        id: q.id,
        shortLabel: usedShortLabel ? shortLabel : null,
        label: getLanguageValue(q.data?.label, i18n.language),
      }
    })
    .filter(q => q.shortLabel && q.shortLabel !== q.label)

  if (shortenedQuestions.length === 0) return null

  return (
    <Instructions title={t('courseSummary:fullQuestions')} sx={{ width: 'fit-content' }}>
      <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {shortenedQuestions.map(q => (
          <Box key={q.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography component="dt" variant="body2" sx={{ fontWeight: 600 }}>
              {`${q.shortLabel}:`}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {q.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Instructions>
  )
}

export const TagLabel = ({ tag, dates }) => {
  const { t, i18n } = useTranslation()
  const isFetching = useIsFetching({
    queryKey: ['summaries-v2', tag?.id],
  })

  return (
    <Box display="flex" flexDirection="column" pl="0.5rem">
      <Typography variant="caption" color="textSecondary">
        {t('courseSummary:tagLabel')}
      </Typography>
      <Box display="flex" gap="1rem">
        <Typography variant="body2" whiteSpace="nowrap" textOverflow="ellipsis" width="20rem" overflow="hidden">
          {getLanguageValue(tag?.name, i18n.language)}
        </Typography>
        {dates && <Typography variant="caption">({getDateRangeString(dates.startDate, dates.endDate)})</Typography>}
        {Boolean(isFetching) && <CircularProgress size={20} />}
      </Box>
    </Box>
  )
}
