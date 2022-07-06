import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  makeStyles,
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const useStyles = makeStyles(() => ({
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
}))

const InstructionAccordion = () => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Box mb={2}>
      <Accordion className={classes.accordion}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography className={classes.summary}>
            {t('feedbackResponse:instructionTitle')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <Typography className={classes.row}>
            {t('feedbackResponse:responseInstruction')}
          </Typography>
          <Typography className={classes.row}>
            {t('feedbackResponse:writingInstruction')}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default InstructionAccordion
