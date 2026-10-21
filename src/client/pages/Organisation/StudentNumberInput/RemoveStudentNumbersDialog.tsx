import { ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { StudentNumberRemoval } from './useStudentNumberRemoval'

import ConfirmDialog from '../../../components/common/ConfirmDialog'
import { focusIndicatorStyle } from '../../../util/accessibility'

type RemoveStudentNumbersDialogProps = {
  open: boolean
  removal: StudentNumberRemoval | null
  errorStudentNumbers: Set<string>
  disableRestoreFocus: boolean
  onConfirm: () => void
  onClose: () => void
  onExited: () => void
}

const RemoveStudentNumbersDialog = ({ removal, errorStudentNumbers, ...props }: RemoveStudentNumbersDialogProps) => {
  const { t } = useTranslation()

  const [firstErrorStudentNumber] = errorStudentNumbers
  let content: string
  if (removal?.kind === 'chip') {
    content = t('organisationSurveys:confirmStudentDelete', { studentNumber: removal.studentNumber })
  } else if (errorStudentNumbers.size === 1) {
    content = t('organisationSurveys:confirmStudentDelete', { studentNumber: firstErrorStudentNumber })
  } else {
    content = t('organisationSurveys:confirmStudentDeleteMany', { count: errorStudentNumbers.size })
  }

  const details = removal?.kind !== 'chip' && errorStudentNumbers.size > 1 && (
    <Accordion
      variant="outlined"
      disableGutters
      sx={{
        mt: 2,
        '&::before': { display: 'none' },
        '&:last-of-type': { borderRadius: '0.8rem' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: '0.8rem', ...focusIndicatorStyle() }}>
        {t('organisationSurveys:studentNumbersToRemove')}
      </AccordionSummary>
      <AccordionDetails>
        <Box component="ul" sx={{ m: 0, columnWidth: '8rem' }}>
          {[...errorStudentNumbers].map(studentNumber => (
            <li key={studentNumber}>{studentNumber}</li>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )

  return (
    <ConfirmDialog
      {...props}
      title={t('organisationSurveys:confirmStudentDeleteTitle')}
      content={content}
      details={details}
      confirmLabel={t('organisationSurveys:remove')}
      confirmColor="error"
      dataCy="formik-student-number-input-remove-erroneous-dialog"
    />
  )
}

export default RemoveStudentNumbersDialog
