import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../util/languageUtils'

const Text = ({ question }) => {
  const { i18n } = useTranslation()
  const content = getLanguageValue(question.data?.content, i18n.language) ?? ''

  return content
}

export default Text
