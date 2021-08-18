import { Box } from '@material-ui/core'
import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import FormikTextField from '../FormikTextField'
import Alert from '../Alert'
import AlertLink from '../AlertLink'

const TextEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={3}>
        <Alert severity="info">
          <Trans i18nKey="feedbackResponse:responseInfo">
            This field supports{' '}
            <AlertLink href="https://commonmark.org/help/" target="_blank">
              Markdown
            </AlertLink>{' '}
            syntax
          </Trans>
        </Alert>
      </Box>
      <FormikTextField
        id={`textual-context-text-${language}-${name}`}
        name={`${name}.data.content.${language}`}
        label={t('questionEditor:content')}
        fullWidth
        multiline
      />
    </>
  )
}

export default TextEditor
