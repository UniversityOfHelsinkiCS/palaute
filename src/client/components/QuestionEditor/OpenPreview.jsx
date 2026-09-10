import { getLanguageValue } from '../../util/languageUtils'
import TextField from '../common/TextField'
import PreviewBase from './PreviewBase'

const OpenPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const required = question.required ?? false

  const inputId = `question-${question.id}-input`

  return (
    <PreviewBase
      id={`question-${question.id}`}
      label={label}
      description={description}
      required={required}
      labelProps={{ component: 'label', htmlFor: inputId }}
    >
      <TextField id={inputId} multiline fullWidth />
    </PreviewBase>
  )
}

export default OpenPreview
