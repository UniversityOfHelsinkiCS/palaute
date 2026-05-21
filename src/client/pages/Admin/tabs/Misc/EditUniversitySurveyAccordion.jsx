import React from 'react'

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
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import useUniversitySurveyVersions from '../../../../hooks/useUniversitySurveyVersions'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { UniversitySurvey } from '../../../../components/QuestionEditor'
import formatDate from '../../../../util/formatDate'

const formatVersionLabel = survey => {
  if (!survey.validFrom) return 'original'
  const date = new Date(survey.validFrom)
  const isCurrent = date <= new Date()
  return `${formatDate(date)}${isCurrent ? ' (current)' : ' (future)'}`
}

const EditUniversitySurveyAccordion = () => {
  const { versions, isLoading } = useUniversitySurveyVersions()
  const [selectedId, setSelectedId] = React.useState(null)

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

          {selectedSurvey && <UniversitySurvey key={selectedSurvey.id} universitySurvey={selectedSurvey} />}
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default EditUniversitySurveyAccordion
