import { getLanguageValue } from '../../util/languageUtils'
import TextField from '../common/TextField'
import PreviewBase from './PreviewBase'

const OpenPreview = ({ question, language }) => {
  const label = getLanguageValue(question.data?.label, language)
  const description = getLanguageValue(question.data?.description, language)
  const required = question.required ?? false

  return (
    <PreviewBase label={label} description={description} required={required}>
      <TextField multiline fullWidth />
    </PreviewBase>
  )
}

export default OpenPreview
