import React from 'react'
import { Box, Button } from '@mui/material'
import { useSnackbar } from 'notistack'

import EditUniversitySurveyAccordion from './EditUniversitySurveyAccordion'
import EmailAccordion from './EmailAccordion'
import ConfigDebug from './ConfigDebug'

import apiClient from '../../../../util/apiClient'

const MiscTab = () => {
  const { enqueueSnackbar } = useSnackbar()

  const resetTestCourse = async () => {
    await apiClient.post('/admin/reset-course', {})
  }
  const runPateCron = async () => {
    if (window.confirm('Will send all emails for today that have not yet been sent.')) {
      try {
        await apiClient.post('/admin/run-pate', {})
        enqueueSnackbar('SUCCESS', { variant: 'success' })
      } catch (e) {
        enqueueSnackbar(`ERROR: ${e.response.statusCode}. Check logs`, {
          variant: 'error',
        })
      }
    }
  }

  return (
    <>
      <EditUniversitySurveyAccordion />
      <EmailAccordion />
      <ConfigDebug />
      <Button variant="contained" color="primary" onClick={runPateCron} data-cy="run-pate">
        Run pateCron
      </Button>
      <Box m="1rem" />
      <Button variant="contained" color="primary" onClick={resetTestCourse}>
        Reset test course
      </Button>
    </>
  )
}

export default MiscTab
