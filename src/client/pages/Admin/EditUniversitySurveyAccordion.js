import React from 'react'

import { Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { useTranslation } from 'react-i18next'
import { Formik, Form } from 'formik'
import { useSnackbar } from 'notistack'

import QuestionEditor from '../../components/QuestionEditor'
import useUniversitySurvey from '../../hooks/useUniversitySurvey'
import { getInitialValues, validate, saveValues } from './utils'
import { getLanguageValue } from '../../util/languageUtils'
import { LoadingProgress } from '../../components/common/LoadingProgress'

const styles = {
  accordion: {
    marginTop: 10,
  },
  heading: {
    marginBottom: theme => theme.spacing(2),
  },
  progressContainer: {
    padding: theme => theme.spacing(4, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}

const EditUniversitySurveyAccordion = () => {
  const { t, i18n } = useTranslation()
  const { language } = i18n

  const { enqueueSnackbar } = useSnackbar()

  const { survey, isLoading: surveyIsLoading } = useUniversitySurvey()
  const isLoading = surveyIsLoading

  if (isLoading) {
    return <LoadingProgress />
  }

  const handleSubmit = async values => {
    try {
      await saveValues(values, survey)
      enqueueSnackbar(t('saveSuccess'), { variant: 'success' })
    } catch (e) {
      enqueueSnackbar(t('unknownError'), { variant: 'error' })
    }
  }

  const initialValues = getInitialValues(survey)
  const name = getLanguageValue(survey?.courseUnit?.name, i18n.language)

  return (
    <Box mt={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>Edit university survey</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Typography variant="h4" component="h1" sx={styles.heading}>
            {name}
          </Typography>

          <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate} validateOnChange={false}>
            <Form>
              <QuestionEditor language={language} name="questions" highLevel />

              <Box mt={2}>
                <Button color="primary" variant="contained" type="submit">
                  {t('save')}
                </Button>
              </Box>
            </Form>
          </Formik>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default EditUniversitySurveyAccordion
