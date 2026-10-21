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

  const removedStudentNumbers = removal?.kind === 'input' ? removal.removedStudentNumbers : [...errorStudentNumbers]
  const content =
    removedStudentNumbers.length === 1
      ? t('organisationSurveys:confirmStudentDelete', { studentNumber: removedStudentNumbers[0] })
      : t('organisationSurveys:confirmStudentDeleteMany', { count: removedStudentNumbers.length })

  const details = removedStudentNumbers.length > 1 && (
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
          {removedStudentNumbers.map((studentNumber, index) => (
            <li key={`${studentNumber}-${index}`}>{studentNumber}</li>
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
