import { WarningAmber } from '@mui/icons-material'
import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../components/common/NorButton'

type ShowAllStudentsToggleProps = {
  count: number
  showAll: boolean
  onShowAllChange: (showAll: boolean) => void
}

// Kept separate from StudentNumberInput so that the pending state renders without re-rendering all the chips
const ShowAllStudentsToggle = ({ count, showAll, onShowAllChange }: ShowAllStudentsToggleProps) => {
  const { t } = useTranslation()
  const [isPending, startTransition] = React.useTransition()
  const [nextShowAll, setNextShowAll] = React.useState(showAll)

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 1, mt: 1 }}>
      <NorButton
        data-cy="formik-student-number-input-show-all"
        color={nextShowAll ? 'secondary' : 'warning'}
        icon={!nextShowAll && <WarningAmber />}
        type="button"
        onClick={() => {
          const next = !nextShowAll
          setNextShowAll(next)
          startTransition(() => onShowAllChange(next))
        }}
      >
        {nextShowAll ? t('organisationSurveys:showFewerStudents') : t('organisationSurveys:showAllStudents', { count })}
      </NorButton>

      {/* Always rendered so that screen readers announce changes to its content */}
      <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 24 }}>
        {isPending && (
          <>
            <CircularProgress size={16} aria-hidden />
            <Typography variant="body2">
              {nextShowAll
                ? t('organisationSurveys:expandingStudentList')
                : t('organisationSurveys:collapsingStudentList')}
            </Typography>
          </>
        )}
        {!isPending && showAll && (
          <Typography variant="body2">{t('organisationSurveys:allStudentsShown', { count })}</Typography>
        )}
      </Box>
    </Box>
  )
}

export default ShowAllStudentsToggle
