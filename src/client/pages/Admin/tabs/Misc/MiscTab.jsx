import React from 'react'
import { Box } from '@mui/material'
import { useSnackbar } from 'notistack'

import EditUniversitySurveyAccordion from './EditUniversitySurveyAccordion'
import EmailAccordion from './EmailAccordion'
import ConfigDebug from './ConfigDebug'

import apiClient from '../../../../util/apiClient'
import { NorButton } from '../../../../components/common/NorButton'

const MiscTab = () => {
  const { enqueueSnackbar } = useSnackbar()

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
      <NorButton color="secondary" onClick={runPateCron} data-cy="run-pate">
        Run pateCron
      </NorButton>
      <Box m="1rem" />
    </>
  )
}

export default MiscTab
