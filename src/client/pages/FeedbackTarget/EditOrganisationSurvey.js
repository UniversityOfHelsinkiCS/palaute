import React, { useState } from 'react'
import { Button } from '@mui/material'
import { Edit } from '@mui/icons-material'

import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useFeedbackTargetContext } from './FeedbackTargetContext'
import OrganisationSurveyEditor from '../Organisation/OrganisationSurveyEditor'
import { useEditOrganisationSurveyMutation } from '../Organisation/useOrganisationSurveyMutation'
import { getOverlappingStudentTeachers, getOrganisationSurveySchema } from '../Organisation/utils'

const EditOrganisationSurvey = () => {
  const { t } = useTranslation()
  const { code } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const { feedbackTarget: organisationSurvey, isAdmin } = useFeedbackTargetContext()
  const [showForm, setShowForm] = useState(false)

  const editMutation = useEditOrganisationSurveyMutation(code)

  const surveyValues = {
    name: organisationSurvey.name,
    startDate: organisationSurvey.opensAt,
    endDate: organisationSurvey.closesAt,
    studentNumbers: organisationSurvey.students.map(s => s.user.studentNumber),
    teachers: organisationSurvey.userFeedbackTargets.map(t => t.user),
  }

  const allowEdit = new Date() <= Date.parse(organisationSurvey.closesAt)
  const organisationSurveySchema = getOrganisationSurveySchema(t)

  const handleClose = () => setShowForm(!showForm)

  const handleSubmit = async (data, { setErrors }) => {
    const overlappingStudentTeachers = getOverlappingStudentTeachers(data)

    if (overlappingStudentTeachers.length > 0) {
      setErrors({
        studentNumbers: {
          text: t('validationErrors:overlappingStudentTeacher'),
          data: overlappingStudentTeachers.map(t => t.studentNumber),
        },
      })
      return
    }

    const values = {
      surveyId: organisationSurvey.id,
      ...data,
      teacherIds: data.teachers.map(t => t.id),
    }

    await editMutation.mutateAsync(values, {
      onSuccess: () => {
        handleClose()

        enqueueSnackbar(t('common:saveSuccess'), { variant: 'success' })
      },
      onError: error => {
        if (error.isAxiosError && error.response && error.response.data && error.response.data.invalidStudentNumbers) {
          const { invalidStudentNumbers } = error.response.data

          setErrors({
            studentNumbers: {
              text: t('validationErrors:invalidStudentNumbers'),
              data: invalidStudentNumbers,
            },
          })
        } else {
          handleClose()
          enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
        }
      },
    })
  }

  if (!allowEdit && !isAdmin) return null

  return (
    <>
      <Button
        sx={{ textAlign: 'left', justifyContent: 'start' }}
        data-cy="feedback-target-edit-period"
        onClick={handleClose}
        variant="text"
        startIcon={<Edit />}
      >
        {t('interimFeedback:editSurvey')} {isAdmin && !allowEdit && '(ADMIN)'}
      </Button>

      <OrganisationSurveyEditor
        title={t('organisationSurveys:editSurvey')}
        initialValues={surveyValues}
        validationSchema={organisationSurveySchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
        editView
      />
    </>
  )
}

export default EditOrganisationSurvey
