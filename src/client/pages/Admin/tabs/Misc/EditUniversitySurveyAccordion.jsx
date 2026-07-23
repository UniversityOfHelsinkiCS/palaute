import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'
import { UniversitySurvey } from '../../../../components/QuestionEditor'
import useUniversitySurveyVersions from '../../../../hooks/useUniversitySurveyVersions'
import apiClient from '../../../../util/apiClient'
import formatDate from '../../../../util/formatDate'
import queryClient from '../../../../util/queryClient'

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d
}

const formatVersionLabel = survey => {
  if (!survey.validFrom) return 'original'
  const date = new Date(survey.validFrom)
  const isCurrent = date <= new Date()
  return `${formatDate(date)}${isCurrent ? ' (current)' : ' (future)'}`
}

const EditUniversitySurveyAccordion = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const { versions, isLoading } = useUniversitySurveyVersions()
  const [selectedId, setSelectedId] = React.useState(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [validFrom, setValidFrom] = React.useState(tomorrow)
  const [submitting, setSubmitting] = React.useState(false)

  const sortedVersions = React.useMemo(
    () =>
      [...versions].sort((a, b) => {
        if (a.validFrom === b.validFrom) return 0
        if (a.validFrom === null) return 1
        if (b.validFrom === null) return -1
        return b.validFrom > a.validFrom ? 1 : -1
      }),
    [versions]
  )

  const activeId = selectedId ?? sortedVersions[0]?.id ?? null
  const selectedSurvey = sortedVersions.find(s => s.id === activeId) ?? null

  const handleOpenDialog = () => {
    setValidFrom(tomorrow())
    setDialogOpen(true)
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const { data } = await apiClient.post('/surveys/university', { validFrom })
      await queryClient.refetchQueries(['universitySurveyVersions'])
      setSelectedId(data.id)
      enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      setDialogOpen(false)
    } catch {
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box mt={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>Edit university survey</Typography>
        </AccordionSummary>

        <AccordionDetails>
          {sortedVersions.length > 1 && (
            <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
              <InputLabel>Version</InputLabel>
              <Select value={activeId ?? ''} label="Version" onChange={e => setSelectedId(Number(e.target.value))}>
                {sortedVersions.map(survey => (
                  <MenuItem key={survey.id} value={survey.id}>
                    {formatVersionLabel(survey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {selectedSurvey && (
            <UniversitySurvey
              key={selectedSurvey.id}
              universitySurvey={selectedSurvey}
              onCreateVersionClick={handleOpenDialog}
            />
          )}
        </AccordionDetails>
      </Accordion>

      <Dialog open={dialogOpen} onClose={() => !submitting && setDialogOpen(false)}>
        <DialogTitle>Create new university survey version</DialogTitle>
        <DialogContent>
          <Box mt={1} mb={2}>
            <DatePicker
              label="Valid from"
              value={validFrom}
              onChange={date => setValidFrom(date)}
              minDate={tomorrow()}
              format="dd/MM/yyyy"
              slots={{ textField: TextField }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          <DialogContentText>
            This will clone all questions from the most recent university survey into a new version. The workload
            question is shared; all other questions are duplicated. This action is difficult to undo.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <NorButton onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </NorButton>
          <NorButton onClick={handleCreate} disabled={submitting || !validFrom} color="primary">
            Create
          </NorButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EditUniversitySurveyAccordion
