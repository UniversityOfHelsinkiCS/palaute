import React, { useState } from 'react'
import { SettingsOutlined } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import OrganisationSurveyEditor from '../../Organisation/OrganisationSurveyEditor'
import { useOrganisationSurvey } from '../../Organisation/useOrganisationSurveys'
import { useEditOrganisationSurveyMutation } from '../../Organisation/useOrganisationSurveyMutation'
import {
  getOverlappingStudentTeachers,
  getOrganisationSurveySchema,
  getSuccessMessage,
  hasNewCourses,
} from '../../Organisation/utils'
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
    studentNumbers: organisationSurvey.students.independentStudents.map(s => s.user.studentNumber),
    teachers: organisationSurvey.userFeedbackTargets.map(t => t.user),
    courses: organisationSurvey.courses,
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
      courseRealisationIds: data.courses.map(c => c.id),
    }

    await editMutation.mutateAsync(values, {
      onSuccess: updatedSurvey => {
        handleClose()

        const submittedStudentNumberCount = data.studentNumbers.length
        const duplicateStudentSubmitted =
          submittedStudentNumberCount > updatedSurvey.students.independentStudents.length
        const newCourseSubmitted = hasNewCourses(
          values.courseRealisationIds,
          organisationSurvey.courses.map(c => c.id)
        )

        const { successMessage, messageKey } = getSuccessMessage(
          t,
          submittedStudentNumberCount,
          updatedSurvey,
          duplicateStudentSubmitted || newCourseSubmitted
        )

        enqueueSnackbar(successMessage, { variant: 'success', key: messageKey })
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
        sx={{ textAlign: 'center', justifyContent: 'center' }}
        onClick={handleClose}
        color="primary"
        icon={<SettingsOutlined />}
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
