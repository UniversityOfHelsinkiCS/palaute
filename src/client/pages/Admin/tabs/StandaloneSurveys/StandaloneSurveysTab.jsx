import { Add, DeleteOutlined } from '@mui/icons-material'
import {
  Box,
  Dialog,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { addDays } from 'date-fns'
import { Form, Formik } from 'formik'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import FormikDatePicker from '../../../../components/common/FormikDatePicker'
import FormikLocalesFieldEditor from '../../../../components/common/FormikLocalesFieldEditor'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'
import { NorButton } from '../../../../components/common/NorButton'
import useAuthorizedUser from '../../../../hooks/useAuthorizedUser'
import useInteractiveMutation from '../../../../hooks/useInteractiveMutation'
import { getLanguageValue } from '../../../../util/languageUtils'
import { formatDate } from '../../../FeedbackTarget/tabs/FeedbackView/utils'
import { ResponsibleTeachersSelector } from '../../../Organisation/OrganisationSurveyEditor'
import { useAllSurveys, useCreateSurvey, useDeleteSurvey } from '../../../StandaloneSurvey/api'
import { toPeriod, validateNameAndPeriod } from '../../../StandaloneSurvey/manage/Settings'

const CreateDialog = ({ open, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { authorizedUser } = useAuthorizedUser()
  const createSurvey = useCreateSurvey()
  const createdId = useRef(null)
  const create = useInteractiveMutation(async body => {
    createdId.current = (await createSurvey.mutateAsync(body)).id
  })

  const initialValues = {
    name: { fi: '', sv: '', en: '' },
    opensAt: addDays(new Date(), 1),
    closesAt: addDays(new Date(), 15),
    responsibleUsers: authorizedUser ? [authorizedUser] : [],
  }

  const validate = values => {
    const errors = validateNameAndPeriod(false, false)(values)
    if (values.responsibleUsers.length === 0) {
      errors.responsibleUsers = t('standaloneSurvey:responsibleUsersRequired')
    }
    return errors
  }

  const handleSubmit = async values => {
    const ok = await create({
      name: values.name,
      ...toPeriod(values),
      responsibleUserIds: values.responsibleUsers.map(u => u.id),
    })
    if (ok) {
      onClose()
      navigate(`/standalone-surveys/${createdId.current}/edit`)
    }
  }

  return (
    <Dialog maxWidth={false} open={open} onClose={onClose}>
      <DialogTitle>Create standalone survey</DialogTitle>
      <Formik initialValues={initialValues} onSubmit={handleSubmit} validate={validate} validateOnChange={false}>
        {({ isSubmitting }) => (
          <Form>
            <Box sx={{ m: 4 }}>
              <Grid spacing={4} container>
                <FormikLocalesFieldEditor name="name" localesLabelString="standaloneSurvey:name" />
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormikDatePicker name="opensAt" label={t('editFeedbackTarget:opensAt')} disablePast />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormikDatePicker name="closesAt" label={t('editFeedbackTarget:closesAt')} disablePast />
                </Grid>
                <Grid size={12}>
                  <ResponsibleTeachersSelector
                    name="responsibleUsers"
                    title={t('organisationSurveys:responsibleTeacherTitle')}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'right', gap: 2 }}>
                <NorButton disabled={isSubmitting} color="primary" type="submit">
                  {t('common:save')}
                </NorButton>
                <NorButton color="cancel" type="button" onClick={onClose}>
                  {t('common:cancel')}
                </NorButton>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

const StandaloneSurveysTab = () => {
  const { i18n } = useTranslation()
  const [creating, setCreating] = useState(false)
  const { data: surveys, isLoading } = useAllSurveys()
  const deleteSurvey = useDeleteSurvey()
  const remove = useInteractiveMutation(id => deleteSurvey.mutateAsync(id))

  if (isLoading) return <LoadingProgress />

  return (
    <Box sx={{ mt: 3 }}>
      <NorButton color="primary" icon={<Add />} onClick={() => setCreating(true)}>
        Create survey
      </NorButton>
      {creating && <CreateDialog open onClose={() => setCreating(false)} />}
      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Opens</TableCell>
            <TableCell>Closes</TableCell>
            <TableCell>Answers</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {surveys?.map(survey => {
            const name = getLanguageValue(survey.name, i18n.language)
            return (
              <TableRow key={survey.id}>
                <TableCell>
                  <MuiLink component={Link} to={`/standalone-surveys/${survey.id}`}>
                    {name}
                  </MuiLink>
                </TableCell>
                <TableCell>{formatDate(new Date(survey.opensAt))}</TableCell>
                <TableCell>{formatDate(new Date(survey.closesAt))}</TableCell>
                <TableCell>{survey.responseCount}</TableCell>
                <TableCell>
                  {survey.responseCount === 0 && (
                    <IconButton
                      aria-label={`Delete ${name}`}
                      onClick={() => {
                        if (window.confirm(`Delete "${name}"?`)) void remove(survey.id)
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

export default StandaloneSurveysTab
