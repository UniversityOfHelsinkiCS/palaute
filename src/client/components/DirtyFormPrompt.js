import React from 'react'
import { Prompt } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { useFormikContext } from 'formik'

const DirtyFormPrompt = () => {
  const { t } = useTranslation()
  const { dirty } = useFormikContext()

  return <Prompt when={dirty} message={t('dirtyFormPrompt')} />
}

export default DirtyFormPrompt
