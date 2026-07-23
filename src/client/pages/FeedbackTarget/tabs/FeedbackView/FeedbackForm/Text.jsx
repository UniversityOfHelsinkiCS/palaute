import Markdown from '../../../../../components/common/Markdown'
import { getLanguageValue } from '../../../../../util/languageUtils'
import { useQuestionLanguage } from '../../../../../util/questionLanguageContext'

const Text = ({ question }) => {
  const language = useQuestionLanguage()
  const content = getLanguageValue(question.data?.content, language) ?? ''

  return <Markdown>{content}</Markdown>
}

export default Text
