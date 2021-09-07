import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Box,
  Typography,
  makeStyles,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useStyles = makeStyles(() => ({
  accordion: {
    backgroundColor: '#f1f1f1',
  },
  summary: {
    fontWeight: 'bold',
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
        <AccordionDetails>
          <Typography>
            {t('feedbackResponse:responseInstruction')}
            <Link href="https://blogs.helsinki.fi/kielijelppi/palautteen-antaminen/">
              https://blogs.helsinki.fi/kielijelppi/palautteen-antaminen/
            </Link>
            {t('feedbackResponse:onlyInFinnishAndSwedish')}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default InstructionAccordion
