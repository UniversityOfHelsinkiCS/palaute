import React from 'react'
import { Button } from '@material-ui/core'

import LoginAs from './LoginAsSelector'
import EditUniversitySurveyAccordion from './EditUniversitySurveyAccordion'
import EmailAccordion from './EmailAccordion'
import apiClient from '../../util/apiClient'

const GeneralTab = () => {
  const resetTestCourse = async () => {
    await apiClient.post('/admin/reset-course', {})
  }

  return (
    <>
      <LoginAs />
      <EditUniversitySurveyAccordion />
      <EmailAccordion />
      <Button variant="contained" color="primary" onClick={resetTestCourse}>
        Reset test course
      </Button>
    </>
  )
}

export default GeneralTab
