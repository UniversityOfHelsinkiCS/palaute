import React from 'react'
import { useTranslation } from 'react-i18next'

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const styles = {
  accordion: {
    backgroundColor: '#f1f1f1',
  },
  summary: {
    fontWeight: 'bold',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    marginBottom: 5,
  },
}

const InstructionAccordion = () => {
  const { t } = useTranslation()

  return (
    <Box mb={2}>
      <Accordion sx={styles.accordion}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography sx={styles.summary}>{t('feedbackResponse:instructionTitle')}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={styles.details}>
          <Typography sx={styles.row}>{t('feedbackResponse:responseInstruction')}</Typography>
          <Typography sx={styles.row}>{t('feedbackResponse:writingInstruction')}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default InstructionAccordion
