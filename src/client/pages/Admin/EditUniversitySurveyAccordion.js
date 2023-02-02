import React from 'react'

import { Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import useUniversitySurvey from '../../hooks/useUniversitySurvey'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { UniversitySurvey } from '../../components/QuestionEditor'

const EditUniversitySurveyAccordion = () => {
  const { survey, isLoading: surveyIsLoading } = useUniversitySurvey()

  const isLoading = surveyIsLoading

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
          <UniversitySurvey universitySurvey={survey} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default EditUniversitySurveyAccordion
