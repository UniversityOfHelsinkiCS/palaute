import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import LinkButton from '../common/LinkButton'

const LanguageOpenEditor = ({ name, language, inputRef }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <FormikTextField
          id={`open-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
          multiline
          inputRef={inputRef}
        />
      </Box>

      <FormikTextField
        id={`open-description-${language}-${name}`}
        name={`${name}.data.description.${language}`}
        label={t('questionEditor:description')}
        helperText={t('questionEditor:descriptionHelper')}
        fullWidth
        multiline
      />
    </>
  )
}

const OpenEditor = forwardRef((props, ref) => {
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

          <LanguageOpenEditor name={name} language={language} inputRef={idx === 0 ? firstInputRef : undefined} />
        </Grid>
      ))}
      <LinkButton title={t('feedbackResponse:markdownLink')} to={t('links:markdownHelp')} external />
    </Grid>
  )
})

export default OpenEditor
