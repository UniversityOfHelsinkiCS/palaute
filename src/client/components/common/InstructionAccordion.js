import React from 'react'

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
}

const InstructionAccordion = ({ title, text }) => (
  <Box my={1}>
    <Accordion sx={styles.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={styles.summary}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={styles.details}>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{text}</Typography>
      </AccordionDetails>
    </Accordion>
  </Box>
)

export default InstructionAccordion
