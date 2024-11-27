import React from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'

const LanguageLikertEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          id={`likert-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>

      <FormikTextField
        id={`likert-description-${language}-${name}`}
        name={`${name}.data.description.${language}`}
        label={t('questionEditor:description')}
        helperText={t('questionEditor:descriptionHelper')}
        fullWidth
      />
    </>
  )
}

const LikertEditor = ({ name, languages = ['fi', 'sv', 'en'] }) => (
  <Grid spacing={4} container>
    {languages.map(language => (
      <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
        <Box mb={2}>
          <Typography variant="h6" component="h2">
            {language.toUpperCase()}
          </Typography>
        </Box>

        <LanguageLikertEditor name={name} language={language} />
      </Grid>
    ))}
  </Grid>
)

export default LikertEditor
