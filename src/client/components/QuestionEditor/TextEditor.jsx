import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Box, Grid2 as Grid, Typography, Alert } from '@mui/material'

import FormikTextField from '../common/FormikTextField'
import AlertLink from '../common/AlertLink'

const LanguageTextEditor = ({ name, language, inputRef }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <FormikTextField
      id={`textual-context-text-${language}-${name}`}
      name={`${name}.data.content.${language}`}
      label={t('questionEditor:content')}
      fullWidth
      multiline
      inputRef={inputRef}
    />
  )
}

const TextEditor = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { name, languages = ['fi', 'sv', 'en'] } = props
  const firstInputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
  }))

  return (
    <Grid spacing={4} container>
      {languages.map((language, idx) => (
        <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
          <Box mb={2}>
            <Typography variant="h6" component="h2">
              {language.toUpperCase()}
            </Typography>
          </Box>

          <LanguageTextEditor name={name} language={language} inputRef={idx === 0 ? firstInputRef : undefined} />
        </Grid>
      ))}
      <Alert severity="info" sx={{ width: '100%' }}>
        {t('questionEditor:markdownSupport')}{' '}
        <AlertLink href={t('links:markdownHelp')} target="_blank">
          {t('feedbackResponse:markdownLink')}
        </AlertLink>
      </Alert>
    </Grid>
  )
})

export default TextEditor
