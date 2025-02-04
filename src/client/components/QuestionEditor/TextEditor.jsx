import { Box, Grid2 as Grid, Typography, Alert } from '@mui/material'
import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import AlertLink from '../common/AlertLink'

const LanguageTextEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={3}>
        <Alert severity="info">
          <Trans i18nKey="feedbackResponse:responseInfo">
            This field supports{' '}
            <AlertLink href={t('links:markdownHelp')} target="_blank">
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

const TextEditor = ({ name, languages = ['fi', 'sv', 'en'] }) => (
  <Grid spacing={4} container>
    {languages.map(language => (
      <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
        <Box mb={2}>
          <Typography variant="h6" component="h2">
            {language.toUpperCase()}
          </Typography>
        </Box>

        <LanguageTextEditor name={name} language={language} />
      </Grid>
    ))}
  </Grid>
)

export default TextEditor
