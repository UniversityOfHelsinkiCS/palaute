import React from 'react'
import { Button } from '@material-ui/core'

import EditUniversitySurveyAccordion from './EditUniversitySurveyAccordion'
import EmailAccordion from './EmailAccordion'
import apiClient from '../../util/apiClient'

const MiscTab = () => {
  const resetTestCourse = async () => {
    await apiClient.post('/admin/reset-course', {})
  }

  return (
    <>
      <EditUniversitySurveyAccordion />
      <EmailAccordion />
      <Button variant="contained" color="primary" onClick={resetTestCourse}>
        Reset test course
      </Button>
    </>
  )
}

export default MiscTab
