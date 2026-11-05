import { Box, Grid2 as Grid, Paper, Typography } from '@mui/material'
import { endOfDay, isSameDay, startOfDay } from 'date-fns'
import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import FormikDatePicker from '../../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../../components/common/FormikLocalesFieldEditor'
import { NorButton } from '../../../components/common/NorButton'
import useInteractiveMutation from '../../../hooks/useInteractiveMutation'
import { validateFeedbackPeriod } from '../../FeedbackTarget/Dates/utils'
import { ResponsibleTeachersSelector } from '../../Organisation/OrganisationSurveyEditor'
import { useUpdateResponsibleUsers, useUpdateSurvey } from '../api'

export const toPeriod = ({ opensAt, closesAt }) => ({
  opensAt: startOfDay(new Date(opensAt)),
  closesAt: endOfDay(new Date(closesAt)),
})

export const validateNameAndPeriod = (isOpen, isOver) => values => {
  const errors = validateFeedbackPeriod(isOpen, isOver)(values)
  if (!Object.values(values.name ?? {}).some(value => value?.trim())) errors.name = { fi: 'validationErrors:required' }
  return errors
}

const Section = ({ title, children }) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
      {title}
    </Typography>
    {children}
  </Paper>
)

const NameAndPeriod = ({ survey, isOpen, isOver }) => {
  const { t } = useTranslation()
  const updateSurvey = useUpdateSurvey(survey.id)
  const save = useInteractiveMutation(values => {
    const { opensAt, closesAt } = toPeriod(values)
    return updateSurvey.mutateAsync({
      name: values.name,
      ...(isSameDay(opensAt, new Date(survey.opensAt)) ? {} : { opensAt }),
      ...(isSameDay(closesAt, new Date(survey.closesAt)) ? {} : { closesAt }),
    })
  })
  const isAdmin = survey.access.isAdmin

  return (
    <Formik
      initialValues={{ name: survey.name, opensAt: new Date(survey.opensAt), closesAt: new Date(survey.closesAt) }}
      onSubmit={async (values, actions) => {
        if (await save(values)) actions.resetForm({ values })
      }}
      validate={validateNameAndPeriod(isOpen || isOver, isOver)}
      enableReinitialize
    >
      {({ dirty, isSubmitting }) => (
        <Form>
          <Grid spacing={4} container>
            <FormikLocalesFieldEditor name="name" localesLabelString="standaloneSurvey:name" />
            <Grid size={{ xs: 12, md: 6 }}>
              <FormikDatePicker
                name="opensAt"
                label={t('editFeedbackTarget:opensAt')}
                disablePast={!isAdmin}
                disabled={(isOpen || isOver) && !isAdmin}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormikDatePicker name="closesAt" label={t('editFeedbackTarget:closesAt')} disablePast={!isAdmin} />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <NorButton color="primary" type="submit" disabled={!dirty || isSubmitting}>
              {t('common:save')}
            </NorButton>
          </Box>
        </Form>
      )}
    </Formik>
  )
}

const ResponsibleUsers = ({ survey }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const updateResponsibleUsers = useUpdateResponsibleUsers(survey.id)
  const save = useInteractiveMutation(async users => {
    const updated = await updateResponsibleUsers.mutateAsync({ userIds: users.map(u => u.id) })
    if (!updated.access.canManage) navigate('/courses')
  })

  return (
    <Formik
      initialValues={{ responsibleUsers: survey.responsibleUsers }}
      onSubmit={async (values, actions) => {
        if (await save(values.responsibleUsers)) actions.resetForm({ values })
      }}
      validate={values =>
        values.responsibleUsers.length === 0 ? { responsibleUsers: t('standaloneSurvey:responsibleUsersRequired') } : {}
      }
      enableReinitialize
    >
      {({ dirty, isSubmitting }) => (
        <Form>
          <ResponsibleTeachersSelector
            name="responsibleUsers"
            title={t('organisationSurveys:editResponsibleTeacherTitle')}
          />
          <Box sx={{ mt: 3 }}>
            <NorButton color="primary" type="submit" disabled={!dirty || isSubmitting}>
              {t('common:save')}
            </NorButton>
          </Box>
        </Form>
      )}
    </Formik>
  )
}

const Settings = ({ survey, isOpen, isOver }) => {
  const { t } = useTranslation()

  return (
    <Box id="feedback-target-tab-content">
      <Section title={t('standaloneSurvey:nameAndPeriod')}>
        <NameAndPeriod survey={survey} isOpen={isOpen} isOver={isOver} />
      </Section>
      <Section title={t('organisationSurveys:responsibleTeachers')}>
        <ResponsibleUsers survey={survey} />
      </Section>
    </Box>
  )
}

export default Settings
