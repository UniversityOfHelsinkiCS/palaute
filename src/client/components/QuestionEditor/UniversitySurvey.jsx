import { Box } from '@mui/material'
import { useSnackbar } from 'notistack'

import apiClient from '../../util/apiClient'
import queryClient from '../../util/queryClient'
import { NorButton } from '../common/NorButton'
import { getFormInitialValues } from './getFormInitialValues'
import QuestionEditor from './QuestionEditor'

const saveQuestions = async (surveyId, payload) => {
  const { data } = await apiClient.put(`/surveys/${surveyId}/questions`, payload)
  // The editor reads the survey once when it opens, so the cache must not keep the old questions
  queryClient.setQueryData(['universitySurveyVersions'], versions =>
    versions?.map(survey => (survey.id === surveyId ? { ...survey, ...data } : survey))
  )
  // The server works out which questions are public
  void queryClient.invalidateQueries({ queryKey: ['universitySurveyVersions'] })
  void queryClient.invalidateQueries({ queryKey: ['universitySurvey'] })
  return data
}

const UniversitySurvey = ({ universitySurvey, onCreateVersionClick }) => {
  const { enqueueSnackbar } = useSnackbar()

  const onPublicityToggle = () => {
    enqueueSnackbar(`
      Whoopsie! University question publicity is not configurable. 
      Instead, all numerics are public and open questions are nonpublic.
    `)
  }

  const { publicQuestionIds } = universitySurvey

  const initialValues = getFormInitialValues({
    universityQuestions: universitySurvey.questions,
    publicQuestionIds,
    publicityConfigurableQuestionIds: [],
    editorLevel: 'university',
  })

  return (
    <>
      <QuestionEditor
        key={universitySurvey.id}
        initialValues={initialValues}
        questionsVersion={universitySurvey.questionsVersion}
        saveQuestions={payload => saveQuestions(universitySurvey.id, payload)}
        handlePublicityToggle={onPublicityToggle}
        editorLevel="university"
      />
      {onCreateVersionClick && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <NorButton color="error" onClick={onCreateVersionClick}>
            Create new version
          </NorButton>
        </Box>
      )}
    </>
  )
}

export default UniversitySurvey
