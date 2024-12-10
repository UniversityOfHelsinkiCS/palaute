import React, { useState } from 'react'
import { Edit } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import OrganisationSurveyEditor from '../../Organisation/OrganisationSurveyEditor'
import { useOrganisationSurvey } from '../../Organisation/useOrganisationSurveys'
import { useEditOrganisationSurveyMutation } from '../../Organisation/useOrganisationSurveyMutation'
import { getOverlappingStudentTeachers, getOrganisationSurveySchema } from '../../Organisation/utils'
import { useFeedbackTargetContext } from '../FeedbackTargetContext'
import { NorButton } from '../../../components/common/NorButton'

const EditOrganisationSurvey = () => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const [showForm, setShowForm] = useState(false)

  const { feedbackTarget, isAdmin, isResponsibleTeacher, isOrganisationAdmin } = useFeedbackTargetContext()
  const { id, courseUnit: { organisations } = [] } = feedbackTarget
  const allowEdit = isAdmin || isResponsibleTeacher || isOrganisationAdmin
  const { survey: organisationSurvey, isLoading } = useOrganisationSurvey(organisations[0]?.code, id, allowEdit)

  const editMutation = useEditOrganisationSurveyMutation(organisations[0]?.code)

  if (!allowEdit || !organisationSurvey || isLoading) return null

  const surveyValues = {
    name: organisationSurvey.name,
    startDate: organisationSurvey.opensAt,
    endDate: organisationSurvey.closesAt,
    studentNumbers: organisationSurvey.students.map(s => s.user.studentNumber),
    teachers: organisationSurvey.userFeedbackTargets.map(t => t.user),
  }

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
      courseIds: data.courses?.map(c => c.courseRealisationId),
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

  return (
    <>
      <NorButton
        data-cy="feedback-target-edit-organisation-survey"
        sx={{ textAlign: 'left', justifyContent: 'start' }}
        onClick={handleClose}
        color="secondary"
        icon={<Edit />}
      >
        {t('organisationSurveys:editSurvey')}
      </NorButton>

      <OrganisationSurveyEditor
        title={t('organisationSurveys:editSurvey')}
        initialValues={surveyValues}
        validationSchema={organisationSurveySchema}
        handleSubmit={handleSubmit}
        editing={showForm}
        onStopEditing={handleClose}
        editView
        organisationCode={organisations[0]?.code}
      />
    </>
  )
}

export default EditOrganisationSurvey
